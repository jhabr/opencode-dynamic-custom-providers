// Fork additions to V2 discovery: provider headers are sent on the /models request, and
// output limits that fill (most of) the context window are capped. Loopback fixture only.
import { test, beforeEach, afterEach } from "node:test"
import assert from "node:assert/strict"
import { capOutputLimit, clearModelsDevCache, discoverAndEnrich, fetchEndpointModels } from "../../packages/v2/dist/v2/discover.js"
import { headerSecrets } from "../../packages/v2/dist/v2/secure.js"
import { startFixture, stubModelsDev } from "./helpers.mjs"

let restore
let fixture

beforeEach(async () => {
  clearModelsDevCache()
  restore = stubModelsDev({})
  fixture = await startFixture({ models: ["fixture-a"] })
})

afterEach(async () => {
  restore()
  await fixture.close()
})

test("capOutputLimit keeps output limits up to half the context window", () => {
  assert.equal(capOutputLimit(200_000, 64_000), 64_000)
  assert.equal(capOutputLimit(8_192, 4_096), 4_096)
})

test("capOutputLimit caps output limits that fill most or all of the context window", () => {
  assert.equal(capOutputLimit(262_144, 262_144), 32_768)
  assert.equal(capOutputLimit(262_144, 235_929), 32_768)
  assert.equal(capOutputLimit(16_384, 12_000), 8_192)
  assert.equal(capOutputLimit(8_192, 100_000), 4_096)
})

test("discoverAndEnrich caps an endpoint output limit equal to the context window", async () => {
  fixture.state.models = [
    { id: "full", context_length: 262_144, max_completion_tokens: 262_144 },
    { id: "sane", context_length: 131_072, max_completion_tokens: 16_384 },
  ]
  const result = await discoverAndEnrich(fixture.baseURL)
  assert.deepEqual(result.full.limit, { context: 262_144, input: undefined, output: 32_768 })
  assert.equal(result.sane.limit.output, 16_384)
})

test("fetchEndpointModels sends provider headers; an explicit Authorization wins over the API key", async () => {
  await fetchEndpointModels(fixture.baseURL, { apiKey: "synthetic-key-0001", headers: { user_key: "gateway-key-0001" } })
  await fetchEndpointModels(fixture.baseURL, { apiKey: "synthetic-key-0001", headers: { Authorization: "Token header-wins-0001" } })
  const [first, second] = fixture.state.seenHeaders
  assert.equal(first.user_key, "gateway-key-0001")
  assert.equal(first.authorization, "Bearer synthetic-key-0001")
  assert.equal(second.authorization, "Token header-wins-0001")
})

test("headerSecrets returns only credential-like header values", () => {
  assert.deepEqual(
    headerSecrets({ user_key: "a", Authorization: "b", "X-Api-Token": "c", Cookie: "d", "X-Org": "acme", Accept: "application/json" }),
    ["a", "b", "c", "d"],
  )
  assert.deepEqual(headerSecrets(undefined), [])
})
