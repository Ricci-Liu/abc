// ============================================================
//  HAIR GROWER — Server
//  Manages player sessions, scalp position assignment,
//  and relays hair-growth data between clients.
// ============================================================

const express = require("express");
const https = require("https");
const fs = require("fs");

const app = express();
const portHTTPS = 3010;

app.use(express.static("public"));

const options = {
  key: fs.readFileSync("localhost-key.pem"),
  cert: fs.readFileSync("localhost.pem"),
};

const HTTPSserver = https.createServer(options, app);
const { Server } = require("socket.io");
const io = new Server(HTTPSserver);

// ============================================================
//  SCALP ZONE — where hair roots are placed
//  These pixel coords match the canvas (600×600) in sketch.js
// ============================================================
const SCALP = {
  x: 140,
  y: 60, // top-left of the scalp bounding box
  w: 320,
  h: 200, // width / height
};

// ============================================================
//  COLOUR PALETTE  (one per player, cycles if > 12 players)
// ============================================================
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
//  PLAYER STATE
//  players[socketID] = { originX, originY, color, points: [{x,y}] }
// ============================================================
let players = {};
let colorCounter = 0;

// ============================================================
//  HELPERS
// ============================================================
function randomScalpPoint() {
  // Random point inside the elliptical scalp area
  // (reject-sample so it stays within an ellipse inscribed in SCALP rect)
  let rx = SCALP.w / 2;
  let ry = SCALP.h / 2;
  let cx = SCALP.x + rx;
  let cy = SCALP.y + ry;

  let px, py;
  do {
    px = SCALP.x + Math.random() * SCALP.w;
    py = SCALP.y + Math.random() * SCALP.h;
  } while (Math.pow((px - cx) / rx, 2) + Math.pow((py - cy) / ry, 2) > 1);

  return { x: Math.round(px), y: Math.round(py) };
}

// ============================================================
//  SOCKET.IO
// ============================================================
io.on("connection", (socket) => {
  console.log("connected:", socket.id);

  // ── Player ready (has first GPS fix) ──────────────────────
  socket.on("playerReady", () => {
    let pos = randomScalpPoint();
    let color = PALETTE[colorCounter % PALETTE.length];
    colorCounter++;

    players[socket.id] = {
      originX: pos.x,
      originY: pos.y,
      color: color,
      points: [{ x: pos.x, y: pos.y }],
    };

    // Tell THIS player their assigned position + colour
    socket.emit("assignPosition", {
      x: pos.x,
      y: pos.y,
      color: color,
      socketID: socket.id,
    });

    // Send THIS player the existing hair history of every other player
    for (let id in players) {
      if (id === socket.id) continue;
      let p = players[id];
      socket.emit("hairHistory", {
        socketID: id,
        color: p.color,
        originX: p.originX,
        originY: p.originY,
        points: p.points,
      });
    }

    console.log(`Player ${socket.id} → scalp (${pos.x}, ${pos.y}) ${color}`);
  });

  // ── Hair position update from a player ────────────────────
  socket.on("hairUpdate", (data) => {
    // data: { x, y }
    let p = players[socket.id];
    if (!p) return;

    p.points.push({ x: data.x, y: data.y });

    // Broadcast to everyone else
    socket.broadcast.emit("hairFromServer", {
      socketID: socket.id,
      color: p.color,
      originX: p.originX,
      originY: p.originY,
      x: data.x,
      y: data.y,
    });
  });

  // ── Disconnect ────────────────────────────────────────────
  socket.on("disconnect", () => {
    console.log("disconnected:", socket.id);
    if (players[socket.id]) {
      socket.broadcast.emit("playerLeft", { socketID: socket.id });
      delete players[socket.id];
    }
  });
});

// ============================================================
HTTPSserver.listen(portHTTPS, () => {
  console.log("HTTPS server running on port", portHTTPS);
});
