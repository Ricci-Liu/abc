// lines of code that make sure socket runs on both locan and hongkong server
// let socket = io();
// socket connection that works locally and on the server:
if (
  location.hostname.toLowerCase().startsWith("browsercircus") ||
  location.hostname.toLowerCase().startsWith("www")
) {
  socket = io({ path: "/ruiqi/port-4260/socket.io" }); // e.g. '/leon/port-4100/socket.io' or '/socket.io'
} else {
  socket = io();
}

let formeElm = document.querySelector("#chatForm");
console.log(formeElm);
let msgInput = document.querySelector("#newMessage");
console.log(msgInput);
let nameInput = document.querySelector("#nameWrapper input"); // <---------

// LISTEN FOR NEWLY TYPES MESSAGES,
formeElm.addEventListener("submit", newMessageSubmitted);

function newMessageSubmitted(event) {
  console.log("typed a message!", event);
  event.preventDefault();

  stripGrammar(msgInput.value);
  // console.log(msgInput.value);
  let newMsg = stripGrammar(msgInput.value);
  // appendMessage(newMsg)

  let messageData = {
    // <---------
    sender: nameInput.value, // <---------
    message: newMsg, // <---------
  };
  // SEND THEM TO THE SERVER
  socket.emit("messageFromClient", messageData); // <---------

  // clear textbox:
  msgInput.value = ""; // <---------
}

// LISTEN FOR NEW MESSAGES FROM SERVER
// APPEND THEM TO THE MESSAGE BOX
// AUTO SCROLL TO BOTTOM
socket.on("messageFromServer", function (msgData) {
  console.log("got a message i think? ", msgData);
  appendMessage(msgData);
});

// APPEND MESSAGES TO BOX
function appendMessage(data) {
  // console.log(data)
  // select list (ul) first
  let chatThreadList = document.querySelector("#threadWrapper ul");
  console.log(chatThreadList);

  // create new list item (li)
  let newListItem = document.createElement("li");

  //sender
  let who = document.createElement("span"); // <---------
  who.className = "who"; // <---------
  who.innerText = data.sender + ":" || "anonymous:"; // <---------

  newListItem.append(who); // <---------

  //messsage
  let words = document.createElement("span"); // <---------
  words.className = "words"; // <---------
  words.innerText = data.message; // <---------

  newListItem.append(words); // <---------

  // append new li to the list
  chatThreadList.append(newListItem);

  // scroll to bottom of textbox:
  chatThreadList.scrollTop = chatThreadList.scrollHeight;
}

// OPTIONAL: LISTEN FOR NEW NAME
// SEND IT TO SERVER

function stripGrammar(text) {
  let cleanedText = text
    .toLowerCase()
    .replace(/[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g, " ")
    .trim();

  let tokens = cleanedText.split(" ");

  return normalize(tokens).join(" ");
}

let phraseNormalize = new Map([
  ["will be", "is"],
  ["would be", "is"],
  ["may be", "is"],
  ["might be", "is"],
  ["can be", "is"],
  ["could be", "is"],
  ["should be", "is"],
]);

let wordNormalize = new Map([
  ["am", "is"],
  ["is", "is"],
  ["are", "is"],
  ["was", "is"],
  ["were", "is"],
  ["be", "is"],
  ["been", "is"],
  ["being", "is"],

  ["do", "do"],
  ["does", "do"],
  ["did", "do"],

  ["a", "the"],
  ["an", "the"],
  ["the", "the"],

  ["went", "go"],
  ["gone", "go"],
  ["ate", "eat"],
  ["eaten", "eat"],
  ["did", "do"],
  ["done", "do"],
  ["had", "have"],
  ["made", "make"],
  ["took", "take"],
  ["taken", "take"],
  ["got", "get"],
  ["gotten", "get"],
  ["saw", "see"],
  ["seen", "see"],
  ["said", "say"],
  ["came", "come"],
  ["gave", "give"],
  ["given", "give"],
  ["found", "find"],
  ["thought", "think"],
  ["told", "tell"],
  ["knew", "know"],
  ["known", "know"],
  ["felt", "feel"],
  ["left", "leave"],
  ["put", "put"],
  ["brought", "bring"],
  ["kept", "keep"],
  ["let", "let"],
  ["began", "begin"],
  ["begun", "begin"],
  ["heard", "hear"],
  ["ran", "run"],
  ["lost", "lose"],
  ["held", "hold"],
  ["wrote", "write"],
  ["written", "write"],
  ["read", "read"],
  ["spoke", "speak"],
  ["spoken", "speak"],
  ["met", "meet"],
  ["paid", "pay"],
  ["sat", "sit"],
  ["stood", "stand"],
  ["tried", "try"],
  ["used", "use"],
]);

function normalize(tokens) {
  let result = [];
  for (let i = 0; i < tokens.length; i++) {
    let pair = tokens[i] + " " + tokens[i + 1];
    if (phraseNormalize.has(pair)) {
      result.push(phraseNormalize.get(pair));
      i++;
    } else if (wordNormalize.has(tokens[i])) {
      result.push(wordNormalize.get(tokens[i]));
    } else {
      result.push(tokens[i]);
    }
  }
  return cleanSuffix(result);
}

let noStrippingWords = new Set([
  "this",
  "is",
  "was",
  "has",
  "his",
  "us",
  "as",
  "yes",
]);

// 8 inflectional suffixes in English
function cleanSuffix(tokens) {
  let result = [];
  tokens.forEach((token) => {
    //some words do not strip
    if (!noStrippingWords.has(token)) {
      if (token.endsWith("ing")) {
        token = token.slice(0, -3);
      } else if (token.endsWith("est")) {
        token = token.slice(0, -3);
      } else if (token.endsWith("ed")) {
        token = token.slice(0, -2);
      } else if (token.endsWith("ies")) {
        token = token.slice(0, -3) + "y";
      } else if (token.endsWith("es")) {
        token = token.slice(0, -2);
      } else if (token.endsWith("en")) {
        token = token.slice(0, -2);
      } else if (token.endsWith("s")) {
        token = token.slice(0, -1);
      } else if (token.endsWith("er")) {
        token = token.slice(0, -2);
      }
    }
    result.push(token);
  });

  console.log(result);
  return result;
}

let infoBtn = document.querySelector("#infoBtn");
let infoModal = document.querySelector("#infoModal");
let closeInfo = document.querySelector("#closeInfo");

infoBtn.addEventListener("click", () => {
  infoModal.classList.remove("hidden");
});

closeInfo.addEventListener("click", () => {
  infoModal.classList.add("hidden");
});
