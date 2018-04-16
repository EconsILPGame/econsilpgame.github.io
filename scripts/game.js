var gameFocus = true;
var gameID = document.getElementById('game').children[0];
document.onclick = function(event){
	if(!gameID.contains(event.target)) gameFocus = false;
	else gameFocus = true;
}
var renderer = PIXI.autoDetectRenderer();

//Loads textures
PIXI.loader
	.add([
		"sprites/player.png",
		"sprites/spritesheet.png",
		"sprites/largeButtonBox.png",
		"sprites/menuBackground.png",
		"sprites/exit.png",
		"sprites/pause.png",
		"sprites/resume.png",
		"sprites/gameTopBarBg.jpg",
		"sprites/graph.png",
		"sprites/wall.png",
		"sprites/restart.png",
		"sprites/gameBg.jpg",
		"sprites/pickups.json",
		"sprites/anger.json"
	])
	.load(setup);


//Input
var keyCodeList = {
	37: "left",
	38: "up",
	39: "right",
	40: "down"
};
var input = {
	up: false,
	down: false,
	left: false,
	right: false
};
function keyPress(event, action){
	if([37, 38, 39, 40].indexOf(event.keyCode) != -1 && gameFocus == true) event.preventDefault();
	input[keyCodeList[event.keyCode]] = action;
}
document.addEventListener("keydown", function(event){keyPress(event, true);});
document.addEventListener("keyup", function(event){keyPress(event, false);});


