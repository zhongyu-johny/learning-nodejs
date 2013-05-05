var express = require('express')
    , sio = require('socket.io');

/*create app*/
var app = express.createServer(express.bodyParser(), express.static('public'));
app.listen(3000);

var io = sio.listen(app)
    , currentSong
    , dj;

function elect(socket) {
  dj = socket;
  io.socket.emit('announcement', socket.name + ' is the new DJ');
  socket.emit('elected!');
  socket.on('disconnect', function () {
    dj = null;
    io.socket.emit('announcement', 'the dj left, next one to join become the dj');
  });
}

io.on('connection', function (socket) {
  console.log('someone connected');

  socket.on('join', function (name) {
    socket.name = name;
    socket.broadcast.emit('announcement', name + ' join in the chat');
  });

  socket.on('text', function (msg, fn) {
    socket.broadcast.emit('text', socket.name, msg);
    fn(Date.now());
  });

  if (!dj) {
    elect(socket);
  } else {
    socket.emit('song', currentSong);
  }
});