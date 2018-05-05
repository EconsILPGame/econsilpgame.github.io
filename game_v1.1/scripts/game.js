var gameFocus = true;
var gameID = document.getElementById('game').children[0];
document.onclick = function (event) {
	if (!gameID.contains(event.target)) gameFocus = false;
	else gameFocus = true;
}
//Loads textures
PIXI.loader
	.add([
		'sprites/buttonBorder.png',
		'sprites/menuBg.jpg',
		'sprites/gameInfoBg.png',
		'sprites/exit.png',
		'sprites/pause.png',
		'sprites/resume.png',
		'sprites/graph.png',
		'sprites/restart.png',
		'sprites/gameBg.jpg',
		'sprites/sprites.json',
		'sprites/sprites.png',
		'sprites/blank.png'
	])
	.load(setup);


//Input
const keyCodeList = {
	37: 'left',
	38: 'up',
	39: 'right',
	40: 'down'
};
var input = {
	up: false,
	down: false,
	left: false,
	right: false
};
function keyPress (event, action) {
	if ([37, 38, 39, 40].indexOf(event.keyCode) != -1 && gameFocus == true) event.preventDefault();
	input[keyCodeList[event.keyCode]] = action;
}
document.addEventListener("keydown", function (event) {keyPress(event, true);});
document.addEventListener("keyup", function (event) {keyPress(event, false);});

//Initialise
function changeScene(newScene){
	window[scene + "Container"].visible = false;
	scene = newScene;
	if(scene == "game") gameSetup();
	window[scene + "Container"].visible = true;
};

