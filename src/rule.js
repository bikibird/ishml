ISHML.Rule=function Rule(key) 
{
	if (this instanceof ISHML.Rule)
	{
		Object.defineProperty(this, "key", {value:key||"gist", writable: true})
		Object.defineProperty(this, "minimum", {value:1, writable: true})
		Object.defineProperty(this, "maximum", {value:1, writable: true})
		Object.defineProperty(this, "mode", {value:0, writable: true})
		Object.defineProperty(this, "filter", {value:()=>true, writable: true})
		Object.defineProperty(this, "semantics", {value:()=>true, writable: true})
		return this
	}
	else
	{
		return new Rule()
	}
}
ISHML.Rule.prototype.add =function(key,rule)
{
	if (rule instanceof ISHML.Rule)
	{
		this[key]=rule.clone()
	}
	else
	{
		this[key]=new ISHML.Rule()
	}	
	return this		
}
ISHML.Rule.prototype.enum={sequence:0,choose:1,skip:2}
ISHML.Rule.prototype.choice =function(key,size,rule)
{
	this[key]=[]
	for (let i = 0; i< size; i++)
	{
		if (rule instanceof ISHML.Rule)
		{
			this[key].push(rule.clone())
		}
		else
		{
			this[key].push(new ISHML.Rule())
		}
	}
}
ISHML.Rule.prototype.clone =function()
{
	var clonedRule= new ISHML.Rule().configure({minimum:this.minimum,maximum:this.maximum,filter:this.filter})
	var entries=Object.entries(this)
	entries.forEach(([key,value])=>
	{
		if (value instanceof ISHML.Rule)
		{
			clonedRule[key]=value.clone()
		}
		else if (value instanceof Array)
		{
			clonedRule[key]=[]
			value.forEach((rule)=>
			{
				clonedRule[key].push(rule.clone())
			})
		} 
	})
	return clonedRule
}	
ISHML.Rule.prototype.configure =function({minimum,maximum,mode,filter,semantics}={})
{
	if(minimum !== undefined){this.minimum=minimum}
	if(maximum !== undefined){this.maximum=maximum}
	if(maximum !== undefined){this.mode=mode}
	if(filter !== undefined){this.filter=filter}
	if(semantics !== undefined){this.semantics=semantics}
	return this
}
/*ISHML.Rule.prototype.parse =function(someTokens)
{
	var counter
	var candidates=[]
	var keys=Object.keys(this)
	if (keys.length===0)
	//terminal
	{
		var candidate=new ISHML.Interpretation([],someTokens)
		var token =	{definitions:candidate.remainder[0].definitions.filter(this.filter), lexeme:candidate.remainder[0].lexeme.slice(0)}
		if (token.definitions.length>0)
		{
			candidate.gist.push(token)
			candidate.remainder=candidate.remainder.slice(1)
			candidates.push(candidate)
			return candidates
		}
		else {return false}		
	}
	else
	//non terminal
	{	
		var candidates=[new ISHML.Interpretation([],someTokens)]
		
		keys.forEach((key)=>
		{
			//for each part
			//convert properties into an array of subrules
			var ruleList=[].concat([],this[key]) //Each sub rule has one or more choices
			var choices=[]
			ruleList.forEach((rule)=> //for each choice
			{
				candidates.forEach((candidate)=>
				{
					var revisedCandidate=new ISHML.Interpretation(candidate.gist,candidate.remainder)
					if (rule.minimum===0)
					{
						choices.push(new ISHML.Interpretation(revisedCandidate.gist,revisedCandidate.remainder))
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
										if (!revisedCandidate.gist[key]){revisedCandidate.gist[key]=[]}
										revisedCandidate.gist[key]=revisedCandidate.gist[key].concat(snippet.gist)
										if (counter>=rule.minimum)
										{
											choices.push(new ISHML.Interpretation(revisedCandidate.gist,revisedCandidate.remainder))
										}	
									}	
								})
							}
							else
							{
								//no match
								break
							}
						}
						else
						{
							//no remainder left
							break
						}
						counter++
					}
				})  // for each choice 
				candidates=choices
			})// for each part
		})
		//TO DO: add semantic check on candidates
		return candidates
	}
}*/
ISHML.Rule.prototype.parse =function(someTokens)
{
	//var interpretations=someInterpretations.slice(0)
	var remainder=someTokens.slice(0)
	var results=[]
	var keys=Object.keys(this)
	if (keys.length===0)
	{
	//terminal
/*	if (this.minimum===0)
	{
		if(this.maximum===1)
		{
			results.push({gist:{},remainder:remainder.slice(0)})
		}
		else
		{
			results.push({gist:[],remainder:remainder.slice(0)})
		}
	}*/
		var counter=1
		var repetition=[]
		while (counter<=this.maximum)
		{
			var token =	{definitions:remainder[0].definitions.filter(this.filter), lexeme:remainder[0].lexeme.slice(0)}
			if (token.definitions.length>0)
			{
				repetition.push(token)
				if (counter>=this.minimum)
				{
					if (this.maximum===1)
					{
						results.push({gist:token,remainder:remainder.slice(1)})
					}
					else
					{
						results.push({gist:repetition,remainder:remainder.slice(1)})
					}	
				}
				remainder=remainder.slice(1)
			}
			else {break}
			counter++
		}
	//if (results.length ===0){results=[false]}

console.log("terminal",results)
	return results
	}	
	else
	//non-terminal
	{
		switch (this.mode) 
		{
			case this.enum.sequence:
			var candidates=[{gist:{},remainder:remainder.slice(0)}]
			keys.forEach((key)=>
			{
				candidates.forEach(({gist,remainder})=>
				{
					var snippets=this[key].parse(remainder.slice(0))  //snippet={gist, remainder}
					if (snippets.length===0 && this[key].minimum===0)
					{
						results.push({gist:gist,remainder:remainder.slice(0)})
					}
					else
					{
						snippets.forEach((snippet)=>
						{
							if (snippet)
							{
								var result={}
								result.gist=Object.assign({},gist)
								result.gist[key]=Object.assign({},snippet.gist)
								result.remainder=snippet.remainder.slice(0)
								results.push(result)
							}
							else
							{
								if (this.key.minimum===0)
								{
									result.gist=Object.assign({},gist)
									result.remainder=remainder.slice(0)
								}
							}

						})
					}	
				})
				candidates=results
				results=[]
			})
			results=candidates
			console.log("non terminal",results)
			break
		}
		return results
	}	
	
}

