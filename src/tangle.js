ishml.Tangle=class Tangle extends Set
{
	//a tangle is a collection of unrelated plies
	constructor(...members) 
	{
		super()
		members.forEach(member=>
		{
			if (member instanceof Set || member instanceof Array)
			{
				member.forEach((item)=>
				{
					if (item instanceof ishml.Ply){super.add(item)}
					if (item instanceof ishml.Knot){super.add(item.ply)}
				})
			}
			else
			{
				if (member instanceof ishml.Ply){super.add(member)}
				if (member instanceof ishml.Knot){super.add(member.ply)}
			}
		})	
		return this	
	}
	cross(other)
	{
		
		var per=crossing=>
		{
			var tangle = new ishml.Tangle()
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
						}
					}
					catch {}	
				}
			}
			return tangle
		}
		return {per:per}
	}
	add(...members)
	{
		members.forEach(member=>
		{
			if (member instanceof Set || member instanceof Array)
			{
				member.forEach((item)=>
				{
					if (item instanceof ishml.Ply){super.add(item)}
					if (item instanceof ishml.Knot){super.add(item.ply)}
				})
			}
			else
			{
				if (member instanceof ishml.Cord){super.add(Object.values(member))}
				if (member instanceof ishml.Ply){super.add(member)}
				if (member instanceof ishml.Knot){super.add(member.ply)}
			}
		})	
		return this	
	}
	get disjoint()
	{
		var knots=new Set()
		var tangle=new ishml.Tangle
		this.forEach(ply=>
		{
			if (!knots.has(ply.knot))
			{
				knots.add(ply.knot)
				tangle.add(ply)
			}
		})
		return tangle
	}
	get tangle(){return this}
	where(condition)
	{
		return new ishml.Tangle([...this].filter(condition))
	}
	map(map)
	{
		var tangle = new ishml.Tangle()
		for ( const a of this)
		{
				tangle.add(map(a))
		}
		return tangle
	}
	first(count=1)
	{
		return new ishml.Tangle([...this].slice(0,1))
	}

	last(count=1)
	{
		return new ishml.Tangle([...this].slice(-1,-count))
	}
	middle(count=1)
	{
		return new ishml.Tangle([...this].slice(count,-count))
	}
	most(count=1)
	{
		return new ishml.Tangle([...this].slice(count-1,-1))
	}
	shuffle(quantity)
	{
		var count=quantity||this.size
		return new ishml.Tangle(ishml.util.shuffle([...this],count))
	}
	sort(sorting)
	{
		return new Tangle([...this].sort(sorting))
	}
	
}