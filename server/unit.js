var Unit = function(id, teamId, position){
	this.id = id;
	this.teamId = teamId;

	this.moving = false;
	this.progress = 0;
	this.position = position;
	this.destination = null;

	this.health = 100;
	this.maxHealth = 100;

	this.attacking = false;
	this.defender = null;
	this.attackCooldown = 0;
	this.attackTime = 10;
	this.attack = 10;
}

Unit.prototype.getName = function(){
	return "Unit_" + this.id;
}

module.exports = Unit;