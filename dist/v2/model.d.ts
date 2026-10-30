import type { Model } from "@opencode/plugin";
import type { DeepMutable } from "@opencode/plugin/promise/types";
import type { EnrichedModel } from "./discover.js";
type MutableModel = DeepMutable<Model.Info>;
/** Plain, secret-free model definition derived from a successful discovery. */
export interface NativeModel {
    readonly id: string;
    readonly name: string;
    readonly family?: string;
    readonly capabilities: {
        readonly tools: boolean;
        readonly input: readonly string[];
        readonly output: readonly string[];
    };
    readonly limit: {
        readonly context: number;
        readonly input?: number;
        readonly output: number;
    };
    readonly cost: ReadonlyArray<{
        readonly input: number;
        readonly output: number;
        readonly cache: {
            readonly read: number;
            readonly write: number;
        };
    }>;
    readonly released: number;
    readonly status: "alpha" | "beta" | "deprecated" | "active";
}
/**
 * Converts the V1 enrichment shape into V2 native model fields. V1-only fields
 * (reasoning, temperature, attachment) have no V2 schema equivalent and are dropped.
 */
export declare function toNativeModel(id: string, model: EnrichedModel): NativeModel | undefined;
export declare function toNativeModels(models: Record<string, EnrichedModel>): NativeModel[];
/**
 * Writes discovered fields onto a host-created draft (which already carries the
 * native defaults from `Model.Info.default`). Identity fields are owned by the host.
 */
export declare function applyNativeModel(draft: MutableModel, model: NativeModel): void;
export {};
