let socket;
if (
  location.hostname.toLowerCase().startsWith("browsercircus") ||
  location.hostname.toLowerCase().startsWith("www")
) {
  socket = io({ path: "/ruiqi/port-4260/socket.io" }); // <-- replace!
} else {
  socket = io();
}
let testAngle;

socket.emit("my-role", { role: "phone1" });

let gyroAlpha,
  gyroBeta,
  gyroGamma = 0;

let deg = 0;

let originX;
let originY = 0;

let spd = 5;
let totalPointsNum = 550;

let deltaX = 0;

let wavePoints = [];
let wavePointsXSent = [];

function setup() {
  canvasHeight = windowHeight;
  let canvas = createCanvas(windowWidth, canvasHeight);

  originX = width / 2;

  spd = height / totalPointsNum;
  //console.log("speed:", spd);
}

function draw() {
  background(255);

  let localX = originX + deltaX;

  let curPoint = {
    x: localX,
    y: originY,
  };
  wavePoints.push(curPoint);

  wavePointsXSent.push(localX);
  strokeWeight(1);
  //text(wavePointsXSent.length, 10, 10);

  if (wavePointsXSent.length >= totalPointsNum) {
    socket.emit("wavePointsX-from-phone1", wavePointsXSent);
    console.log(wavePointsXSent);
    wavePointsXSent = [];
  }

  for (let i = wavePoints.length - 1; i >= 0; i--) {
    wavePoints[i].y += spd;

    if (wavePoints[i].y > height) {
      wavePoints.splice(i, 1);
    }
  }

  stroke(0);
  strokeWeight(10);
  noFill();
  beginShape();

  for (let i = 0; i < wavePoints.length; i++) {
    vertex(wavePoints[i].x, wavePoints[i].y);
  }
  endShape();

  strokeWeight(1);
  textSize(20);
}

let startAngle = undefined;
function handleOrientation(eventData) {
  document.querySelector("#requestOrientationButton").style.display = "none";

  gyroAlpha = eventData.alpha;
  gyroBeta = eventData.beta;
  gyroGamma = eventData.gamma;

  let smoothedAlpha = getSmoothedAlpha(gyroAlpha);

  testAngle = smoothedAlpha;

  deltaX = map(gyroGamma, -90, 90, -width / 3, width / 3);
}

function getSmoothedAlpha(alphaData) {
  let delta;
  if (alphaData > 180) {
    delta = 360 - alphaData;
  } else {
    delta = -alphaData;
  }
  return delta;
}
