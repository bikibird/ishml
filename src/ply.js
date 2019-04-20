ISHML.Ply= function Ply(aKnot, aWeight=undefined, aConverseTieKey)
{
	if (this instanceof ISHML.Ply)
	{
		this.knot=aKnot
		this.weight=aWeight
		this.converse=aConverseTieKey
		return this
	}
	else
	{
		return new Ply(aKnot, aWeight, aConverseTieKey)
	}	
}