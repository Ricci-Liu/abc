let socket;
if (
  location.hostname.toLowerCase().startsWith("browsercircus") ||
  location.hostname.toLowerCase().startsWith("www")
) {
  socket = io({ path: "/YOUR-NAME/YOUR-PORT/socket.io" }); // e.g. '/leon/port-4100/socket.io' or '/socket.io'
} else {
  socket = io();
}

let gyroAlpha = 0;
let gyroBeta = 0;
let gyroGamma = 0;

let cX = 0;
let cY = 0;

function setup() {
  canvasHeight = windowHeight;
  let canvas = createCanvas(windowWidth, windowHeight);

  ((cX = width / 2), (cY = height / 2));
}

function draw() {
  background(255);
  circle(cX, cY, 100);
}

function handleOrientation(eventData) {
  document.querySelector("#requestOrientationButton").style.display = "none";
  // document.querySelector("#palette-choice").style.display = "none";

  gyroAlpha = eventData.alpha;
  let deltaX = map(360 - gyroAlpha, 0, 360, -width / 2, width / 2);
  cX = width / 2 + deltaX;
  gyroBeta = eventData.beta;
  // cY = map(gyroAlpha, 0, 360, 0, width);
  cY = height / 2;
  gyroGamma = eventData.gamma;
  console.log(gyroAlpha, gyroBeta, gyroGamma);

  let data = {
    x: cX,
    y: cY,
  };

  socket.emit("test-data-from-client", data);
  fill(0);
}
