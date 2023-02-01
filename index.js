const { writeFile } = require('fs');
const compression = require('compression');
var cache = require('cache-control');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http, {cors: {origin: "*"},maxHttpBufferSize: 1e8 });
const port = process.env.PORT || 3000;
const NEW_CHAT_MESSAGE_EVENT = "newChatMessage";

//maxHttpBufferSize: 1e8 // 100 MB
console.log("Running")

app.use(compression())

app.use(cache({
  '/index.html': 5000,
  '/none/**/*.html': 5000,
  '/private.html': 'private, max-age=300',
  '/**': 5000000 // Default to caching all items for 500,
}));

app.use(express.static(__dirname + '/public', {
  maxAge: 86400000,
  setHeaders: function(res, path) {
      res.setHeader("Expires", new Date(Date.now() + 2592000000*30).toUTCString());
    }
}))

app.get('/',(req, res)=>{
  res.send("Server is running fine")
})

io.on('connection', (socket) => {
  console.log('a user connected'); //Log if user joins

  const { roomId } = socket.handshake.query;
  socket.join(roomId);

  socket.on(NEW_CHAT_MESSAGE_EVENT, (data) => {
    io.in(roomId).emit(NEW_CHAT_MESSAGE_EVENT, data);
  });

  socket.on('newFileupload', (fileObject, callback) => {
    // console.log(fileObject)
    const fileName = fileObject.type.split('.')[0]
    const fileExtension = fileObject.type.split('.')[1]

    writeFile(`./files/${fileName}${Math.floor(Math.random() * 900) + 10}.${fileExtension}`, fileObject.file, (err) => {
      callback({message: err ? 'failure' : 'success'})
    })  

    //sending file back to the room
    // io.in(roomId).emit(NEW_CHAT_MESSAGE_EVENT, data);

  })
  
  socket.on("disconnect", () => {
    socket.leave(roomId);
  });

});

http.listen(port, () => {
  console.log(`Chat Testing server running at http://localhost:${port}/`);
});