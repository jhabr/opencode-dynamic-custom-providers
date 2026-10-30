function displayStyle(value) {
    return value === "slug" || value === "name" ? value : undefined;
}
function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
/** Exact http(s) origin of `value`, or undefined if it is anything else (paths, queries, credentials). */
function originOf(value) {
    if (typeof value !== "string")
        return undefined;
    try {
        const url = new URL(value);
        if (url.protocol !== "http:" && url.protocol !== "https:")
            return undefined;
        if (url.username || url.password || url.search || url.hash)
            return undefined;
        if (url.pathname !== "/" && url.pathname !== "")
            return undefined;
        return url.origin;
    }
    catch {
        return undefined;
    }
}
/** Narrows untrusted `ctx.options`; unknown keys and malformed values are ignored. */
export function parseOptions(raw) {
    const input = isRecord(raw) ? raw : {};
    const providers = {};
    if (isRecord(input.providers)) {
        for (const [id, value] of Object.entries(input.providers)) {
            if (!isRecord(value))
                continue;
            providers[id] = {
                ...(typeof value.discover === "boolean" ? { discover: value.discover } : {}),
                ...(displayStyle(value.displayStyle) ? { displayStyle: displayStyle(value.displayStyle) } : {}),
            };
        }
    }
    const agentOrigins = Array.isArray(input.agentOrigins)
        ? [...new Set(input.agentOrigins.map(originOf).filter((value) => value !== undefined))]
        : [];
    return {
        displayStyle: displayStyle(input.displayStyle) ?? "slug",
        providers,
        agentOrigins,
    };
}
