const videoElement = document.getElementsByClassName("input_video")[0];
const canvasElement = document.getElementsByClassName("output_canvas")[0];
const canvasCtx = canvasElement.getContext("2d");

let indexFingerX = 0;
let indexFingerBaseX = 0;
let indexFingerY = 0;
let indexFingerBaseY = 0;

const WIDTH = canvasElement.width;
const HEIGHT = canvasElement.height;

function draw(results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(
    results.image,
    0,
    0,
    canvasElement.width,
    canvasElement.height
  );
  if (results.multiHandLandmarks) {
    for (const landmarks of results.multiHandLandmarks) {
      drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
        color: "#00FF00",
        lineWidth: 2,
      });
      drawLandmarks(canvasCtx, landmarks, { color: "#FF0000", lineWidth: 1 });
    }
  }
  canvasCtx.restore();
}

function finger(results) {
  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    indexFingerX = results.multiHandLandmarks[0][8].x * WIDTH;
    indexFingerBaseX = results.multiHandLandmarks[0][5].x * WIDTH;
    indexFingerY = results.multiHandLandmarks[0][8].y * HEIGHT;
    indexFingerBaseY = results.multiHandLandmarks[0][5].y * HEIGHT;

    let h = indexFingerBaseY - indexFingerY;
    let w = indexFingerBaseX - indexFingerX;

    if (Math.abs(h) <= 50 && w <= -30 && w >= -140) {
      globalDirection = "left";
      window.globalDirection = "left";
      console.log("left");
    } else if (Math.abs(h) <= 50 && w <= 140 && w >= 30) {
      globalDirection = "right";
      window.globalDirection = "right";
      console.log("right")
    } else if (Math.abs(w) <= 40 && h >= 20 && h <= 140) {
      globalDirection = "up";
      window.globalDirection = "up";
      console.log("up");
    } else {
      globalDirection = null;
      window.globalDirection = null;
    }
  } 
  else {
    globalDirection = null;
    window.globalDirection = null;
  }
}

function results(results) {
  draw(results);
  finger(results);
}

const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  },
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});

hands.onResults(results);

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({ image: videoElement });
  },
  width: 600,
  height: 400,
});
camera.start();
