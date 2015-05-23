var config = require('./config/main')
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

/****************
*
* DB GOODNESS
*
*****************/

// db uri
var dburi = 'mongodb://'+config.db.user+':'+config.db.pw+'@'+config.db.host+':'+config.db.port+'/'+config.db.db;

// establish connection and pushes message to db
var pushMessage = function(data) {
	MongoClient.connect(dburi, function(err, db) {
		assert.equal(null, err);
		if (err) {
			console.log("unable to connect to db");
		} else {
			console.log("connected to the db");
			insertMessage(db, data);
		}
	});

	// setups what collection the doc is inserted in
	var insertMessage = function(db, doc) {
		var messagesCollection = db.collection('messageLogs');
		// insert docs into the collection
		messagesCollection.insert(doc, function(err, result) {
			assert.equal(err, null);
			db.close();		// we need to wait for the doc to insert before closing the connection
		});
	};
};

// throw the callback once we get all our messages 
var getOldMessages = function (name, callback) {
	MongoClient.connect(dburi, function(err, db) {
		assert.equal(null, err);
		if (err) {
			console.log("unable to connect to db");
		} else {
			console.log("connected to the db");
			getMessages(db, name, callback);
		}
		
	});

	var getMessages = function(db, name, callback) {
		var messagesCollection = db.collection('messageLogs');
		// insert docs into the collection
		messagesCollection.find({room: name}).sort({date: -1}).limit(10).toArray(function(err, result) {
			assert.equal(err, null);
			if(typeof callback == "function") 
	        	callback(result);
			db.close();		
		});
	};
};

/*
var authenticateUser = function(db, doc, callback) {
	var usersCollection = db.collection('users');
	usersCollection.find().toArray(function(err, docs) {
		
	});
};
*/

/****************
*
* ROUTING GOODNESS
*
*****************/

// routes
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
app.get('/main.js', function(req, res){
  res.sendFile(__dirname + '/main.js');
});


/****************
*
* CHATTING GOODNESS
*
*****************/


var rooms = [];

io.on('connection', function(socket) {
	socket.emit('system msg', 'Welcome to chat');

	console.log('user connected');

	/****************
	*
	* AUTHENTICATING ...
	*
	*****************/

	// authenticate the user
/*	socket.on('authenticate', function(data) {

	});
*/

	/****************
	*
	* ROOMS MANAGEMENT
	*
	*****************/

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
		console.log("Socket joined");
		// let the client know they have joined the room
		socket.emit('system msg', 'You have joined ' + name + '.');
	}); // a thought .. how do we know when to remove a room ? socket.io automatically destroys the room when the last user has left ...


	socket.on('get rooms', function() {
		socket.emit('rooms list', rooms);
	});

	/****************
	*
	* SEND MESSAGES
	*
	*****************/

	socket.on('message to room', function(data) {
		socket.to(data.room).emit('convo', data);
		// push message to db
		pushMessage(data);
	});

	/****************
	*
	* GETTING OLD MESSAGES
	*
	*****************/

	// pull old messages from room (name) and send back to client
	socket.on('fetch old messages', function(name) {
		var data = getOldMessages(name, function(data) {
			socket.emit('res old messages', data);
		});
	});


	// if a socket disconnects from the server
/*	socket.on('disconnect', function() {
		console.log('user disconnected');
		socket.emit('system msg', 'User has disconnected');
	});
*/
});

/****************
*
* ESTABLISH WEB SERVER
*
*****************/

// let's listen
http.listen(3000, function(){
  console.log('listening on *:3000');
});