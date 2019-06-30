ISHML.Rule=function Rule() 
{
	if (this instanceof ISHML.Rule)
	{
		Object.defineProperty(this, "minimum", {value:1, writable: true})
		Object.defineProperty(this, "maximum", {value:1, writable: true})
		Object.defineProperty(this, "mode", {value:0, writable: true})
		Object.defineProperty(this, "greedy", {value:false, writable: true})
		Object.defineProperty(this, "keep", {value:true, writable: true})
		Object.defineProperty(this, "filter", {value:(definition)=>true, writable: true})
		Object.defineProperty(this, "semantics", {value:(interpretation)=>true, writable: true})
		return this
	}
	else
	{
		return new Rule()
	}
}

ISHML.Rule.prototype.clone =function()
{
	var clonedRule= new ISHML.Rule().configure({minimum:this.minimum,maximum:this.maximum,
		mode:this.mode,greedy:this.greedy,keep:this.keep,filter:this.filter, semantics:this.semantics})
	var entries=Object.entries(this)
	entries.forEach(([key,value])=>{clonedRule[key]=value.clone()})
	return clonedRule
}	
ISHML.Rule.prototype.configure =function({minimum,maximum,mode,greedy,keep,filter,semantics}={})
{
	if(minimum !== undefined){this.minimum=minimum}
	if(maximum !== undefined){this.maximum=maximum}
	if(mode !== undefined){this.mode=mode}
	if(greedy !== undefined){this.greedy=greedy}
	if(keep !== undefined){this.keep=keep}
	if(filter !== undefined){this.filter=filter}
	if(semantics !== undefined){this.semantics=semantics}
	return this
}
ISHML.Rule.prototype.parse =function(tokenization)
{
	
	var someTokens=tokenization.clone()
	var results=[]
	var keys=Object.keys(this)
	if (keys.length>0)
	//non-terminal
	{
		switch (this.mode) 
		{
			case ISHML.enum.mode.all:
				if (this.maximum ===1 ){var candidates=[new ISHML.Interpretation({},someTokens)]}
				else {var candidates=[new ISHML.Interpretation([],someTokens)]}
				var counter = 0
				var phrases=[]
				var revisedCandidates=candidates.slice(0)
				while (counter<this.maximum)
				{
					for (let key of keys)
					{
						revisedCandidates.forEach(({gist,remainder})=>
						{	
							//SNIP
							if (remainder.tokens.length>0)
							{
								var snippets=this[key].parse(remainder.clone()) 
								snippets.forEach((snippet)=>
								{
									var phrase=new ISHML.Interpretation(gist,snippet.remainder)
									if (this.maximum ===1 )
									{
										if(this[key].keep){phrase.gist[key]=snippet.gist}
									}
									else 
									{
										if(phrase.gist.length===counter){phrase.gist.push({})}
										if(this[key].keep){phrase.gist[counter][key]=snippet.gist}
									}
									phrases.push(phrase)
								})
							}  
						})
						if (this[key].minimum===0)
						{
							revisedCandidates=revisedCandidates.concat(phrases.slice(0))
						}
						else{revisedCandidates=phrases.slice(0)}
						
						phrases=[]
					}
					counter++
					if (revisedCandidates.length===0)
					{
						break
					}
					else
					{
						if (counter >= this.minimum)
						{
							if (this.greedy){results=revisedCandidates.slice(0)}
							else {results=results.concat(revisedCandidates)}
						}
					}
				}
				break
			case ISHML.enum.mode.any:
					if (this.maximum ===1 ){var candidates=[new ISHML.Interpretation({},someTokens)]}
					else {var candidates=[new ISHML.Interpretation([],someTokens)]}
					var revisedCandidates=candidates.slice(0)
					for (let key of keys)
					{
						var counter = 0
						var phrases=[]
						
						while (counter<this.maximum)
						{
							revisedCandidates.forEach(({gist,remainder})=>
							{
							//SNIP
								if (remainder.tokens.length>0)
								{
									var snippets=this[key].parse(remainder.clone()) 
									snippets.forEach((snippet)=>
									{
										var phrase=new ISHML.Interpretation(gist,snippet.remainder)
										if (this.maximum ===1 )
										{
											if(this[key].keep){phrase.gist=snippet.gist}
										}
										else 
										{
											if(phrase.gist.length===counter){phrase.gist.push({})}
											if(this[key].keep){phrase.gist[counter]=snippet.gist}
										}
										phrases.push(phrase)
									})
								}
							})
							revisedCandidates=phrases.slice(0)
							phrases=[]
							counter++
							if (revisedCandidates.length===0){break}
							else
							{
								if (this.greedy){results=revisedCandidates.slice(0)}
								else {results=results.concat(revisedCandidates)}
							}
						}
						revisedCandidates=candidates.slice(0)  //go see if there are more alternatives that work.	
					}
					break
			case ISHML.enum.mode.apt:
				if (this.maximum ===1 ){var candidates=[new ISHML.Interpretation({},someTokens)]}
				else {var candidates=[new ISHML.Interpretation([],someTokens)]}
				var revisedCandidates=candidates.slice(0)
				for (let key of keys)
				{
					var counter = 0
					var phrases=[]
					
					while (counter<this.maximum)
					{
						revisedCandidates.forEach(({gist,remainder})=>
						{
							//SNIP
							if (remainder.tokens.length>0)
							{
								var snippets=this[key].parse(remainder.clone()) 
								snippets.forEach((snippet)=>
								{
									var phrase=new ISHML.Interpretation(gist,snippet.remainder)
									if (this.maximum ===1 )
									{
										if(this[key].keep){phrase.gist=snippet.gist}
									}
									else 
									{
										if(phrase.gist.length===counter){phrase.gist.push({})}
										if(this[key].keep){phrase.gist[counter]=snippet.gist}
									}
									phrases.push(phrase)
								})
							}
						})
						revisedCandidates=phrases.slice(0)
						phrases=[]
						counter++
						if (revisedCandidates.length===0){break}
						else
						{
							if (this.greedy){results=revisedCandidates.slice(0)}
							else {results=results.concat(revisedCandidates)}
						}
					}
					if (results.length>0){break} //found something that works, stop looking.
					revisedCandidates=candidates.slice(0)//try again with next key.	
				}
				break
		}
	}
	else
	{
	//terminal
		var counter=1
		var repetitions=[]
		while (counter<=this.maximum)
		{
			if (someTokens.tokens.length>0)
			{
				var token =	new ISHML.Token(someTokens.tokens[0].lexeme, someTokens.tokens[0].definitions.filter(this.filter))
				if (token.definitions.length>0)
				{
					repetitions.push(token)
					if (!this.greedy)
					{
						if (counter>=this.minimum)
						{
							if (this.maximum===1)
							{
								results.push(new ISHML.Interpretation(token,new ISHML.Tokenization(someTokens.tokens.slice(1),someTokens.remainder)))
							}
							else
							{
								results.push(new ISHML.Interpretation(repetitions,new ISHML.Tokenization(someTokens.tokens.slice(1),someTokens.remainder)))//{gist:repetitions.slice(0),remainder:remainder.slice(1)})
							}	
						}
					}	
					someTokens.tokens=someTokens.tokens.slice(1)
				}
				else {break}
				counter++
			}
			else {break}	
		}
		if (this.greedy)
		{
			if (counter-1>=this.minimum)
			{
				if (this.maximum===1)
				{
					results.push(new ISHML.Interpretation(repetitions[0],someTokens))
				}
				else
				{
					results.push(new ISHML.Interpretation(repetitions, someTokens))
				}	
			}
		}
	}	
	
	return results.reduce((revisedResults, interpretation) =>
	{
		var revisedInterpretation=this.semantics(interpretation)
		if (revisedInterpretation)
		{
			if (revisedInterpretation === true)
			{
				revisedResults.push(interpretation)
			}
			else
			{
				revisedResults.push(revisedInterpretation)
			}
		}
		return revisedResults

	},[])
}
ISHML.Rule.prototype.snip =function(key,rule)
{
	if (rule instanceof ISHML.Rule)
	{
		this[key]=rule
	}
	else
	{
		this[key]=new ISHML.Rule()
	}	
	return this		
}