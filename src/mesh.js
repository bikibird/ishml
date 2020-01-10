ishml.Mesh= function Mesh(...knots)
{
	
	if (this instanceof ishml.Mesh)
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
	else
	{
		return new Mesh(knots)
	}	
}

ishml.Mesh.prototype[Symbol.iterator]=function()
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

ishml.Mesh.prototype.add=function(...knots)
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

ishml.Mesh.prototype.clear=function()
{
	Object.keys(this).forEach(key=>
	{
		delete this[key]
	})
	return this
}	  

ishml.Mesh.prototype.delete=function(...knots)
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
	
ishml.Mesh.prototype.disjoin=function(...knots)
{
	var other=new ishml.Mesh(knots)
	var left = this.filter(knot => !other.has(knot))
	var right = other.filter(knot => !this.has(knot))
	return left.union(right)
}
ishml.Mesh.prototype.entwine=function(...knots)
{
	var other=new ishml.Mesh()
	knots.forEach((k=>other.add(k)))
	var twinings=new ishml.Mesh()
	var where=({via=null,condition=()=>true}={})=>
	{
		this.forEach((knot)=>
		{
			other.forEach((otherKnot)=>
			{
				if(knot.hasOwnProperty(via) && knot[via] instanceof ishml.Cord)
				{
					if(knot[via].mesh.has(otherKnot))
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
	return {where:where}
}	
ishml.Mesh.prototype.filter=function(filter)
{
	return new ishml.Mesh(Object.values(this).filter(filter))
}

ishml.Mesh.prototype.first=function(count=1)
{
	return new ishml.Mesh(Object.values(this).slice(0,count))
}

ishml.Mesh.prototype.forEach=function(f)
{

	Object.values(this).forEach(f)

	return undefined
}

ishml.Mesh.prototype.has=function(...knots)
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

ishml.Mesh.prototype.join= function(...knots) 
{
	var other=new ishml.Mesh(...knots)
	if (this.size < other.size)
	{
		return new ishml.Mesh(this.filter(knot => other.has(knot)))
	}
	else
	{
		return new ishml.Mesh(other.filter(knot => this.has(knot)))
	}	
}

ishml.Mesh.prototype.last=function(count=1)
{
	return new ishml.Mesh(Object.values(this).slice(-1,-count))
}

ishml.Mesh.prototype.map=function(map)
{
	return ishml.Mesh(Object.values(this).map(map))
}
ishml.Mesh.prototype.middle=function(count=1)
{
	return new ishml.Mesh(Object.values(this).slice(count,-count))
}
ishml.Mesh.prototype.most=function(count=1)
{
	return new ishml.Mesh(Object.values(this).slice(count-1,-1))
}
ishml.Mesh.prototype.omit=function(other)
{
	return new ishml.Mesh(Object.values(this).filter(x => !other.has(x)))
}
ishml.Mesh.prototype.shuffle=function(quantity)
{
	var count=quantity||this.size
	return new ishml.Mesh(ishml.util.shuffle(this.knots,count))
}

Object.defineProperty(ishml.Mesh.prototype, "size", { get: function() { return Object.values(this).size}})

ishml.Mesh.prototype.sort=function(sorting)
{
	return new ishml.Mesh(Object.values(this).sort(sorting))
}

ishml.Mesh.prototype.union=function(...knots)
{
	return new ishml.Mesh(this, knots)
}

