ishml.Cord =class Cord extends Function 
{
	constructor(...plies)
	{
		super()
		Object.defineProperty(this,"id",{writable:true})
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

		return new Proxy(this, ishml.Cord.handler)
	}
	[Symbol.iterator](){return Object.values(this)}
	add(...plies)
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
	clear()
	{
		Object.keys(this).forEach(key=>
		{
			delete this[key]
		})
		return this
	}
	delete(...plies)
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
	filter(filter)
	{
		return new ishml.Cord(Object.values(this).filter(filter))
	}
	first(count=1)
	{
		return new ishml.Cord(Object.values(this).slice(0,count))
	}
	forEach(f)
	{

		Object.values(this).forEach(f)

		return this
	}
	has(...plies)
	{

		return plies.every((ply)=>
		{
			if (ply instanceof ishml.Ply)
			{
				return (Object.values(this).some(thisPly=>thisPly.knot===ply.knot))
			}
			if (ply instanceof ishml.Knot)
			{
				return (Object.values(this).some(thisPly=>thisPly.knot===ply))
			}
			if (ply instanceof ishml.Tangle)
			{
				[...ply].every(member=>
				{
					if (member instanceof ishml.Ply)
					{
						return (Object.values(this).some(thisPly=>thisPly.knot===member.knot))
					}
					if (member instanceof ishml.Knot)
					{
						return (Object.values(this).some(thisPly=>thisPly.knot===member))
					}
				})
			}
			else
			{
				return this.hasOwnProperty(ply)
			}

		})
	}
	//get knots(){ return new ishml.Tangle(Object.values(this).map((ply)=>ply.knot))}
	get plies(){ return new ishml.Tangle(Object.values(this))}
	get ply(){ return Object.values(this)[0]}

	last(count=1)
	{
		return new ishml.Cord(Object.values(this).slice(-1,-count))
	}

	middle(count=1)
	{
		return new ishml.Cord(Object.values(this).slice(count,-count))
	}
	most(count=1)
	{
		return new ishml.Cord(Object.values(this).slice(count-1,-1))
	}
	where(condition)
	{
		return new ishml.Cord(Object.values(this).filter(ply=>condition(ply)))
	}
	shuffle(quantity)
	{
		var count=quantity||this.size
		return new ishml.Cord(ishml.util.shuffle(this.knots,count))
	}

	get size() { return Object.values(this).length}
	get isEmpty() { return Object.values(this).length===0}

	sort(sorting)
	{
		return new ishml.Cord(Object.values(this).sort(sorting))
	}
	get tangle()
	{
		return (new ishml.Tangle(Object.values(this)))
	}

}
ishml.Cord.handler=
{
	apply: (target, thisArg, args) => target.has(...args)
}








