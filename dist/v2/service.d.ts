import type { Plugin } from "@opencode/plugin";
import type { ProviderEditor } from "@opencode/plugin/promise/provider";
import type { IntegrationEditor } from "@opencode/plugin/promise/integration";
import type { ModelEditor } from "@opencode/plugin/promise/model";
import type { PluginOptions } from "./options.js";
import type { AddProviderResult, ProviderStatus, RefreshResult } from "./rpc.js";
export type { AddProviderResult, ProviderStatus, RefreshResult } from "./rpc.js";
export declare const NATIVE_PACKAGE = "@opencode/ai/providers/openai-compatible";
export type Host = Pick<Plugin.Context, "location" | "provider" | "integration" | "model"> & Partial<Pick<Plugin.Context, "event">>;
/**
 * Who is asking. `user`: an interactive RPC client (TUI wizard), which is trusted to
 * choose endpoints and supply keys. `agent`: a model tool call, whose input may be
 * prompt-injected and is never trusted with credentials or new origins.
 */
export type Caller = "user" | "agent";
export interface CallOptions {
    readonly caller?: Caller;
    readonly signal?: AbortSignal;
}
export declare function legacyEnvName(providerID: string): string;
export declare function validateProviderId(providerID: string): string | null;
export interface AddProviderInput {
    readonly providerID: string;
    readonly baseURL: string;
    readonly name?: string;
    readonly apiKey?: string;
    readonly overwrite?: boolean;
}
/**
 * Owns one plugin generation's discovery state. Transforms only replay the last
 * successful inventory for the exact provider source that produced it; network
 * discovery happens on startup, explicit refresh/add, and provider source or
 * connection changes — never on a timer.
 */
export declare function createService(host: Host, options: PluginOptions): {
    transformProviders: (editor: ProviderEditor) => void;
    transformIntegrations: (editor: IntegrationEditor) => void;
    observeModels: (editor: ModelEditor) => void;
    refresh: (input?: {
        readonly providerID?: string;
        readonly clearCache?: boolean;
        readonly unattempted?: boolean;
    }, call?: CallOptions) => Promise<RefreshResult>;
    addProvider: (input: AddProviderInput, call?: CallOptions) => Promise<AddProviderResult>;
    status: () => ProviderStatus[];
    /** Starts the one startup discovery and credential change tracking. */
    start(): void;
    /** Status after any in-flight or queued work settles. */
    settledStatus: (call?: CallOptions) => Promise<ProviderStatus[]>;
    /**
     * Stops admission, aborts in-flight discovery, settles queued callers as cancelled,
     * and resolves once no further side effects can happen (bounded wait).
     */
    dispose(): Promise<void>;
    readonly disposed: boolean;
};
export type Service = ReturnType<typeof createService>;
