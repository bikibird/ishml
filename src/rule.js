ISHML.Rule=function Rule() 
{
	if (this instanceof ISHML.Rule)
	{
		Object.defineProperty(this, "minimum", {writable: true})
		Object.defineProperty(this, "maximum", {writable: true})
		Object.defineProperty(this, "skip", {writable: true})
		Object.defineProperty(this, "filter", {writable: true})
		return this
	}
	else
	{
		return new Rule()
	}
}

ISHML.Rule.prototype.choice =function(key,size,rule)
{
	this[key]=[]
	for (let i = 0; i< size; i++)
	{
		if (rule instanceof ISHML.rule)
		{
			this[key].push(rule.clone())
		}
		else
		{
			this[key].push(new ISHML.rule())
		}
	}
}
ISHML.Rule.prototype.clone =function()
{
	var clonedRule= new ISHML.rule().configure({minimum=this.minimum,maximum=this.maximum,skip=this.skip,filter=this.filter})
	var entries=Object.entries(this)
	entries.forEach(([key,value])=>
	{
		if (value instanceof rule)
		{
			clonedRule[key]=value.clone()
		}
		else if (value instanceof Array)
		{
			clonedRule[key]=[]
			value.forEach((rule)=>
			{
				clonedRule[key].push(this[key].value.clone)
			})
		} 
	})
	return clonedRule
}	
ISHML.Rule.prototype.configure =function({minimum,maximum,skip,filter}={})
{
	if(minimum !== undefined)
	{
		Object.defineProperty(this, "minimum", {value:minimum,writable: true})
	}
	if(maximum !== undefined)
	{
		Object.defineProperty(this, "maximum", {value:maximum,writable: true})
	}
	if(skip !== undefined)
	{
		Object.defineProperty(this, "skip", {value:skip,writable: true})
	}
	if(filter !== undefined)
	{
		Object.defineProperty(this, "filter", {value:filter,writable: true})
	}
	return this
}
ISHML.Rule.prototype.parse =function(someTokens)
{
	var counter
	var candidates=[]
	var keys=Object.keys(this)
	if (keys.length===0)
	{
		var candidate=ISHML.Interpretation([],someTokens)
		if (this.minimum===0 && !this.skip)
		{
			candidates.push(ISHML.Interpretation(candidate.gist,candidate.remainder))
		}
		counter = 1

		while (counter <= this.maximum)
		{	
			var token =	{definitions:someTokens[0].definitions.filter(this.filter), lexeme:someTokens[0].lexeme.slice(0)}
			if (token.definitions.length>0)
			{
				if (!this.skip)
				{
					candidate.gist.push(token)
				}
				candidate.remainder=candidate.remainder.slice(1)
				if (counter >= this.minimum)
				{
					var revisedCandidate=ISHML.Interpretation(candidate.gist, candidate.remainder)
					if (this.maximum===1)
					{
						revisedCandidate.gist=revisedCandidate.gist[0]
					}
					
					candidates.push(revisedCandidate)
				}
				
			}
			else {return false}
			counter++	
		}
		if (candidates.length>0)
		{
			return candidates
		}
		else {return false}		
	}
	else
	{	
		var candidates=[ISHML.Interpretation([],someTokens)]
		var choices=[]
		keys.forEach((key)=>
		{
			//convert property into an array of subrules
			var ruleList=[].concat([],this[key]) //Each sub rule may have more than one option
			ruleList.forEach((rule)=>
			{
				//for each rule parse up to maximum times
				candidates.forEach((candidate)=>
				{
					var revisedCandidate=ISHML.Interpretation(candidate.gist,candidate.remainder)
					if (rule.minimum===0 && !rule.skip)
					{
						choices.push(ISHML.Interpretation(revisedCandidate.gist,revisedCandidate.remainder))
					}
					counter = 1
					while (counter<=rule.maximum)
					{
						if(revisedCandidate.remainder.length>0)
						{
							var snippets=rule.parse(revisedCandidate.remainder)
							//add snippets to revised candidates
							if (snippets)
							{
								snippets.forEach((snippet)=>
								{
									if (snippet)
									{
										revisedCandidate.remainder=snippet.remainder										
										if (!this[key].skip)
										{	
											if (!revisedCandidate.gist[counter-1]){revisedCandidate.gist[counter-1]={}}
											revisedCandidate.gist[counter-1][key]=snippet.gist	
											if (counter>=rule.minimum)
											{
												choices.push(ISHML.Interpretation(revisedCandidate.gist,revisedCandidate.remainder))
											}	
										}	
									}
								})
							}
						}
						counter++
					}
				})  // choice of rule list
			})
			candidates=choices
			choices=[]		
		})
		if (this.maximum===1)
		{
			candidates.forEach((candidate)=>
			{
				candidate.gist=candidate.gist[0]
			})
		}
		return candidates
	}
}
ISHML.Rule.prototype.sequence =function(key,rule)
{
	if (rule instanceof ISHML.rule)
	{
		this[key]=rule.clone()
	}
	else
	{
		this[key]=new ISHML.rule()
	}	
	return this		
}