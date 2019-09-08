ISHML.Cord= function Cord(id)
{
	//what cords are made of
	if (this instanceof ISHML.Cord)
	{
		Object.defineProperty(this,"id",{writable:true, value:id})
		return new Proxy(this, 
		{
			get: function(target, property) 
			{
				var ply =Reflect.get(target,property)
				var from = ply.from
				if (from instanceof ISHML.Ply)
				{
					from._path.push(ply)
					ply._path=from._path.slice(0)
					from._path.length=0
					
				}
				else
				{
					ply._path=[from, ply]
					
				}
				return ply
			}
		})	
	}
	else
	{
		return new Cord(id)
	}	
}
Object.defineProperty(ISHML.Cord.prototype, "knot", { get: function() { return Object.values(this)[0]}})
Object.defineProperty(ISHML.Cord.prototype, "knots", { get: function() { return Object.values(this)||[]} })

ISHML.Cord.prototype.filter=function(aFilter){return this.knots.filter(aFilter)}
ISHML.Cord.prototype.first=function(aCount=1){return this.knots.slice(0,aCount)}
ISHML.Cord.prototype.last=function(aCount=1){return this.knots.slice(-1,-aCount)}
ISHML.Cord.prototype.middle=function(aCount=1){return this.knots.slice(aCount,-aCount)}
ISHML.Cord.prototype.most=function(aCount=1){return this.knots.slice(aCount-1,-1)}
ISHML.Cord.prototype.shuffle=function(aCount)
{
	var count=aCount||this.size
	return ISHML.util.shuffle(this.knots,count)
}
ISHML.Cord.prototype.sort=function(aSort){return this.knots.sort(aSort)}

