let gyroAlpha = 0;
let gyroBeta = 0;
let gyroGamma = 0;
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
  };

  curPalette = colorPalettes[curPaletteName];
}

function draw() {
  if (start) time = millis();

  noStroke();
}

// P5 touch events: https://p5js.org/reference/#Touch

// function windowResized() {
//   resizeCanvas(windowWidth, windowHeight);
// }

function handleOrientation(eventData) {
  document.querySelector("#requestOrientationButton").style.display = "none";
  // document.querySelector("#palette-choice").style.display = "none";

  gyroAlpha = eventData.alpha;
  gyroBeta = eventData.beta;
  gyroGamma = eventData.gamma;

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
  let gyroAlphaMap = map(gyroAlpha, 0, 360, 1, rectHMax / 4);
  let gyroBetaMap = map(gyroBeta, 0, 360, 1, rectHMax);
  let gyroGammaMap = map(gyroGamma, 0, 360, 1, rectHMax);

  let unitW = 0.3;

  //console.log(curPalette[0]);

  if (curShape == "waveform") {
    fill(curPalette[0][0], curPalette[0][1], curPalette[0][2], 180);
    rect(x, y, 0.3, gyroAlphaMap);
    fill(curPalette[1][0], curPalette[1][1], curPalette[1][2], 180);
    rect(x, y, 0.3, gyroBetaMap);
    fill(curPalette[2][0], curPalette[2][1], curPalette[2][2], 180);
    rect(x, y, 0.3, gyroGammaMap);
    speedX = 0.3;
  } else if (curShape == "rectangle") {
    fill(curPalette[0][0], curPalette[0][1], curPalette[0][2], 5);
    rect(x, y, gyroAlphaMap, gyroAlphaMap);
    fill(curPalette[1][0], curPalette[1][1], curPalette[1][2], 5);
    rect(x, y, gyroBetaMap, gyroBetaMap);
    fill(curPalette[2][0], curPalette[2][1], curPalette[2][2], 5);
    rect(x, y, gyroGammaMap, gyroGammaMap);
    speedX = 0.3;
  } else if (curShape == "circle") {
    fill(curPalette[0][0], curPalette[0][1], curPalette[0][2], 5);
    circle(x, y, gyroAlphaMap);
    fill(curPalette[1][0], curPalette[1][1], curPalette[1][2], 5);
    circle(x, y, gyroBetaMap);
    fill(curPalette[2][0], curPalette[2][1], curPalette[2][2], 5);
    circle(x, y, gyroGammaMap);
    speedX = 0.3;
  }

  if (start) x += speedX;

  if (x >= width) {
    x = 0;
    y += (rectHMax * lineHeight) / 100;

    if (y >= windowHeight) {
      img = get();
      imgs.push(img);
      background(0);
      x = 0;
      y = 10;
    }
  }
}

function changeColorPalette(str) {
  curPalette = colorPalettes[str];
  console.log(str);
}

function changeShape(str) {
  curShape = str;
}

function endRecording() {
  start = false;
  img = get();
  imgs.push(img);

  let imgW = width;
  let imgH = height * imgs.length;

  let finalImage = createGraphics(imgW, imgH);
  finalImage.background(0);

  for (let i = 0; i < imgs.length; i++) {
    finalImage.image(imgs[i], 0, i * height);
  }

  save(finalImage, "motion-strip.png");
}
