var app = require('http').createServer(handler)
, fs = require('fs')
, io = require('socket.io').listen(app);

var port = process.env.PORT || 5000;
app.listen(port);

function handler(req, res) {
  console.log(__dirname);
  fs.readFile( __dirname + '/client.html',
    function(err, data) {
      if (err) {
        console.log(err);
        res.writeHead(500);
        return res.end('Error loading client.html');
      }
      res.writeHead(200);
      res.end(data);
    });
}

io.sockets.on('connection', function(socket) {
  socket.on('set nickname', function(nickname) {
    socket.set('nickname', nickname, function() {
      var connected_msg = nickname + ' is now connected.';
      console.log(connected_msg);

      io.sockets.volatile.emit('broadcast_msg', connected_msg);
    });
  });

  socket.on('emit_msg', function(msg) {
    socket.get('nickname', function(err, nickname) {
      console.log('Chat message by', nickname);
      io.sockets.volatile.emit('broadcast_msg', nickname + ': ' + msg );
    });
  });

  socket.on('disconnect', function() {
    socket.get('nickname', function(err, nickname) {
      console.log('Disconnect',nickname);
      var disconnect_msg = '<b>' + nickname + ' has disconnected.</b>';

      io.sockets.volatile.emit('broadcast_msg', disconnect_msg);
    });
  });
});