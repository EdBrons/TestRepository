// app.js
var express = require('express');  
var app = express();  
var server = require('http').createServer(app);  
var io = require('socket.io')(server);

app.get('/', function(req, res,next) {  
    res.sendFile(__dirname + '/client/index.html');
});

app.use("/client", express.static(__dirname + "/client"));

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
	factions[socket.id].points = 100;
	factions[socket.id].pointIncome = .1;

	map.createUnit(socket.id, getRandomPosition());

	socket.on("disconnect", function() {
		console.log(socket.id + " has disconnected.");
		delete sockets[socket.id];
		delete factions[socket.id];
		map.deleteTeam(socket.id);
	});

	socket.on("attackUnit", function(data){
		map.attack(data.attackerId, data.defenderId);
	});

	socket.on("buyUnit", function(data){
		if (factions[socket.id].points >= 100){
			var position = data.positon;
			if (position && map.getUnitAt(position) != null && map.getUnitMovingTo(position) != null){
				data.position = getRandomPosition();
			}
			if (!map.isInBounds(data.position)){
				data.position = getRandomPosition();
			}
			factions[socket.id].points -= 100;
			map.createUnit(socket.id, data.position);
		}
	});

	socket.on("moveUnit", function(data){
		var unit = map.getUnitById(data.unitId);
		if (unit.teamId == socket.id && map.isInBounds(data.to)){
			map.moveUnit(data.unitId, data.to);
		}
	});

	updateClients();

	socket.emit("faction", {
		factionId : socket.id
	});
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

function getRandomPosition(){
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

	return position;
}

var ticksPerSecond = 20;

function Tick(){
	
	map.update();

	for (var i in factions){
		factions[i].points += factions[i].pointIncome;
	}

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