ISHML.Interpretation=function Interpretation(aGist=[],aRemainder=[])
{
	if (this instanceof ISHML.Interpretation)
	{
		this.gist=aGist.slice(0)
		this.remainder=aRemainder.slice(0)
		return this
	}
	else
	{
		return new Interpretation(aGist,aRemainder)
	}
}