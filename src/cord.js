ishml.Cord =class Cord extends Function
{
	//a cord is a collection of unrelated plies
	constructor(...members) 
	{
		function Cord(){}
		Object.setPrototypeOf(Cord, ishml.Cord.prototype)
		Object.defineProperty(Cord,"id",{writable:true})
		Object.defineProperty(Cord,"plies",{value:new Set(),writable:true})

		members.forEach(member=>
		{
			if (member instanceof Set ||member instanceof ishml.Cord ||member instanceof Array)
			{
				member.forEach((item)=>
				{
					if (item instanceof ishml.Ply)
					{
						Cord.plies.add(item)
						Cord[item.id]=item
					}
					else
					{
						if (item instanceof ishml.Knot)
						{
							Cord.plies.add(item.ply)
							Cord[item.id]=item.ply
						}
					}
					
				})
			}
			else
			{
				if (member instanceof ishml.Ply)
				{
					Cord.plies.add(member)
					Cord[member.id]=member
				}
				else
				{
					if (member instanceof ishml.Knot)
					{
						Cord.plies.add(member.ply)
						Cord[member.id]=member.ply
					}
				}
				
			}
		})	
		return new Proxy(Cord,ishml.Cord.handler)
	}
	[Symbol.iterator](){return this.plies.values()[Symbol.iterator]()}
	cross(other)
	{
		
		var per=crossing=>
		{
			var cord = new ishml.Cord()
			for (const a of this)
			{
				for (const b of other)
				{
					var result=crossing(a,b)
					try
					{
						if (result===true)
						{
							cord.add(a)
						}
						else 
						{
							if (result instanceof ishml.Ply || result instanceof ishml.Cord)
							{
								cord.add(result)
							}
							
						}
					}
					catch 
					{
						
					}	
				}
			}
			return cord
		}
		return {per:per}
	}
	add(...members)
	{
		members.forEach(member=>
		{
			if (member instanceof Cord || member instanceof Set || member instanceof Array)
			{
				member.forEach((item)=>
				{
					if (item instanceof ishml.Ply)
					{
						this.plies.add(item)
						this[item.id]=item
					}
					else
					{
						if (item instanceof ishml.Knot)
						{
							this.plies.add(item.ply)
							this[item.id]=item.ply
						}
					}
				})
			}
			else
			{
				if (member instanceof ishml.Ply)
				{
					this.plies.add(member)
					this[member.id]=member
				}
				else
				{
					if (member instanceof ishml.Knot)
					{
						this.plies.add(member.ply)
						this[member.id]=member.ply
					}
				}
			}
		})	
		return this	
	}
	get disjoint()
	{
		var knots=new Set()
		var cord=new ishml.Cord()
		this.plies.forEach(ply=>
		{
			if (!knots.has(ply.knot))
			{
				knots.add(ply.knot)
				cord.add(ply)
			}
		})
		return cord
	}
	get isEmpty()
	{
		return this.plies.size===0
	}
	get converse()
	{
		var cord = new ishml.Cord()
		for ( const thisPly of this.plies)
		{
			if (thisPly.converse){cord.add(thisPly.converse)}
		}
		return cord
	}
	get cord(){return this}
	filter(condition)
	{
		return new ishml.Cord([...this.plies].filter(condition))
	}
	delete(...plies)
	{
		plies.forEach((ply)=>
		{
			if(ply instanceof ishml.Ply)
			{
				//DEFECT deleting hash key when there may be more than one ply with the same id
				delete this[ply.id]
				this.plies.delete(ply)
			}
			else
			{
				
				if (ply)
				{
					ply.forEach((ply)=>
					{
						if(ply instanceof ishml.Ply)
						{
							//DEFECT deleting hash key when there may be more than one ply with the same id
							delete this[ply.id]
							this.plies.delete(ply)
						}
					})
				}	
				
			}
		})
		return this
	}
	forEach(f)
	{
		this.plies.forEach(f)
	}
	has(ply)
	{
		if (this.plies.has(ply)){return true}
		return false
	}
	map(map)
	{
		return [...this.plies].map(map)
		//var cord = new ishml.Cord()
		//for ( const a of this.plies)
		//{
		//		cord.add(map(a))
		//}
		//return cord
	}
	first(count=1)
	{
		return new ishml.Cord([...this.plies].slice(0,1))
	}
	last(count=1)
	{
		return new ishml.Cord([...this.plies].slice(-1,-count))
	}
	recite(recitation=(ply)=>ply.knot.id)
	{
		var result=[]
		this.plies.forEach((ply)=>
		{
			result.push(recitation(ply))
		})
		return result
	}
	middle(count=1)
	{
		return new ishml.Cord([...this.plies].slice(count,-count))
	}
	most(count=1)
	{
		return new ishml.Cord([...this.plies].slice(count-1,-1))
	}
	shuffle(quantity)
	{
		var count=quantity||this.size
		return new ishml.Cord(ishml.util.shuffle([...this.plies],count))
	}
	get size(){return this.plies.size}
	sort(sorting)
	{
		return new Cord([...this.plies].sort(sorting))
	}
	orient(property,plies)
	{
		/*
		 $.thing.ring.worn_by($.actor.player)

		 $.actor.player.wears.ring

		 $.thing.ring.worn_by.player.converse

		*/
		var otherCord=new ishml.Cord(plies)
		var cord=new ishml.Cord()

		if (plies)
		{

			for (const thisPly of this ) //$.thing.ring
			{
				var targetCord=thisPly.knot[property]//$.thing.ring.worn_by
			

				for (const targetPly of targetCord) //$.thing.ring.worn_by  aka player
				{
					for (const otherPly of otherCord) //$.actor.player
					{
						if (targetPly.knot===otherPly.knot)
						{
							if (targetPly.converse)
							{
								cord.add(targetPly.converse) //$.thing.ring.worn_by.converse aka ring
							}
							break
						}
					}
				}	
			}
		}
		else
		{
			for (const thisPly of this ) //$.thing.ring
			{
				var targetCord=thisPly.knot[property]//$.thing.ring.worn_by
				for (const targetPly of targetCord) //$.thing.ring.worn_by  aka player
				{
					if (targetPly.converse)
					{
						cord.add(targetPly.converse) //$.thing.ring.worn_by.converse aka ring
					}
				}	
			}
		}
		return cord
	}
	retie(...someCordage)
	{
		var from =(...fromKnots)=>
		{
			var fromCord=fromKnots.flat(Infinity)

			knots.forEach(k=>
			{
				if (k instanceof ishml.Knot)
				{
					var knot=k
				}
				else
				{
					if (k instanceof ishml.Ply)
					{
						var knot=k.knot
					}
					else
					{
						var knot=new ishml.Knot(k)
					}	
				}
				this.forEach((toKnot)=>
				{
		
					knot.tie(...someCordage).to(toKnot)
				})	
			})
			return this	
		}

		var to = (...toKnots)=>
		{
			this.forEach((knot)=>
			{
				toKnots.forEach(toKnot=>
					{
						knot.tie(...someCordage).to(toKnot)
					})
			})
			
			return this
		}
		return {to:to, from:from}
	}
	tie(...someCordage)
	{
		var from =(...fromKnots)=>
		{
			var knots=fromKnots.flat(Infinity)

			knots.forEach(k=>
			{
				if (k instanceof ishml.Knot)
				{
					var knot=k
				}
				else
				{
					if (k instanceof ishml.Ply)
					{
						var knot=k.knot
					}
					else
					{
						var knot=new ishml.Knot(k)
					}	
				}
				this.forEach((toKnot)=>
				{
		
					knot.tie(...someCordage).to(toKnot)
				})	
			})
			return this	
		}

		var to = (...toKnots)=>
		{
			this.forEach((knot)=>
			{
				toKnots.forEach(toKnot=>
					{
						knot.tie(...someCordage).to(toKnot)
					})
			})
			
			return this
		}
		return {to:to, from:from}
	}
	retie(cordage)
	{
		//$.place.kitchen.contains.knife.retie("in<contains").to($.place.foyer)
		this.untie()
		return this.knot.tie(cordage)
	}
	untie()
	{
		this.plies.forEach(ply=>
		{
			ply.untie()
		})
		return this
	}
}
ishml.Cord.handler=
{	
	apply: function(target, thisArg, cords)
	{
		/*
		$.thing.ring.worn_by($.actor.player)

		$.actor.player.wears.ring

		$.thing.ring.worn_by.player.converse

		*/
		
		var cord=new ishml.Cord()

		if (cords.length>0)
		{
			var otherCord=new ishml.Cord(...cords)
			for (const targetPly of target ) //$.thing.ring
			{
				for (const otherPly of otherCord) //$.actor.player
				{
					if (targetPly.knot===otherPly.knot)
					{
						if (targetPly.converse)
						{
							
							cord.add(targetPly.converse) //$.thing.ring.worn_by.converse aka ring
						}
					}
				}
			}
		}
		else
		{
			for (const targetPly of target ) //$.thing.ring
			{
				if (targetPly.converse)
				{
					cord.add(targetPly.converse) //$.thing.ring.worn_by.converse aka ring
				}
			}
		}
		return cord

	},
	set: function(target, property, value, receiver)
	{
		if (value instanceof ishml.Ply)
		{
			target[property]=value
			target.plies.add(value)
			return true
		}
		else{return Reflect.set(target,property,value,receiver)}
	},
	get: function(target, property, receiver) 
	{
		//if cord contains ply, return the ply
		//$.room.kitchen.exit.north
		if (Reflect.has(target,property,receiver))  //return the ply 
		{
			return Reflect.get(target,property,receiver)
		}
		else 
		{
			// Return  the ply where the knot id matches the property name.
			//if some plies in the cord point to knots matching the property, return a cord of those plies.
			//$.kitchen.exit.foyer 
			target.plies.forEach(ply=>
			{
				if (ply.knot?.id===property){return ply}
			})
			//if some plies in the cord point to knots which point cords matching the property, return a cord of the plies of matching cords.  Fast travel along cords
			//$.actor.lizzy.friend.friend
			var cord=new ishml.Cord()
			target.plies.forEach(ply=>
			{
				cord.add(ply.knot[property])
			})
			return cord
			//if (cord.size>0){return cord}
			//else {return null}
			//	return Reflect.get(target,"orient",receiver).bind(target,property)()
		}
	}
}
