// Enforce modern Javascript mode
"use strict";

const BUFFER_SIZE = 10;

// Element holding the vizualisation of what the camera sees
const cameraviz = document.querySelector("#camera-viz");

// Element holding the vizualisation of the posenet output
const posenetviz = document.querySelector("#posenet-viz");

// Element for starting the pushup challenge
const startbutton = document.querySelector("#start-button");

const repscounter = document.querySelector("#reps-counter p");

let model; // scope limité à ce script

let tPrevious = performance.now();
let fps = 0.0;

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

function updateFps() {
    const tNow = performance.now();
    fps = (1000. / (tNow - tPrevious)).toFixed(1);
    tPrevious = tNow;
}

async function predict(imageinput) {
    // Prediction #1: run input through posenet
    // estimatePose can take in an image, video or canvas html element
    const { pose, posenetOutput } = await model.estimatePose(imageinput);
    // Prediction 2: run input through teachable machine classification model
    const prediction = await model.predict(posenetOutput);
    return { pose, prediction };

    // for (let i = 0; i < prediction.length; i++) {
    //     probability = repscounter.labels[i].probability;
    //     probability.shift();
    //     probability.push(prediction[i].probability);

    //     repscounter.labels[i].probability = probability;
    //     repscounter.labels[i].filteredProbability = probability.reduce((total, el) => total + el, 0) / probability.length;
    // }

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

// // append/get elements to the DOM
// const canvas = document.getElementById("posenet-viz");
// canvas.width = size; canvas.height = size;
// ctx = canvas.getContext("2d");
