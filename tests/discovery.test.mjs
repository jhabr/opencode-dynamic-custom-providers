import { test } from "node:test"
import assert from "node:assert"
import { capOutputLimit, normalizeModelId } from "../dist/discovery.js"

test("normalizeModelId strips models/ prefix and org prefixes", () => {
  assert.strictEqual(normalizeModelId("gpt-4o"), "gpt-4o")
  assert.strictEqual(normalizeModelId("models/gemini-2.5-flash"), "gemini-2.5-flash")
  assert.strictEqual(normalizeModelId("meta-llama/llama-3-8b"), "llama-3-8b")
  assert.strictEqual(normalizeModelId("openai/gpt-4o-mini"), "gpt-4o-mini")
})

test("normalizeModelId maps colons to hyphens", () => {
  assert.strictEqual(normalizeModelId("deepseek-ai/deepseek-coder:6.7b"), "deepseek-coder-6.7b")
})

test("capOutputLimit keeps output limits below the context window", () => {
  assert.strictEqual(capOutputLimit(200_000, 64_000), 64_000)
  assert.strictEqual(capOutputLimit(8_192, 4_096), 4_096)
})

test("capOutputLimit caps output limits that fill the whole context window", () => {
  assert.strictEqual(capOutputLimit(262_144, 262_144), 32_768)
  assert.strictEqual(capOutputLimit(16_384, 16_384), 8_192)
  assert.strictEqual(capOutputLimit(8_192, 100_000), 4_096)
})
