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

  socket.on("wavePoints-from-phone1", (data) => {
    if (phone2) {
      io.to(phone2).emit("wavePoints-from-phone1-server", data);
    }
  });

  // DISCONNECT
  // manage the roles
  socket.on("disconnect", function () {
    console.log("someone disconnected", socket.id);

    //console.log(frogs);

    // delete frog from the global array
    // that keeps track of all frogs online

    // find index
    //   let idx = frogs.findIndex(function (f) {
    //     return f.id == socket.id;
    //   });
    //   console.log(idx);

    //   // if its a frog
    //   if (idx > -1) {
    //     frogs.splice(idx, 1);
    //   }
    //   console.log(frogs);
    //   // delete frog
    //   // if it's a cnductpr
    //   // delete conductor

    //   if (socket.id == conductor) {
    //     conductor = undefined;
    //   }

    //   // if the condiuctr is still online
    //   // tell them which frog has been deleted

    //   if (conductor != undefined) {
    //     io.to(conductor).emit("delete-frog", socket.id);
    //   }
  });
});

// Creating servers and make them listen at their ports:

HTTPSserver.listen(portHTTPS, function (req, res) {
  console.log("HTTPS Server started at port", portHTTPS);
});
