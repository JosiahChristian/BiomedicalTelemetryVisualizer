export const DEFAULT_CONFIG = Object.freeze({
  timeStep: 0.02,
  heartRateBpm: 72,
  restingPotentialMv: -70,
  spikePotentialMv: 40,
  neuralPeriodSeconds: 1.6,
});

export function createState() {
  return { elapsed: 0, velocityCmS: 20, systolicMmhg: 120, diastolicMmhg: 80, arterialPressureMmhg: 80, membraneMv: -70 };
}

export function sampleState(elapsed, config = DEFAULT_CONFIG) {
  if (!Number.isFinite(elapsed) || elapsed < 0) throw new RangeError("elapsed must be non-negative and finite");
  const cardiacPhase = (elapsed * config.heartRateBpm / 60) % 1;
  const pulse = Math.exp(-Math.pow((cardiacPhase - 0.16) / 0.10, 2));
  const recoil = Math.exp(-Math.pow((cardiacPhase - 0.42) / 0.16, 2));
  const velocityCmS = 17 + 25 * pulse + 5 * recoil;
  const systolicMmhg = 108 + 15 * pulse + 2 * recoil;
  const diastolicMmhg = 72 + 8 * (1 - cardiacPhase) + 2 * recoil;
  const arterialPressureMmhg = diastolicMmhg + (systolicMmhg - diastolicMmhg) * pulse;

  const neuralPhase = elapsed % config.neuralPeriodSeconds;
  let membraneMv = config.restingPotentialMv;
  if (neuralPhase < 0.04) membraneMv = config.restingPotentialMv + (neuralPhase / 0.04) * 110;
  else if (neuralPhase < 0.12) membraneMv = config.spikePotentialMv - ((neuralPhase - 0.04) / 0.08) * 120;
  else if (neuralPhase < 0.28) membraneMv = -80 + ((neuralPhase - 0.12) / 0.16) * 10;

  return { elapsed, velocityCmS, systolicMmhg, diastolicMmhg, arterialPressureMmhg, membraneMv };
}

export function advanceState(state, config = DEFAULT_CONFIG) {
  return sampleState(state.elapsed + config.timeStep, config);
}

export function validateSolverPayload(payload) {
  if (payload?.schema !== "biomedical-telemetry-playback/v1") return false;
  const axon = payload.axon?.voltage_mv;
  const flow = payload.flow?.velocity_cm_per_s;
  const pressure = payload.pressure;
  const validAxon = Array.isArray(axon) && axon.length > 1 && axon.every(Number.isFinite);
  const validFlow = Array.isArray(flow) && flow.length > 1 && flow.every(Number.isFinite);
  const liveFlow = validFlow && Math.max(...flow) > 0 && Math.max(...flow) - Math.min(...flow) > 0.01;
  const validPressure = pressure === undefined || (
    Number.isFinite(pressure.systolic_mmhg)
    && Number.isFinite(pressure.diastolic_mmhg)
    && pressure.systolic_mmhg > pressure.diastolic_mmhg
    && Array.isArray(pressure.pressure_mmhg)
    && pressure.pressure_mmhg.length > 1
    && pressure.pressure_mmhg.every(Number.isFinite)
  );
  return validAxon && liveFlow && validPressure;
}

export function sampleSolverPlayback(payload, elapsed, periodSeconds = 6) {
  if (!validateSolverPayload(payload)) throw new TypeError("invalid solver payload");
  const phase = (elapsed % periodSeconds) / periodSeconds;
  const axonIndex = Math.min(payload.axon.voltage_mv.length - 1, Math.floor(phase * payload.axon.voltage_mv.length));
  const flowIndex = Math.min(payload.flow.velocity_cm_per_s.length - 1, Math.floor(phase * payload.flow.velocity_cm_per_s.length));
  const pressureValues = payload.pressure?.pressure_mmhg;
  const pressureIndex = pressureValues
    ? Math.min(pressureValues.length - 1, Math.floor(phase * pressureValues.length))
    : null;
  return {
    elapsed,
    velocityCmS: payload.flow.velocity_cm_per_s[flowIndex],
    systolicMmhg: payload.pressure?.systolic_mmhg ?? null,
    diastolicMmhg: payload.pressure?.diastolic_mmhg ?? null,
    arterialPressureMmhg: pressureIndex === null ? null : pressureValues[pressureIndex],
    membraneMv: payload.axon.voltage_mv[axonIndex],
  };
}
