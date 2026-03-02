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

socket.on("test-data-from-server", (data) => {
  console.log("receivedData:", data);

  cX = data.x;

  cY = data.y;

  fill(0);
});