ISHML.Rule.prototype.snip =function(interpretations=[])
{
	var keys=Object.keys(this)
	var candidates=[]
	interpretations.forEach(({gist,remainder})=>{
		var result
		if (keys.length===0)
		//terminal
		{
			var token =	{definitions:remainder[0].definitions.filter(this.filter), lexeme:remainder[0].lexeme.slice(0)}
			if (token.definitions.length>0)
			{
				result={gist:token,remainder:remainder.slice(1)}
			}
		}
		else
		//non-terminal
		{
			keys.forEach((key)=>
			{
				var snippet=this[key].parse(remainder)  //snippet=gist, remainder
				if (snippet)
				{
					switch (this.mode) 
					{
						case this.enum.sequence:
							result[key]={gist:snippet.gist,remainder:snippet.remainder.slice(0)}
							remainder=snippet.remainder.slice(0)
							break
						case this.enum.choose:
						//does not advance remainder
							result[key]={gist:snippet.gist,remainder:snippet.remainder.slice(0)}
							break
						case this.enum.skip:
							result.remainder=snippet.remainder.slice(0)
							remainder=snippet.remainder.slice(0)
						break	
					}
				}
			})

		}
	})
	return candidates
}
ISHML.Rule.prototype.sequence =function(key,rule)
{
	if (rule instanceof ISHML.Rule)
	{
		this[key]=rule.clone()
	}
	else
	{
		this[key]=new ISHML.Rule()
	}	
	return this		
}