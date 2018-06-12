var Unit = function(id, teamId, position, name){
	this.id = id;
	this.teamId = teamId;
	this.moving = false;
	this.progress = 0;
	this.position = position;
	this.destination = null;
	this.name = name;
}

module.exports = Unit;