const express = require("express");

const https = require("https");
// to read certificates from the filesystem (fs)
const fs = require("fs");

const app = express(); // the server "app", the server behaviour
const portHTTPS = 4101; // port for https

// returning to the client anything that is
// inside the public folder
app.use(express.static("public"));

// Creating object of key and certificate
// for SSL
const options = {
  key: fs.readFileSync("keys-for-local-https/localhost-key.pem"),
  cert: fs.readFileSync("keys-for-local-https/localhost.pem"),
};

let HTTPSserver = https.createServer(options, app);

const { Server } = require("socket.io"); // include library
const { arrayBuffer } = require("stream/consumers");
const io = new Server(HTTPSserver); // start socket io

let phone1, phone2, phone3;

io.on("connection", (socket) => {
  // we manage the connection inside here
  console.log("a user connected", socket.id);

  socket.on("my-role", (data) => {
    if (data.role == "phone1") {
      phone1 = socket.id;
    } else if (data.role == "phone2") {
      phone2 = socket.id;
    } else if (data.role == "phone3") {
      phone3 = socket.id;
    }
  });

  socket.on("wavePointsX-from-phone1", (data) => {
    if (phone2) {
      io.to(phone2).emit("wavePointsX-from-phone1-server", data);
    }
  });

  socket.on("wavePointsX-from-phone2", (data) => {
    if (phone3) {
      io.to(phone3).emit("wavePointsX-from-phone2-server", data);
    }
  });

  // DISCONNECT
  // manage the rolesx`
  socket.on("disconnect", function () {
    console.log("someone disconnected", socket.id);
  });
});

// Creating servers and make them listen at their ports:

HTTPSserver.listen(portHTTPS, function (req, res) {
  console.log("HTTPS Server started at port", portHTTPS);
});
