let socket;
if (
  location.hostname.toLowerCase().startsWith("browsercircus") ||
  location.hostname.toLowerCase().startsWith("www")
) {
  socket = io({ path: "/YOUR-NAME/YOUR-PORT/socket.io" }); // e.g. '/leon/port-4100/socket.io' or '/socket.io'
} else {
  socket = io();
}

socket.emit("my-role", { role: "phone1" });

let gyroAlpha = 0;

let originX;
let originY = 0;

let angle = 0;
let spd = 5;

let deltaX;

let wavePoints = [];

let numPointsThatLeft = 0;

function setup() {
  canvasHeight = windowHeight;
  let canvas = createCanvas(windowWidth, windowHeight);

  originX = width / 2;
}

function draw() {
  background(255);

  let swingX = originX + deltaX;

  wavePoints.push({
    x: swingX,
    y: originY,
  });

  for (let i = wavePoints.length - 1; i >= 0; i--) {
    wavePoints[i].y += spd;

    if (wavePoints[i].y > height) {
      numPointsThatLeft++;
      let data = {
        phoneIdx: 1,
        wavePoint: wavePoints[i],
      };

      // console.log(data);

      // if (numPointsThatLeft % 10 == 0) {
      socket.emit("wavePoints-from-phone1", data);
      // }

      wavePoints.splice(i, 1);
    }
  }

  stroke(0);
  strokeWeight(10);
  noFill();
  beginShape();

  for (let i = 0; i < wavePoints.length; i++) {
    vertex(wavePoints[i].x, wavePoints[i].y);
    // circle(wavePoints[i].x, wavePoints[i].y, 5);
  }
  endShape();

  text(wavePoints.length, 10, 10);
}

function handleOrientation(eventData) {
  document.querySelector("#requestOrientationButton").style.display = "none";
  // document.querySelector("#palette-choice").style.display = "none";

  gyroAlpha = eventData.alpha;

  let smoothedAlpha = getSmoothedAlpha(gyroAlpha);

  deltaX = map(smoothedAlpha, -90, 90, -width / 2 + 50, width / 2 - 50);
  gyroBeta = eventData.beta;

  gyroGamma = eventData.gamma;
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
