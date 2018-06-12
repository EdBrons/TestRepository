var socket = io();

socket.on("updateWorld", function(data){
	tiles = data.tiles;
	drawTiles();
});

var tiles;

var canvas = document.getElementById("canvas");
var c = canvas.getContext("2d");

function drawTiles(){
	tiles.forEach((tile) => {
		c.fillStyle = "#000000";
		c.fillRect(tile.x * 16 + 6, tile.y * 16 + 6, 4, 4);
	});
}