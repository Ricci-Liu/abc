let socket = io();

let formeElm = document.querySelector("#chatForm");
console.log(formeElm);
let msgInput = document.querySelector("#newMessage");
console.log(msgInput);

// LISTEN FOR NEWLY TYPES MESSAGES,
// SEND THEM TO THE SERVER
formeElm.addEventListener("submit", newMessageSubmitted);

function newMessageSubmitted(event) {
  console.log("typed a message!", event);
  event.preventDefault();

  // console.log(msgInput.value);

  let newMsg = msgInput.value;

  // appendMessage(newMsg);

  socket.emit("messageFromClient", newMsg); // 发送信息，只有specify的信息才能被server接收到
}

socket.on("messageFromServer", (msgData) => {
  console.log("got a message", msgData);
  appendMessage(msgData.message);
});

// LISTEN FOR NEW MESSAGES FROM SERVER
// APPEND THEM TO THE MESSAGE BOX
function appendMessage(txt) {
  console.log(txt);
  // select list (ul) first
  let chatThreadList = document.querySelector("#threadWrapper ul");
  console.log(chatThreadList);

  // create new list item (li)
  let newListItem = document.createElement("li");
  newListItem.innerText = txt;

  // append new li to the list
  chatThreadList.append(newListItem);

  // scroll to bottom of textbox:
  chatThreadList.scrollTop = chatThreadList.scrollHeight;
}

// AUTO SCROLL TO BOTTOM

// APPEND MESSAGES TO BOX

// OPTIONAL: LISTEN FOR NEW NAME
// SEND IT TO SERVER
