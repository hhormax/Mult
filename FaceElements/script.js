
let video = document.getElementById("video");
let canvas = document.getElementById("canvas");
let modelFace;
let modelFingers;
let ctx = canvas.getContext("2d");
let ctxF = canvas.getContext("2d");
let facePrediction = null;
let handPrediction = null;

let fingerLookupIndices = {
  thumb: [0, 1, 2, 3, 4],
  indexFinger: [0, 5, 6, 7, 8],
  middleFinger: [0, 9, 10, 11, 12],
  ringFinger: [0, 13, 14, 15, 16],
  pinky: [0, 17, 18, 19, 20],
};

function drawPoint(y, x, r) {
  ctxF.beginPath();
  ctxF.arc(x, y, r, 0, 2 * Math.PI);
  ctxF.fill();
}

function drawKeypoints(keypoints) {
  const keypointsArray = keypoints;

  for (let i = 0; i < keypointsArray.length; i++) {
    const y = keypointsArray[i][0];
    const x = keypointsArray[i][1];
    drawPoint(x - 2, y - 2, 3);
  }

  const fingers = Object.keys(fingerLookupIndices);
  for (let i = 0; i < fingers.length; i++) {
    const finger = fingers[i];
    const points = fingerLookupIndices[finger].map((idx) => keypoints[idx]);
    drawPath(points, false);
  }
}

function drawPath(points, closePath) {
  const region = new Path2D();
  region.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    region.lineTo(point[0], point[1]);
  }

  if (closePath) {
    region.closePath();
  }
  ctxF.stroke(region);
}

const detectHandPoses = async () => {
  const prediction = await modelFingers.estimateHands(video);
  handPrediction = prediction;
  ctxF.clearRect(0, 0, canvas.width, canvas.height);
  ctxF.drawImage(video, 0, 0, 600, 400);
  ctxF.beginPath();
  ctxF.strokeStyle = "green";
  ctxF.fillStyle = "red";
  ctxF.lineWidth = "4";
  if (window.isDrawingEnabled) {
    prediction.forEach((pred) => {
      const result = pred.landmarks;
      const annotations = pred.annotations;
      drawKeypoints(result, annotations);
    });
  }
};

const detectFaces = async () => {
  const prediction = await modelFace.estimateFaces(video, false);
  facePrediction = prediction;
  ctx.drawImage(video, 0, 0, 600, 400);
  if (window.isDrawingEnabled) {
    prediction.forEach((pred) => {
      ctx.beginPath();
      ctx.fillStyle = "blue";
      pred.landmarks.forEach((landmark) => {
        ctx.fillRect(landmark[0], landmark[1], 5, 5);
      });
    });
  }
};

function distance(point1, point2) {
  return Math.sqrt(
    Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2)
  );
}

const closestFacePart = async () => {
  if (facePrediction && handPrediction && handPrediction[0]) {
    const landmarks = await facePrediction[0].landmarks;
    let handX = await handPrediction[0].annotations?.indexFinger[3][0];
    let handY = await handPrediction[0].annotations?.indexFinger[3][1];
    const parts = [
      "left eye 👁️",
      "right eye 👁️",
      "nose 👃🏻",
      "mouth 👄",
      "left ear 👂",
      "right ear 👂",
    ];
    let closestPart = null;
    let minDistance = Infinity;

    for (let i = 0; i < landmarks.length; i++) {
      const landmark = landmarks[i];
      const dist = distance([handX, handY], [landmark[0], landmark[1]]);
      if (dist < minDistance) {
        minDistance = dist;
        closestPart = parts[i];
      }
    }

    if (minDistance > 100) {
      closestPart = "none";
    }

    closestPartDisplay.textContent = closestPart; // Обновляем значение closestPartDisplay

    console.log(closestPart);
  } else {
    closestPartDisplay.textContent = "none"; // Устанавливаем "none", если ничего не показывается
    console.log("facePrediction or handPrediction is not available yet.");
  }
};

let closestPart = async () => {
  console.log(facePrediction);
};

const setupCamera = () => {
  navigator.mediaDevices
    .getUserMedia({
      video: { width: 600, height: 400 },
      audio: false,
    })
    .then((stream) => {
      video.srcObject = stream;
    });
};

setupCamera();

video.addEventListener("loadeddata", async () => {
  modelFace = await blazeface.load();
  modelFingers = await handpose.load();
  setInterval(detectFaces, 10);
  setInterval(detectHandPoses, 12);
  setInterval(() => {
    if (facePrediction && handPrediction) {
      closestFacePart();
    } else {
      console.log("Waiting for predictions...");
    }
  }, 15);
});
