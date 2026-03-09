let socket;
if (
  location.hostname.toLowerCase().startsWith("browsercircus") ||
  location.hostname.toLowerCase().startsWith("www")
) {
  socket = io({ path: "/YOUR-NAME/YOUR-PORT/socket.io" }); // e.g. '/leon/port-4100/socket.io' or '/socket.io'
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
let totalPointsNum = 600;

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

  if (testAngle) {
    textSize(16);
    //strokeWeight(1);
    //text(testAngle, 100, 100);
  }
  for (let i = 0; i < wavePoints.length; i++) {
    vertex(wavePoints[i].x, wavePoints[i].y);
  }
  endShape();

  strokeWeight(1);
  textSize(20);
  // text(round(gyroAlpha), 50, 150);
  // text(round(gyroBeta), 50, 175);
  // text(round(gyroGamma), 50, 200);

  // text("deg" + round(deg), 50, 240);
}

let startAngle = undefined;
function handleOrientation(eventData) {
  document.querySelector("#requestOrientationButton").style.display = "none";

  gyroAlpha = eventData.alpha;
  gyroBeta = eventData.beta;
  gyroGamma = eventData.gamma;

  let smoothedAlpha = getSmoothedAlpha(gyroAlpha);

  testAngle = smoothedAlpha;

  deltaX = map(gyroGamma, -90, 90, -width / 3 + 50, width / 3 - 50);
  // if (dirRight(gyroAlpha)) {
  //   deltaX = map(gyroBeta, 90, 180, 0, width / 4 - 50);
  // } else {
  //   deltaX = map(gyroBeta, 90, 180, -width / 4 + 50, 0);
  // }

  let euler = new THREE.Euler(
    (gyroBeta * Math.PI) / 180,
    (gyroAlpha * Math.PI) / 180,
    (-gyroGamma * Math.PI) / 180,
    "YXZ",
  );
  let quaternion = new THREE.Quaternion().setFromEuler(euler);
  // console.log(quaternion);
  const forward = new THREE.Vector3(0, 0, 1);
  forward.applyQuaternion(quaternion);
  // console.log(forward);
  // forward.z = 0;
  // forward.y = 0;
  forward.normalize();

  let aa = Math.atan2(forward.x, forward.z);
  // console.log(aa);
  deg = degrees(aa);
  if (!startAngle) {
    startAngle = deg;
  } else {
    deg = deg - startAngle;
  }
  // console.log(deg);
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
