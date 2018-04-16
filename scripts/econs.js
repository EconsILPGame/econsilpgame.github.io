function intsec(a, b){
	return (b.c - a.c) / (a.m - b.m);
}
function line(m, c){
	this.m = m;
	this.c = c;
	this.findArea = function(a, b){
		return (b-a) * Math.abs(this.m*(b+a)/2 + this.c);
	}
	this.f = function(x){
		return this.m * x + this.c;
	}
	this.drawLine = function(x){
		graph.plot.lineStyle(1, x, 1);
		graph.plot.moveTo(0, -this.f(0));
		graph.plot.lineTo(80, -this.f(80));	
	}
}
var demand = new line(-0.7, 70);

var producerSupply = new line(0.3, 10);
var socialSupply = new line(0.6, 20);
var forcedSupply = new line(producerSupply.m, producerSupply.c);
let iniE = {};
iniE.x = intsec(demand, producerSupply);
var baseConsumerSurplus = demand.findArea(0, iniE.x) - iniE.x * demand.f(iniE.x);
var baseProducerSurplus = iniE.x * producerSupply.f(iniE.x) - producerSupply.findArea(0, iniE.x);
let socialEx = intsec(demand, socialSupply);
var curConsumerSurplus = baseConsumerSurplus;
var curProducerSurplus = baseProducerSurplus;
var curWelfareLoss = socialSupply.findArea(0, iniE.x) - forcedSupply.findArea(0, iniE.x);
var baseTotalWelfare = demand.findArea(0, socialEx) - socialSupply.findArea(0, socialEx);
var curTotalWelfare = curConsumerSurplus + curProducerSurplus - curWelfareLoss;
var curAnger = 0;
var tax = 0;