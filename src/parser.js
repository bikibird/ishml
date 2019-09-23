ISHML.Parser=function Parser({lexicon,grammar}={})
{
	if (this instanceof ISHML.Parser)
	{
		this.lexicon=lexicon
		this.grammar=grammar
	}
	else
	{
		return new Parser({lexicon:lexicon,grammar:grammar})
	}
}
ISHML.Parser.prototype.analyze=function(text)
{    
	var interpretations=[]
	var partialInterpretations=[]
	var completeInterpretations=[]

	var result=this.grammar.parse(text,this.lexicon)
	if (result)
	{
		interpretations=interpretations.concat(result)
	}

	interpretations.forEach((interpretation)=>
	{
		if (interpretation.remainder.length>0)
		{
			partialInterpretations.push(interpretation)
		}
		else
		{
			completeInterpretations.push(interpretation)
		}
	})
	if (completeInterpretations.length>0)
	{	
		return {success:true, interpretations:completeInterpretations}
	}
	else
	{
		if (partialInterpretations.length>0)
		{
			return {success:false, interpretations: partialInterpretations.sort(function(first,second){return first.remainder.length - second.remainder.length})}
		}
		else
		{
			return { success: false}
		}
	}
}