var scene = 'menu'
const friction = 0.89, statsDesc = ['happiness', 'tax', 'curAnger', 'score'];;
var gameOverText;
var stats = {}, graph = {};
var player, gameSpeed, gameBg;
var menuContainer, gameContainer, gamePauseContainer, gameInfoContainer, gameCoreContainer, gameOverContainer;
function setup () {
	//Menu Container
	menuContainer = new PIXI.Container();
	let menuBackground = new PIXI.Sprite(PIXI.loader.resources['sprites/menuBg.jpg'].texture);
	let menuPlayButton = new button(400, 250, 'resume.png', 'Play');
	menuPlayButton.sprite.on('pointertap', function () {changeScene('game');});
	menuContainer.addChild(menuBackground, menuPlayButton.sprite);
	app.stage.addChild(menuContainer);
	
	//Game Containers	
	gameContainer = new PIXI.Container();
	gameCoreContainer = new PIXI.Container();
	gameInfoContainer = new PIXI.Container();
	gamePauseContainer = new PIXI.Container();
	gameOverContainer = new PIXI.Container();
	
	//Game Pause Container
	let gamePauseExit = new button(0, 30, 'exit.png', 'Quit Game');
	gamePauseExit.sprite.on('pointertap', function () {changeScene('menu');});
	let gamePauseResume = new button(0, -30, 'resume.png', 'Resume Game');
	gamePauseResume.sprite.on('pointertap', togglePause);
	gamePauseContainer.position.set(app.screen.width / 2, app.screen.height / 2);
	gamePauseContainer.pivot.set(0.5);
	gamePauseContainer.visible = false;
	gamePauseContainer.addChild(gamePauseExit.sprite, gamePauseResume.sprite);
	
	//Game Core Container
	gameBg = new PIXI.TilingSprite(PIXI.loader.resources['sprites/gameBg.jpg'].texture, 550, 500);
	gameBg.alpha = 0.8;
	gameCoreContainer.addChild(gameBg);
	player = new playerClass('player.png', 250, 300, 0, 0, 0.7, 5);
	gameCoreContainer.position.set(250, 0);
	
	//Game Info Container
	let gameInfoCoverBg = new PIXI.TilingSprite(PIXI.loader.resources['sprites/blank.png'].texture, 250, 500);
	gameInfoContainer.addChild(gameInfoCoverBg);
	let gameInfoBg = new PIXI.TilingSprite(PIXI.loader.resources['sprites/gameInfoBg.png'].texture, 250 / 2, 500 / 2);
	gameInfoBg.scale.x = gameInfoBg.scale.y = 2;
	gameInfoBg.alpha = 0.3;
	gameInfoContainer.addChild(gameInfoBg);
	let gamePauseButton = new PIXI.Sprite(PIXI.loader.resources['sprites/pause.png'].texture);
	gamePauseButton.position.set(20, 20);
	gamePauseButton.anchor.set(0.5);
	gamePauseButton.interactive = true;
	gamePauseButton.buttonMode = true;
	gamePauseButton.on('mouseover', function () {
		this.scale.x = 1.1;
		this.scale.y = 1.1;
	});
	gamePauseButton.on('mouseout', function () {
		this.scale.x = 1;
		this.scale.y = 1;
	});
	gamePauseButton.on('pointertap', togglePause);
	gameInfoContainer.addChild(gamePauseButton);
	
	for (let i=0; i<statsDesc.length; i++) {
		stats[statsDesc[i]] = new PIXI.Text('', {fontFamily: 'Consolas', fontSize: 18});
		stats[statsDesc[i]].position.set(10, i * 50 + 60);
		gameInfoContainer.addChild(stats[statsDesc[i]]);
	}
	stats.curAnger.angerFace = new PIXI.Sprite(PIXI.loader.resources['sprites/sprites.json'].textures['angry1.png']);
	stats.curAnger.angerFace.position.set(160, 170);
	stats.curAnger.angerFace.anchor.set(0.5);
	gameInfoContainer.addChild(stats.curAnger.angerFace);
	graph = new PIXI.Sprite(PIXI.loader.resources['sprites/graph.png'].texture);
	graph.position.set(10, 270);
	graph.plot = new PIXI.Graphics();
	graph.plot.position.set(20, 200);
	graph.addChild(graph.plot);
	gameInfoContainer.addChild(graph);
	
	//Game Over Container
	gameOverContainer.pivot.set(0.5);
	gameOverContainer.position.set(app.screen.width/2, app.screen.height/2);
	let tempGraphic = new PIXI.Graphics();
	tempGraphic.lineStyle(2, 0x0000FF, 1);
	tempGraphic.drawRoundedRect(-250, -150, 500, 300,20);
	let tempTexture = tempGraphic.generateCanvasTexture();
	gameOverContainerBg = new PIXI.Sprite(tempTexture);
	gameOverContainer.addChild(gameOverContainerBg);
	gameOverContainerBg.anchor.set(0.5);
	gameOverRestart = new button(0, 30, 'restart.png', 'Restart Game');	
	gameOverRestart.sprite.on('pointertap', gameSetup);
	gameOverContainer.addChild(gameOverRestart.sprite);
	gameOverText = new PIXI.Text('Game Over! Your score was ' + score, {fontFamily: 'Consolas', fontSize: 18});
	gameOverText.anchor.set(0.5);
	gameOverText.position.set(0, -50);
	gameOverContainer.addChild(gameOverText);
	gameOverContainer.visible = false;
		
	gameContainer.addChild(gameCoreContainer, gameInfoContainer, gamePauseContainer, gameOverContainer);
	gameContainer.visible = false;
	app.stage.addChild(gameContainer);
	app.ticker.add(function (delta) {mainGameLoop(delta);});
}
var pickupSpawnCounter, updateStats, eventCounter, score, pause;
var demand, producerSupply, forcedSupply, socialSupply;
function gameSetup () {
	demand = new line(-1, 180, 0x000000);
	producerSupply = new line(0.3, 10, 0x0000FF);
	forcedSupply = new line(0.3, 10, 0x00FF00);
	socialSupply = new line(0.6, 30, 0xFF0000);
	
	player.sprite.position.set(250, 300);
	player.vx = player.vy = 0;
	curAnger = 0;
	gameSpeed = 1.8;
	pickupSpawnCounter = 100;
	updateStats = 1;
	eventCounter = 600;
	tax = 0;
	score = 0;
	gameOverContainer.visible = false;
	pause = true;
	togglePause();
}
//Loading Loop
function togglePause () {
	pause = !pause;
	if (pause) {
		gamePauseContainer.visible = true;
		gameCoreContainer.alpha = 0.1;
		gameInfoContainer.alpha = 0.1;
		gamePauseContainer.alpha = 1;
	}
	else {
		gamePauseContainer.visible = false;
		gameInfoContainer.alpha = 1;
		gameCoreContainer.alpha = 1;
	}
}
//Game Loop

var entities = [];
const gameBound = {
	top : 0,
	bottom : 500,
	left : 0,
	right : 550
};
const events = ['incomeRise', 'incomeDrop', 'advert', 'qualityDrop', 'qualityRise', 'supplyDrop', 'supplyRise'];
const eventsText = [	'People are getting richer, yay!',
						'Oh no, people are earning less money.',
						'Advertising has raised interest in the product!',
						'The production quality has dropped, causing more harm to the environment.',
						'Better technology reduces environmental damage during production.',
						'Dwindling raw materials increases cost of production.',
						'A sudden abundance of raw materials reduces cost of production.'
						];
