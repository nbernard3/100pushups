// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/pose

// the link to your model provided by Teachable Machine export panel
const URL = "./model/"; // ne peut-être assigné qu'une fois
const bufferSize = 10;

const startbutton = {
    methods: {
        start() {
            console.debug("App started.")
            startCamera();
        }
    }
}

Vue.createApp(startbutton).mount("#start-button");

const cameraview = document.querySelector("#camera-view");

function startCamera() {
    var constraints = { video: { facingMode: "user" }, audio: false };
    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
        track = stream.getTracks()[0];
        cameraview.srcObject = stream;
    }).catch(function (error) {
        console.error("Oops. Something is broken.", error);
    });
}


function startPosenet() {

    // let model, webcam, ctx; // scope limité à ce script
    // new Vue({
    //     el: "#reps-counter",
    //     data: {
    //         iReps: 0,
    //         labels: [],
    //         fps: 0.0,
    //         tPrevious: 0.0,
    //     },
    //     methods: {
    //         start: start
    //     },
    // })

    // const modelURL = URL + "model.json";
    // const metadataURL = URL + "metadata.json";

    // load the model and metadata
    // Note: the pose library adds a tmPose object to your window (window.tmPose)
    // model = await tmPose.load(
    //     modelURL,
    //     metadataURL);

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
}


const posenetviz = document.querySelector("#posenet-viz");

async function loop(timestamp) {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);

    tNow = performance.now();
    repscounter.fps = (1000. / (tNow - repscounter.tPrevious)).toFixed(1);
    repscounter.tPrevious = tNow;
}

async function predict() {
    // Prediction #1: run input through posenet
    // estimatePose can take in an image, video or canvas html element
    const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
    // Prediction 2: run input through teachable machine classification model
    const prediction = await model.predict(posenetOutput);

    for (let i = 0; i < prediction.length; i++) {
        probability = repscounter.labels[i].probability;
        probability.shift();
        probability.push(prediction[i].probability);

        repscounter.labels[i].probability = probability;
        repscounter.labels[i].filteredProbability = probability.reduce((total, el) => total + el, 0) / probability.length;
    }

    drawPose(pose);
}


function drawPose(pose) {
    if (webcam.canvas) {
        ctx.drawImage(webcam.canvas, 0, 0);
        if (pose) {
            const minPartConfidence = 0.5;
            tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
            tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
        }
    }
}



