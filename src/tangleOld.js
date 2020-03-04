ishml.Tangle=class Tangle extends Set
{
	constructor(...members) 
	{
		super()
		members.forEach(member=>
		{
			if (member instanceof Set || member instanceof Array)
			{
				member.forEach((item)=>
				{
					super.add(item)
				})
			}
			else
			{
				super.add(member)
			}
		})	
		return this	
	}
	cross(other)
	{
		var per=function(crossing)
		{
			var tangle = new ishml.Tangle()
			for (const a of this)
			{
				for (const b of other)
				{
					tangle.add(crossing(a,b))
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
				super.add(item)
			})
		}
		else
		{
			super.add(member)
		}
		})
		
		return this
	}
	union(other)
	{
		return new ishml.Tangle([...this, ...other])
	}
	join(other) 
	{
		var thisArray=[...this]
		var otherArray=[...other]
		if (thisArray.length<otherArray.length)
		{
			return new ishml.Tangle(thisArray.filter(x => other.has(x)))
		}
		else
		{
			return new ishml.Tangle(otherArray.filter(x => this.has(x)))
		}	
	}
	disjoin(other) 
	{
		var leftArray= [...this].filter(x => !other.has(x))
		var rightArray=[...other].filter(x => !this.has(x))
		return new ishml.Tangle(leftArray.concat(rightArray))
	}
	omit(other)
	{
		return new ishml.Tangle([...this].filter(x => !other.has(x)))
	}
	filter(filter)
	{
		return new ishml.Tangle([...this].filter(filter))
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
	sort(sorting)
	{
		return new ishml.Tangle([...this].sort(sorting))
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
	isSuperset(otherTangle)
	{
		return [...otherTangle].every((member)=>this.has(member))
	}
	isSubset(otherTangle)
	{
		return [...this].every((member)=>otherTangle.has(member))
	}
	isEqual(otherTangle)
	{
		if (this.size===otherTangle.size)
		{
			return [...otherTangle].every((member)=>this.has(member))
		}
		else {return false}
	}
	isEquivalent(otherTangle)
	{
		if (this.size===otherTangle.size){return true}
		else {return false}
	}
	get knots()
	{
		return this.map(knot=>
		{
			if (knot instanceof ishml.ply)
			{
				return knot.knot
			}
			else {return knot}
		})
	}
	get plies()
	{
		return this.map(knot=>
		{
			if (knot instanceof ishml.knot)
			{
				return knot.ply
			}
			else {return knot}	
		})
	}
	get array()
	{

		return [...this]
	}
}