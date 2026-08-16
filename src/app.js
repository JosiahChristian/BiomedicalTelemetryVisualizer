import { DEFAULT_CONFIG, advanceState, createState, sampleSolverPlayback, validateSolverPayload } from "./model.js";

const canvas = document.querySelector("#biomedCanvas");
const ctx = canvas.getContext("2d");
const velocity = document.querySelector("#vessel-readout");
const pressure = document.querySelector("#pressure-readout");
const membrane = document.querySelector("#nerve-readout");
const elapsed = document.querySelector("#elapsed-readout");
const toggle = document.querySelector("#toggle-button");
const status = document.querySelector("#system-status");
const sourceLabels = {
  flow: document.querySelector("#flow-source"),
  pressure: document.querySelector("#pressure-source"),
  neural: document.querySelector("#neural-source"),
};
let state = createState();
let running = true;
let accumulator = 0;
let previous = performance.now();
let solverPayload = null;
const cardioHistory = [];
const neuralHistory = [];

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(rect.width * scale));
  canvas.height = Math.max(1, Math.floor(rect.height * scale));
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
}

function drawTrace(values, min, max, baseline, height, color, width) {
  if (values.length < 2) return;
  ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = 2;
  values.forEach((value, index) => {
    const x = index * width / Math.max(values.length - 1, 1);
    const y = baseline + height / 2 - ((value - min) / (max - min)) * height;
    if (index === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.stroke();
}

function draw() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = "rgba(124,141,165,.18)"; ctx.lineWidth = 1;
  [height * .36, height * .73].forEach(y => { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); });
  ctx.fillStyle = "rgba(124,141,165,.72)"; ctx.font = "12px ui-monospace";
  ctx.fillText("CARDIOVASCULAR VELOCITY TRACE", 16, height * .36 - 14);
  ctx.fillText("MEMBRANE POTENTIAL TRACE", 16, height * .73 - 14);
  drawTrace(cardioHistory, 10, 50, height * .18, height * .22, "#4ade80", width);
  drawTrace(neuralHistory, -85, 45, height * .60, height * .25, "#f87171", width);
}

function updateReadouts() {
  velocity.textContent = state.velocityCmS.toFixed(2);
  pressure.textContent = state.systolicMmhg === null ? "N/A" : `${Math.round(state.systolicMmhg)}/${Math.round(state.diastolicMmhg)}`;
  membrane.textContent = state.membraneMv.toFixed(2);
  elapsed.textContent = state.elapsed.toFixed(2);
}

function frame(now) {
  const frameSeconds = Math.min((now - previous) / 1000, .1); previous = now;
  if (running) {
    accumulator += frameSeconds;
    while (accumulator >= DEFAULT_CONFIG.timeStep) {
      state = solverPayload ? sampleSolverPlayback(solverPayload, state.elapsed + DEFAULT_CONFIG.timeStep) : advanceState(state);
      cardioHistory.push(state.velocityCmS); neuralHistory.push(state.membraneMv);
      if (cardioHistory.length > 500) { cardioHistory.shift(); neuralHistory.shift(); }
      accumulator -= DEFAULT_CONFIG.timeStep;
    }
  }
  updateReadouts(); draw(); requestAnimationFrame(frame);
}

toggle.addEventListener("click", () => {
  running = !running; toggle.textContent = running ? "Pause" : "Resume";
  status.textContent = running ? "Simulation active" : "Simulation paused";
});
document.querySelector("#reset-button").addEventListener("click", () => {
  state = createState(); cardioHistory.length = 0; neuralHistory.length = 0; accumulator = 0;
});
window.addEventListener("resize", resizeCanvas);
async function loadSolverTelemetry() {
  try {
    const response = await fetch("https://josiahchristian.github.io/BiomedicalSystemsSolver/telemetry-playback.json?v=41372a85");
    if (!response.ok) throw new Error(`telemetry request failed: ${response.status}`);
    const payload = await response.json();
    if (!validateSolverPayload(payload)) throw new Error("telemetry schema validation failed");
    solverPayload = payload;
    status.textContent = "Solver playback active";
    sourceLabels.flow.textContent = "SOLVER";
    sourceLabels.pressure.textContent = payload.pressure ? "REDUCED SOLVER" : "UNAVAILABLE";
    sourceLabels.neural.textContent = "SOLVER";
  } catch (error) {
    console.warn("Using reduced local generators:", error);
    status.textContent = "Reduced-model fallback active";
    Object.values(sourceLabels).forEach(label => { label.textContent = "SYNTHETIC"; });
  }
}

resizeCanvas(); loadSolverTelemetry(); requestAnimationFrame(frame);
