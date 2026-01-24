let kick, bass, hh, lead;
let gridW, gridH;

let notes = [];
let ids = new Set();

let lpf = new Tone.Filter(2000, "lowpass").toMaster();
let hpf = new Tone.Filter(17000, "highpass").toMaster();

function preload() {
  kick = new Tone.Synth({
    oscillator: { type: "sine" },
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.01 },
    volume: 10,
  }).toMaster();

  lead = new Tone.Synth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.05, sustain: 0.1 },
  }).connect(lpf);

  bass = new Tone.Synth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.15, sustain: 0.1 },
  }).connect(lpf);

  hh = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { decay: 0.05, sustain: 0.05 },
  }).connect(hpf);
}

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("p5-canvas-container");

  gridW = width / 10;
  gridH = gridW;
}

function draw() {
  background(0, 0, 0);

  strokeWeight(5);
  stroke(255);
  line(width / 2, 0, width / 2, height);
  line(0, height / 2, width, height / 2);

  strokeWeight(1);

  push();

  fill(255);
  translate(width - 30, height / 2 + 130);
  rotate(radians(90));
  textSize(30);
  text("frequency", -100, 0);

  pop();

  push();

  fill(255);
  translate(width / 2, height - 20);
  rotate(radians(90));
  textSize(30);
  text("bpm", -50, 50);

  pop();

  push();

  fill(255);
  translate(width - 30, 110);
  rotate(radians(90));
  textSize(30);
  text("Notes:" + notes.length + "/5", -100, 0);

  pop();

  for (let x = 0; x <= width; x += gridW) {
    for (let y = 0; y <= height; y += gridH) {
      noFill();
      stroke(105);
      rect(x, y, gridW, gridH);
    }
  }
  notes.forEach((note) => note.display());
}

function touchStarted() {
  //console.log(touches);
  Tone.context.resume();
  Tone.Transport.start();

  for (let i = 0; i < touches.length; i++) {
    let id = touches[i].id;
    if (!ids.has(id)) {
      ids.add(id);

      // assign a synth according to the sequence of finger
      let currentSynth;
      let count = notes.length;

      if (count == 0) {
        currentSynth = kick;
      } else if (count == 1) {
        currentSynth = bass;
      } else if (count == 2) {
        currentSynth = hh;
      } else {
        currentSynth = lead;
      }

      let n = new Note(touches[i].x, touches[i].y, currentSynth);
      notes.push(n);
      n.playNote();
    }
  }
}

function touchEnded() {
  if (notes.length !== 5) {
    notes.forEach((note) => note.stopNote());
    notes = [];
    ids.clear();
  }
}

class Note {
  constructor(x, y, curSynth) {
    this.x = x;
    this.y = y;
    this.mySynth = curSynth;
    this.color = color(random(255), random(255), random(255));
    this.text;

    this.freq = map(this.x, 0, width, -100, 880);
    this.interval = map(this.y, 0, height, 0.5, 0.1);
    this.toneLoop = null;
  }

  display() {
    fill(this.color);

    push();
    translate(this.x, this.y);
    rotate(radians(90));
    rectMode(CENTER);
    //noStroke();

    if (this.mySynth == kick) {
      this.text = "bd";
      circle(0, 0, 80);
    } else if (this.mySynth == hh) {
      this.text = "hh";
      triangle(40, 20, -40, 20, 0, -40);
    } else if (this.mySynth == bass) {
      this.text = "bass";
      rect(0, 0, 100, 80);
    } else {
      this.text = "synth";
      rect(0, 0, 100, 20);
    }
    textSize(70);
    textAlign(CENTER);
    text(this.text, 0, 0);

    pop();
  }

  playNote() {
    this.toneLoop = new Tone.Loop((time) => {
      if (this.mySynth == hh) {
        this.mySynth.triggerAttackRelease("16n", time);
      } else {
        this.mySynth.triggerAttackRelease(this.freq, "8n", time);
      }
    }, this.interval);

    this.toneLoop.start(0);
  }

  stopNote() {
    if (this.toneLoop) {
      this.toneLoop.stop();
      this.toneLoop.dispose();
    }
  }
}
