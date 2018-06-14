		//document.addEventListener("keydown", handleKeydown);
		
	// 	function handleKeydown(e){
	// 		if (selectedUnit == null){
	// 			return false;
	// 		}
	// 		if (e.keyCode == 37){
	// 			//left
	// 			if (selectedUnitId != null){
	// 				socket.emit("moveUnit", {
	// 					unitId : selectedUnit.id,
	// 					to : {x : selectedUnit.position.x - 1, y : selectedUnit.position.y}
	// 				});
	// 			}
	// 		}
	// 		else if (e.keyCode == 38){
	// 			//up
	// 			if (selectedUnitId != null){
	// 				socket.emit("moveUnit", {
	// 					unitId : selectedUnit.id,
	// 					to : {x : selectedUnit.position.x, y : selectedUnit.position.y - 1}
	// 				});
	// 			}
	// 		}
	// 		else if (e.keyCode == 39){
	// 			//right
	// 			if (selectedUnitId != null){
	// 				socket.emit("moveUnit", {
	// 					unitId : selectedUnit.id,
	// 					to : {x : selectedUnit.position.x + 1, y : selectedUnit.position.y}
	// 				});
	// 			}
	// 		}
	// 	app.selectedTile = {x : x, y : y};
	// }