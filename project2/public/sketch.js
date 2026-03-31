// ============================================================
//  HAIR GROWER — draw hair on a bald head by walking around
//  Each player is assigned a random start point on the scalp.
//  GPS movement → hair strand growth (N/S/E/W mapped to canvas).
//  Multiple players each grow their own coloured strand.
// ============================================================

// ---------- socket ----------
let socket;
if (location.hostname.toLowerCase().startsWith("browsercircus")) {
  socket = io({ path: "/hair-grower/socket.io" });
} else {
  socket = io();
}

// ---------- GPS state (from requestGPS.js) ----------
let GPS_GRANTED = false;
let currentLatitude = 0;
let currentLongitude = 0;
let originLatitude = null; // set once on first GPS fix
let originLongitude = null;

// ---------- hair drawing state ----------
let myHair; // HairStrand for THIS player
let othersMap = {}; // socketID → HairStrand for remote players

// ---------- canvas / image ----------
let baldImg; // p5 Image – the bald head photo
let CANVAS_W = 600;
let CANVAS_H = 600;

// ---------- scalp region (where hair can start) ----------
// Adjust these to fit your actual bald-head photo
const SCALP = {
  x: 140,
  y: 60, // top-left corner of scalp bounding box
  w: 320,
  h: 200, // width / height of scalp zone
};

// ---------- scale: metres of real walking → pixels on canvas ----------
// 1 degree latitude ≈ 111,000 m.  Tune SCALE_FACTOR to taste.
// e.g. 0.01° lat ≈ 1111 m → we want that to be, say, 200 px
//   so pixels_per_degree = 200 / 0.01 = 20000
const PIXELS_PER_DEGREE_LAT = 20000;
const PIXELS_PER_DEGREE_LON = 20000; // roughly same at mid-latitudes

// ---------- colour palette for players ----------
const PALETTE = [
  "#FF6B6B",
  "#FFD93D",
  "#6BCB77",
  "#4D96FF",
  "#C77DFF",
  "#FF9A3C",
  "#00C9A7",
  "#F72585",
  "#80FFDB",
  "#FF477E",
  "#FFBE0B",
  "#8338EC",
];

// ============================================================
//  p5 LIFECYCLE
// ============================================================
function preload() {
  // Put your bald-head image in the /public folder as "bald.png"
  baldImg = loadImage("assets/512.png");
}

function setup() {
  let cnv = createCanvas(CANVAS_W, CANVAS_H);
  cnv.parent("p5-canvas-container");
  textAlign(CENTER, CENTER);
  textSize(12);
}

function draw() {
  background(245, 230, 210); // warm skin-tone background

  // Draw bald head
  if (baldImg) {
    image(baldImg, 0, 0, CANVAS_W, CANVAS_H);
  } else {
    // Placeholder head if image not loaded
    drawPlaceholderHead();
  }

  // Draw all remote strands
  for (let id in othersMap) {
    othersMap[id].display();
  }

  // Draw my strand on top
  if (myHair) {
    myHair.display();
    drawMyLabel();
  }

  // UI overlay
  drawUI();
}

// ============================================================
//  GPS HANDLING
// ============================================================
function handleNewPosition(pos) {
  let lonlat = fixForChineseMap(pos);
  currentLongitude = lonlat[0];
  currentLatitude = lonlat[1];

  // First fix: lock origin and tell server we're ready
  if (originLatitude === null) {
    originLatitude = currentLatitude;
    originLongitude = currentLongitude;

    // Ask server to assign us a scalp position
    socket.emit("playerReady", { socketID: socket.id });
  }

  if (myHair && myHair.assigned) {
    // Convert GPS displacement to canvas displacement
    let dx = (currentLongitude - originLongitude) * PIXELS_PER_DEGREE_LON;
    let dy = -(currentLatitude - originLatitude) * PIXELS_PER_DEGREE_LAT; // N = up = -y

    let newX = myHair.originX + dx;
    let newY = myHair.originY + dy;

    myHair.addPoint(newX, newY);

    // Broadcast to others
    socket.emit("hairUpdate", {
      x: newX,
      y: newY,
    });
  }
}

// ============================================================
//  SOCKET EVENTS
// ============================================================

// Server tells us our assigned scalp position + colour
socket.on("assignPosition", function (data) {
  // data: { x, y, color, socketID }
  myHair = new HairStrand(data.x, data.y, data.color, socket.id, true);
  console.log("Assigned scalp position", data.x, data.y, data.color);
});

// Another player's position update
socket.on("hairFromServer", function (data) {
  // data: { socketID, x, y, color, originX, originY }
  if (!othersMap[data.socketID]) {
    othersMap[data.socketID] = new HairStrand(
      data.originX,
      data.originY,
      data.color,
      data.socketID,
      false,
    );
  }
  othersMap[data.socketID].addPoint(data.x, data.y);
});

