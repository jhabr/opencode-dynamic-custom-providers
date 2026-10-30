import type { Plugin } from "@opencode/plugin/tui";
export declare const id = "opencode-dynamic-custom-providers-v2";
type Context = Plugin.Context;
export declare function runReload(ctx: Context): Promise<void>;
export declare function runAddProvider(ctx: Context): Promise<void>;
declare const plugin: Plugin.Definition;
export default plugin;
