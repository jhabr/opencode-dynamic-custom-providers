/**
 * V2 endpoint discovery and models.dev enrichment. Mirrors the V1 enrichment
 * rules, but owns its network behaviour: caller AbortSignals, a fixed redirect
 * policy, and diagnostics that never include remote response bodies.
 */
export type DisplayStyle = "name" | "slug";
export interface EnrichedModel {
    name: string;
    family?: string;
    release_date?: string;
    status?: string;
    attachment?: boolean;
    reasoning?: boolean;
    temperature?: boolean;
    tool_call?: boolean;
    cost?: {
        input: number;
        output: number;
        cache_read?: number;
        cache_write?: number;
    };
    limit: {
        context: number;
        input?: number;
        output: number;
    };
    modalities?: {
        input: string[];
        output: string[];
    };
}
interface EndpointModel {
    id: string;
    name?: string;
    context_length?: number;
    max_completion_tokens?: number;
    max_output_tokens?: number;
    max_model_len?: number;
    context_window?: number;
    input_cost?: number;
    output_cost?: number;
    capabilities?: {
        tool_choice?: boolean;
        function_calling?: boolean;
        reasoning?: boolean;
        temperature?: boolean;
    };
    supported_parameters?: string[];
}
export interface DiscoverOptions {
    readonly apiKey?: string;
    /** Provider `headers`, sent on discovery too (e.g. a gateway key); an explicit `Authorization` wins over `apiKey`. */
    readonly headers?: Readonly<Record<string, string>>;
    readonly signal?: AbortSignal;
    readonly displayStyle?: DisplayStyle;
    /** Secrets that must never appear in returned model IDs/names (e.g. the key, URL query values). */
    readonly secrets?: readonly string[];
}
export declare function clearModelsDevCache(): void;
export declare function normalizeModelId(id: string): string;
export declare function sanitizeModelId(id: string): string;
/**
 * `<baseURL>/models` with the base query. The path is set on the parsed URL, never
 * re-parsed as a relative reference: a base path such as `//other.host/v1` must stay
 * a path on the base origin, not become a new authority.
 */
export declare function modelsURL(baseURL: string): URL;
/**
 * GET <baseURL>/models. Credentials are only sent to the base URL's origin:
 * same-origin redirects are followed (at most 3, credentials kept); a redirect
 * to any other origin is rejected without being requested.
 */
export declare function fetchEndpointModels(baseURL: string, options?: DiscoverOptions): Promise<EndpointModel[]>;
/**
 * Some endpoints report an output limit equal to (or most of) the context window, which
 * leaves no room for the prompt. Above half the context, fall back to a sane limit.
 */
export declare function capOutputLimit(context: number, output: number): number;
/**
 * Discovers and enriches models. Model IDs/names that echo a known secret are
 * dropped so a hostile endpoint cannot reflect a credential into the model list.
 */
export declare function discoverAndEnrich(baseURL: string, options?: DiscoverOptions): Promise<Record<string, EnrichedModel>>;
export {};
