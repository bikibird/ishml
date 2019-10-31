ishml.Cord= function Cord(id)
{
	//what cords are made of
	if (this instanceof ishml.Cord)
	{
		Object.defineProperty(this,"id",{writable:true, value:id})

		return this
	}	
	else
	{
		return new Cord(id)
	}	
}


Object.defineProperty(ishml.Cord.prototype, "knot", { get: function() { return Object.values(this)[0]}})
Object.defineProperty(ishml.Cord.prototype, "knots", { get: function() { return Object.values(this)||[]} })

ishml.Cord.prototype.filter=function(aFilter){return this.knots.filter(aFilter)}
ishml.Cord.prototype.first=function(aCount=1){return this.knots.slice(0,aCount)}
ishml.Cord.prototype.last=function(aCount=1){return this.knots.slice(-1,-aCount)}
ishml.Cord.prototype.middle=function(aCount=1){return this.knots.slice(aCount,-aCount)}
ishml.Cord.prototype.most=function(aCount=1){return this.knots.slice(aCount-1,-1)}
ishml.Cord.prototype.shuffle=function(aCount)
{
	var count=aCount||this.size
	return ishml.util.shuffle(this.knots,count)
}
ishml.Cord.prototype.sort=function(aSort){return this.knots.sort(aSort)}

