function detectCollision (a, b) {
	let ax = a.worldTransform.tx, ay = a.worldTransform.ty, bx = b.worldTransform.tx, by = b.worldTransform.ty;
	if((ax + a.width > bx && ax + a.width < bx + b.width) || (bx + b.width > ax && bx + b.width < ax + a.width)){
		if((ay + a.height > by && ay + a.height < by + b.height) || (by + b.height > ay && by + b.height < ay + a.height)){
			return true;
		}
	}
	return false;
}

//const events = ['incomeRise', 'incomeDrop', 'advert', 'qualityDrop', 'qualityRise', 'supplyDrop', 'supplyRise'];
const eventMagnitude = 10;
function eventHappen(x) {
	eventsInfo.push(new PIXI.Text(eventsText[x], {fontFamily: 'Consolas', fontSize: 18, fill: 0x98fb98, wordWrap: true, wordWrapWidth: 400}));
	eventsInfo[eventsInfo.length - 1].position.set(50, 80);
	gameCoreContainer.addChild(eventsInfo[eventsInfo.length - 1]);
	eventDesc = events[x];
	switch (eventDesc) {
		case 'incomeRise':
			demand.c += Math.random() * eventMagnitude;
			break;
		case 'incomeDrop':
			demand.c -= Math.random() * eventMagnitude;
			break;
		case 'advert':
			demand.c += Math.random() * eventMagnitude;
			break;
		case 'qualityDrop':
			socialSupply.c += Math.random() * eventMagnitude;
			break;
		case 'qualityRise':
			socialSupply.c -= Math.random() * eventMagnitude;
			break;
		case 'supplyDrop':
			producerSupply.c -= Math.random() * eventMagnitude;
			break;
		case 'supplyRise':
			producerSupply.c += Math.random() * eventMagnitude;
			break;
		default:
	}
}