// A player's full hair history on join (so late-joiners see existing strands)
socket.on("hairHistory", function (data) {
  // data: { socketID, color, originX, originY, points: [{x,y},...] }
  let strand = new HairStrand(
    data.originX,
    data.originY,
    data.color,
    data.socketID,
    false,
  );
  for (let pt of data.points) {
    strand.addPoint(pt.x, pt.y);
  }
  othersMap[data.socketID] = strand;
});

// Another player disconnected
socket.on("playerLeft", function (data) {
  delete othersMap[data.socketID];
});

// ============================================================
//  HAIR STRAND CLASS
// ============================================================
class HairStrand {
  constructor(originX, originY, col, id, isMe) {
    this.originX = originX;
    this.originY = originY;
    this.col = col;
    this.id = id;
    this.isMe = isMe;
    this.points = [{ x: originX, y: originY }]; // start at root
    this.assigned = true;
    this.thickness = isMe ? 4 : 3;
  }

  addPoint(x, y) {
    let last = this.points[this.points.length - 1];
    // Only add if moved at least 1 px (avoid noise clutter)
    if (dist(last.x, last.y, x, y) > 1) {
      this.points.push({ x, y });
    }
  }

  display() {
    if (this.points.length < 2) {
      // Just draw the root dot
      noStroke();
      fill(this.col);
      circle(this.originX, this.originY, this.thickness * 2 + 2);
      return;
    }

    // Draw hair strand as a smooth curved line
    push();
    noFill();
    stroke(this.col);
    strokeWeight(this.thickness);
    strokeCap(ROUND);
    strokeJoin(ROUND);

    beginShape();
    for (let i = 0; i < this.points.length; i++) {
      let p = this.points[i];
      if (i === 0) {
        curveVertex(p.x, p.y); // duplicate first for catmull-rom
      }
      curveVertex(p.x, p.y);
      if (i === this.points.length - 1) {
        curveVertex(p.x, p.y); // duplicate last
      }
    }
    endShape();

    // Draw root dot
    noStroke();
    fill(this.col);
    circle(this.originX, this.originY, this.thickness + 4);

    // Draw tip dot
    let tip = this.points[this.points.length - 1];
    fill(this.col);
    noStroke();
    circle(tip.x, tip.y, this.thickness + 2);

    pop();
  }
}

// ============================================================
//  UI HELPERS
// ============================================================
function drawMyLabel() {
  if (!myHair || myHair.points.length < 1) return;
  let tip = myHair.points[myHair.points.length - 1];
  push();
  noStroke();
  fill(myHair.col);
  textSize(11);
  textAlign(CENTER, BOTTOM);
  text("YOU", tip.x, tip.y - 8);
  pop();
}

function drawUI() {
  push();
  noStroke();
  fill(0, 150);
  rect(0, CANVAS_H - 50, CANVAS_W, 50, 8);

  fill(255);
  textSize(12);
  textAlign(LEFT, CENTER);

  if (!GPS_GRANTED) {
    text("⏳ Waiting for GPS permission…", 12, CANVAS_H - 25);
  } else if (!myHair) {
    text("📡 Getting your location…", 12, CANVAS_H - 25);
  } else {
    let len = myHair.points.length;
    text(
      `🧑 You  |  💈 ${len} points  |  👥 ${Object.keys(othersMap).length} others`,
      12,
      CANVAS_H - 25,
    );
  }
  pop();
}

function drawPlaceholderHead() {
  // Simple cartoon bald head placeholder
  push();
  noStroke();

  // Head shape
  fill(255, 220, 177);
  ellipse(CANVAS_W / 2, CANVAS_H / 2 - 20, 280, 320);

  // Scalp highlight zone
  noFill();
  stroke(220, 180, 140, 100);
  strokeWeight(1);
  rect(SCALP.x, SCALP.y, SCALP.w, SCALP.h, 40);

  // Eyes
  fill(60);
  ellipse(CANVAS_W / 2 - 50, CANVAS_H / 2 + 20, 20, 12);
  ellipse(CANVAS_W / 2 + 50, CANVAS_H / 2 + 20, 20, 12);

  // Smile
  noFill();
  stroke(60);
  strokeWeight(2);
  arc(CANVAS_W / 2, CANVAS_H / 2 + 60, 80, 40, 0, PI);

  // Label
  noStroke();
  fill(150);
  textSize(13);
  textAlign(CENTER);
  text("(put bald.png in /public)", CANVAS_W / 2, CANVAS_H / 2 - 130);

  pop();
}

// ============================================================
//  WINDOW RESIZE
// ============================================================
function windowResized() {
  // Keep canvas fixed size so hair coordinates stay consistent
  // (don't resize – the head image must stay pixel-accurate)
}
