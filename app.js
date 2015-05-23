var config = require('./config/main')
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

// db uri
var dburi = 'mongodb://'+config.db.user+':'+config.db.pw+'@'+config.db.host+':'+config.db.port+'/'+config.db.db;

// establish connection and pushes message to db
var pushMessage = function(data) {
	console.log('pushing message');
	MongoClient.connect(dburi, function(err, db) {
		assert.equal(null, err);
		if (err) {
			console.loog("unable to connect to db");
		} else {
			console.log("Connected to the db");
			insertMessage(db, data);
		}
	});

	// setups what collection the doc is inserted in
	var insertMessage = function(db, doc) {
		var messagesCollection = db.collection('messageLogs');
		// insert docs into the collection
		messagesCollection.insert(doc, function(err, result) {
			assert.equal(err, null);
			//callback(result);
			db.close();		// we need to wait for the doc to insert before closing the connection
		});
	};
};


// routes
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});


// chat server
var rooms = [];

io.on('connection', function(socket) {
	socket.emit('system msg', 'Welcome to chat');

	console.log('user connected');

	socket.on('create room', function(name) {
		// check to see if room exists
		if(rooms.length == 0) {
			rooms.push(name);
		} else {
			if(rooms.indexOf(name) < 0) {
				rooms.push(name);
			}
		}
		socket.join(name);
		// let the client know they have joined the room
		socket.emit('system msg', 'You have joined ' + name + '.');
	}); // a thought .. how do we know when to remove a room ? socket.io automatically destroys the room when the last user has left ...


	socket.on('get rooms', function() {
		socket.emit('rooms list', rooms);
	});

	socket.on('message to room', function(data) {
		socket.to(data.room).emit('convo', data);
		// push message to db
		pushMessage(data);
	});


	// if a socket disconnects from the server
/*	socket.on('disconnect', function() {
		console.log('user disconnected');
		socket.emit('system msg', 'User has disconnected');
	});
*/
})

// let's listen
http.listen(3000, function(){
  console.log('listening on *:3000');
});