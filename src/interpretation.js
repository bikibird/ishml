ishml.Interpretation=function Interpretation(gist={},remainder)
{
	if (this instanceof ishml.Interpretation)
	{
		if (gist instanceof Array)
		{
			this.gist=gist.slice(0)
		}
		else
		{
			if(gist instanceof ishml.Token)
			{
				this.gist=gist.clone()
			}
			else
			{
				this.gist=Object.assign({},gist)
			}	
		}
		if(remainder)
		{
			this.remainder=remainder.slice()
		}
		else
		this.remainder=""
		return this
	}
	else
	{
		return new Interpretation(gist,remainder)
	}
}
