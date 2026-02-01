let gyroAlpha = 0;
let gyroBeta = 0;
let gyroGamma = 0;

let baseAlpha, baseBeta, baseGamma;
let relativeAlpha = 0;
let relativeBeta = 0;
let relativeGamma = 0;

let time = 0;
let x = 0;
let y = 10;

let rectHMax = 50;

let speedX = 0.3;
let canvasHeight;

let curShape = "waveform";

let imgs = [];
let img;

let colorPalettes;
let curPaletteName = "neon";
let curPalette;

let lineHeight = 0.5;

function setup() {
  canvasHeight = windowHeight;
  let canvas = createCanvas(windowWidth, canvasHeight);
  canvas.parent("p5-canvas-container");

  colorPalettes = {
    neon: [
      [255, 0, 124],
      [0, 202, 255],
      [255, 242, 0],
    ],
    monoWhite: [
      [255, 255, 255],
      [0, 0, 0],
      [255, 255, 255],
    ],
    ravePink: [
      [255, 45, 170],
      [139, 92, 246],
      [0, 229, 255],
    ],
    earthy: [
      [236, 253, 223],
      [254, 211, 208],
      [253, 255, 235],
    ],
    monoBlack: [
      [0, 0, 0],
      [255, 255, 255],
      [0, 0, 0],
    ],
  };

  curPalette = colorPalettes[curPaletteName];
}

function draw() {
  if (start) time = millis();

  if (calibrationRequest) calibration();

  noStroke();
}

function handleOrientation(eventData) {
  document.querySelector("#requestOrientationButton").style.display = "none";
  // document.querySelector("#palette-choice").style.display = "none";

  gyroAlpha = eventData.alpha;
  gyroBeta = eventData.beta;
  gyroGamma = eventData.gamma;

  if (gyroAlpha < 180) {
    relativeAlpha = gyroAlpha;
  } else {
    relativeAlpha = 360 - gyroAlpha;
  }

  relativeBeta = abs(gyroBeta - baseBeta);
  relativeGamma = abs(gyroGamma - baseGamma);

  //console.log(relativeAlpha);

  document.querySelector("#alphaText").innerText =
    "alpha: " + Math.round(gyroAlpha);
  document.querySelector("#alphaText").style.color =
    `rgb(${curPalette[0][0]}, ${curPalette[0][1]}, ${curPalette[0][2]})`;

  document.querySelector("#betaText").innerText =
    "beta: " + Math.round(gyroBeta);
  document.querySelector("#betaText").style.color =
    `rgb(${curPalette[1][0]}, ${curPalette[1][1]}, ${curPalette[1][2]})`;

  document.querySelector("#gammaText").innerText =
    "gamma: " + Math.round(gyroGamma);
  document.querySelector("#gammaText").style.color =
    `rgb(${curPalette[2][0]}, ${curPalette[2][1]}, ${curPalette[2][2]})`;

  let sliderLineH = document.querySelector("#line-height");
  let outlineH = document.querySelector("#line-height-text");
  lineHeight = sliderLineH.value;
  outlineH.value = lineHeight;

  let sliderShapeSize = document.querySelector("#shape-size");
  let outShapeSize = document.querySelector("#shape-size-text");
  rectHMax = sliderShapeSize.value;
  outShapeSize.value = rectHMax;

  let totalSec = floor(time / 1000);
  let hr = floor(totalSec / 3600);
  let min = floor((totalSec % 3600) / 60);
  let sec = totalSec % 60;

  document.querySelector("#timeText").innerText =
    "time: " + nf(hr, 2) + ":" + nf(min, 2) + ":" + nf(sec, 2);

  document.querySelector("#frameCount").innerText =
    "total framecount: " + Math.round(imgs.length);

  rectMode(CENTER);

  let relativeAlphaMap = map(relativeAlpha, 0, 180, 1, rectHMax);
  let relativeBetaMap = map(relativeBeta, 0, 180, 1, rectHMax);
  let relativeGammaMap = map(relativeGamma, 0, 180, 1, rectHMax);
  console.log(relativeAlphaMap, relativeBetaMap, relativeGammaMap);

  let unitW = 0.3;

  //console.log(curPalette[0]);

  if (curShape == "waveform") {
    fill(curPalette[0][0], curPalette[0][1], curPalette[0][2], 255);
    rect(x, y, 0.3, relativeAlphaMap);
    fill(curPalette[1][0], curPalette[1][1], curPalette[1][2], 255);
    rect(x, y, 0.3, relativeBetaMap);
    fill(curPalette[2][0], curPalette[2][1], curPalette[2][2], 255);
    rect(x, y, 0.3, relativeGammaMap);
    speedX = 0.3;
  } else if (curShape == "rectangle") {
    rectHMax = 5;
    fill(curPalette[0][0], curPalette[0][1], curPalette[0][2], 10);
    rect(x, y, relativeAlphaMap, relativeAlphaMap);
    fill(curPalette[1][0], curPalette[1][1], curPalette[1][2], 10);
    rect(x, y, relativeBetaMap, relativeBetaMap);
    fill(curPalette[2][0], curPalette[2][1], curPalette[2][2], 10);
    rect(x, y, relativeGammaMap, relativeGammaMap);
    speedX = 1;
  } else if (curShape == "circle") {
    rectHMax = 5;
    fill(curPalette[0][0], curPalette[0][1], curPalette[0][2], 10);
    circle(x, y, relativeAlphaMap);
    fill(curPalette[1][0], curPalette[1][1], curPalette[1][2], 10);
    circle(x, y, relativeBetaMap);
    fill(curPalette[2][0], curPalette[2][1], curPalette[2][2], 10);
    circle(x, y, relativeGammaMap);
    speedX = 1;
  }

  if (start) x += speedX;

  if (x >= width) {
    x = 0;
    y += rectHMax * (lineHeight / 10);

    if (y >= windowHeight) {
      img = get();
      imgs.push(img);
      x = 0;
      y = 10;
    }
  }
}

function changeColorPalette(str) {
  curPalette = colorPalettes[str];
}

function changeShape(str) {
  curShape = str;
}

function changeBGColor(str) {
  document.querySelector("canvas").style.backgroundColor = str;

  if (str == "white") {
    console.log("haha");
    if (curPaletteName == "monoWhite") curPalette = colorPalettes["monoBlack"];
    document.querySelectorAll(".toolTitle").forEach((el) => {
      el.style.color = "black";
    });
  } else if (str == "black") {
    if (curPaletteName == "monoBlack") curPalette = colorPalettes["monoWhite"];
    document.querySelectorAll(".toolTitle").forEach((el) => {
      el.style.color = "white";
    });
  }
}

function endRecording() {
  start = false;
  img = get();
  imgs.push(img);

  let imgW = width;
  let imgH = height * imgs.length;

  let finalImage = createGraphics(imgW, imgH);

  if (document.querySelector("canvas").style.backgroundColor == "white") {
    finalImage.background(255);
  } else {
    finalImage.background(0);
  }

  for (let i = 0; i < imgs.length; i++) {
    finalImage.image(imgs[i], 0, i * height);
  }

  save(finalImage, "motion-strip.png");
}

function calibration() {
  baseAlpha = gyroAlpha;
  baseBeta = gyroBeta;
  baseGamma = gyroGamma;

  calibrationRequest = false;
}
