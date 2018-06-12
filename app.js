// app.js
var express = require('express');  
var app = express();  
var server = require('http').createServer(app);  
var io = require('socket.io')(server);

app.get('/', function(req, res,next) {  
    res.sendFile(__dirname + '/client/index.html');
});

//client files
app.use("/client", express.static(__dirname + "client/"));

const PORT = process.env.PORT || 2000;

server.listen(PORT, () => {
	console.log("Our app is running on port " + PORT);
});
console.log("Server started.");

var Map = require("./server/map.js");
var Unit = require("./server/unit.js");

var map = new Map(20, 20);

var sockets = {};
var factions = {};

io.sockets.on("connection", function(socket){
	console.log("Socket connection.");
	socket.id = Math.floor(Math.random() * 1000000000);
	sockets[socket.id] = socket;
	socket.color = getRandomColor();

	factions[socket.id] = {};
	factions[socket.id].color = socket.color;

	var position = {
		x : Math.floor(Math.random() * map.width),
		y : Math.floor(Math.random() * map.height)
	};
	
	var unique = false;
	
	while (unique == false){
		position = {
			x : Math.floor(Math.random() * map.width),
			y : Math.floor(Math.random() * map.height)
		};
		
		if (map.getUnitAt(position) == null && map.getUnitMovingTo(position) == null){
			unique = true;
		}
	}

	map.createUnit(socket.id, position, getName());

	socket.on("disconnect", function() {
		console.log(socket.id + " has disconnected.");
		map.deleteTeam(socket.id);
	});

	socket.on("moveUnit", function(data){
		console.log(socket.id + " tries to move " + data.unitId + " to " + data.to.x + "," + data.to.y);
		map.moveUnit(data.unitId, data.to);
	});



	updateClients();
});

function updateClients(){
	for (var i in sockets){
		var socket = sockets[i];
		socket.emit("mapUpdate", {
			map : map,
			factions : factions
		});
	}
}

var i = 0;
var names = [
	"Jack",
	"Ian",
	"Lookas",
	"George",
	"Jill",
	"Walton",
	"Jim",
	"Brad",
	"Dave",
	"IfWeGetThisFarTheNextUnitWillCrashTheServer!"
];
function getName(){
	return names[i++];
}

var ticksPerSecond = 60

function Tick(){
	
	map.update();

	updateClients();

	setTimeout(Tick, 1000 / ticksPerSecond);

}

function getRandomColor() {
	var letters = '0123456789ABCDEF';
	var color = '#';
	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

Tick();
