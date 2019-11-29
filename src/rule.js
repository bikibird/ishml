ishml.Rule=function Rule() 
{
	if (this instanceof ishml.Rule)
	{
		Object.defineProperty(this, "caseSensitive", {value:false, writable: true})
		Object.defineProperty(this, "full", {value:false, writable: true})
		Object.defineProperty(this, "filter", {value:(definition)=>true, writable: true})
		Object.defineProperty(this, "greedy", {value:false, writable: true})
		Object.defineProperty(this, "keep", {value:true, writable: true})
		Object.defineProperty(this, "lax", {value:false, writable: true})
		Object.defineProperty(this, "longest", {value:false, writable: true})
		Object.defineProperty(this, "minimum", {value:1, writable: true})
		Object.defineProperty(this, "maximum", {value:1, writable: true})
		Object.defineProperty(this, "mode", {value:ishml.enum.mode.all, writable: true})
		Object.defineProperty(this, "semantics", {value:(interpretation)=>true, writable: true})
		Object.defineProperty(this, "separator", {value:/^\s/, writable: true})
		Object.defineProperty(this, "regex", {value:false, writable: true})
		return this
	}
	else
	{
		return new Rule()
	}
}

ishml.Rule.prototype.clone =function()
{
	var circularReferences=new Set()

	function _clone(rule)
	{
		var clonedRule= new ishml.Rule().configure({caseSensitive:rule.caseSensitive, filter:rule.filter, full:rule.full, greedy:rule.greedy, keep:rule.keep, lax:rule.lax, longest:rule.longest, minimum:rule.minimum, maximum:rule.maximum, mode:rule.mode, regex:rule.regex, semantics:rule.semantics, separator:rule.separator})
		var entries=Object.entries(rule)
		entries.forEach(([key,value])=>
		{
			if (circularReferences.has(value))
			{
				clonedRule[key]=value
			}
			else
			{
				circularReferences.add(value)
				clonedRule[key]=_clone(value)
			}
			
		})
		return clonedRule
	}	
	return _clone(this)
}	
ishml.Rule.prototype.configure =function({caseSensitive, filter, full, greedy, keep, lax, longest, minimum,maximum, mode, regex, semantics, separator}={})
{

	if(caseSensitive !== undefined){this.caseSensitive=caseSensitive}
	if(filter !== undefined){this.filter=filter}
	if(full !== undefined){this.full=full}
	if(greedy !== undefined){this.greedy=greedy}
	if(keep !== undefined){this.keep=keep}
	if(lax !== undefined){this.lax=lax}
	if(longest !== undefined){this.longest=longest}
	if(minimum !== undefined){this.minimum=minimum}
	if(maximum !== undefined){this.maximum=maximum}
	if(mode !== undefined){this.mode=mode}
	if(regex !== undefined){this.regex=regex}
	if(semantics !== undefined){this.semantics=semantics}
	if(separator !== undefined){this.separator=separator}
	return this
}
ishml.Rule.prototype.parse =function(text,lexicon)
{
	var someText=text.slice(0)
	var results=[]
	var problem=false
	var keys=Object.keys(this)
	if (keys.length>0)
	//non-terminal
	{
		switch (this.mode) 
		{
			case ishml.enum.mode.all:
				if (this.maximum ===1 ){var candidates=[new ishml.Interpretation({},someText)]}
				else {var candidates=[new ishml.Interpretation([],someText)]}
				var counter = 0
				var phrases=[]
				var revisedCandidates=candidates.slice(0)
				while (counter<this.maximum)
				{
					for (let key of keys)
					{
						revisedCandidates.forEach(({gist,remainder=false})=>
						{	
							//SNIP
							if (remainder.length>0)
							{
								var {snippets,error}=this[key].parse(remainder.slice(0),lexicon) 
								snippets.forEach((snippet)=>
								{
									var phrase=new ishml.Interpretation(gist,snippet.remainder)
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
								if (snippets.length===0)
								{
									
									if (error.error)
									{
										if(!problem)
										{
											problem={error:{}}
										}
										problem.error[key]=error.error
									}
								}
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
			case ishml.enum.mode.any:
					if (this.maximum ===1 ){var candidates=[new ishml.Interpretation({},someText)]}
					else {var candidates=[new ishml.Interpretation([],someText)]}
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
								if (remainder.length>0)
								{
									var {snippets,error}=this[key].parse(remainder.slice(0),lexicon) 
									snippets.forEach((snippet)=>
									{
										var phrase=new ishml.Interpretation(gist,snippet.remainder)
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
								if (snippets.length===0)
								{
									
									if (error.error)
									{
										if(!problem)
										{
											problem={error:{}}
										}
										problem.error[key]=error.error
									}
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
			case ishml.enum.mode.apt:
				if (this.maximum ===1 ){var candidates=[new ishml.Interpretation({},someText)]}
				else {var candidates=[new ishml.Interpretation([],someText)]}
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
							if (remainder.length>0)
							{
								var {snippets,error}=this[key].parse(remainder.slice(0),lexicon) 
								snippets.forEach((snippet)=>
								{
									var phrase=new ishml.Interpretation(gist,snippet.remainder)
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
							if (snippets.length===0 )
							{
								
								if (error.error)
								{
									if(!problem)
									{
										problem={error:{}}
									}
									problem.error[key]=error.error
								}
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

		if (this.maximum ===1 ){var candidates=[new ishml.Interpretation({},someText)]}
		else {var candidates=[new ishml.Interpretation([],someText)]}
		var revisedCandidates=candidates.slice(0)
		
		var counter = 0
		var phrases=[]
		var rule = this
		while (counter<this.maximum)
		{
			revisedCandidates.forEach(({gist,remainder})=>
			{
				//SNIP
				if (remainder.length>0)
				{
					var snippets=lexicon.search(remainder, {regex:rule.regex,separator:rule.separator, lax:rule.lax, caseSensitive:rule.caseSensitive, longest:rule.longest, full:rule.full})

					snippets.forEach((snippet)=>
					{
						snippet.token.definitions=snippet.token.definitions.filter(this.filter)
						if (snippet.token.definitions.length>0)
						{
							var phrase=new ishml.Interpretation(gist,snippet.remainder)
							if (this.maximum ===1 )
							{
								if(this.keep){phrase.gist=snippet.token}
							}
							else 
							{
								if(phrase.gist.length===counter){phrase.gist.push({})}
								if(this.keep){phrase.gist[counter]=snippet.token}
							}
							phrases.push(phrase)
						}	
					})
					if (snippets.length===0  && counter < this.minimum)
					{
						if(!problem)
						{
							problem={error:remainder}
						}
						

					}
					
				}
			})

			revisedCandidates=phrases.slice(0)
			phrases=[]
			counter++
			if (revisedCandidates.length===0)
			{
				
				break
			}
			else
			{
				if (this.greedy){results=revisedCandidates.slice(0)}
				else {results=results.concat(revisedCandidates)}
			}
		}
		
	}	
	if (results.length>0)
	{	
		return {snippets:results.reduce((revisedResults, interpretation) =>
		{
			var revisedInterpretation=this.semantics(interpretation)
			if (revisedInterpretation)
			{
				if (revisedInterpretation === true)
				{
					interpretation.error=problem.error
					revisedResults.push(interpretation)
				}
				else
				{
					revisedInterpretation.error=problem.error
					revisedResults.push(revisedInterpretation)
				}
			}
			return revisedResults

		},[]),error:problem}
	}
	else
	{
		return {snippets:[], error:problem}
	}	
}
ishml.Rule.prototype.snip =function(key,rule)
{
	if (typeof key !== "number")
	{
		var formattedKey=key.replace(/\s+/g, '_')
	}
	else
	{
		var formattedKey=key
	}

	if (rule instanceof ishml.Rule)
	{
		this[formattedKey]=rule
	}
	else
	{
		this[formattedKey]=new ishml.Rule()

		this[formattedKey].caseSensitive=this.caseSensitive
		this[formattedKey].full=this.full
		this[formattedKey].lax=this.lax
		this[formattedKey].longest=this.longest
		this[formattedKey].separator=this.separator
		
	}	
	return this		
}