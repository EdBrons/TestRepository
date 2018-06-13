var Utils = {};

Utils.isAdjacent = function(position1, position2){
	if ((Math.abs(position1.x - position2.x) + Math.abs(position1.y - position2.y)) == 1){
		return true;
	}
	return false;
}

Utils.getAdjacents = function(position){
	var adjacents = [];
}

Utils.getPath = function(map, start, end){

}

module.exports = Utils;