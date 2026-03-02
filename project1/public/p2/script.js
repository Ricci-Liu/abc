let socket;
if (
  location.hostname.toLowerCase().startsWith("browsercircus") ||
  location.hostname.toLowerCase().startsWith("www")
) {
  socket = io({ path: "/YOUR-NAME/YOUR-PORT/socket.io" }); // e.g. '/leon/port-4100/socket.io' or '/socket.io'
} else {
  socket = io();
}

socket.emit("my-role", { role: "phone2" });

let gyroAlpha = 0;
let gyroBeta = 0;
let gyroGamma = 0;

let spd = 5;

let wavePoints = [];

function setup() {
  canvasHeight = windowHeight;
  let canvas = createCanvas(windowWidth, windowHeight);
}

function draw() {
  push();
  translate(0, -780);
  background(255);

  for (let i = wavePoints.length - 1; i >= 0; i--) {
    wavePoints[i].y += spd;

    // if (wavePoints[i].y > height) {
    //   let data = {
    //     phoneIdx: 1,
    //     wavePoint: wavePoints[i],
    //   };

    // console.log(data);
    // socket.emit("wavePoints-from-phone1", data);
    // wavePoints.splice(i, 1);
    // }
    if (wavePoints[i].y > height + 780) {
      wavePoints.splice(i, 1);
    }
  }

  stroke(0);
  strokeWeight(10);
  noFill();
  beginShape();

  for (let i = 0; i < wavePoints.length; i++) {
    curveVertex(wavePoints[i].x, wavePoints[i].y);
    //circle(wavePoints[i].x, wavePoints[i].y, 5);
  }
  endShape();

  fill(0);
  pop();

  text(wavePoints.length, 10, 10);
}

socket.on("wavePoints-from-phone1-server", (data) => {
  wavePoints.push(data.wavePoint);

  console.log("receivedData:", data.wavePoint);
});
