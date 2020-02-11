ishml.Tangle=class Tangle extends Set
{
	constructor(members) 
	{
		if(members)
		{
			if(typeof members[Symbol.iterator] === 'function')
			{
				super(members)
			}
			else{super([members])}
		}
		else {super()}
	}
	cross(other,crossing)
	{
		var tangle = new ishml.Tangle()
		for (a of this)
		{
			for (b of other)
			{
				tangle.add(crossing(a,b))
			}
		}
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
		return new ishml.Tangle([...this].map(map))
	}
	sort(sorting)
	{
		return new ishml.Tangle([...this].sort(sorting))
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

	get array()
	{

		return [...this]
	}
}