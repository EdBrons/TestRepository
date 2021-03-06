var socket = io();
var map;
var units;
var factions;
var faction;
var tileSize = 16;
var canvas = document.getElementById("canvas");
var c = canvas.getContext("2d");

canvas.width = 20 * tileSize;
canvas.height = 20 * tileSize;

socket.on("mapUpdate", function(data){
	console.log("Recieved map update.");
	map = data.map;
	factions = data.factions;
	drawMap();
});

socket.on("faction", function(data){
	faction = data.factionId;
	document.body.style.backgroundColor = factions[faction].color;
});

var selectedUnitId = null;

canvas.addEventListener("click", handleClick);

// document.addEventListener("keydown", handleKeydown);

function handleKeydown(e){
	var unitPosition = {x : 0, y : 0};
	for (var i in map.units){
		if (map.units[i].id == selectedUnitId){
			unitPosition = map.units[i].position;
		}
	}
	if (e.keyCode == 37){
		//left
		if (selectedUnitId != null){
			socket.emit("moveUnit", {
				unitId : selectedUnitId,
				to : {x : unitPosition.x - 1, y : unitPosition.y}
			});
		}
	}
	else if (e.keyCode == 38){
		//up
		if (selectedUnitId != null){
			socket.emit("moveUnit", {
				unitId : selectedUnitId,
				to : {x : unitPosition.x, y : unitPosition.y - 1}
			});
		}
	}
	else if (e.keyCode == 39){
		//right
		if (selectedUnitId != null){
			socket.emit("moveUnit", {
				unitId : selectedUnitId,
				to : {x : unitPosition.x + 1, y : unitPosition.y}
			});
		}
	}
	else if (e.keyCode == 40){
		//down
		if (selectedUnitId != null){
			socket.emit("moveUnit", {
				unitId : selectedUnitId,
				to : {x : unitPosition.x, y : unitPosition.y + 1}
			});
		}
	}
}
	
function handleClick(e){
	var x = Math.floor((e.clientX - canvas.offsetLeft) / tileSize);
	var y = Math.floor((e.clientY - canvas.offsetTop) / tileSize);
	// var unit = map.getUnitAt({x : x, y : y});
	var tile = map.unitMap[x][y];
	if (tile.unit != null){
		selectedUnitId = tile.unit.id;
	}
	else {
		if (tile.movingTo == null && selectedUnitId != null){
			socket.emit("moveUnit", {
				unitId : selectedUnitId,
				to : {x : x, y : y}
			});
			selectedUnitId = null;
		}
	}
}
function drawMap(){
	c.clearRect(0, 0, canvas.width, canvas.height);

	//temporary drawing of tiles
	c.fillStyle = "#2ECC71";
	c.fillRect(0, 0, map.width * tileSize, map.height * tileSize);


	for (var i in map.units){
		var unit = map.units[i];
		c.fillStyle = factions[unit.teamId].color;
		var x = unit.position.x * tileSize;
		var y = unit.position.y * tileSize;
		if (unit.moving){
			if (unit.position.x > unit.destination.x){
				x -= Math.floor(tileSize * unit.progress / 100);
			}
			else if (unit.position.x < unit.destination.x){
				x += Math.floor(tileSize * unit.progress / 100);
			}
	
			if (unit.position.y > unit.destination.y){
				y -= Math.floor(tileSize * unit.progress / 100);
			}
			else if (unit.position.y < unit.destination.y){
				y += Math.floor(tileSize * unit.progress / 100);
			}
		}
		
		c.fillRect(x, y, tileSize, tileSize);
	}
}