//Initialise
var scene = 'menu'
const friction = 0.9;
function but(x, y){
	this.anchor.set(0.5);
	this.position.set(x, y);
	this.interactive = true;
	this.buttonMode = true;	
	this.on("mouseover", function(){
		this.scale.x = 1.1;
		this.scale.y = 1.1;
	});
	this.on("mouseout", function(){
		this.scale.x = 1;
		this.scale.y = 1;
	});
}
var player, menuPlayBut, menuBackground, menuContainer, gameContainer, gameOverText, gamePauseContainer, gameNotPauseContainer, gamePauseExit;
var gameScreen = {}, gameTopBar, gameTopBarBg, gamePauseBut, gameOverContainer, stats = {}, graph = {};
var pickupDesc = ["taxDec", "taxInc"], onScreenPickups = [], onScreenWalls = [];
const statsDesc = ["curConsumerSurplus", "curProducerSurplus", "tax", "curAnger", "score"];
function pauseMenuButton(text, texture, x, y){
	this.text = new PIXI.Text(text, {fontFamily: "consolas", fontSize: 18});
	this.text.anchor.set(0.5);
	this.text.position.set(-30, 0);
	this.icon = new PIXI.Sprite(PIXI.loader.resources[texture].texture);
	this.icon.anchor.set(0.5);
	this.icon.position.set(60, 0);
	this.addChild(this.text, this.icon);
	but.call(this, x, y);
	gamePauseContainer.addChild(this);
}	
function setup(){	
	menuContainer = new PIXI.Container();
	menuBackground = new PIXI.Sprite(PIXI.loader.resources["sprites/menuBackground.png"].texture);
	menuBackground.scale.x = 4;
	menuBackground.scale.y = 4;
	
	menuPlayBut = new PIXI.Sprite(PIXI.loader.resources["sprites/largeButtonBox.png"].texture);
	but.call(menuPlayBut, app.screen.width/2, app.screen.height*2/3);
	menuPlayBut.text = new PIXI.Text("PLAY", {fontFamily: "Consolas"});
	menuPlayBut.addChild(menuPlayBut.text);
	menuPlayBut.text.anchor.set(0.5);
	menuPlayBut.on("pointertap", function(){changeScene("game")});
	
	menuContainer.addChild(menuBackground);	
	menuContainer.addChild(menuPlayBut);
	app.stage.addChild(menuContainer);
	
	gameContainer = new PIXI.Container();
	gameNotPauseContainer = new PIXI.Container();
	gamePauseBut = new PIXI.Sprite(PIXI.loader.resources["sprites/pause.png"].texture);
	but.call(gamePauseBut, 20, 20);
	gamePauseBut.on("pointertap", togglePause);
	gamePauseContainer = new PIXI.Container();
	gamePauseContainer.pivot.set(0.5);
	gamePauseContainer.visible = false;
	gamePauseContainer.position.set(app.screen.width/2, app.screen.height/2);
	gamePauseExit = new PIXI.Sprite(PIXI.loader.resources["sprites/largeButtonBox.png"].texture);
	pauseMenuButton.call(gamePauseExit, "Quit Game", "sprites/exit.png", 0, 30);
	gamePauseExit.on("pointertap", function(){changeScene("menu");});
	gamePauseResume = new PIXI.Sprite(PIXI.loader.resources["sprites/largeButtonBox.png"].texture);
	pauseMenuButton.call(gamePauseResume, "Resume Game", "sprites/resume.png", 0, -30);
	gamePauseResume.on("pointertap", togglePause);
	gameContainer.addChild(gamePauseContainer);
	
	gameTopBar = new PIXI.Container();
	gameTopBarBg = new PIXI.Sprite(PIXI.loader.resources["sprites/gameTopBarBg.jpg"].texture);
	gameTopBarBg.alpha = 0.5;
	gameTopBar.addChild(gameTopBarBg);
	for(let i=0; i<statsDesc.length; i++){
		stats[statsDesc[i]] = new PIXI.Text("", {fontFamily: "Consolas", fontSize: 18});
		stats[statsDesc[i]].position.set(70, i * 30 + 10);
		gameTopBar.addChild(stats[statsDesc[i]]);
	}
	stats.curAnger.angerFace = new PIXI.Sprite(PIXI.loader.resources["sprites/anger.json"].textures[2]);
	gameTopBar.addChild(stats.curAnger.angerFace);
	stats.curAnger.angerFace.position.set(280, 90);
	graph = new PIXI.Sprite(PIXI.loader.resources["sprites/graph.png"].texture);
	let mask = new PIXI.Graphics();
	mask.position.set(0, 0);
	mask.beginFill(0xFFFFFF);
	mask.drawRect(400, 20, 150, 150);
	mask.endFill();
	graph.mask = mask;
	graph.scale.x = 1.5;
	graph.scale.y = 1.5;
	graph.position.set(400, 20);
	graph.plot = new PIXI.Graphics();
	graph.addChild(graph.plot);
	graph.plot.position.set(10, 90);
	
	gameTopBar.addChild(gamePauseBut);
	gameTopBar.addChild(graph);
	gameScreen.y = gameTopBar.height;
	gameNotPauseContainer.addChild(gameTopBar);
	
	gameOverContainer = new PIXI.Container();
	gameOverContainer.pivot.set(0.5);
	gameOverContainer.position.set(app.screen.width/2, app.screen.height/2);
	let tempGraphic = new PIXI.Graphics();
	tempGraphic.lineStyle(2, 0x0000FF, 1);
	tempGraphic.drawRoundedRect(-250, -150, 500, 300,20);
	let tempTexture = tempGraphic.generateCanvasTexture();
	gameOverContainerBg = new PIXI.Sprite(tempTexture);
	gameOverContainer.addChild(gameOverContainerBg);
	gameOverContainerBg.anchor.set(0.5);
	gameOverRestart = new PIXI.Sprite(PIXI.loader.resources["sprites/largeButtonBox.png"].texture);
	pauseMenuButton.call(gameOverRestart, "Restart Game", "sprites/restart.png", 0, 30);
	gamePauseContainer.removeChild(gameOverRestart);
	gameOverContainer.addChild(gameOverRestart);
	gameOverRestart.on("pointertap", gameSetup);
	gameOverText = new PIXI.Text("Game Over! Your score was " + score, {fontFamily: "Consolas", fontSize: 18});
	gameOverText.anchor.set(0.5);
	gameOverText.position.set(0, -50);
	gameOverContainer.addChild(gameOverContainerBg);
	gameOverContainer.addChild(gameOverText);
	gameOverContainer.visible = false;
	
	player = new PIXI.Sprite(PIXI.loader.resources["sprites/player.png"].texture);
	let addToPlayer = {
		x : 284,
		y : 250,
		vx: 0,
		vy: 0,
		vxLimit: 4,
		vyLimit: 4,
		vxSpeed: 0.7,
		vySpeed: 0.7
	}
	Object.assign(player, addToPlayer);
	gameBg = new PIXI.TilingSprite(PIXI.loader.resources["sprites/gameBg.jpg"].texture, 600, 300);
	gameBg.position.set(0, 200);
	gameNotPauseContainer.addChild(gameBg);
	gameNotPauseContainer.addChild(player);
	gameContainer.addChild(gameNotPauseContainer);
	gameContainer.addChild(gameOverContainer);
	gameContainer.visible = false;
	app.stage.addChild(gameContainer);
	app.ticker.add(function(delta){mainGameLoop(delta);});
}
var scrollSpeed, pickupSpawnCounter, wallSpawnCounter, updateStats, eventCounter, score, pause, wallSpawnTime;
const maxWallSpawnTime = 60;
function gameSetup(){
	while(onScreenPickups.length > 0){
		gameNotPauseContainer.removeChild(onScreenPickups[0]);
		onScreenPickups[0].destroy();
		onScreenPickups.splice(0, 1);
	}
	while(onScreenWalls.length > 0){
		gameNotPauseContainer.removeChild(onScreenWalls[0]);
		onScreenWalls[0].destroy();
		onScreenWalls.splice(0, 1);
	}
	curAnger = 0;
	let addToPlayer = {
		x : 284,
		y : 250,
		vx: 0,
		vy: 0,
		vxLimit: 5,
		vyLimit: 5,
		vxSpeed: 0.7,
		vySpeed: 0.7
	}
	Object.assign(player, addToPlayer);
	scrollSpeed = 3;
	pickupSpawnCounter = 100;
	wallSpawnCounter = 100;
	wallSpawnTime = maxWallSpawnTime;
	updateStats = 1;
	eventCounter = 500;
	tax = 0;
	score = 0;
	gameOverContainer.visible = false;
	pause = true;
	togglePause();
}

