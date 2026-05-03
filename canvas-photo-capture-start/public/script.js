let socket;
if (
  location.hostname.toLowerCase().startsWith("browsercircus") ||
  location.hostname.toLowerCase().startsWith("www")
) {
  socket = io({ path: "/canvas-photo/socket.io" }); // yields '/leon/port-4100/socket.io' or '/socket.io'
} else {
  socket = io();
}

let video;
let snapped = false;
let canvas;
let camSound = document.querySelector("#camSound");
let sendButton = document.querySelector("#sendButton");
let previewButton = document.querySelector("#preview-button");
let captureButton = document.querySelector("#captureButton");

let faceImage;
let startDrawing = false;
let canvasW = 480;
let canvasH = 480;

let videoW = 480;
let videoH = 640;

let videoOffsetY = -(videoH - canvasH) / 2; // = -80
let videoOffsetX = -(videoW - canvasW) / 2;

let canvasDisplayWidth, canvasDisplayHeight;

let videoGraphic;

let circleRatio = 0.4;

//drawing Tools
let penType = [];
let r = 0;
let g = 0;
let b = 0;
let penStrokeW = 2;
let isErasing = false;
let drawLayer;
let currentStroke = [];

let curShape = "line";
let colorInput = document.getElementById("color-picker");
let sizeSlider = document.getElementById("size-slider");
let penPreview = document.getElementById("pen-preview");

// avatar parameters
let avatarCreated = false;
let finalImage;

function setup() {
  canvas = createCanvas(canvasW, canvasH);
  canvas.parent("canvas-wrapper");

  // the canvas contains canvasW x canvasH pixels
  // that also defines the resolution of the captured images
  // but we can make it appear smaller on the actual website:
  canvasDisplayHeight = window.innerHeight * 0.5;
  canvas.elt.style.height = canvasDisplayHeight + "px";
  canvasDisplayWidth = canvasDisplayHeight * (canvasW / canvasH);
  canvas.elt.style.width = canvasDisplayWidth + "px";

  videoGraphic = createGraphics(canvasW, canvasH);
  // Create a video capture (aka webcam input)
  // video = createCapture(VIDEO);
  video = createCapture({
    video: { facingMode: "user" },
    audio: false,
  });

  // Specify the resolution of the webcam input (too high and you may notice performance issues, especially if you're extracting info from it or adding filters)
  video.size(canvasW, canvasH);

  // In some browsers, you may notice that a second video appears onscreen! That's because p5js actually creates a <video> html element, which then is piped into the canvas – the added command below ensures we don't see it :)
  video.hide();

  drawLayer = createGraphics(canvasW, canvasH);
  drawLayer.clear();
  background(255);
}

function draw() {
  strokeWeight(5);
  stroke(255);
  noFill();
  rect(0, 0, width, height);

  if (!avatarCreated) {
    background(255);
    if (snapped == false) {
      videoGraphic.clear();
      videoGraphic.push();
      videoGraphic.circle(
        videoGraphic.width / 2,
        videoGraphic.height / 2,
        videoGraphic.width * circleRatio,
      );
      videoGraphic.canvas.getContext("2d").clip();

      videoGraphic.translate(videoGraphic.width, 0);
      videoGraphic.scale(-1, 1);
      videoGraphic.image(video, videoOffsetX, videoOffsetY, videoW, videoH);
      videoGraphic.pop();

      image(videoGraphic, 0, 0);
    } else {
      if (videoGraphic) image(videoGraphic, 0, 0);
      image(drawLayer, 0, 0);
    }
  } else {
    background(205, 234, 255);
    image(finalImage, 0, 0);
  }
}

// pressing the CAPTURE BUTTON:
captureButton.addEventListener("click", function () {
  if (snapped == false) {
    snapped = true;

    captureButton.innerText = "Try Again";
    captureButton.style.width = "30%";
    captureButton.style.backgroundColor = "rgb(255, 191, 191)";

    previewButton.style.display = "flex";
    document.getElementById("pen-tools").style.display = "flex";

    //camSound.play();
  } else {
    // CLICK OF "Try Again" BUTTON
    resetCamera();
  }
});

// pressing the PREVIEW BUTTON:
previewButton.addEventListener("click", function () {
  avatarCreated = true;
  finalImage = createFinalImg();
  sendButton.style.visibility = "visible";

  document.getElementById("pen-tools").style.display = "none";
  previewButton.style.display = "none";
});

