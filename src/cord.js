ishml.Cord =class Cord extends Function //(function Cord(){})
{
	//a cord is a collection of unrelated plies
	constructor(...members) 
	{
		//function Cord(){}  //sets function's name
		super()
		Object.setPrototypeOf(this, ishml.Cord.prototype)
		Object.defineProperty(this,"id",{writable:true})
		Object.defineProperty(this,"__plies",{value:new Set(),writable:true})
		Object.defineProperty(this,"_select",{value:null,writable:true})
		members.forEach(member=>
		{
			if (member instanceof Set ||member instanceof ishml.Cord ||member instanceof Array)
			{
				member.forEach((item)=>
				{
					if (item instanceof ishml.Ply)
					{
						this._plies.add(item)
						this[item.id]=item
					}
					else
					{
						if (item instanceof ishml.Knot)
						{
							this._plies.add(item.ply)
							this[item.id]=item.ply
						}
					}
					
				})
			}
			else
			{
				if (member instanceof ishml.Ply)
				{
					this._plies.add(member)
					this[member.id]=member
				}
				else
				{
					if (member instanceof ishml.Knot)
					{
						this._plies.add(member.ply)
						this[member.id]=member.ply
					}
					else
					{
						if (typeof member === "function")
						{
							this._select=member
						}
					}
				}
				
			}
		})	
		return new Proxy(this,ishml.Cord.handler)
	}
	[Symbol.iterator](){return this._plies.values()[Symbol.iterator]()}
	get _plies()
	{
		if(this._select){return this._select()._plies}
		else{return this.__plies}
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
						this._plies.add(item)
						this[item.id]=item
					}
					else
					{
						if (item instanceof ishml.Knot)
						{
							this._plies.add(item.ply)
							this[item.id]=item.ply
						}
					}
				})
			}
			else
			{
				if (member instanceof ishml.Ply)
				{
					this._plies.add(member)
					this[member.id]=member
				}
				else
				{
					if (member instanceof ishml.Knot)
					{
						this._plies.add(member.ply)
						this[member.id]=member.ply
					}
				}
			}
		})	
		return this	
	}
	converse(cordId)
	{
		var cord = new ishml.Cord()
		if (cordId)
		{
			for ( const ply of this[cordId]._plies){cord.add(ply.converse)}
		}
		else
		{	
			for ( const ply of this._plies){cord.add(ply.converse)}
		}	
		return cord
	}
	get cord(){return this}
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
	data(property="name")
	{
		return this.map(ply=>
		{
			var knot=ply.knot
			var data={}
			Object.keys(ply).forEach(key=>
			{
				data["ply_"+key]=ply[key]
			})
			Object.assign(data,ply.knot)
			if (property===undefined){data.value=knot.name}
			else
			{
				if (property===""){data.value=""}
				else{data.value=knot[property]}
			}
			return data
		})
	}
	delete(...plies)
	{
		var cord=new ishml.Cord(...plies)
		cord.forEach((ply)=>
		{
			if(ply instanceof ishml.Ply)
			{
				//DEFECT deleting key when there may be more than one ply with the same id
				delete this[ply.id]
				this._plies.delete(ply)
			}
			else
			{
				
				if (ply)
				{
					ply.forEach((ply)=>
					{
						if(ply instanceof ishml.Ply)
						{
							//DEFECT deleting key when there may be more than one ply with the same id
							delete this[ply.id]
							this._plies.delete(ply)
						}
					})
				}	
				
			}
		})
		return this
	}
	get disjoint()
	{
		var knots=new Set()
		var cord=new ishml.Cord()
		this._plies.forEach(ply=>
		{
			if (!knots.has(ply.knot))
			{
				knots.add(ply.knot)
				cord.add(ply)
			}
		})
		return cord
	}
	akin(...someCord)
	{
		var knots=this.knots.toSet
		var otherKnots = (new ishml.Cord(...someCord)).knots.toSet
		if (knots.size===otherKnots.size)
		{
			return [...knots].every(knot=>otherKnots.has(knot))
		}
		else {return false}
	}
	filter(condition)
	{
		return new ishml.Cord([...this._plies].filter(condition))
	}
	get isEmpty()
	{
		return this._plies.size===0
	}
	
