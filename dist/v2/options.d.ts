import type { DisplayStyle } from "./discover.js";
/** Per-provider plugin-owned options, configured under the plugin entry's `options.providers`. */
export interface ProviderOptions {
    /** `true` opts a provider in even if it has explicit models; `false` opts it out entirely. */
    readonly discover?: boolean;
    readonly displayStyle?: DisplayStyle;
}
export interface PluginOptions {
    readonly displayStyle: DisplayStyle;
    readonly providers: Readonly<Record<string, ProviderOptions>>;
    /**
     * Extra origins (`scheme://host[:port]`) the agent `add-provider` tool may probe, in
     * addition to origins of already configured dynamic providers. User-owned approval;
     * new-provider adds by the tool are still credential-free.
     */
    readonly agentOrigins: readonly string[];
}
/** Narrows untrusted `ctx.options`; unknown keys and malformed values are ignored. */
export declare function parseOptions(raw: unknown): PluginOptions;
