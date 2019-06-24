ISHML.Interpretation=function Interpretation(gist={},remainder=[])
{
	if (this instanceof ISHML.Interpretation)
	{
		if (gist instanceof Array)
		{
			this.gist=gist.slice(0)
		}
		else
		{
			if(gist instanceof ISHML.Token)
			{
				this.gist=gist.clone()
			}
			else
			{
				this.gist=Object.assign({},gist)
			}	
		}
		this.remainder=remainder.slice(0)
		return this
	}
	else
	{
		return new Interpretation(gist,remainder)
	}
}
