import { SafeError } from "./secure.js";
/** V2 project config names, in the order OpenCode prefers when both exist (`.jsonc` wins). */
export declare const CONFIG_NAMES: readonly ["opencode.jsonc", "opencode.json"];
export declare class ConfigError extends SafeError {
    readonly code: "malformed" | "duplicate" | "invalid" | "conflict" | "changed" | "busy" | "cancelled";
    constructor(message: string, code: "malformed" | "duplicate" | "invalid" | "conflict" | "changed" | "busy" | "cancelled");
}
/** Secret-free provider entry written under `providers.<id>`. */
export interface PersistedProvider {
    readonly name?: string;
    readonly package: string;
    readonly baseURL: string;
}
export interface PersistResult {
    readonly path: string;
    readonly created: boolean;
    readonly replaced: boolean;
}
/** Resolves the project config file this plugin owns writes to: `<directory>/opencode.json(c)`. */
export declare function resolveConfigPath(directory: string): Promise<{
    path: string;
    exists: boolean;
}>;
/** Parses JSONC strictly: any syntax error, or a non-object root, is a hard failure. */
export declare function parseConfig(text: string, file: string): Record<string, unknown>;
/** `providers` of the project config (empty when there is no config). */
export declare function readProviders(directory: string): Promise<Record<string, unknown>>;
export declare function readProviderIds(directory: string): Promise<string[]>;
/**
 * Adds (or, with `overwrite`, updates) `providers.<id>` in the project config.
 * Comments, formatting, unknown keys and other providers are preserved. On
 * overwrite, only plugin-owned fields are rewritten; user fields such as
 * explicit `models`, `headers` or `env` stay intact. Never writes secrets.
 */
export declare function persistProvider(directory: string, providerID: string, provider: PersistedProvider, options?: {
    readonly overwrite?: boolean;
    readonly signal?: AbortSignal;
    /**
     * Expected current `providers.<id>` value (`undefined` = absent), compared inside the
     * locked transaction: if the entry differs, nothing is written (`changed`).
     */
    readonly expect?: {
        readonly entry: unknown;
    };
    /** Test seam: runs after the new content is staged and before the target is checked and replaced. */
    readonly beforeReplace?: () => Promise<void>;
    /** Test seam: how long to wait for a live lock owner (default 10 s). */
    readonly lockTimeout?: number;
}): Promise<PersistResult>;
