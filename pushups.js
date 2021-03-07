// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/pose

// Enforce modern Javascript mode
"use strict";

const BUFFER_SIZE = 10;

// Element holding the vizualisation of what the camera sees
const cameraviz = document.querySelector("#camera-viz");

// Element holding the vizualisation of the posenet output
const posenetviz = document.querySelector("#posenet-viz");

// Element for starting the pushup challenge
const startbutton = document.querySelector("#start-button");

let model; // scope limité à ce script

/**
 * Open the camera and launch streaming.
 */
async function startCamera() {

    let constraints = { video: { facingMode: "user" }, audio: false };
    let stream = await navigator.mediaDevices.getUserMedia(constraints);
    cameraviz.srcObject = stream;
}


async function loadPosenet() {

    const URL = "./model/";
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // load the model and metadata
    // Note: the pose library adds a tmPose object to your window (window.tmPose)
    model = await tmPose.load(
        modelURL,
        metadataURL);
}

function launchPredictionLoop() {
    posenetviz.height = cameraviz.height;
    posenetviz.width = cameraviz.width;
    window.requestAnimationFrame(predictionLoop);
}

function predictionLoop(timestamp) {
    // tNow = performance.now();
    // repscounter.fps = (1000. / (tNow - repscounter.tPrevious)).toFixed(1);
    // repscounter.tPrevious = tNow;

    // webcam.update(); // update the webcam frame
    const { pose, prediction } = predict(cameraviz);
    drawPose(pose);
    window.requestAnimationFrame(predictionLoop);
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


// model.getClassLabels().forEach(
//     el => repscounter.labels.push({
//         name: el,
//         probability: new Array(bufferSize).fill(0),
//         filteredProbability: 0,
//     }))

// // Convenience function to setup a webcam
// const size = 200;
// const flip = true; // whether to flip the webcam
// webcam = new tmPose.Webcam(size, size, flip); // width, height, flip
// await webcam.setup(); // request access to the webcam
// await webcam.play();
// window.requestAnimationFrame(loop);

// // append/get elements to the DOM
// const canvas = document.getElementById("posenet-viz");
// canvas.width = size; canvas.height = size;
// ctx = canvas.getContext("2d");