// pressing the SEND to server button
sendButton.addEventListener("click", function () {
  finalImage.elt.toBlob(sendImageToServer, "image/png");
});

function createFinalImg() {
  let finalImage = createGraphics(canvasW, canvasH);
  finalImage.clear();

  finalImage.image(videoGraphic, 0, 0);
  finalImage.image(drawLayer, 0, 0);

  return finalImage;
}
// socket handling incoming photos:

// array of photos:
// socket.on("historic-photos", function (data) {
//   data.forEach(prependPhoto);
// });

// individual photo:
socket.on("new-photo", function (data) {
  console.log(data);
  //prependPhoto(data);
});

// document.querySelector("#deleteButton").addEventListener("click", function () {
//   socket.emit("delete-photos");
//   document.querySelector("#images").innerHTML = "";
// });

// FUNCTIONS:

function resetCamera() {
  snapped = false;
  sendButton.style.visibility = "hidden";
  captureButton.innerText = "SNAP!";
  captureButton.style.width = "50%";
  captureButton.style.backgroundColor = "initial";

  avatarCreated = false;
  finalImage = null;

  document.getElementById("pen-tools").style.display = "none";
  drawLayer.clear();
}

function sendImageToServer(blob) {
  console.log(blob);
  fetch("upload-photo", {
    method: "POST",
    headers: { "Content-Type": "image/png" }, // or jvideoGraphic
    body: blob,
  }).then((data) => {
    console.log(data.status);
    resetCamera();
  });
}

// function prependPhoto(URL) {
//   // console.log(data, socket.id);
//   let album = document.querySelector("#album");
//   let img = document.createElement("img");
//   let images = album.querySelector("#images");
//   img.src = URL;
//   images.prepend(img);
// }

function cropFace() {
  // draw cam image into graphic layer and clip it there
  // turn graphic layer into blob and send that to server
  faceImage = createGraphics(canvasW, canvasH);
  faceImage.clip(mask);
  faceImage.push();
  faceImage.translate(canvasW, 0);
  faceImage.scale(-1, 1);
  faceImage.image(video, 0, 0, canvasW, canvasH);
  faceImage.pop();
}

function mask() {
  faceImage.circle(width / 2, height / 2, width * circleRatio);
}

// drawing functions
function touchStarted() {
  if (!snapped || touches.length === 0) return;

  let x = touches[0].x;
  let y = touches[0].y;
  lastX = x;
  lastY = y;
}

function touchMoved() {
  if (!snapped || touches.length === 0) return;

  let x = touches[0].x;
  let y = touches[0].y;

  if (isErasing) {
    drawLayer.erase();
    drawLayer.fill(255);

    drawLayer.circle(x, y, penStrokeW);
    drawLayer.noErase();
  } else {
    drawLayer.stroke(colorInput.value);
    drawLayer.fill(colorInput.value);
    if (curShape == "line") {
      drawLayer.strokeWeight(penStrokeW);
      drawLayer.line(lastX, lastY, x, y);
    } else if (curShape == "strokeCircle") {
      drawLayer.noFill();
      drawLayer.strokeWeight(1);
      drawLayer.circle(x, y, penStrokeW);
    } else if (curShape == "circle") {
      drawLayer.noStroke();
      // drawLayer.strokeWeight(penStrokeW);
      drawLayer.circle(x, y, penStrokeW);
    }
    lastX = x;
    lastY = y;
  }
}

function touchEnd() {}

colorInput.addEventListener("input", updatePen);
sizeSlider.addEventListener("input", updatePen);

// change the pen type
function changeShape(str) {
  isErasing = false;
  curShape = str;
  document.getElementById("eraser-btn").classList.toggle("active", isErasing);
}

function updatePen() {
  penStrokeW = sizeSlider.value * 0.5;
  penPreview.style.width = sizeSlider.value + "px";
  penPreview.style.height = sizeSlider.value + "px";
  penPreview.style.background = colorInput.value;
}

document.getElementById("eraser-btn").addEventListener("click", () => {
  isErasing = !isErasing;
  document.getElementById("eraser-btn").classList.toggle("active", isErasing);
});

document.getElementById("clear-btn").addEventListener("click", () => {
  drawLayer.clear();
});

document.querySelectorAll(".brush-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    brushType = btn.dataset.brush;

    document.querySelectorAll(".brush-btn").forEach((b) => {
      b.classList.remove("active");
    });
    btn.classList.add("active");
  });
});
