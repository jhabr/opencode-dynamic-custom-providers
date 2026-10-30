/**
 * V2-owned URL policy and secret redaction. Deliberately independent of the V1
 * `security.ts` pattern sanitizer: V2 redacts the exact secrets an operation
 * knows about and never surfaces remote response bodies.
 */
export type UrlCheck = {
    readonly ok: true;
    readonly url: URL;
} | {
    readonly ok: false;
    readonly message: string;
};
/**
 * Policy for base URLs supplied through add-provider (before any network request
 * or config write): absolute http(s), no embedded user/password, no query string
 * and no fragment. Credentials belong in the credential store, never in a URL
 * that is written to project config.
 */
export declare function checkBaseURL(raw: string): UrlCheck;
/** Loose validity check for config-supplied URLs (user-owned config; query is passed through as configured). */
export declare function isHttpUrl(raw: string): boolean;
export declare function origin(raw: string): string | undefined;
/** Display form of a URL: origin + path only; never user info, query or fragment. */
export declare function displayURL(raw: string): string;
/** Query parameter values of a configured URL are treated as secrets for redaction. */
export declare function urlSecrets(raw: string): string[];
/** Values of credential-like headers (e.g. a gateway `user_key`); other header values are not secrets. */
export declare function headerSecrets(headers: Readonly<Record<string, string>> | undefined): string[];
/** Stable, non-reversible fingerprint used only in memory to bind inventory to a credential. */
export declare function fingerprint(secret: string | undefined): string;
/**
 * Removes every known secret, then common credential shapes (Bearer, key=..., sk-...).
 * If a known secret is too short to redact safely, the whole message is withheld.
 */
export declare function redact(message: string, secrets: Iterable<string | undefined>): string;
/**
 * True when `value` contains one of the given secrets in any encoded form. Only known
 * secrets count: generic shapes would reject legitimate model IDs such as `task-1234`.
 */
export declare function containsSecret(value: string, secrets: Iterable<string | undefined>): boolean;
/** Messages of errors raised by this package; remote bodies never reach these. */
export declare class SafeError extends Error {
    readonly code: string;
    constructor(message: string, code?: string);
}
export declare class CancelledError extends SafeError {
    constructor(message?: string);
}
/**
 * Converts any thrown value into a fixed, safe diagnostic. Only messages created
 * by this package (SafeError) are passed through, and still redacted; everything
 * else (host, network, parser errors) is mapped to a generic category.
 */
export declare function safeMessage(error: unknown, secrets?: Iterable<string | undefined>): string;
