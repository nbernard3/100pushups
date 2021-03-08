// Enforce modern Javascript mode
"use strict";

// Element holding the vizualisation of what the camera sees
const cameraviz = document.querySelector("#camera-viz");

// Element holding the vizualisation of the posenet output
const posenetviz = document.querySelector("#posenet-viz");

// Element for starting the pushup challenge
const startbutton = document.querySelector("#start-button");

// Element for displaying fps and reps number
const repscounter = document.querySelector("#reps-counter p");

// The artificial brain
let model;

// Current FPS
let fps = 0.0;

// Last call date
let tPrevious = performance.now();

startbutton.onclick = async function () {

    startbutton.style.display = "none";
    await startCamera();
    await loadPosenet();
    launchPredictionLoop();
};

/**
 * Open the camera and launch streaming.
 */
async function startCamera() {

    let constraints = { video: { facingMode: "user" }, audio: false };
    let stream = await navigator.mediaDevices.getUserMedia(constraints);
    cameraviz.srcObject = stream;
    await cameraviz.play();
    console.info("Camera started");
}

/**
 * Loads the artificial brain.
 */
async function loadPosenet() {

    const url = "./model/";
    const modelURL = url + "model.json";
    const metadataURL = url + "metadata.json";

    model = await tmPose.load(
        modelURL,
        metadataURL);
    console.info("Model launched");
}

/**
 * Launch the infinite loop.
 */
function launchPredictionLoop() {
    posenetviz.height = cameraviz.height;
    posenetviz.width = cameraviz.width;
    window.requestAnimationFrame(predictionLoop);
}

function predictionLoop(timestamp) {

    const { pose, prediction } = predict(cameraviz);
    drawPose(pose);
    displayReps();
    window.requestAnimationFrame(predictionLoop);
}

async function predict(imageinput) {

    // Prediction #1: run input through posenet
    // estimatePose can take in an image, video or canvas html element
    const { pose, posenetOutput } = await model.estimatePose(imageinput);
    // Prediction 2: run input through teachable machine classification model
    const prediction = await model.predict(posenetOutput);
    return { pose, prediction };
}

function drawPose(pose) {

    const ctx = posenetviz.getContext("2d");
    if (pose) {
        const minPartConfidence = 0.5;
        tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
        tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
    }
}

function displayReps() {
    updateFps();
    repscounter.innerText = `${fps}fps - 0reps`;
}

function updateFps() {
    const tNow = performance.now();
    fps = (1000. / (tNow - tPrevious)).toFixed(1);
    tPrevious = tNow;
}
