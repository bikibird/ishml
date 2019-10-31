ishml.Set=class ishmlSet extends Set
{
	constructor(members) 
	{
		super(members)
	}
	union(other)
	{
		return new ishml.Set([...this, ...other])
	}
	join(other) 
	{
		var thisArray=[...this]
		var otherArray=[...other]
		if (thisArray.length<otherArray.length)
		{
			return new ishml.Set(thisArray.filter(x => other.has(x)))
		}
		else
		{
			return new ishml.Set(otherArray.filter(x => this.has(x)))
		}	
	}
	disjoin(other) 
	{
		var otherArray=[...other]
		var leftArray= [...this].filter(x => !other.has(x))
		var rightArray=[...other].filter(x => !this.has(x))
		return new ishml.Set(leftArray.concat(rightArray))
	}
	omit(other)
	{
		return new ishml.Set([...this].filter(x => !other.has(x)))
	}
	filter(filter)
	{
		return new ishml.Set([...this].filter(filter))
	}
	map(map)
	{
		return new ishml.Set([...this].map(map))
	}
	toArray({shuffle=false,count}={})
	{
		if (shuffle)
		{
			return ishml.util.shuffle([...this],count)
		}
		else
		{
			return [...this]
		}
	}
}

