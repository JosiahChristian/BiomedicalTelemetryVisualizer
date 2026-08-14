# BiomedicalTelemetryVisualizer

Browser-based scientific telemetry and visualization environment for computational biophysics and biomedical system models.

## Overview

BiomedicalTelemetryVisualizer provides a dedicated visualization layer for simulated physiological dynamics.

The project separates biomedical telemetry from the aerospace cyber-physical visualization stack and establishes an independent environment for observing cardiovascular and electrophysiological system behavior.

The current implementation renders continuously evolving physiological signals while exposing numerical telemetry associated with vascular flow, blood pressure, and neural membrane potential.

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

### Cardiovascular Simulation

A time-varying cardiovascular state model generates vessel velocity and pressure telemetry.

Periodic pulse events perturb the underlying waveform to represent transient cardiac behavior.

### Electrophysiological Simulation

The neural telemetry model generates recurring action-potential events followed by progressive membrane repolarization toward a resting potential.

### Real-Time Telemetry Registry

Physiological state variables are continuously propagated to numerical readouts while their corresponding signals are rendered on the visualization canvas.

## Technology

- JavaScript
- HTML5
- CSS3
- Canvas API
- Browser-native simulation
- GitHub Pages

## Related Systems

BiomedicalTelemetryVisualizer complements:

- **BiomedicalSystemsSolver** — computational biophysics solver for cardiovascular and neural system models
- **Adaptive-Digital-Twin-Framework** — research framework for adaptive state estimation, uncertainty, machine learning, optimization, and intelligent control

The aerospace telemetry environment is maintained separately in **AeroCPSTelemetry**.

## Research Direction

The visualizer provides a foundation for future integration of higher-fidelity biomedical model outputs, streamed solver telemetry, uncertainty visualization, anomaly detection, and adaptive digital-twin state monitoring.

## Live Application

[Launch Biomedical Telemetry Visualizer](https://josiahchristian.github.io/BiomedicalTelemetryVisualizer/)

