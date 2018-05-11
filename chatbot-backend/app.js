const express = require("express");
const socketIo = require("socket.io");
const port = 8080;
const app = express();
var readline = require('readline'),
rl = readline.createInterface(process.stdin, process.stdout),
prefix = '> ';

server = app.listen(port, () => {
	console.log('Server is running on port ' + port);
	console.log('Console for Kalimat.ai chatbot. Please enter your command');
	rl.setPrompt(prefix, prefix.length);
	rl.prompt();
});
io = socketIo(server);

rl.on('line', function(line) {
	var input = line.trim().split(" ");
	if (input.length > 1) {
		var command = input[0];
		input.splice(0,1);
		input[input.length-1] = input[input.length-1].replace(/\r?\n|\r/g,"");
		if (command === 'text') {
			var messageContent = input.join(" ");
			var message = JSON.stringify({'user' : 'chatbot','type' : 'text','content' : messageContent});
			io.emit('RECEIVE_MESSAGE', message);
		} else if (command === 'buttons') {
			var items = new Array();
			for (var i = 0; i < input.length; i++) {
				items.push({'item' : 'button','text' : input[i]});
			}
			var message = JSON.stringify({'user' : 'chatbot','type' : 'template','items' : items});
			io.emit('RECEIVE_MESSAGE', message);
		} else {
			console.log('Unknown command');
			rl.setPrompt(prefix, prefix.length);
			rl.prompt();
		}
	}
});
rl.on('close', function() {
  	console.log('Bye');
  	process.exit(0);
});

io.on("connection", (socket) => {
	readline.clearLine(process.stdout,0);
  	console.log(socket.id + ": is connected");
  	rl.setPrompt(prefix, prefix.length);
  	rl.prompt();

  	socket.on('SEND_MESSAGE', function(message){
  		readline.clearLine(process.stdout,0);
  		console.log(message.user + ": is writing '" + message.content + "'");
  		rl.setPrompt(prefix, prefix.length);
  		rl.prompt();
  	});
  	
  	socket.on('RECEIVE_MESSAGE', function(message){
  		if (message.type === 'text') {
  			readline.clearLine(process.stdout,0);
  			console.log(message.user + ": got '" + message.content + "'");
  			rl.setPrompt(prefix, prefix.length);
  			rl.prompt();
  		} else if (message.type === 'template') {
  			var buttons = new Array();
  			for (var i=0;i<message.items.length;i++) {
  				buttons.push(message.items[i].text);
  			};
  			var buttonArguments = buttons.join(', ');
  			readline.clearLine(process.stdout,0);
  			console.log(message.user + ": got buttons(" + buttonArguments + ")");
  			rl.setPrompt(prefix, prefix.length);
  			rl.prompt();
  		}
  	});

  	socket.on("disconnect", function() {
  		process.stdout.clearLine();
  		socket.disconnect(true);
  		process.stdout.clearLine();
  		console.log(socket.id + ": is disconnected");
  		rl.setPrompt(prefix, prefix.length);
  		rl.prompt();
	});
});

