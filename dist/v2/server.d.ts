import type { Plugin } from "@opencode/plugin";
import { type AddProviderInput, type RefreshResult } from "./service.js";
export declare const id = "opencode-dynamic-custom-providers-v2";
export { DynamicProvidersRpc, RPC_ID } from "./rpc.js";
export type { AddProviderResult, ProviderStatus, RefreshResult } from "./rpc.js";
export declare function parseAddProviderInput(raw: unknown, allowApiKey: boolean): AddProviderInput | string;
export declare function formatRefresh(result: RefreshResult): string;
declare const plugin: Plugin.Plugin;
export default plugin;
