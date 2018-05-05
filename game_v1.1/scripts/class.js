class button {
	constructor (x, y, texture, text) {
		this.sprite = new PIXI.Sprite(PIXI.loader.resources['sprites/buttonBorder.png'].texture);
		this.sprite.anchor.set(0.5);
		this.sprite.position.set(x, y);
		this.sprite.interactive = true;
		this.sprite.buttonMode = true;
		this.text = new PIXI.Text(text, {fontFamily: 'consolas', fontSize: 18});
		this.text.anchor.set(0.5);
		this.text.position.set(-30, 0);
		this.icon = new PIXI.Sprite(PIXI.loader.resources['sprites/' + texture].texture);
		this.icon.anchor.set(0.5);
		this.icon.position.set(60, 0);
		this.sprite.addChild(this.icon, this.text);
		
		this.sprite.on("mouseover", function(){
			this.scale.x = 1.1;
			this.scale.y = 1.1;
		});
		this.sprite.on("mouseout", function(){
			this.scale.x = 1;
			this.scale.y = 1;
		});
	}
}

class entity {
	constructor (texture, x, y) {
		this.sprite = new PIXI.Sprite(PIXI.loader.resources['sprites/sprites.json'].textures[texture]);
		this.sprite.position.set(x, y);
		gameCoreContainer.addChild(this.sprite);
	}
}

class playerClass extends entity {
	constructor (texture, x, y, vx, vy, acc, vLimit) {
		super(texture, x, y);
		this.vx = vx;
		this.vy = vy;
		this.vLimit = vLimit;
		this.acc = acc;
	}
	doAction () {
		if (input.up == true) this.vy -= this.acc;
		if (input.down == true) this.vy += this.acc;
		if (input.left == true) this.vx -= this.acc;
		if (input.right == true) this.vx += this.acc;
		
		if(this.vx < -this.vLimit) this.vx = -this.vLimit;
		else if(this.vx > this.vLimit) this.vx = this.vLimit;
		if(this.vy < -this.vLimit) this.vy = -this.vLimit;
		else if(this.vy > this.vLimit) this.vy = this.vLimit;
		
		this.vx *= friction;
		this.vy *= friction;
		
		this.sprite.y += this.vy;
		if (this.sprite.y < gameBound.top) this.sprite.y = gameBound.top;
		else if (this.sprite.y + this.sprite.height > gameBound.bottom) this.sprite.y = gameBound.bottom - this.sprite.height;
		this.sprite.x += this.vx;
		if (this.sprite.x < gameBound.left) this.sprite.x = gameBound.left;
		else if (this.sprite.x + this.sprite.width > gameBound.right) this.sprite.x = gameBound.right - this.sprite.width;
		this.sprite.updateTransform();
	}
}

class pickupClass extends entity {
	constructor (texture, x, y, action) {
		super(texture, x, y, 0);
		this.action = action;
	}
	doAction () {
		this.sprite.x -= gameSpeed;
		this.sprite.updateTransform();
		if (this.sprite.x + this.sprite.width < 0) return 1;
		else if (detectCollision(this.sprite, player.sprite)) {
			switch (this.action) {
				case 'taxInc':
					tax += 10;
					break;
				case 'taxDec':
					if (tax >= 10) tax -= 10;
					break;
				case 'collide':
					gameOver();
				default:
			}
			return 1;
		}
		return 0;
	}
}

function intsec (line1, line2) {
	return (line2.c - line1.c) / (line1.m - line2.m);
}

class line {
	constructor (m, c, color) {
		this.m = m;
		this.c = c;
		this.color = color;
	}
	drawLine () {
		graph.plot.lineStyle(1, this.color, 1);
		graph.plot.moveTo(0, -this.c);
		graph.plot.lineTo(200, -this.m * 200 - this.c);
	}
	findArea (x1, x2) {
		return (x2 - x1) * ((x1 + x2) / 2 * this.m + this.c);
	}
	f (x) {
		return this.m * x + this.c;
	}
}	