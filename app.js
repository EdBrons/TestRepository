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
var Utils = require("./server/utils.js")

var map = new Map(100, 100);

var sockets = {};
var factions = {};
var incomeTiles = [];
for (var i = 0; i < 20; i++){
	var position = {
		x : Math.floor(Math.random() * map.width),
		y : Math.floor(Math.random() * map.height),
	}
	
	var income = Math.floor(Math.random() * 10) / 10;
	
	incomeTiles.push({
		position : position,
		income : income,
		controlledBy : null,
	});
}

io.sockets.on("connection", function(socket){
	console.log("Socket connection.");
	socket.id = Math.floor(Math.random() * 1000000000);
	sockets[socket.id] = socket;
	socket.color = Utils.getRandomColor();

	factions[socket.id] = {};
	factions[socket.id].color = socket.color;
	factions[socket.id].points = 100;
	
	var position = map.getRandomPosition();
	if (position != false){
		map.createUnit(socket.id, position);	
	}

	socket.on("disconnect", function() {
		console.log(socket.id + " has disconnected.");
		delete sockets[socket.id];
		delete factions[socket.id];
		map.deleteTeam(socket.id);
	});

	socket.on("attackUnit", function(data){
		console.log("attack");

		map.attack(data.attackerId, data.defenderId);
	});

	socket.on("buyUnit", function(data){
		console.log("buy")

		if (factions[socket.id].points >= 100){
			if (data.position == undefined || data.position == null || (map.getUnitAt(data.position) != null || map.getUnitMovingTo(data.position != null)) || data.position == "none"){
				data.position = map.getRandomPosition();
			}
			if (data.position != false){
				map.createUnit(socket.id, data.position);
				factions[socket.id].points -= 100;
			}
		}
	});

	socket.on("moveUnit", function(data){
		console.log("move")

		var unit = map.getUnitById(data.unitId);

		if (unit.teamId != socket.id){
			return false;
		}

		if (Utils.isAdjacent(unit.position, data.to) == false){
			map.setTarget(unit.id, data.to);
		}
		if (unit.teamId == socket.id && map.isInBounds(data.to)){
			map.moveUnit(data.unitId, data.to);
		}
	});
	
	socket.on("setAlert", function(data){
		var unit = map.getUnitById(data.unitId);
		
		if (unit.teamId != socket.id){
			return false;	
		}
		
		map.setAlert(unit.id);
	});

	updateClients();

	socket.emit("teamId", {
		teamId : socket.id
	});
});

function updateClients(){
	for (var i in sockets){
		var socket = sockets[i];
		socket.emit("mapUpdate", {
			map : map,
			teams : factions,
			incomeTiles : incomeTiles,
		});
	}
}

var ticksPerSecond = 20;

function updateIncome(){
	for (var i in factions){
		if (factions[i]){
			factions[i].pointIncome = 0;	
		}
	}
	for (var i in incomeTiles){
		if (incomeTiles[i]){
			var incomeTile = incomeTiles[i];
			var unit = map.getUnitAt(incomeTile.position);	
			if (unit){
				factions[unit.teamId].pointIncome += incomeTile.income;	
			}
		}
	}	
}

function Tick(){
	
	map.update();

	updateIncome();
	
	for (var i in factions){
		if (factions[i]){
			factions[i].points += factions[i].pointIncome;	
		}
	}
	
	updateClients();

	setTimeout(Tick, 1000 / ticksPerSecond);
}

Tick();