const pickupActions = ['taxInc', 'taxDec', 'collide'];
const pickupTextures = ['taxinc.png', 'taxdec.png', 'wall.png'];
const angerLevel = [0, 20, 40, 60, 80, 100];
var eventsInfo = [];
function gameLoop(){
	if (pause) return;
	gameBg.tilePosition.x -= gameSpeed;
	
	//Spawns pickups
	if (--pickupSpawnCounter < 0) {
		pickupSpawnCounter = Math.random() * 480 / gameSpeed + 60;
		let pickupSpawnType = Math.floor(Math.random() * pickupActions.length);
		entities.push(new pickupClass(pickupTextures[pickupSpawnType], 600, Math.random() * 468, pickupActions[pickupSpawnType]));
	}
	
	for (let i=0; i<entities.length; i++) {
		if (entities[i].doAction() == 1) {
			gameCoreContainer.removeChild(entities[i].sprite);
			entities[i].sprite.destroy();
			entities.splice(i--, 1);
		}
	}
	player.doAction();
		
	//Events
	for (let i=0; i<eventsInfo.length; i++) {
		eventsInfo[i].alpha -= 0.004;
		eventsInfo[i].position.y -= 0.18;
		if (eventsInfo[i].alpha <= 0) {
			gameCoreContainer.removeChild(eventsInfo[i]);
			eventsInfo[i].destroy();
			eventsInfo.splice(i--, 1);
		}
	}
	if(--eventCounter < 0){
		eventCounter = Math.random() * 300 + 200;
		eventHappen(Math.floor(Math.random() * events.length));
	}	
	
	//Update statistics
	let maxHappiness = (demand.c - socialSupply.c) * intsec(demand, socialSupply) / 2;
	let curHappiness = (demand.c - socialSupply.c) * intsec(demand, socialSupply) / 2;
	let eqx = intsec(demand, socialSupply);
	let eqx2 = intsec(demand, forcedSupply);
	if (eqx2 < eqx) curHappiness -= (eqx - eqx2) * (demand.f(eqx2) - socialSupply.f(eqx2)) / 2;
	if (eqx2 > eqx) curHappiness -= (socialSupply.f(eqx2) - demand.f(eqx2)) * (eqx2 - eqx) / 2;
	if(--updateStats < 0){
		forcedSupply.c = producerSupply.c + tax;
		updateStats = 30;
		gameSpeed += 0.04;
		score++;
		if (curHappiness / maxHappiness < 0.9) curAnger += (2 - curHappiness / maxHappiness) ** 3 / 2;
		else curAnger -= 0.05;
		if (curAnger >= 100) gameOver();
		else if (curAnger < 0) curAnger = 0;
		curAnger = Math.round(curAnger*100)/100;
	}
	forcedSupply.c = producerSupply.c + tax;
	stats.happiness.setText('Current Happiness:\n' + Math.round(curHappiness/maxHappiness*10000)/100 + "%");
	stats.tax.setText("Tax: $" + Math.round(tax*100)/100);
	stats.curAnger.setText('Public Anger: ');
	let i = 0;
	for (; i<angerLevel.length; i++) {
		if (curAnger < angerLevel[i]) break;
	}
	if (stats.curAnger.angerFace.texture != PIXI.loader.resources['sprites/sprites.json'].textures['angry' + i + '.png']) {
		stats.curAnger.angerFace.setTexture(PIXI.loader.resources['sprites/sprites.json'].textures['angry' + i + '.png']);
	}
	stats.score.setText("Score: " + score);
	graph.plot.clear();
	graph.plot.lineStyle(1, 0xFFFFFF, 0);
	graph.plot.beginFill(0x00AAFF);
	if (eqx2 < eqx) graph.plot.drawPolygon(new PIXI.Polygon(0, -demand.c, 0, -socialSupply.c, eqx2, -socialSupply.f(eqx2), eqx2, -demand.f(eqx2)));
	else graph.plot.drawPolygon(new PIXI.Polygon(0, -demand.c, 0, -socialSupply.c, eqx, -socialSupply.f(eqx)));
	graph.plot.endFill();
	if (eqx2 >= eqx) {
		graph.plot.beginFill(0xFF8800);
		graph.plot.drawPolygon(new PIXI.Polygon(eqx, -demand.f(eqx), eqx2, -demand.f(eqx2), eqx2, -socialSupply.f(eqx2)));
		graph.plot.endFill();
	}
	demand.drawLine();
	producerSupply.drawLine();
	forcedSupply.drawLine();
	socialSupply.drawLine();
}

function gameOver(){
	pause = true;
	gameCoreContainer.alpha = 0.1;
	gameInfoContainer.alpha = 0.1;
	gameOverContainer.visible = true;
	gameOverText.setText("Game Over! Your score was " + score);
}

//Process
function mainGameLoop(delta){
	switch(scene){
		case "game":
			gameLoop();
			break;
		default:
	}
}