function changeScene(newScene){
	window[scene + "Container"].visible = false;
	scene = newScene;
	if(scene == "game") gameSetup();
	window[scene + "Container"].visible = true;
};
