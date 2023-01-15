const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http, {cors: {origin: "*"}});
const port = process.env.PORT || 3000;
const NEW_CHAT_MESSAGE_EVENT = "newChatMessage";

console.log("Running")

app.get('/',(req, res)=>{
  res.send("Hello")
})

io.on('connection', (socket) => {
  console.log('a user connected'); //Log if user joins

  const { roomId } = socket.handshake.query;
  socket.join(roomId);

  socket.on(NEW_CHAT_MESSAGE_EVENT, (data) => {
    io.in(roomId).emit(NEW_CHAT_MESSAGE_EVENT, data);
  });
  
  socket.on("disconnect", () => {
    socket.leave(roomId);
  });
//   socket.emit('connection', null);
// socket.on('FromClient', msg => {
//     io.emit('FromAPI', msg); //returning back to frontend
//     console.log(msg)
//   });
});

http.listen(3000, () => {
  console.log(`Chat Testing server running at http://localhost:${port}/`);
});