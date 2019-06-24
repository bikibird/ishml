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
ISHML.Parser.prototype.analyze=function(text, {caseSensitive=false, fuzzy=false, greedy=false, lax=false, smooth=false,separator=/\s/}={})
{    
	var tokenizations = this.lexicon.tokenize(text,{caseSensitive:caseSensitive, fuzzy:fuzzy, greedy:greedy, lax:lax, smooth:smooth, separator:separator})
	var interpretations=[]
	var partialInterpretations=[]
	var completeInterpretations=[]
	if (tokenizations.complete.length > 0)
	{
		tokenizations.complete.forEach((sequence)=>
		{
			var result=this.grammar.parse(sequence.tokens)
			if (result)
			{
				interpretations=interpretations.concat(result)
			}
		})

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
			return completeInterpretations
		}
		else
		{
			partialInterpretations.sort(function(first,second){return first.remainder.length - second.remainder.length})
			const error=new Error("Incomplete interpretation.")
			error.interpretations=partialInterpretations
			throw error
		}
	}
	else
	{
		const error=new Error("Incomplete tokenization.")
		error.tokenizations=tokenizations.partial
		throw error
	}	
}