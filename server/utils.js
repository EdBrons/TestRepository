var Utils = {};

Utils.isAdjacent = function(position1, position2){
	if ((Math.abs(position1.x - position2.x) + Math.abs(position1.y - position2.y)) == 1){
		return true;
	}
	return false;
}

//Only 4 - no diagonals
Utils.getAdjacents = function(position){
	var adjacents = [];
	adjacents[0] = {x : position.x - 1, y : position.y};
	adjacents[1] = {x : position.x + 1, y : position.y};
	adjacents[2] = {x : position.x, y : position.y - 1};
	adjacents[3] = {x : position.x, y : position.y + 1};
	return adjacents;
}

//Manhattan
Utils.getDistance = function(position1, position2){
	return Math.abs(position1.x - position2.x) + Math.abs(position1.y - position2.y);
}

Utils.getPath = function(map, start, end){
	map.tiles = [];
	for (var x = 0; x < map.width; x++){
		map.tiles[x] = [];
		for (var y = 0; y < map.height; y++){
			map.tiles[x][y] = {};
			map.tiles[x][y].f = 0;
			map.tiles[x][y].g = 0;
			map.tiles[x][y].h = 0;
			map.tiles[x][y].debug = null;
			map.tiles[x][y].parent = null;
			map.tiles[x][y].position = {
				x : x,
				y : y,
			}
		}
	}

	var openList = [];
	var closedList = [];
	openList.push(map.tiles[start.x][start.y]);

	while (openList.length > 0){
		var lowInd = 0;

		for (var i in openList){
			if (openList[i].f < openList[lowInd].f){ lowInd = i }
		}

		var currentNode = openList[lowInd];

		if (currentNode.position.x == end.x && currentNode.position.y == end.y){
			var curr = currentNode;
			var ret = [];
			// while (curr.parent){
			// 	console.log(curr.parent.position.x + "," + curr.parent.position.y);
			// 	ret.push(curr);
			// 	curr = curr.parent;
			// }
			// var path = ret.reverse();
			// for (var i in path){
			// 	console.log(path[i].x + "," + path[i].y);
			// }

			console.log(currentNode);

			return true;
		}

		openList.splice(lowInd, 1);
		closedList.push(currentNode);

		var positions = Utils.getAdjacents(currentNode.position);
		var neighbors = [];

		for (var i in positions){
			if (map.tiles[positions[i].x] && map.tiles[positions[i].x][positions[i].y]){
				neighbors.push(map.tiles[positions[i].x][positions[i].y]);
			}
		}

		for (var i in neighbors){
			var neighbor = neighbors[i];

			if(map.unitMap[neighbor.position.x][neighbor.position.y].unit != null) {
          		// not a valid node to process, skip to next neighbor
          		continue;
        	}

        	var gScore = currentNode.g + 1; // 1 is the distance from a node to it's neighbor
       	 	var gScoreIsBest = false;

       	 	if(openList.indexOf(neighbor) == -1) {
        		// This the the first time we have arrived at this node, it must be the best
        		// Also, we need to take the h (heuristic) score since we haven't done so yet
        		gScoreIsBest = true;
        		neighbor.h = Utils.getDistance(neighbor.position, end);
        		openList.push(neighbor);
        	}
        	else if(gScore < neighbor.g) {
          		// We have already seen the node, but last time it had a worse g (distance from start)
        		  gScoreIsBest = true;
        	}

        	if(gScoreIsBest) {
        		  // Found an optimal (so far) path to this node.   Store info on how we got here and
        		  //  just how good it really is...
        		  neighbor.parent = currentNode;
        		  neighbor.g = gScore;
        		  neighbor.f = neighbor.g + neighbor.h;
        		  neighbor.debug = "F: " + neighbor.f + "<br />G: " + neighbor.g + "<br />H: " + neighbor.h;
        	}


        	if (neighbor.position.x == end.x && neighbor.position.y == end.y){
        		console.log(currentNode);
        		return true;
        	}


		}
	}

	return [];
}

Utils.getRandomColor = function() {
	var letters = '0123456789ABCDEF';
	var color = '#';
	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}


module.exports = Utils;