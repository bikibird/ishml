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
		return new Cord(knots)
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
ishml.Cord.handler=
{
	get: function(target, property, receiver) 
	{
		if(Reflect.has(target,property))
		{
			return Reflect.get(target,property)
		}
		else
		{
			var alias=Reflect.get(target,"alias")
			return Reflect.get(target,alias[property])
		}
	},
/*	has: function(target, property, receiver) 
	{
		if(Reflect.has(target,property))
		{
			return true
		}
		else
		{
			var alias=Reflect.get(target,"alias")
			if (alias.hasOwnProperty(property))
			{
				return true
			}
			else {return false}
		}
	},*/
	set: function(target, property, value, receiver)
	{
		var alias=Reflect.get(target,"alias")
		if (property==="id")
		{
			return Reflect.set(target,property,value)
		}
		if (value instanceof ishml.Knot)
		{
			Reflect.set(target,value.uid,value)
			if (property!==value.uid)
			{
				alias[property]=value.uid
			}
			return true
		}
		else
		{
			value.forEach((knot)=>
			{
				Reflect.set(target,knot.uid,knot)
				if (property!==knot.uid)
				{
					alias[property]=knot.uid
				}
			})
			return true
		}	
	}	
}
ishml.Cord.prototype[Symbol.iterator]=function()
{
	return {
		knots:Object.values(this),
		i:0,
		next()
		{
			if (this.i<this.knots.length) 
			{
				var value = this.knots[this.i]
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
/*ishml.Cord.prototype.cord=function(id)
{
	this.id=id
	return this
}*/	
ishml.Cord.prototype.add=function(...knots)
{
	knots.forEach((knot)=>
	{
		if(knot instanceof ishml.Knot)
		{
			this[knot.uid]=knot
		}
		else
		{
			knot.forEach((knot)=>
			{
				this[knot.uid]=knot
			})
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

ishml.Cord.prototype.delete=function(...knots)
{
	knots.forEach((knot)=>
	{
		if(knot instanceof ishml.Knot)
		{
			delete this[knot.uid]
		}
		else
		{
			knot.forEach((knot)=>
			{
				delete this[knot.uid]
			})
		}
	})
	return this
}
	
ishml.Cord.prototype.disjoin=function(...knots)
{
	var other=new ishml.Cord(knots)
	var left = this.filter(knot => !other.has(knot))
	var right = other.filter(knot => !this.has(knot))
	return left.union(right)
}
ishml.Cord.prototype.entwine=function({knots,via=null,condition=()=>true})
{
	var other=new ishml.Cord(knots)
	var twinings=new ishml.Cord()
	
	this.forEach((knot)=>
	{
		other.forEach((otherKnot)=>
		{
			if(knot.hasOwnProperty(via) && knot[via] instanceof ishml.Cord)
			{
				if(knot[via].has(otherKnot))
				{
					if (condition(knot,otherKnot))
					{
						var head=knot.plait()
						var tail=otherKnot.plait()
						head.advance=tail
						head.via=via
						tail.retreat=head
						twinings.add(head)
					}
				}

			}
			else
			{
				var head=knot.plait()
				var tail=otherKnot.plait()
				head.advance=tail
				head.via=via
				tail.retreat=head
				twinings.add(head)
			}		
		})
	})
	return twinings
}	
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

ishml.Cord.prototype.has=function(...knots)
{
	return knots.every((knot)=>
	{
		if(knot instanceof ishml.Knot)
		{
			if(this[knot.uid]){return true}else{return false}
		}
		else
		{
			return knot.every((knot)=>
			{
				if(this[knot.uid]){return true}else{return false}
			})
		}
	})
}

ishml.Cord.prototype.join= function(...knots) 
{
	var other=new ishml.Cord(...knots)
	if (this.size < other.size)
	{
		return new ishml.Cord(this.filter(knot => other.has(knot)))
	}
	else
	{
		return new ishml.Cord(other.filter(knot => this.has(knot)))
	}	
}
Object.defineProperty(ishml.Cord.prototype, "knot", { get: function() { return Object.values(this)[0]} })

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

Object.defineProperty(ishml.Cord.prototype, "size", { get: function() { return Object.values(this).size}})

ishml.Cord.prototype.sort=function(sorting)
{
	return new ishml.Cord(Object.values(this).sort(sorting))
}

ishml.Cord.prototype.union=function(...knots)
{
	return new ishml.Cord(this, knots)
}

