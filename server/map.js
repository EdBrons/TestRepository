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
		
		if (unit.alert){
			var neighbors = Utils.getAdjacents(unit.position);
			for (var i in neighbors){
				if (this.isInBounds(neighbors[i])){
					var position = neighbors[i];
					if (this.getUnitAt(position) != null && this.getUnitAt(position).teamId != unit.teamId){
						this.attack(unit.id, this.getUnitAt(position).id);	
					}
				}
			}
		}

		if (unit.target != null && unit.target != undefined && unit.moving == false){
			if (unit.position.x < unit.target.x){
				this.moveUnit(unit.id, {x : unit.position.x + 1, y : unit.position.y});
			}
			else if (unit.position.x > unit.target.x){
				this.moveUnit(unit.id, {x : unit.position.x - 1, y : unit.position.y});
			}
			
			else if (unit.position.y < unit.target.y){
				this.moveUnit(unit.id, {x : unit.position.x, y : unit.position.y + 1});
			}
			else if (unit.position.y > unit.target.y){
				this.moveUnit(unit.id, {x : unit.position.x, y : unit.position.y - 1});
			}
		}

		if (unit.moving){
			if (this.canMoveTo(unit, unit.destination)){
				unit.progress += 30;
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
					//reset progress
					unit.progress = 0;
					//update unit destination
					unit.destination = null;
					//stop unit moving
					unit.moving = false;

					if (unit.target != null && unit.position.x == unit.target.x && unit.position.y == unit.target.y){
						unit.target = null;
					}
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
	if (attacker == false){
		return false;	
	}
	var defender = this.getUnitById(defenderId);
	if (defender == false){
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

Map.prototype.setAlert = function(unitId){
	var unit = this.getUnitById(unitId);
	if (unit){
		if (unit.alert){
			unit.alert = false;	
		}
		else{
			unit.alert = true;
		}
	}
}

Map.prototype.setTarget = function(unitId, destination){
	var unit = this.getUnitById(unitId);
	unit.target = destination;
}

Map.prototype.canMoveTo = function(unit, destination){
	if (!Utils.isAdjacent(unit.position, destination)){
		console.log(unit.getName() + " can't move because the tiles are not adjacent.")
		return false;
	}

	if (this.getUnitAt(destination) != null){
		console.log(unit.getName() + " can't move because the destination has a unit");
		return false;
	}

	if (this.getUnitMovingTo(destination) != null && this.getUnitById(destination).id != unit.Id){
		console.log(unit.getName() + " can't move because the destination has a unit moving to it")
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

Map.prototype.getRandomPosition = function(){
	
	var tries = 10;
	
	var position = {
		x : Math.floor(Math.random() * this.width),
		y : Math.floor(Math.random() * this.height)
	};
	
	var unique = false;
	
	while (unique == false){
		position = {
			x : Math.floor(Math.random() * this.width),
			y : Math.floor(Math.random() * this.height)
		};
		
		if (this.getUnitAt(position) == null && this.getUnitMovingTo(position) == null){
			unique = true;
		}
		
		tries--;
		if (tries < 0){
			return false;
		}
	}

	return position;
}

module.exports = Map;
