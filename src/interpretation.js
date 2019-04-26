//TO DO: composer function
ISHML.Interpretation=function Interpretation(gist=[],remainder=[])
{
	if (this instanceof ISHML.Interpretation)
	{
		this.gist=gist.slice(0)
		this.remainder=remainder.slice(0)
		return this
	}
	else
	{
		return new Interpretation(gist,remainder)
	}
}