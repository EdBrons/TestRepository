var Utils = {};

Utils.isAdjacent = function(position1, position2){
	if ((Math.abs(position1.x - position2.x) + Math.abs(position1.y - position2.y)) == 1){
		return true;
	}
	return false;
}

module.exports = Utils;