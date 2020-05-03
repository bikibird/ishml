ishml.Tangle=class Tangle
{
	//a tangle is a collection of unrelated plies
	constructor(...members) 
	{
		this.plies=new Set()
		
		members.forEach(member=>
		{
			if (member instanceof Set ||member instanceof ishml.Cord ||member instanceof Array)
			{
				member.forEach((item)=>
				{
					if (item instanceof ishml.Ply){this.plies.add(item)}
					if (item instanceof ishml.Knot){this.plies.add(item.ply)}
				})
			}
			else
			{
				if (member instanceof ishml.Ply){this.plies.add(member)}
				else
				{
					if (member instanceof ishml.Knot){this.plies.add(member.ply)}
				}
				
			}
		})	
		return new Proxy(this,ishml.Tangle.handler)
	}
	[Symbol.iterator](){return this.plies.values()[Symbol.iterator]()}
	cross(other)
	{
		
		var per=crossing=>
		{
			var tangle = new ishml.Tangle()
			var complement=new ishml.Tangle()
			for (const a of this)
			{
				for (const b of other)
				{
					var result=crossing(a,b)
					try
					{
						if (result===true)
						{
							tangle.add(a)
						}
						else 
						{
							if (result instanceof ishml.Ply)
							{
								tangle.add(result)
							}
							else
							{
								complement.add(a)
							}
						}
					}
					catch 
					{
						complement.add(a)
					}	
				}
			}
			return {tangle:tangle,complement:complement}
		}
		return {per:per}
	}
	add(...members)
	{
		members.forEach(member=>
		{
			if (member instanceof Tangle || member instanceof Set || member instanceof ishml.Cord || member instanceof Array)
			{
				member.forEach((item)=>
				{
					if (item instanceof ishml.Ply){this.plies.add(item)}
					if (item instanceof ishml.Knot){this.plies.add(item.ply)}
				})
			}
			else
			{
				if (member instanceof ishml.Ply){this.plies.add(member)}
				if (member instanceof ishml.Knot){this.plies.add(member.ply)}
			}
		})	
		return this	
	}
	get disjoint()
	{
		var knots=new Set()
		var tangle=new ishml.Tangle()
		this.plies.forEach(ply=>
		{
			if (!knots.has(ply.knot))
			{
				knots.add(ply.knot)
				tangle.add(ply)
			}
		})
		return tangle
	}
	get isEmpty()
	{
		return this.plies.size===0
	}
	get tangle(){return this}
	where(condition)
	{
		return new ishml.Tangle([...this.plies].filter(condition))
	}
	map(map)
	{
		var tangle = new ishml.Tangle()
		for ( const a of this.plies)
		{
				tangle.add(map(a))
		}
		return tangle
	}
	first(count=1)
	{
		return new ishml.Tangle([...this.plies].slice(0,1))
	}

	last(count=1)
	{
		return new ishml.Tangle([...this.plies].slice(-1,-count))
	}
	middle(count=1)
	{
		return new ishml.Tangle([...this.plies].slice(count,-count))
	}
	most(count=1)
	{
		return new ishml.Tangle([...this.plies].slice(count-1,-1))
	}
	shuffle(quantity)
	{
		var count=quantity||this.size
		return new ishml.Tangle(ishml.util.shuffle([...this.plies],count))
	}
	sort(sorting)
	{
		return new Tangle([...this.plies].sort(sorting))
	}
	
}
ishml.Tangle.handler=
{
	get: function(target, property, receiver) 
	{

		if (Reflect.has(target,property,receiver)){return Reflect.get(target,property,receiver)}//Reflect.get(target,property)}
		else 
		{
			// assume property is name of a cord and return a custom function
			
			return (other)=>
			{
				var tangle = new ishml.Tangle()
				var complement=new ishml.Tangle()
				for (const a of target)
				{
					for (const b of other)
					{
						var ply=a[property](b)
						if (ply){tangle.add(ply)}
						else {complement.add(a)}
					}

				}
				return {tangle:tangle,complement:complement}
			}
		}
	}
}