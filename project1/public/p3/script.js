let socket;
if (
  location.hostname.toLowerCase().startsWith("browsercircus") ||
  location.hostname.toLowerCase().startsWith("www")
) {
  socket = io({ path: "/ruiqi/port-4260/socket.io" }); // <-- replace!
} else {
  socket = io();
}

socket.emit("my-role", { role: "phone3" });

let originX, originY;
let totalPointsNum = 400;

let spd = 5;
let strokeW = 10;

let deltaX = 0;

let receivedXArr = [];
let receivedXHold;

let wavePoints = [];

function setup() {
  createCanvas(windowWidth, windowHeight);

  originX = width / 2;
  originY = 0;

  spd = height / totalPointsNum;
}

function draw() {
  background(255);

  let localX = originX - deltaX;

  let receivedX = originX;

  if (receivedX == null) {
    receivedX = receivedXHold;
  }

  if (receivedXArr.length > 0) {
    receivedX = receivedXArr.shift();
    receivedXHold = receivedX;
  }

  let finalX = localX + receivedX - originX;

  // 4) Push point at top
  wavePoints.push({ x: finalX, y: originY });

  for (let i = wavePoints.length - 1; i >= 0; i--) {
    wavePoints[i].y += spd;
    if (wavePoints[i].y > height) {
      wavePoints.splice(i, 1);
    }
  }

  stroke(0);
  strokeWeight(strokeW);
  noFill();
  beginShape();
  for (let i = 0; i < wavePoints.length; i++) {
    curveVertex(wavePoints[i].x, wavePoints[i].y);
  }
  endShape();

  // 7) Debug HUD
  noStroke();
  fill(0);
  textSize(16);
}

socket.on("wavePointsX-from-phone2-server", (xs) => {
  receivedXArr = receivedXArr.concat(xs);
  console.log(receivedXArr);
});

function handleOrientation(eventData) {
  document.querySelector("#requestOrientationButton").style.display = "none";
  // document.querySelector("#palette-choice").style.display = "none";

  gyroAlpha = eventData.alpha;
  gyroBeta = eventData.beta;
  gyroGamma = eventData.gamma;

  textSize(16);
  stroke(0);

  deltaX = map(gyroGamma, -90, 90, -width / 3, width / 3);
}
