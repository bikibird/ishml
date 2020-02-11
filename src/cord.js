ishml.Cord= function Cord(...plies)
{
	
	if (this instanceof ishml.Cord)
	{
		Object.defineProperty(this,"id",{writable:true})
	//	Object.defineProperty(this,"alias",{writable:true,value:{}})

		plies.forEach((ply)=>
		{
			if(ply instanceof ishml.Ply){this[ply.id]=ply}
			else
			{
				if (ply instanceof ishml.Knot){this[ply.id]=ply.toPly()}
				else
				{	
					if (ply)
					{
						ply.forEach((ply)=>
						{
							if(ply instanceof ishml.Ply){this[ply.id]=ply}
							else
							{
								if (ply instanceof ishml.Knot){this[ply.id]=ply.toPly()}
							}	
						})
					}	
				}
			}
		})
		
		return this //new Proxy(this,ishml.Cord.handler)
	}
	else
	{
		return new Cord(plies)
	}	
}
ishml.Cord.prototype.hasKnot=function(knot)
{
	for (k of this)
	{
		if (k.knot===knot){return true}
	}
	return false

}
//Removed ishml.Cord.handler
ishml.Cord.prototype[Symbol.iterator]=function()
{
	return {
		plies:Object.values(this),
		i:0,
		next()
		{
			if (this.i<this.plies.length) 
			{
				var value = this.plies[this.i]
				this.i++
				return {value: value, done: false}
				
			}
			else
			{
				return {done: true}
			}
			
		}
	}
}

ishml.Cord.prototype.add=function(...plies)
{
	plies.forEach((ply)=>
	{
		if(ply instanceof ishml.Ply){this[ply.id]=ply}
		else
		{
			if (ply instanceof ishml.Knot){this[ply.id]=ply.toPly()}
			else
			{	
				if (ply)
				{
					ply.forEach((ply)=>
					{
						if(ply instanceof ishml.Ply){this[ply.id]=ply}
						else
						{
							if (ply instanceof ishml.Knot){this[ply.id]=ply.toPly()}
						}	
					})
				}	
			}
		}
	})
		
	return this
}

ishml.Cord.prototype.clear=function()
{
	Object.keys(this).forEach(key=>
	{
		delete this[key]
	})
	return this
}	  

ishml.Cord.prototype.delete=function(...plies)
{
	plies.forEach((ply)=>
	{
		if(ply instanceof ishml.Ply){delete this[ply.id]}
		else
		{
			
			if (ply)
			{
				ply.forEach((ply)=>
				{
					if(ply instanceof ishml.Ply){delete this[ply.id]}
						
				})
			}	
			
		}
	})
	return this
}
	
// REMOVED: ishml.Cord.prototype.disjoin=function(...plies)
//REMOVED: ishml.Cord.prototype.entwine=function({knots,via=null,condition=()=>true})
	
ishml.Cord.prototype.filter=function(filter)
{
	return new ishml.Cord(Object.values(this).filter(filter))
}

ishml.Cord.prototype.first=function(count=1)
{
	return new ishml.Cord(Object.values(this).slice(0,count))
}

ishml.Cord.prototype.forEach=function(f)
{

	Object.values(this).forEach(f)

	return undefined
}

ishml.Cord.prototype.has=function(...plies)
{
	return plies.every((ply)=>
	{
		return (Object.values(this).some(thisPly=>{thisPly===ply}))

	})
}
ishml.Cord.prototype.hasKnot=function(...knots)
{
	return knots.every((knot)=>
	{
		return (Object.values(this).some(thisPly=>{thisPly.knot===knot}))

	})	

}

// Removed: ishml.Cord.prototype.join= function(...plies) 
Object.defineProperty(ishml.Cord.prototype, "knots", { get: function() { return new ishml.Tangle(Object.values(this).map((ply)=>ply.knot))}})

Object.defineProperty(ishml.Cord.prototype, "plies", { get: function() { return new ishml.Tangle(Object.values(this))}})
Object.defineProperty(ishml.Cord.prototype, "ply", { get: function() { return Object.values(this)[0]} })

ishml.Cord.prototype.last=function(count=1)
{
	return new ishml.Cord(Object.values(this).slice(-1,-count))
}

ishml.Cord.prototype.map=function(map)
{
	return ishml.Cord(Object.values(this).map(map))
}
ishml.Cord.prototype.middle=function(count=1)
{
	return new ishml.Cord(Object.values(this).slice(count,-count))
}
ishml.Cord.prototype.most=function(count=1)
{
	return new ishml.Cord(Object.values(this).slice(count-1,-1))
}
ishml.Cord.prototype.omit=function(other)
{
	return new ishml.Cord(Object.values(this).filter(x => !other.has(x)))
}
ishml.Cord.prototype.shuffle=function(quantity)
{
	var count=quantity||this.size
	return new ishml.Cord(ishml.util.shuffle(this.knots,count))
}

Object.defineProperty(ishml.Cord.prototype, "size", { get: function() { return Object.values(this).length}})

ishml.Cord.prototype.sort=function(sorting)
{
	return new ishml.Cord(Object.values(this).sort(sorting))
}




