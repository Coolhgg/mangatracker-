// Basic smoke test using Node's built-in test runner (no extra deps)
import test from 'node:test'
import assert from 'node:assert'

// Ensure environment and basic imports work

test('smoke: environment boots', () => {
  assert.ok(process.version, 'node has a version')
})

test('smoke: simple math', () => {
  assert.strictEqual(2 + 2, 4)
})