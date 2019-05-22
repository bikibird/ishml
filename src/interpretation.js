//TO DO: composer function
ISHML.interpret=function(text, lexicon, grammar)
{    
	var tokenizer = lexicon.tokenize(text)
	var sequence = tokenizer.next()
	var interpretations=[]
	var badInterpretations=[]
	var goodInterpretations=[]
	while (!sequence.done)
	{
		interpretations.push(new ISHML.Interpretation([],sequence.value.tokens))
		//var result=grammar.parse([{gist:{},remainder:sequence.value.tokens}])
		var result=grammar.parse(sequence.value.tokens)
		if (result)
		{
			interpretations=interpretations.concat(result)
		}
		sequence = tokenizer.next()
	}

	interpretations.sort(function(first,second){return first.remainder.length - second.remainder.length})

	var success=false
	interpretations.some((interpretation)=>
	{
		if (interpretation.remainder.length>0)
		{
			if (success===true){return true}
			else
			{
				badInterpretations.push(interpretation)
			}	
		}
		else
		{
			goodInterpretations.push(interpretation)
			success=true
			return false
		}
	})
	if (goodInterpretations.length>0)
	{	
		return goodInterpretations
	}
	else
	{
		return badInterpretations
	}
}
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
