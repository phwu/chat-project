$(function(){
	// establish connection
	var socket = io();

	// some handy dandy variables
	var name = '';
	var mg = '';
	var room = '';

	/****************
	*
	* AUTHENTICATING ...
	*
	*****************/

	// get user name 
	// TODO authentication
	$('#login').submit(function() {
		name = $('#name').val();
		//pw = $('#name').val();
		//socket.emit('authenticate', {name: name, pw: pw});
		
		// will remove once authentication in place
		$('#login input').prop('disabled', true);
	    $('#login button').prop('disabled', true);
	    $('#options li').removeClass('disabled');
	    $('#oldmessages li').removeClass('disabled');
	    socket.emit('get rooms', {});
	    
	    // bind on click
		$('#createroom').click(function() {
			createRoom();
		});

	    return false;
	});

/*
	socket.on('authenticate', function(data) {
		if(login is true) {
			$('#login input').prop('disabled', true);
	    	$('#login button').prop('disabled', true);
	    	$('#options li').removeClass("disabled");
	    	socket.emit('get rooms', {});
		}else {

		}
	});
	*/

	/****************
	*
	* ROOM FUNCTIONS
	*
	*****************/

	// create a room based on username, client assumes if you create a room, you're going to join it
	function createRoom() {
		socket.emit('create room', name);
		room = name;
		$('#options li').addClass('disabled');
		$('#createroom').prop('onclick',null).off('click');
	    $('#joinrooms li').each(function() {
	    	$(this).find('a').prop('onclick',null).off('click');
	    });
		$('#chat button').prop('disabled', false);
	};
	

	// show available rooms.... this could be helpful for operators
	socket.on('rooms list', function(rooms) {
		if(rooms.length > 0) {
			$('#joinrooms').find('#room-count').text(rooms.length);
	    	rooms.forEach(function(room) {
	    		// add to lists and bind the function .. this one was a doosey since it's dynamic
	    		var link = '<li><a href="#">'+room+'</a></li>';
	        	$('#joinrooms').append(link);
	        	$('#joinrooms li:last-child').find('a').click(function(){
	        		joinRoom(room);
	        	});
	    	});
		}
	});

	// now we can join rooms
	function joinRoom(rm) { 
		// basically same as creating a room, cept we pass a room name rather than using the user's name
	    socket.emit('create room', rm);
	    room = rm;
	    $('#options li').addClass('disabled');
	    $('#createroom').prop('onclick',null).off('click');
	    $('#joinrooms li').each(function() {
	    	$(this).find('a').prop('onclick',null).off('click');
	    });
	    $('#chat button').prop('disabled', false);
	};

	/****************
	*
	* SENDING MESSAGES
	*
	*****************/
	      
	// we always want to send the message to clients in the same room
	$('#chat').submit(function() {
		mg = $('#m').val();
	    var date = new Date();

	    // this will help keep the db clean and ensure the UI looks OK
	    if(name == '') {
	    	name = 'null';
	    }
	    if(mg == '') {
	    	mg = 'null';
	    }

	    var data = {
	    	name: name,
	        mg: mg,
	        room: room,
	        date: date
	    };

	    // this will ensure only sockets connected in the same room get the message
	    socket.emit('message to room', data);
	    // go ahead and propagate message to screen since it's from your client anyways!
	    var messageHtml = '<li>' + mg + ' (<span>'+date.toTimeString()+'</span>)</li>';
	    var nameHtml = '<li><strong>'+ name +'</strong></li>';
	    $('#messages').append(messageHtml);
	    $('#names').append(nameHtml);
	    // reset the message boxx
	    $('#m').val('');
	    return false;
	});

	/****************
	*
	* RECEIVING MESSAGES
	*
	*****************/

	socket.on('convo', function(data) {
		var date = new Date(data.date);
	   	// we got our packet from the other client(s) in the room, let's propagate that data!
	   	var messageHtml = '<li>' + data.mg + ' (<span>'+date.toTimeString()+'</span>)</li>';
	    var nameHtml = '<li><strong>'+ data.name +'</strong></li>';
	    $('#messages').append(messageHtml);
	    $('#names').append(nameHtml);
	});

	/****************
	*
	* HANDLE SERVER MESSAGES
	*
	*****************/

	// messages pushed from the server, can be used to send alerts from server side ...
	socket.on('system msg', function(msg) {
		$('#names').append($('<li class="text-uppercase">').text('*****'));
		$('#messages').append($('<li>').text(msg));
	});

	/****************
	*
	* GETTING OLD MESSAGES
	*
	*****************/

	// fetch old messages
	function fetchOldMgs(name) {
		socket.emit('fetch old messages', name);
		$('#oldmessages li').find('a').prop('onclick',null).off('click');
		$('#oldmessages li').addClass('disabled');
	};
	$('#oldmessages').find('a').click(function() {
		fetchOldMgs(name);
	});

	socket.on('res old messages', function(data) {
		if(data.length == 0) {
			var html = '<li>No messages found :(</li>';
			$('#oldmessages').append(html);
		} else {
			data.forEach(function(msg) {
				var date = new Date(msg.date);
				var oldHtml = '<li><em>'+ date.toString() + '</em>   <strong>' + msg.name + ' said </strong>' + msg.mg + '</li>';
				$('#oldmessages').append(oldHtml);
			});
		}
	});

});