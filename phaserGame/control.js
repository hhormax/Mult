let video = document.getElementById("videoElement");
let canvas = document.getElementById("canvas");
let ctxF = canvas.getContext("2d");
let modelFingers;
let handPrediction = null;
let globalDirection = null;
let text = document.getElementById("text");

const setUpCamera = () => {
  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(function (stream) {
        video.srcObject = stream;
      })
      .catch(function (err) {
        console.log(err);
      });
  }
};

const travelDirection = async () => {
  handPrediction = await modelFingers.estimateHands(video);
  if (handPrediction && handPrediction[0]) {
    let fingerX = await handPrediction[0].annotations?.indexFinger[3][0];
    let fingerY = await handPrediction[0].annotations?.indexFinger[3][1];
    let handX = await handPrediction[0].annotations?.indexFinger[1][0];
    let handY = await handPrediction[0].annotations?.indexFinger[1][1];
    let h = handY - fingerY;
    let w = handX - fingerX;

    //console.log("h ", h);
    //console.log("w ", w);
    //const parts = ["left 👈", "right 👉", "up 👆"];

    if (Math.abs(h) <= 50 && w <= -30 && w >= -140) {
      globalDirection = "left";
      window.globalDirection = "left";
    } else if (Math.abs(h) <= 50 && w <= 140 && w >= 30) {
      globalDirection = "right";
      window.globalDirection = "right";
    } else if (Math.abs(w) <= 40 && h >= 20 && h <= 140) {
      globalDirection = "up";
      window.globalDirection = "up";
    } else {
      globalDirection = null;
      window.globalDirection = null;
    }
  } else {
    globalDirection = null;
    window.globalDirection = null;
  }
  console.log(globalDirection);
};

setUpCamera();

video.addEventListener("loadeddata", async () => {
  modelFingers = await handpose.load();
  setInterval(travelDirection, 333);
});
