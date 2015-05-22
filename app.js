var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});


var rooms = [];

io.on('connection', function(socket) {
	socket.emit('system msg', 'Welcome to chat');

	console.log('user connected');

	socket.on('create room', function(name) {
		// check to see if room exists
		if(rooms.length == 0) {
			rooms.push(name);
		} else {
			rooms.forEach(function(room) {
				if(room != name)
					rooms.push(name);
			});
		}
		socket.join(name);
		socket.emit('room joined', name);
	});

	socket.on('get rooms', function() {
		console.log('get rooms');
		socket.emit('rooms list', rooms);
		console.log('sending rooms ' + rooms);
	});

	socket.on('message to room', function(data) {
		socket.to(data.room).emit('convo', data);
	});

	socket.on('chat message', function(msg) {
		console.log('name:' + msg.name);
		console.log('message:' + msg.mg);
		io.emit('chat message', msg);
	});

	// if a socket disconnects from the server
	socket.on('disconnect', function() {
		console.log('user disconnected');
		socket.emit('system msg', 'User has disconnected');
	});
})

http.listen(3000, function(){
  console.log('listening on *:3000');
});