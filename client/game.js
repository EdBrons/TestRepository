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