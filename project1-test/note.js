// FROM SERVER TO CLIENTS

// socket.emit()
// respond to the client that it is currently in communication (who has contacted the server)

// io.to(socketID).emit()
// send message to on specific client (regardless who has contacted the server previously)

// io.emit()
// send a message to all the clients online

//socket.broadcast.emit()
//send message to all clients, except the sender(except the socket)
