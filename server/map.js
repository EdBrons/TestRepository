var Utils = require("./utils.js");
var Unit = require("./unit.js");

var Map = function(width, height){
	this.width = width;
	this.height = height;

	this.units = [];
	this.unitMap = [];
	this.unitCount = 0;

	for (var x = 0; x < width; x++){
		this.unitMap[x] = [];
		for (var y = 0; y < height; y++){
			this.unitMap[x][y] = {
				unit : null,
				movingTo : null,
			};
		}
	}
}

Map.prototype.isInBounds = function(position){
	return (position.x >= 0 && position.y >= 0 && position.x < this.width && position.y < this.height);
}

Map.prototype.getUnitAt = function(position){
	if (!this.isInBounds(position)){
		return null;
	}
	return this.unitMap[position.x][position.y].unit;
}

Map.prototype.getUnitMovingTo = function(position){
	if (!this.isInBounds(position)){
		return null;
	}
	return this.unitMap[position.x][position.y].movingTo;	
}

Map.prototype.createUnit = function(teamId, position){
	var unit = new Unit(this.unitCount++, teamId, position);
	this.units.push(unit);
	this.unitMap[position.x][position.y].unit = unit;
}

Map.prototype.update = function(){
	for (var i in this.units){
		var unit = this.units[i];

		if (unit.attackCooldown > 0){
			unit.attackCooldown--;
		}

		if (unit.moving){
			if (this.canMoveTo(unit, unit.destination)){
				unit.progress += 10;
				if (unit.progress > 100){

					//tell ian for testing purposes
					console.log(unit.getName() + " moved from " + unit.position.x + "," + unit.position.y + " to " + unit.destination.x + "," + unit.destination.y);

					//take unit off starting tile
					this.unitMap[unit.position.x][unit.position.y].unit = null;
					//put unit onto destination tile
					this.unitMap[unit.destination.x][unit.destination.y].unit = unit;
					//take away claim
					this.unitMap[unit.destination.x][unit.destination.y].movingTo = null;
					//update unit position
					unit.position = unit.destination;
					//update unit destination
					unit.destination = null;
					//stop unit moving
					unit.moving = false;
					//reset progress
					unit.progress = 0;
				}
			}
			else{
				//unit cant move to tile so it stops
				unit.moving = false;
			}
		}
	}
}

Map.prototype.attack = function(attackerId, defenderId){
	var attacker = this.getUnitById(attackerId);
	if (attacker == undefined){
		return false;	
	}
	var defender = this.getUnitById(defenderId);
	if (defender == undefined){
		return false;
	}
	if (Utils.isAdjacent(attacker.position, defender.position)){
		if (attacker.attackCooldown <= 0){
			console.log(attacker.getName() + " attacked" + defender.getName());
			defender.health -= attacker.attack;
			if (defender.health < 0){
				this.deleteUnit(defenderId);
			}
			attacker.attackCooldown = attacker.attackTime;
		}
	}
}

Map.prototype.moveUnit = function(unitId, destination){
	for (var i in this.units){
		var unit = this.units[i];
		if (unit.id == unitId){

			if (unit.moving){
				// console.log(unit.destination.x + "," + unit.destination.y + " " + destination.x + "," + destination.y);
				if (unit.destination.x == destination.x && unit.destination.y == destination.y){
					return false;
				}

				else{
					this.unitMap[unit.destination.x][unit.destination.y].movingTo = null;
				}
			}
			else{
				if (unit.destination != null){
					this.unitMap[unit.destination.x][unit.destination.y].movingTo = null;
				}
			}

			unit.destination = destination;
			this.unitMap[unit.destination.x][unit.destination.y].movingTo = unit;
			unit.moving = true;
			unit.progress = 0;
		}
	}
}

Map.prototype.canMoveTo = function(unit, destination){
	if (!Utils.isAdjacent(unit.position, destination)){
		console.log(unit.getName() + " can't move because the tiles are not adjacent.")
		return false;
	}

	if (this.getUnitAt(destination) != null && this.getUnitMovingTo(destination) != null){
		console.log(unit.getName() + " can't move because the destination has a unit");
		return false;
	}


	return true;
}

Map.prototype.deleteTeam = function(teamId){
	for (var i = this.units.length - 1; i >= 0; i--){
		var unit = this.units[i];
		if (unit.teamId == teamId){
			this.unitMap[unit.position.x][unit.position.y].unit = null;
			if (unit.destination != null){
				this.unitMap[unit.destination.x][unit.destination.y].movingTo = null;
			}
			this.units.splice(i, 1);
		}
	}
}

Map.prototype.deleteUnit = function(unitId){
	for (var i = this.units.length - 1; i >= 0; i--){
		var unit = this.units[i];
		if (unit.id == unitId){
			this.unitMap[unit.position.x][unit.position.y].unit = null;
			if (unit.destination != null){
				this.unitMap[unit.destination.x][unit.destination.y].movingTo = null;
			}
			this.units.splice(i, 1);
		}
	}
}

Map.prototype.getUnitById = function(unitId){
	for (var i in this.units){
		if (this.units[i].id == unitId){
			return this.units[i];
		}
	}
	return false;
}

module.exports = Map;
