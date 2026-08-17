import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);

test("dashboard exposes every telemetry and control hook used by the application", async () => {
  const html = await readFile(new URL("index.html", root), "utf8");
  for (const id of [
    "biomedCanvas",
    "vessel-readout",
    "pressure-readout",
    "nerve-readout",
    "elapsed-readout",
    "toggle-button",
    "reset-button",
    "system-status",
    "flow-source",
    "pressure-source",
    "neural-source",
  ]) {
    assert.match(html, new RegExp(`id=["']${id}["']`), `missing #${id}`);
  }
});

test("application requests a versioned solver artifact and renders pressure history", async () => {
  const app = await readFile(new URL("src/app.js", root), "utf8");
  assert.match(app, /telemetry-playback\.json\?v=[0-9a-f]{8}/);
  assert.match(app, /pressureHistory/);
  assert.match(app, /REDUCED SOLVER/);
});

test("page discloses non-clinical status", async () => {
  const html = await readFile(new URL("index.html", root), "utf8");
  assert.match(html, /Not for clinical use/i);
});
