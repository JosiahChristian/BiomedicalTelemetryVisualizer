# BiomedicalTelemetryVisualizer

Browser-based scientific telemetry and visualization environment for computational biophysics and biomedical system models.

[![Web validation](https://github.com/JosiahChristian/BiomedicalTelemetryVisualizer/actions/workflows/web-validation.yml/badge.svg)](https://github.com/JosiahChristian/BiomedicalTelemetryVisualizer/actions/workflows/web-validation.yml)
[![Live application](https://img.shields.io/badge/live-GitHub%20Pages-38bdf8)](https://josiahchristian.github.io/BiomedicalTelemetryVisualizer/)

> **Current boundary:** The application loads compact, versioned playback
> traces exported by `BiomedicalSystemsSolver`. If that artifact is unavailable,
> it explicitly falls back to deterministic reduced waveform generators.

## Overview

BiomedicalTelemetryVisualizer provides a dedicated visualization layer for simulated physiological dynamics.

The project separates biomedical telemetry from the aerospace cyber-physical visualization stack and establishes an independent environment for observing cardiovascular and electrophysiological system behavior.

The current implementation plays continuously evolving solver-exported traces
for vascular flow, reduced-order arterial pressure, and neural membrane
potential. Deterministic local generators remain an explicit availability
fallback.

## Current Telemetry

The dashboard currently visualizes:

- cardiovascular flow dynamics
- transient vessel velocity
- systolic and diastolic pressure behavior
- neural action-potential propagation
- membrane-potential recovery
- continuously updated physiological telemetry

## Architecture

### HTML5 Canvas Rendering

The visualization engine uses the HTML5 Canvas API to render cardiovascular and electrophysiological waveforms directly in the browser.

### Cardiovascular Playback

The primary cardiovascular feed combines a proximal velocity trace from the
one-dimensional momentum-diffusion baseline with a separately documented
two-element Windkessel pressure cycle. These reduced models are not yet
bidirectionally coupled.

### Electrophysiological Playback

The primary neural trace is exported from the solver's spatial active-axon
Hodgkin-Huxley model. The local fallback uses a documented recurring spike,
hyperpolarization, and resting-potential recovery sequence.

### Real-Time Telemetry Registry

Physiological state variables are continuously propagated to numerical readouts while their corresponding signals are rendered on the visualization canvas.

## Repository Structure

```text
.
├── index.html                 # accessible visualization interface
├── src/app.js                # rendering, controls, and animation loop
├── src/model.js              # solver playback adapter and local fallback
├── src/styles.css            # responsive visual system
├── tests/model.test.js       # boundedness and lifecycle tests
└── .github/workflows/        # continuous validation
```

## Run and Test

Serve the repository with any static HTTP server and open `index.html`. The
application has no runtime dependencies. Run model validation with:

```bash
npm test
```

Node.js 20 or newer is required for testing.

The primary artifact is served from
`BiomedicalSystemsSolver/docs/telemetry-playback.json` and identifies its
schema, solver functions, source version, and model limitations. The arterial
readout reports the exported Windkessel cycle's systolic and diastolic extrema.
The producer publishes the corresponding
[JSON Schema](https://github.com/JosiahChristian/BiomedicalSystemsSolver/blob/main/docs/telemetry-playback.schema.json)
for integration review and compatibility checks.

## Technology

- JavaScript
- HTML5
- CSS3
- Canvas API
- Browser-native simulation
- GitHub Pages
- Node.js built-in test runner

## Related Software

- [**BiomedicalSystemsSolver**](https://github.com/JosiahChristian/BiomedicalSystemsSolver) — validated numerical modeling of cardiovascular and neural systems
- [**AeroCPSTelemetry**](https://github.com/JosiahChristian/AeroCPSTelemetry) — separate browser-based aerospace telemetry application

## Safety and Scientific Limitations

This software is an educational scientific-visualization application. It is not
a medical device, diagnostic system, patient monitor, physiological simulator,
or source of clinical guidance. The displayed values validate interface and
telemetry behavior only; they do not validate human physiology.

## Development Roadmap

Future work may include live streamed solver telemetry, uncertainty
visualization, anomaly detection, and richer physiological state monitoring.

## Live Application

[Launch Biomedical Telemetry Visualizer](https://josiahchristian.github.io/BiomedicalTelemetryVisualizer/)
