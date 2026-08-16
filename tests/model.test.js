import test from "node:test";
import assert from "node:assert/strict";
import { advanceState, createState, sampleState } from "../src/model.js";

test("initial state is explicit and reproducible", () => {
  assert.deepEqual(createState(), { elapsed: 0, velocityCmS: 20, systolicMmhg: 120, diastolicMmhg: 80, membraneMv: -70 });
});

test("reduced cardiovascular values remain bounded", () => {
  for (let time = 0; time < 10; time += 0.01) {
    const state = sampleState(time);
    assert.ok(state.velocityCmS >= 17 && state.velocityCmS < 48);
    assert.ok(state.systolicMmhg >= 108 && state.systolicMmhg < 126);
    assert.ok(state.diastolicMmhg >= 72 && state.diastolicMmhg < 83);
  }
});

test("synthetic neural cycle includes rest, spike, and recovery", () => {
  assert.equal(sampleState(0).membraneMv, -70);
  assert.equal(sampleState(0.04).membraneMv, 40);
  assert.equal(sampleState(0.12).membraneMv, -80);
  assert.equal(sampleState(0.28).membraneMv, -70);
});

test("advance uses the configured fixed time step", () => {
  assert.equal(advanceState(createState()).elapsed, 0.02);
});

test("invalid model time is rejected", () => {
  assert.throws(() => sampleState(-1), RangeError);
  assert.throws(() => sampleState(Number.NaN), RangeError);
});
