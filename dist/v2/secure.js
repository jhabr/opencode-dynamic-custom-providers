import { createHash } from "node:crypto";
/**
 * Policy for base URLs supplied through add-provider (before any network request
 * or config write): absolute http(s), no embedded user/password, no query string
 * and no fragment. Credentials belong in the credential store, never in a URL
 * that is written to project config.
 */
export function checkBaseURL(raw) {
    let url;
    try {
        url = new URL(raw);
    }
    catch {
        return { ok: false, message: "Invalid Base URL. Please enter a full URL (including https://)." };
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") {
        return { ok: false, message: "Invalid Base URL. Only http:// and https:// endpoints are supported." };
    }
    if (url.username || url.password) {
        return { ok: false, message: "Base URL must not embed credentials. Use the API key prompt instead." };
    }
    if (url.search || raw.includes("?")) {
        return {
            ok: false,
            message: "Base URL must not contain a query string (query parameters can carry credentials and would be saved to config). Use the API key prompt instead.",
        };
    }
    if (url.hash || raw.includes("#"))
        return { ok: false, message: "Base URL must not contain a fragment (#...)." };
    return { ok: true, url };
}
/** Loose validity check for config-supplied URLs (user-owned config; query is passed through as configured). */
export function isHttpUrl(raw) {
    try {
        const url = new URL(raw);
        return url.protocol === "http:" || url.protocol === "https:";
    }
    catch {
        return false;
    }
}
export function origin(raw) {
    try {
        return new URL(raw).origin;
    }
    catch {
        return undefined;
    }
}
/** Display form of a URL: origin + path only; never user info, query or fragment. */
export function displayURL(raw) {
    try {
        const url = new URL(raw);
        return `${url.origin}${url.pathname}`.replace(/\/+$/, "");
    }
    catch {
        return "[invalid URL]";
    }
}
/** Query parameter values of a configured URL are treated as secrets for redaction. */
export function urlSecrets(raw) {
    try {
        const url = new URL(raw);
        return [...url.searchParams.values(), url.username, url.password].filter((value) => value.length > 0);
    }
    catch {
        return [];
    }
}
const CREDENTIAL_HEADER = /auth|key|token|secret|cookie|password|session/i;
/** Values of credential-like headers (e.g. a gateway `user_key`); other header values are not secrets. */
export function headerSecrets(headers) {
    return Object.entries(headers ?? {})
        .filter(([name]) => CREDENTIAL_HEADER.test(name))
        .map(([, value]) => value);
}
/** Stable, non-reversible fingerprint used only in memory to bind inventory to a credential. */
export function fingerprint(secret) {
    if (!secret)
        return "none";
    return createHash("sha256").update(secret).digest("hex").slice(0, 32);
}
function variants(secret) {
    const out = new Set();
    const add = (value) => {
        if (value.length > 0)
            out.add(value);
    };
    for (const base of [secret, secret.trim()]) {
        add(base);
        add(encodeURIComponent(base));
        add(encodeURI(base));
        add(JSON.stringify(base).slice(1, -1));
        add(Buffer.from(base, "utf8").toString("base64"));
        add(Buffer.from(base, "utf8").toString("base64url"));
    }
    return [...out].sort((a, b) => b.length - a.length);
}
const MIN_REDACT_LENGTH = 4;
const GENERIC = [
    [/Bearer\s+[^\s"',;]+/gi, "Bearer [REDACTED]"],
    [/\b(api[_-]?key|apikey|access[_-]?token|token|secret|password|key)(["']?\s*[=:]\s*["']?)[^\s"'&,;}]+/gi, "$1$2[REDACTED]"],
    [/sk-[A-Za-z0-9_-]{4,}/g, "sk-[REDACTED]"],
];
/** Replaces every known secret (raw, trimmed, URL/JSON/base64-encoded, case-insensitive). */
function redactKnown(message, secrets) {
    let text = message;
    for (const secret of secrets) {
        if (!secret)
            continue;
        if (secret.trim().length < MIN_REDACT_LENGTH) {
            // Too short to replace safely: withhold the whole message if it appears at all.
            if (secret.trim().length > 0 && text.toLowerCase().includes(secret.trim().toLowerCase()))
                return undefined;
            continue;
        }
        for (const variant of variants(secret)) {
            const escaped = variant.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            text = text.replace(new RegExp(escaped, "gi"), "[REDACTED]");
        }
    }
    return text;
}
const WITHHELD = "[diagnostic withheld: it may contain a credential]";
/**
 * Removes every known secret, then common credential shapes (Bearer, key=..., sk-...).
 * If a known secret is too short to redact safely, the whole message is withheld.
 */
export function redact(message, secrets) {
    let text = redactKnown(message, secrets);
    if (text === undefined)
        return WITHHELD;
    for (const [pattern, replacement] of GENERIC)
        text = text.replace(pattern, replacement);
    return text;
}
/**
 * True when `value` contains one of the given secrets in any encoded form. Only known
 * secrets count: generic shapes would reject legitimate model IDs such as `task-1234`.
 */
export function containsSecret(value, secrets) {
    return redactKnown(value, secrets) !== value;
}
/** Messages of errors raised by this package; remote bodies never reach these. */
export class SafeError extends Error {
    code;
    constructor(message, code = "error") {
        super(message);
        this.code = code;
        this.name = "SafeError";
    }
}
export class CancelledError extends SafeError {
    constructor(message = "Operation cancelled") {
        super(message, "cancelled");
        this.name = "CancelledError";
    }
}
/**
 * Converts any thrown value into a fixed, safe diagnostic. Only messages created
 * by this package (SafeError) are passed through, and still redacted; everything
 * else (host, network, parser errors) is mapped to a generic category.
 */
export function safeMessage(error, secrets = []) {
    if (error instanceof SafeError)
        return redact(error.message, secrets);
    const name = typeof error === "object" && error !== null ? String(error.name ?? "") : "";
    if (name === "AbortError" || name === "TimeoutError")
        return "request timed out or was cancelled";
    return "unexpected error";
}
