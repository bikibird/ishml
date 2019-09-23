ISHML.Set=class ISHMLSet extends Set
{
	constructor(members) 
	{
		super(members)
	}
	union(other)
	{
		return new ISHML.Set([...this, ...other])
	}
	join(other) 
	{
		var thisArray=[...this]
		var otherArray=[...other]
		if (thisArray.length<otherArray.length)
		{
			return new ISHML.Set(thisArray.filter(x => other.has(x)))
		}
		else
		{
			return new ISHML.Set(otherArray.filter(x => this.has(x)))
		}	
	}
	disjoin(other) 
	{
		var otherArray=[...other]
		var leftArray= [...this].filter(x => !other.has(x))
		var rightArray=[...other].filter(x => !this.has(x))
		return new ISHML.Set(leftArray.concat(rightArray))
	}
	omit(other)
	{
		return new ISHML.Set([...this].filter(x => !other.has(x)))
	}
	filter(filter)
	{
		return new ISHML.Set([...this].filter(filter))
	}
	map(map)
	{
		return new ISHML.Set([...this].map(map))
	}
	toArray({shuffle=false,count}={})
	{
		if (shuffle)
		{
			return ISHML.util.shuffle([...this],count)
		}
		else
		{
			return [...this]
		}
	}
}

