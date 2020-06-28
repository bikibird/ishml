ishml.Cord =class Cord extends Function
{
	//a cord is a collection of unrelated plies
	constructor(...members) 
	{
		
		super()

		Object.defineProperty(this,"id",{writable:true})
		Object.defineProperty(this,"plies",{value:new Set(),writable:true})
		
		members.forEach(member=>
		{
			if (member instanceof Set ||member instanceof ishml.Cord ||member instanceof Array)
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

		return new Proxy(this,ishml.Cord.handler)
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
	where(condition)
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
		var cord = new ishml.Cord()
		for ( const a of this.plies)
		{
				cord.add(map(a))
		}
		return cord
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

	size(){return this.plies.size}
	
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
}

/*
	player.wears.shoe or player.wears["shoe"] returns ply to shoe or null.


	 var  droppable=command.subject.wears(command.directObject)  //returns cord of direct Objects that player wears
            
			.add(command.subject.carries(command.directObject)) //
			returns cord of directObject plies.


	*/

ishml.Cord.handler=
{	
	apply: function(target, thisArg, plies)
	{
		/*
		$.thing.ring.worn_by($.actor.player)

		$.actor.player.wears.ring

		$.thing.ring.worn_by.player.converse

		*/
		
		var cord=new ishml.Cord()

		if (plies.length>0)
		{
			var otherCord=new ishml.Cord(plies)
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
	}
	,
	get: function(target, property, receiver) 
	{

		if (Reflect.has(target,property,receiver)){return Reflect.get(target,property,receiver)}//Reflect.get(target,property)}

	else 
		{
			// assume property is name of a cord and return a custom function
			
			return  Reflect.get(target,"orient",receiver).bind(target,property)
			
		}
	}
}