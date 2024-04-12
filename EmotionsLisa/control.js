let video = document.getElementById("videoElement");
let modelFingers;
let handPrediction = null;

let indexXb = null;
let indexYb = null;
let indexX = null;
let indexY = null;

let thumbXb = null;
let thumbYb = null;
let thumbX = null;
let thumbY = null;

let pinkyXb = null;
let pinkyYb = null;
let pinkyX = null;
let pinkyY = null;

let dist = 0;

let firstFlag = false;
let secondFlag = false;
let thirdFlag = false;
let fourthFlag = false;
let fifthFlag = false;

let firstVideoInterval = null;
let secondVideoInterval = null;
let thirdVideoInterval = null;
let fourthVideoInterval = null;
let fifthVideoInterval = null;

let firstVideo = document.getElementById("myVideo");
let secondVideo = document.getElementById("myVideo1");

let firstCount = 0;
let secondCount = 0;
let thirdCount = 0;
let fourthCount = 0;
let fifthCount = 0;

let happyScore = null;
let happy = null;

const detectHandPoses = async () => {
  const prediction = await modelFingers.estimateHands(video);
  handPrediction = prediction;

  indexXb =
    (handPrediction && handPrediction[0]?.annotations?.indexFinger[0][0]) ||
    null;
  indexYb =
    (handPrediction && handPrediction[0]?.annotations?.indexFinger[0][1]) ||
    null;
  indexX =
    (handPrediction && handPrediction[0]?.annotations?.indexFinger[3][0]) ||
    null;
  indexY =
    (handPrediction && handPrediction[0]?.annotations?.indexFinger[3][1]) ||
    null;

  thumbXb =
    (handPrediction && handPrediction[0]?.annotations?.thumb[1][0]) || null;
  thumbYb =
    (handPrediction && handPrediction[0]?.annotations?.thumb[1][1]) || null;
  thumbX =
    (handPrediction && handPrediction[0]?.annotations?.thumb[3][0]) || null;
  thumbY =
    (handPrediction && handPrediction[0]?.annotations?.thumb[3][1]) || null;

  pinkyXb =
    (handPrediction && handPrediction[0]?.annotations?.pinky[0][0]) || null;
  pinkyYb =
    (handPrediction && handPrediction[0]?.annotations?.pinky[0][1]) || null;
  pinkyX =
    (handPrediction && handPrediction[0]?.annotations?.pinky[3][0]) || null;
  pinkyY =
    (handPrediction && handPrediction[0]?.annotations?.pinky[3][1]) || null;
};

const emotions = async () => {
  const displaySize = { width: video.width, height: video.height };
  const detections = await faceapi
    .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceExpressions();
  happyScore = detections[0]?.expressions?.happy || null;
};

function happySmile() {
  if (happyScore > 0.5) {
    return true;
  }
  return false;
}

function distance(x, y, x1, y1) {
  return Math.sqrt(Math.pow(x1 - x, 2) + Math.pow(y1 - y, 2));
}

function bant(length = 50) {
  if (indexX && indexY && thumbX && thumbY) {
    dist = distance(indexX, indexY, thumbX, thumbY);
    return dist < length;
  }
  return false;
}

function cap() {
  let h = indexYb - indexY;
  let w = indexXb - indexX;

  if (indexX && thumbX && pinkyX) {
    if (
      (Math.abs(h) <= 50 && w <= -30 && w >= -140) ||
      (Math.abs(h) <= 50 && w <= 140 && w >= 30)
    )
      return true;
  }
  return false;
}

function walls() {
  let h = indexYb - indexY;
  let w = indexXb - indexX;
  if (indexX && thumbX && pinkyX) {
    if (Math.abs(w) <= 40 && h >= 20 && h <= 140) return true;
  }
  return false;
}

const setupCamera = () => {
  navigator.mediaDevices
    .getUserMedia({
      video: {},
      audio: false,
    })
    .then((stream) => {
      video.srcObject = stream;
    });
};

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("models"),
  faceapi.nets.faceExpressionNet.loadFromUri("models"),
]).then(setupCamera);

function startVideo() {
  firstVideo.play();
}

function startVideo1() {
  secondVideo.play();
}

function stopVideo() {
  firstVideo.pause();
}

function stopVideo1() {
  secondVideo.pause();
}

function again() {
  firstVideo.currentTime = 0;
  stopVideo();
}

firstVideoInterval = setInterval(() => {
  if (walls()) {
    firstCount++;
    if (firstCount >= 4) {
      startVideo();
      setTimeout(stopVideo, 2320); /// установить
      setTimeout(() => {
        firstFlag = true;
      }, 2400);
      clearInterval(firstVideoInterval);
    }
  } else {
    firstCount = 0;
  }
}, 250);

secondVideoInterval = setInterval(() => {
  if (walls() && firstFlag) {
    secondCount++;
    if (secondCount >= 4) {
      startVideo();
      setTimeout(stopVideo, 2480); /// установить
      setTimeout(() => {
        secondFlag = true;
      }, 2500);
      clearInterval(secondVideoInterval);
    }
  } else {
    capCount = 0;
  }
}, 250);

thirdVideoInterval = setInterval(() => {
  if (cap() && secondFlag) {
    thirdCount++;
    if (thirdCount >= 4) {
      startVideo();
      setTimeout(stopVideo, 1000); /// установить
      setTimeout(() => {
        thirdFlag = true;
      }, 2500);
      clearInterval(thirdVideoInterval);
    }
  } else {
    thirdCount = 0;
  }
}, 250);

fourthVideoInterval = setInterval(() => {
  if (walls() && thirdFlag) {
    fourthCount++;
    if (fourthCount >= 4) {
      startVideo();
      setTimeout(() => {
        fourthFlag = true;
      }, 2500);
      clearInterval(fourthVideoInterval);
    }
  } else {
    fourthCount = 0;
  }
}, 250);

fifthVideoInterval = setInterval(() => {
  if (happySmile()) {
    fifthCount++;
    if (fifthCount >= 4) {
      stopVideo1();
    }
  } else {
    fifthCount = 0;
  }
  console.log("fifthCount: ", fifthCount);
}, 250);

firstVideo.addEventListener("ended", () => {
  stopVideo();
  firstVideo.style.display = "none";
  secondVideo.style.display = "block";
  startVideo1();

  firstCount = 0;
  secondCount = 0;
  thirdCount = 0;
  fourthCount = 0;

  clearInterval(firstVideoInterval);
  clearInterval(secondVideoInterval);
  clearInterval(thirdVideoInterval);
  clearInterval(fourthVideoInterval);
});

secondVideo.addEventListener("ended", () => {
  startVideo1();
});

video.addEventListener("loadeddata", async () => {
  modelFingers = await handpose.load();
  setInterval(detectHandPoses, 50);
  setInterval(emotions, 50);

  setInterval(() => {
    console.log(happySmile());
  }, 50);
});