/*	get subsetOf()
	{}
	get supersetOf()
	{}
*/	
	
	slice(start=0,end=1)
	{
		return new ishml.Cord([...this._plies].slice(0,1))
	}
	forEach(f)
	{
		this._plies.forEach(f)
	}
	has(ply)
	{
		if (ply instanceof ishml.Ply)
		{
			if (this._plies.has(ply)){return true}
			return false
		}	
		else {return [...this._plies].some(ply=>ply.knot===ply)}
	}
	intersect (cord)
	{
		var otherCord=new ishml.Cord(cord)
		var cord=new ishml.Cord()
		this.forEach(ply=>
		{
			if (otherCord.has(ply.knot))
			{
				cord.add(ply)
			}
		})
		return cord
	}
	get knot(){return[...this._plies][0].knot}
	get knots()
	{
		var thisCord=this
		return new Proxy({},
		{
			get: function(target, property, receiver) 
			{
				if (property==="toArray"){return 	[...thisCord._plies].map(ply=>ply.knot)}
				if (property==="toSet"){return new Set([...thisCord._plies].map(ply=>ply.knot))}
				return [...thisCord._plies].map(ply=>ply.knot[property])
			}			
		})	
	}
	last(count=1)
	{
		return new ishml.Cord([...this._plies].slice(-1,-count))
	}
	map(map)
	{
		return [...this._plies].map(map)
	}
	middle(count=1)
	{
		return new ishml.Cord([...this._plies].slice(count,-count))
	}
	most(count=1)
	{
		return new ishml.Cord([...this._plies].slice(count-1,-1))
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
	get text()
	{
		var cord=this
		return new Proxy(()=>{},
		{
			apply:function(target,thisArg,args)
			{
				if(args.length===0)
				{
					return ishml.Template.list(cord.knots.name).say().text
				}
			},
			get: function(target,property)
			{

				return ishml.Template.list(cord.knots[property]).say().text
			}
			
		})

	}
	get ply(){return[...this._plies][0]}
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
	get plies()
	{
		var thisCord=this
		return new Proxy({},
		{
			get: function(target, property) 
			{
				if (property==="toArray"){return 	[...thisCord._plies]}
				if (property==="toSet"){return thisCord._plies}
				return [...thisCord._plies].map(ply=>ply[property])
			}			
		})	
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
	recite(recitation=(ply)=>ply.knot.id)
	{
		var result=[]
		this._plies.forEach((ply)=>
		{
			result.push(recitation(ply))
		})
		return result
	}
	retie(...knots)
	{
		this.forEach(ply=>
		{
			ply.retie(...knots)
		})
		return this
	}
	reduce(f){return [...this.__plies].reduce(f)}
	shuffle(quantity)
	{
		var count=quantity||this.size
		return new ishml.Cord(ishml.util.shuffle([...this._plies],count))
	}
	get size(){return this._plies.size}
	sort(sorting)
	{
		return new Cord([...this._plies].sort(sorting))
	}
	subtract(...someKnots)
	{
		var a=new ishml.Cord(this)
		var b=new ishml.Cord(...someKnots).knots.toSet
		a.forEach(ply=>
		{
			if(b.has(ply.knot))
			{
				delete a[ply.id]
				a._plies.delete(ply)
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
	untie(cordId)
	{
		var cord=cordId?this.converse(cordId):this

		cord._plies.forEach(ply=>
		{
			ply.untie()
		})
		return this
	}
	where(condition)
	{
		if (condition(this)){return this}
		else return new Cord()
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
		if (target._select){return target._select(cords)}
		var cord=new ishml.Cord()

		if (cords.length>0)
		{
			cords.forEach((c)=>
			{
				if (typeof c === "string")  //$.actor.player.in("cloakroom") $.place.foyer.exit("cloakroom") $.place.foyer.exit("west")
				{
					target.forEach(targetPly=>
					{
						if (targetPly.id===c ||targetPly.knot.id===c)cord.add(targetPly)
					})	
				}
				else
				{
					var otherCord=new ishml.Cord(c)
					target.forEach(targetPly=>
					{
						otherCord.forEach(otherPly=>
						{
							if (targetPly.knot===otherPly.knot){cord.add(targetPly)}
						})
					})
				}	
			})
		}
		else
		{
			cord.add(target) //Called cord without parameters.  Need to return the orignal cord. Can't just return target, because not wrapped in proxy. 
		}
		return cord

	},
	set: function(target, property, value, receiver)
	{
		if (value instanceof ishml.Ply)
		{
			target[property]=value
			target._plies.add(value)
			return true
		}
		else{return Reflect.set(target,property,value,receiver)}
	},
	get: function(target, property, receiver) 
	{
		//if cord contains ply, return the ply
		//$.room.kitchen.exit.north
		if (target._select){return target._select()[property]}
		if (Reflect.has(target,property,receiver))  //return the ply 
		{
			return Reflect.get(target,property,receiver)
		}
		else 
		{
			// Return  the ply where the knot id matches the property name.
			//$.kitchen.exit.foyer 
			target._plies.forEach(ply=>
			{
				if (ply.knot?.id===property){return ply}
			})
			//if some plies in the cord point to knots which point cords matching the property, return a cord of the plies of matching cords.  Fast travel along cords
			//$.actor.lizzy.friend.friend
			var cord=new ishml.Cord()
			target._plies.forEach(ply=>
			{
					cord.add(ply.knot[property])	
			})
			return cord

		}
	}
}
