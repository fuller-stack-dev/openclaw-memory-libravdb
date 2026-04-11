import test from "node:test";
import assert from "node:assert/strict";

import { hashBytes } from "../../src/markdown-hash.js";

test("markdown hash sentinel is stable and changes with content", () => {
  const left = hashBytes(new Uint8Array([1, 2, 3, 4]));
  const right = hashBytes(new Uint8Array([1, 2, 3, 4]));
  const different = hashBytes(new Uint8Array([1, 2, 3, 5]));

  assert.equal(left, right);
  assert.notEqual(left, different);
});
