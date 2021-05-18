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
					else
					{
						if (typeof member === "function")
						{
							//DEFECT not done
							// define infer as a getter property set to the pass function.
						}
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
	equivalent(...someCord)
	{
		var knots=this.knots
		var otherKnots = (new ishml.Cord(...someCord)).knots
		if (knots.size===otherKnots.size)
		{
			return [...knots].every(knot=>otherKnots.has(knot))
		}
		else {return false}
	}
	get subsetOf()
	{}
	get supersetOf()
	{}
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
		var cord=new ishml.Cord(...plies)
		cord.forEach((ply)=>
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
	hasKnot(knot)
	{
		return [...this.plies].some(ply=>ply.knot===knot)
	}
	
	get knots()
	{
		return new Set([...this.plies].map(ply=>ply.knot))
	}
	map(map)
	{
		return [...this.plies].map(map)
	}
	//$.thing.ring.nearby(1).via("in","over","under").contains(player,{via})
	nearby(hops)
	{
		var visited
		var result
		var neighbors 
		var thisCord = this
		var adjacencies=(cord,keys)=>
		{
			var adjacent=new ishml.Cord()
			if (keys)
			{
				keys.forEach((key)=>
				{	
					cord.forEach(ply=>{adjacent.add(ply.knot[key])})
				})
			}
			else
			{
				cord.forEach(ply=>{adjacent.add(ply.knot.cords)})
			}
			
			return adjacent
		}
		return {
			via:(...cordage)=>
			{
				var i=hops?hops-1:Infinity
				result=adjacencies(this, cordage)
				visited = new ishml.Cord(result)
				while (i>0)
				{
					neighbors=adjacencies(result, cordage).subtract(visited)
					if (neighbors.size===0){return new ishml.Cord()}
					visited.add(neighbors)
					result= new ishml.Cord(neighbors)
					i--
				}
				return result
			}
		}	
	}
	path(destination,{filter=(knot)=>true,minimum=1,maximum=Infinity,via,cost=(ply,leg)=>ply.cost+leg.ply.weight}={})
	{
		var fore=new ishml.Cord()
		var aft=new ishml.Cord()
		var path
		this.cross(destination).per(
		(a,b)=>
		{
			path=a.path(b,{filter:filter,minimum:minimum,maximum:maximum,via:via,cost:cost})
			fore.add(path.fore)
			aft.add(path.aft)
		})
		return {fore:fore,aft:aft}
	}
	realm(hops)
	{
		var visited
		var result
		var neighbors 
		var size
		var thisCord=this
		var adjacencies=(cord,keys)=>
		{
			var adjacent=new ishml.Cord()
			if (keys)
			{
				keys.forEach((key)=>
				{	
					cord.forEach(ply=>{adjacent.add(ply.knot[key])})
				})
			}
			else
			{
				cord.forEach(ply=>{adjacent.add(ply.knot.cords)})
			}
			
			return adjacent
		}
		return {
			via:(...cordage)=>
			{
				var i=hops?hops-1:Infinity
				result=adjacencies(thisCord, cordage)
				visited=new ishml.Cord(thisCord).add(result)
				while (i>0)
				{
					neighbors=adjacencies(result, cordage).subtract(visited)
					if (neighbors.size===0){break}
					visited.add(neighbors)
					result.add(neighbors)
					i--
				}
				return result
			}
		}	
	}

	//portable.reachable($.actor.player.in, {via:"in"})
	reachable(destination,{filter=(knot)=>true,minimum=1,maximum=Infinity,via,cost=(ply,leg)=>ply.cost+leg.ply.weight}={})
	{
		return this.cross(destination).per(
		(a,b)=>
		{
			var {aft}=a.path(b,{filter:filter,minimum:minimum,maximum:maximum,via:via,cost:cost})
			if (aft) {return true}
			else {return false}
		})
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
							cord.add(targetPly.converse) //$.thing.ring.worn_by.converse aka ring
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
					cord.add(targetPly.converse) //$.thing.ring.worn_by.converse aka ring
				}	
			}
		}
		return cord
	}
	retie(...someCordage)
	{
		var from =(...fromCords)=>
		{
			var fromCord= new ishml.Cord(...fromCords)

			fromCord.forEach(ply=>
			{
				this.forEach((toPly)=>
				{
					ply.untie()
					ply.knot.tie(...someCordage).to(toPly.Knot)
				})	
			})
			return this	
		}
		var to = (...toCords)=>
		{
			var toCord=new ishml.Cord(...toCords)
			this.forEach((ply)=>
			{
				toCord.forEach(toPly=>
					{
						ply.untie()
						ply.knot.tie(...someCordage).to(toPly.knot)
					})
			})
			return this
		}
		return {to:to, from:from}
	}
	subtract(...someKnots)
	{
		var a=new ishml.Cord(this)
		var b=new ishml.Cord(...someKnots).knots
		a.forEach(ply=>
		{
			if(b.has(ply.knot))
			{
				delete a[ply.id]
				a.plies.delete(ply)
			}
		})
		return a
	}
	tie(...someCordage)
	{
		var from =(...fromCords)=>
		{
			var fromCord= new ishml.Cord(...fromCords)

			fromCord.forEach(ply=>
			{
				this.forEach((toPly)=>
				{
					ply.knot.tie(...someCordage).to(toPly.knot)
				})	
			})
			return this	
		}

		var to = (...toCords)=>
		{
			var toCord=new ishml.Cord(...toCords)
			this.forEach((ply)=>
			{
				toCord.forEach(toPly=>
					{
						ply.knot.tie(...someCordage).to(toPly.knot)
					})
			})
			
			return this
		}
		return {to:to, from:from}
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
ishml.Cord.cordage={}
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
			cords.forEach((c)=>
			{
				if (typeof c === "string")
				{
					cord.add(target[c]?.converse)
				}
				else
				{
					var otherCord=new ishml.Cord(c)
					for (const targetPly of target ) //$.thing.ring
					{
						for (const otherPly of otherCord) //$.actor.player
						{
							if (targetPly.knot===otherPly.knot)
							{
								if (targetPly.converse)
								{
									
									cord.add(targetPly?.converse) //$.thing.ring.worn_by.converse aka ring
								}
							}
						}
					}
				}	
			})
			
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
