export const DEFAULT_CONFIG = Object.freeze({
  timeStep: 0.02,
  heartRateBpm: 72,
  restingPotentialMv: -70,
  spikePotentialMv: 40,
  neuralPeriodSeconds: 1.6,
});

export function createState() {
  return { elapsed: 0, velocityCmS: 20, systolicMmhg: 120, diastolicMmhg: 80, membraneMv: -70 };
}

export function sampleState(elapsed, config = DEFAULT_CONFIG) {
  if (!Number.isFinite(elapsed) || elapsed < 0) throw new RangeError("elapsed must be non-negative and finite");
  const cardiacPhase = (elapsed * config.heartRateBpm / 60) % 1;
  const pulse = Math.exp(-Math.pow((cardiacPhase - 0.16) / 0.10, 2));
  const recoil = Math.exp(-Math.pow((cardiacPhase - 0.42) / 0.16, 2));
  const velocityCmS = 17 + 25 * pulse + 5 * recoil;
  const systolicMmhg = 108 + 15 * pulse + 2 * recoil;
  const diastolicMmhg = 72 + 8 * (1 - cardiacPhase) + 2 * recoil;

  const neuralPhase = elapsed % config.neuralPeriodSeconds;
  let membraneMv = config.restingPotentialMv;
  if (neuralPhase < 0.04) membraneMv = config.restingPotentialMv + (neuralPhase / 0.04) * 110;
  else if (neuralPhase < 0.12) membraneMv = config.spikePotentialMv - ((neuralPhase - 0.04) / 0.08) * 120;
  else if (neuralPhase < 0.28) membraneMv = -80 + ((neuralPhase - 0.12) / 0.16) * 10;

  return { elapsed, velocityCmS, systolicMmhg, diastolicMmhg, membraneMv };
}

export function advanceState(state, config = DEFAULT_CONFIG) {
  return sampleState(state.elapsed + config.timeStep, config);
}
