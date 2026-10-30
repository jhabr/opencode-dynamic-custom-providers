const STATUSES = new Set(["alpha", "beta", "deprecated", "active"]);
const DEFAULT_CONTEXT = 128_000;
const DEFAULT_OUTPUT = 4096;
function positiveInt(value) {
    return typeof value === "number" && Number.isFinite(value) && value >= 1 ? Math.floor(value) : undefined;
}
function finiteNonNegative(value) {
    return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : undefined;
}
function modalities(value, fallback) {
    if (!Array.isArray(value))
        return [...fallback];
    const result = [...new Set(value.filter((item) => typeof item === "string" && item.length > 0))];
    return result.length > 0 ? result : [...fallback];
}
/**
 * Converts the V1 enrichment shape into V2 native model fields. V1-only fields
 * (reasoning, temperature, attachment) have no V2 schema equivalent and are dropped.
 */
export function toNativeModel(id, model) {
    // `#` separates variants in V2 model references; sanitizeModelId already removes it.
    if (!id || id.includes("#") || id.trim() !== id)
        return undefined;
    const input = modalities(model.modalities?.input, ["text"]);
    const output = modalities(model.modalities?.output, ["text"]);
    const context = positiveInt(model.limit?.context) ?? DEFAULT_CONTEXT;
    const limitInput = positiveInt(model.limit?.input);
    const limitOutput = positiveInt(model.limit?.output) ?? DEFAULT_OUTPUT;
    const cost = [];
    if (model.cost) {
        const costInput = finiteNonNegative(model.cost.input);
        const costOutput = finiteNonNegative(model.cost.output);
        if (costInput !== undefined && costOutput !== undefined) {
            cost.push({
                input: costInput,
                output: costOutput,
                cache: {
                    read: finiteNonNegative(model.cost.cache_read) ?? 0,
                    write: finiteNonNegative(model.cost.cache_write) ?? 0,
                },
            });
        }
    }
    const released = model.release_date ? Date.parse(model.release_date) : Number.NaN;
    const status = typeof model.status === "string" && STATUSES.has(model.status)
        ? model.status
        : "active";
    return {
        id,
        name: typeof model.name === "string" && model.name.length > 0 ? model.name : id,
        ...(typeof model.family === "string" && model.family.length > 0 ? { family: model.family } : {}),
        capabilities: { tools: model.tool_call === true, input, output },
        limit: {
            context,
            ...(limitInput !== undefined ? { input: limitInput } : {}),
            output: limitOutput,
        },
        cost,
        released: Number.isFinite(released) ? released : 0,
        status,
    };
}
export function toNativeModels(models) {
    const result = [];
    for (const [id, model] of Object.entries(models)) {
        const native = toNativeModel(id, model);
        if (native)
            result.push(native);
    }
    return result;
}
/**
 * Writes discovered fields onto a host-created draft (which already carries the
 * native defaults from `Model.Info.default`). Identity fields are owned by the host.
 */
export function applyNativeModel(draft, model) {
    draft.modelID = model.id;
    draft.name = model.name;
    // Optional schema fields are exact: an explicit `undefined` fails Model.Info decoding.
    if (model.family === undefined)
        delete draft.family;
    else
        draft.family = model.family;
    draft.capabilities = {
        tools: model.capabilities.tools,
        input: [...model.capabilities.input],
        output: [...model.capabilities.output],
    };
    draft.limit = {
        context: model.limit.context,
        ...(model.limit.input !== undefined ? { input: model.limit.input } : {}),
        output: model.limit.output,
    };
    draft.cost = model.cost.map((cost) => ({
        input: cost.input,
        output: cost.output,
        cache: {
            read: cost.cache.read,
            write: cost.cache.write,
        },
    }));
    draft.time = { released: model.released };
    draft.status = model.status;
    draft.enabled = true;
}
