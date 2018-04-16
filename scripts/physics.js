function pickupFunction(a){
	switch(a.type){
		case 1:
			tax -= 1;
			if(tax < 0) tax = 0;
			break;
		case 0:
			tax += 1;
			break;
		default:
	}
}

function detectCollision(a, b){
	let ax = a.worldTransform.tx, ay = a.worldTransform.ty, bx = b.worldTransform.tx, by = b.worldTransform.ty;
	if((ax + a.width > bx && ax + a.width < bx + b.width) || (bx + b.width > ax && bx + b.width < ax + a.width)){
		if((ay + a.height > by && ay + a.height < by + b.height) || (by + b.height > ay && by + b.height < ay + a.height)){
			return true;
		}
	}
	return false;
}

function updateBaseStats(){
	let iniE = {};
	iniE.x = intsec(demand, producerSupply);
	baseConsumerSurplus = demand.findArea(0, iniE.x) - iniE.x * demand.f(iniE.x);
	baseProducerSurplus = iniE.x * producerSupply.f(iniE.x) - producerSupply.findArea(0, iniE.x);
	let socialEx = intsec(demand, socialSupply);
	baseTotalWelfare = demand.findArea(0, socialEx) - socialSupply.findArea(0, socialEx);
}

function eventHappen(x){
	switch(x){
		case 0:
			socialSupply.m += 0.1;
			break;
		case 1:
			if(socialSupply.m - 0.1 <= forcedSupply.m) eventHappen(Math.floor(Math.random()*6));
			else socialSupply.m -= 0.1;
			break;
		case 2:
			if(demand.m + 0.1 >= -0.1) eventHappen(Math.floor(Math.random()*6));
			else demand.m += 0.1;
			break;
		case 3:
			demand.m -= 0.1;
			break;
		case 4:
			if(producerSupply.m - 0.1 <= 0) eventHappen(Math.floor(Math.random()*6));
			else producerSupply.m -= 0.1;
			break;
		case 5:
			producerSupply.m += 0.1;
			socialSupply.m += 0.1;
			forcedSupply.m += 0.1;
			break;
		default:
	}
}
