ISHML.Tie= function Tie()
{
	//what ties are made of
	if (this instanceof ISHML.Tie)
	{
		//Object.defineProperty(this, "knot", {value:aKnot,writable: true})
		//Object.defineProperty(this, "$", {value:{},writable: true})
		return this
	}
	else
	{
		return new Tie()
	}	
}
Object.defineProperty(ISHML.Tie.prototype, "knot", { get: function() { return Object.values(this)[0].knot} })
Object.defineProperty(ISHML.Tie.prototype, "plies", { get: function() { return Object.values(this)||[]} })
Object.defineProperty(ISHML.Tie.prototype, "ply", { get: function() { return Object.values(this)[0]} })
//ISHML.Tie.prototype.ascendingByKnots=function(aCount){}
//ISHML.Tie.prototype.ascendingByWeights=function(aCount){}
//ISHML.Tie.prototype.descendingByKnots=function(aCount){}
//ISHML.Tie.prototype.descendingByWeights=function(aCount){}
ISHML.Tie.prototype.filter=function(aFilter){return this.plies.filter(aFilter)}
ISHML.Tie.prototype.first=function(aCount=1){return this.plies.slice(0,aCount)}
ISHML.Tie.prototype.last=function(aCount=1){return this.plies.slice(-1,-aCount)}
ISHML.Tie.prototype.middle=function(aCount=1){return this.plies.slice(aCount,-aCount)}
ISHML.Tie.prototype.most=function(aCount=1){return this.plies.slice(aCount-1,-1)}
ISHML.Tie.prototype.shuffle=function(aCount)
{
	var count=aCount||this.size
	return ISHML.util.shuffle(this.plies,count)
}
ISHML.Tie.prototype.sort=function(aSort){return this.plies.sort(aSort)}
ISHML.Tie.prototype.toMesh=function(){return new ISHML.Mesh(this.plies)}