//Loading Loop
function menuLoop(){
}
function togglePause(){
	pause = !pause;
	if(pause){
		gamePauseContainer.visible = true;
		gameNotPauseContainer.alpha = 0.1;
		gamePauseContainer.alpha = 1;
	}
	else{
		gamePauseContainer.visible = false;
		gameNotPauseContainer.alpha = 1;
	}
}
//Game Loop
function gameLoop(){
	if(pause) return;
	//Spawns pickups
	pickupSpawnCounter--;
	if(pickupSpawnCounter <= 0){
		wallSpawnCounter += 20;
		pickupSpawnCounter = Math.floor(Math.random()*180 + 120);
		let pickupSpawnType = Math.floor(Math.random() * pickupDesc.length);
		onScreenPickups.push(new PIXI.Sprite(PIXI.loader.resources["sprites/pickups.json"].textures[pickupSpawnType]));
		gameNotPauseContainer.addChild(onScreenPickups[onScreenPickups.length - 1]);
		onScreenPickups[onScreenPickups.length - 1].position.set(600, Math.random()*268 + 200);
		onScreenPickups[onScreenPickups.length - 1].type = pickupSpawnType;
	}
	
	wallSpawnCounter--;
	if(wallSpawnCounter <= 0){
		wallSpawnCounter = Math.floor(Math.random()*wallSpawnTime + wallSpawnTime);
		wallSpawnTime--;
		let j = 0;
		for(let i=Math.random()*268 + 200; i<app.screen.height-40; i+=40){
			onScreenWalls.push(new PIXI.Sprite(PIXI.loader.resources["sprites/wall.png"].texture));
			onScreenWalls[onScreenWalls.length - 1].position.set(600, i);
			gameNotPauseContainer.addChild(onScreenWalls[onScreenWalls.length - 1]);
			j++;
			if(Math.floor(Math.random()*4) == 0 || j>=5) break; 
		}
	}
	
	if(input.up == true) player.vy -= player.vySpeed;
	if(input.down == true) player.vy += player.vySpeed;
	if(input.left == true) player.vx -= player.vxSpeed;
	if(input.right == true) player.vx += player.vxSpeed;
	
	if(player.vx < -player.vxLimit) player.vx = -player.vxLimit;
	else if(player.vx > player.vLlimit) player.vx = player.vxLimit;
	if(player.vy < -player.vyLimit) player.vy = -player.vyLimit;
	else if(player.vy > player.vyLimit) player.vy = player.vyLimit;
	
	player.y += player.vy;
	if(player.y + player.height > app.screen.height) player.y = app.screen.height - player.height;
	else if(player.y < gameScreen.y) player.y = gameScreen.y;
	player.x += player.vx;
	if(player.x + player.width > app.screen.width) player.x = app.screen.width - player.width;
	else if(player.x < 0) player.x = 0;
	player.updateTransform();
	gameBg.tilePosition.x -= scrollSpeed;
	for(let i=0; i<onScreenPickups.length; i++){
		onScreenPickups[i].x -= scrollSpeed;
		onScreenPickups[i].updateTransform();
		if(onScreenPickups[i].x + onScreenPickups[i].width < 0 || detectCollision(player, onScreenPickups[i]) == true){
			if(detectCollision(player, onScreenPickups[i])) pickupFunction(onScreenPickups[i]);
			gameNotPauseContainer.removeChild(onScreenPickups[i]);
			onScreenPickups[i].destroy();
			onScreenPickups.splice(i, 1);
			i--;
		}
	}
	for(let i=0; i<onScreenWalls.length; i++){
		onScreenWalls[i].x -= scrollSpeed;
		onScreenWalls[i].updateTransform();
		if(onScreenWalls[i].x + onScreenWalls[i].width < 0){
			gameNotPauseContainer.removeChild(onScreenWalls[i]);
			onScreenWalls[i].destroy();
			onScreenWalls.splice(i, 1);
			i--;
		}
		else if(detectCollision(player, onScreenWalls[i]) == true) gameOver();
	}
	
	player.vx *= friction;
	player.vy *= friction;
	if(Math.abs(player.vx) < 0.001) player.vx = 0;
	if(Math.abs(player.vy) < 0.001) player.vy = 0;
	
	//Events
	eventCounter--;
	if(eventCounter <= 0){
		eventCounter = Math.random() * 300 + 200;
		let eventType = Math.floor(Math.random() * 6);
		eventHappen(eventType);
		updateBaseStats();
	}	
	
	//Update statistics
	updateStats--;
	if(updateStats <= 0){
		updateStats = 60;
		scrollSpeed += 0.06;
		score++;
		if(curTotalWelfare/baseTotalWelfare < 0.98) curAnger += (2 - curTotalWelfare/baseTotalWelfare) ** 2;
		else curAnger -= 0.01;
		if(curAnger >= 100) gameOver();
		curAnger = Math.round(curAnger*100)/100;
	}
	forcedSupply.c = producerSupply.c + tax;
	let ex = intsec(demand, forcedSupply);
	curConsumerSurplus = demand.findArea(0, ex) - ex * demand.f(ex);
	curProducerSurplus = ex * forcedSupply.f(ex) - forcedSupply.findArea(0, ex);
	curWelfareLoss = socialSupply.findArea(0, ex) - forcedSupply.findArea(0, ex);
	curTotalWelfare = curConsumerSurplus + curProducerSurplus - curWelfareLoss;
	stats.curConsumerSurplus.setText("Consumer Surplus: " + Math.round(curConsumerSurplus/baseConsumerSurplus*10000)/100 + "%");
	stats.curProducerSurplus.setText("Producer Surplus: " + Math.round(curProducerSurplus/baseProducerSurplus*10000)/100 + "%");
	stats.tax.setText("Tax: $" + Math.round(tax*100)/100);
	stats.curAnger.setText("Public Anger: " + curAnger + "%");
	let i;
	if(curAnger < 25) i = 2;
	else if(curAnger < 50) i = 3
	else if(curAnger < 75) i = 0;
	else i = 1;
	if(stats.curAnger.angerFace.texture != PIXI.loader.resources["sprites/anger.json"].textures[i]){
		stats.curAnger.angerFace.setTexture(PIXI.loader.resources["sprites/anger.json"].textures[i]);
	}
	stats.score.setText("Score: " + score);
	
	graph.plot.clear();
	demand.drawLine(0x000000);
	producerSupply.drawLine(0x0000FF);
	forcedSupply.drawLine(0x00FF00);
	socialSupply.drawLine(0xFF0000);	
}

function gameOver(){
	pause = true;
	gameNotPauseContainer.alpha = 0.1;
	gamePauseContainer.alpha = 0.1;
	gameOverContainer.visible = true;
	gameOverText.setText("Game Over! Your score was " + score);
}

//Process
function mainGameLoop(delta){
	switch(scene){
		case "menu":
			menuLoop();
			break;
		case "game":
			gameLoop();
			break;
		default:
	}
}