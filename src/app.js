const canvas = document.getElementById("biomedCanvas");
const ctx = canvas ? canvas.getContext("2d") : null;

const vesselReadout = document.getElementById("vessel-readout");
const pressureReadout = document.getElementById("pressure-readout");
const nerveReadout = document.getElementById("nerve-readout");

let waveOffset = 0;
let actionPotential = -70.0;
let simulationTick = 0;

function resizeCanvas() {
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const deviceScale = window.devicePixelRatio || 1;

    canvas.width = Math.max(
        1,
        Math.floor(rect.width * deviceScale)
    );

    canvas.height = Math.max(
        1,
        Math.floor(rect.height * deviceScale)
    );

    ctx.setTransform(
        deviceScale,
        0,
        0,
        deviceScale,
        0,
        0
    );
}

function cardiovascularState() {
    const cardiacPhase = waveOffset * 0.05;

    let velocity =
        25.0 +
        Math.sin(cardiacPhase) * 5.0;

    let systolic =
        120 +
        Math.sin(cardiacPhase) * 8.0;

    let diastolic =
        80 +
        Math.cos(waveOffset * 0.03) * 4.0;

    const pulseWindow = simulationTick % 60;

    if (pulseWindow < 5) {
        velocity += 15.0;
        systolic += 15.0;
    }

    return {
        velocity,
        systolic,
        diastolic
    };
}

function electrophysiologyState() {
    if (simulationTick % 80 === 0) {
        actionPotential = 40.0;
    } else {
        actionPotential +=
            (-70.0 - actionPotential) * 0.15;
    }

    return actionPotential;
}

function drawReferenceLines(width, height) {
    ctx.save();

    ctx.strokeStyle = "rgba(124, 141, 165, 0.18)";
    ctx.lineWidth = 1;

    const cardioBaseline = height * 0.38;
    const neuroBaseline = height * 0.72;

    ctx.beginPath();
    ctx.moveTo(0, cardioBaseline);
    ctx.lineTo(width, cardioBaseline);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, neuroBaseline);
    ctx.lineTo(width, neuroBaseline);
    ctx.stroke();

    ctx.fillStyle = "rgba(124, 141, 165, 0.65)";
    ctx.font = "12px Courier New";

    ctx.fillText(
        "CARDIOVASCULAR FLOW",
        16,
        cardioBaseline - 14
    );

    ctx.fillText(
        "NEURAL ACTION POTENTIAL",
        16,
        neuroBaseline - 14
    );

    ctx.restore();
}

function drawCardiovascularWave(width, height) {
    const baseline = height * 0.38;
    const amplitude = Math.min(34, height * 0.08);

    ctx.save();

    ctx.strokeStyle = "#4ade80";
    ctx.lineWidth = 2;
    ctx.shadowColor = "rgba(74, 222, 128, 0.35)";
    ctx.shadowBlur = 7;

    ctx.beginPath();

    for (let x = 0; x < width; x += 2) {
        let y =
            baseline +
            Math.sin(
                (x + waveOffset) * 0.03
            ) * amplitude;

        const pulse =
            (x + waveOffset) % 90;

        if (pulse < 6) {
            y -= amplitude * 1.2;
        }

        if (x === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }

    ctx.stroke();
    ctx.restore();
}

function drawNeuralWave(width, height) {
    const baseline = height * 0.72;

    ctx.save();

    ctx.strokeStyle = "#f87171";
    ctx.lineWidth = 2;
    ctx.shadowColor = "rgba(248, 113, 113, 0.35)";
    ctx.shadowBlur = 7;

    ctx.beginPath();

    for (let x = 0; x < width; x += 2) {
        const impulsePosition =
            (x + waveOffset) % 170;

        let y = baseline;

        if (impulsePosition < 12) {
            y -= impulsePosition * 6;
        } else if (impulsePosition < 22) {
            y -= 72 - (impulsePosition - 12) * 12;
        } else if (impulsePosition < 38) {
            y += (impulsePosition - 22) * 2.4;
        } else if (impulsePosition < 55) {
            y += 38 - (impulsePosition - 38) * 2.2;
        }

        if (x === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }

    ctx.stroke();
    ctx.restore();
}

function updateTelemetry() {
    const cardiovascular =
        cardiovascularState();

    const neuralVoltage =
        electrophysiologyState();

    if (vesselReadout) {
        vesselReadout.textContent =
            cardiovascular.velocity.toFixed(2);
    }

    if (pressureReadout) {
        pressureReadout.textContent =
            Math.round(cardiovascular.systolic) +
            "/" +
            Math.round(cardiovascular.diastolic);
    }

    if (nerveReadout) {
        nerveReadout.textContent =
            neuralVoltage.toFixed(2);
    }
}

function render() {
    if (!canvas || !ctx) return;

    simulationTick += 1;
    waveOffset += 2;

    updateTelemetry();

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    ctx.clearRect(
        0,
        0,
        width,
        height
    );

    drawReferenceLines(
        width,
        height
    );

    drawCardiovascularWave(
        width,
        height
    );

    drawNeuralWave(
        width,
        height
    );

    requestAnimationFrame(render);
}

if (canvas && ctx) {
    resizeCanvas();

    window.addEventListener(
        "resize",
        resizeCanvas
    );

    requestAnimationFrame(render);
}