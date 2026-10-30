/** Shared server/TUI contract. Plain data only, so the TUI can import it without server code. */
export declare const RPC_ID = "opencode-dynamic-custom-providers-v2";
export declare const ADD_ERROR_CODES: readonly ["invalid", "duplicate", "approval_required", "discovery_failed", "config_error", "conflict", "cancelled"];
export declare const DynamicProvidersRpc: {
    readonly id: "opencode-dynamic-custom-providers-v2";
    readonly methods: {
        readonly status: {
            readonly input: {
                readonly type: "object";
                readonly properties: {};
                readonly additionalProperties: false;
            };
            readonly output: {
                readonly type: "object";
                readonly properties: {
                    readonly providers: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "object";
                            readonly properties: {
                                readonly id: {
                                    readonly type: "string";
                                };
                                readonly baseURL: {
                                    readonly type: "string";
                                };
                                readonly models: {
                                    readonly type: "integer";
                                    readonly minimum: 0;
                                };
                                readonly modelIDs: {
                                    readonly type: "array";
                                    readonly items: {
                                        readonly type: "string";
                                    };
                                };
                                readonly refreshedAt: {
                                    readonly type: "number";
                                };
                                readonly lastError: {
                                    readonly type: "string";
                                };
                                readonly pending: {
                                    readonly type: "boolean";
                                };
                            };
                            readonly required: readonly ["id", "baseURL", "models", "modelIDs"];
                            readonly additionalProperties: false;
                        };
                    };
                };
                readonly required: readonly ["providers"];
                readonly additionalProperties: false;
            };
        };
        readonly refresh: {
            readonly input: {
                readonly type: "object";
                readonly properties: {
                    readonly providerID: {
                        readonly type: "string";
                        readonly minLength: 1;
                        readonly maxLength: 128;
                    };
                };
                readonly additionalProperties: false;
            };
            readonly output: {
                readonly type: "object";
                readonly properties: {
                    readonly providerCount: {
                        readonly type: "integer";
                        readonly minimum: 0;
                    };
                    readonly totalModels: {
                        readonly type: "integer";
                        readonly minimum: 0;
                    };
                    readonly failures: {
                        readonly type: "integer";
                        readonly minimum: 0;
                    };
                    readonly updatedProviderIds: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                        };
                    };
                    readonly warnings: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                        };
                    };
                    readonly errors: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                        };
                    };
                    readonly providers: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "object";
                            readonly properties: {
                                readonly id: {
                                    readonly type: "string";
                                };
                                readonly baseURL: {
                                    readonly type: "string";
                                };
                                readonly models: {
                                    readonly type: "integer";
                                    readonly minimum: 0;
                                };
                                readonly modelIDs: {
                                    readonly type: "array";
                                    readonly items: {
                                        readonly type: "string";
                                    };
                                };
                                readonly refreshedAt: {
                                    readonly type: "number";
                                };
                                readonly lastError: {
                                    readonly type: "string";
                                };
                                readonly pending: {
                                    readonly type: "boolean";
                                };
                            };
                            readonly required: readonly ["id", "baseURL", "models", "modelIDs"];
                            readonly additionalProperties: false;
                        };
                    };
                    readonly cancelled: {
                        readonly type: "boolean";
                    };
                };
                readonly required: readonly ["providerCount", "totalModels", "failures", "updatedProviderIds", "warnings", "errors", "providers"];
                readonly additionalProperties: false;
            };
        };
        readonly addProvider: {
            readonly input: {
                readonly type: "object";
                readonly properties: {
                    readonly providerID: {
                        readonly type: "string";
                        readonly minLength: 1;
                        readonly maxLength: 128;
                    };
                    readonly baseURL: {
                        readonly type: "string";
                        readonly minLength: 1;
                        readonly maxLength: 2048;
                    };
                    readonly name: {
                        readonly type: "string";
                        readonly maxLength: 256;
                    };
                    readonly apiKey: {
                        readonly type: "string";
                        readonly maxLength: 8192;
                    };
                    readonly overwrite: {
                        readonly type: "boolean";
                    };
                };
                readonly required: readonly ["providerID", "baseURL"];
                readonly additionalProperties: false;
            };
            readonly output: {
                readonly type: "object";
                readonly properties: {
                    readonly ok: {
                        readonly type: "boolean";
                    };
                    readonly code: {
                        readonly type: "string";
                        readonly enum: readonly ["invalid", "duplicate", "approval_required", "discovery_failed", "config_error", "conflict", "cancelled"];
                    };
                    readonly message: {
                        readonly type: "string";
                    };
                    readonly modelCount: {
                        readonly type: "integer";
                        readonly minimum: 0;
                    };
                    readonly configPath: {
                        readonly type: "string";
                    };
                    readonly credentialStored: {
                        readonly type: "boolean";
                    };
                    readonly warnings: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                        };
                    };
                };
                readonly required: readonly ["ok", "message"];
                readonly additionalProperties: false;
            };
        };
    };
    readonly events: {};
};
export type DynamicProvidersRpc = typeof DynamicProvidersRpc;
/** Secret-free per-provider state, safe to return over RPC and tool output. */
export interface ProviderStatus {
    readonly id: string;
    readonly baseURL: string;
    readonly models: number;
    readonly modelIDs: readonly string[];
    readonly refreshedAt?: number;
    readonly lastError?: string;
    /** Added in this session and not yet acknowledged by a config reload. */
    readonly pending?: boolean;
}
export interface RefreshResult {
    readonly providerCount: number;
    readonly totalModels: number;
    readonly failures: number;
    readonly updatedProviderIds: readonly string[];
    readonly warnings: readonly string[];
    readonly errors: readonly string[];
    readonly providers: readonly ProviderStatus[];
    readonly cancelled?: boolean;
}
export type AddErrorCode = (typeof ADD_ERROR_CODES)[number];
export type AddProviderResult = {
    readonly ok: true;
    readonly message: string;
    readonly modelCount: number;
    readonly configPath: string;
    readonly credentialStored: boolean;
    readonly warnings: readonly string[];
} | {
    readonly ok: false;
    readonly code: AddErrorCode;
    readonly message: string;
};
export declare function isProviderStatus(value: unknown): value is ProviderStatus;
/**
 * Runtime narrowing for RPC results received by a client (the TUI). The output JSON
 * schemas above describe the union of both result shapes; these guards are the
 * discriminated check (success-only fields required on success, known code on failure).
 */
export declare function isRefreshResult(value: unknown): value is RefreshResult;
export declare function isAddProviderResult(value: unknown): value is AddProviderResult;
