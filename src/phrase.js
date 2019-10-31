ishml.Phrase=function Phrase() 
{
	if (this instanceof ishml.Phrase)
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
		Object.defineProperty(this, "mode", {value:0, writable: true})
		Object.defineProperty(this, "semantics", {value:(interpretation)=>true, writable: true})
		Object.defineProperty(this, "separator", {value:/^\s/, writable: true})
		Object.defineProperty(this, "regex", {value:false, writable: true})
		return this
	}
	else
	{
		return new Phrase()
	}
}

ishml.Phrase.prototype.clone =function()
{
	var circularReferences=new Set()

	function _clone(phrase)
	{
		var clonedPhrase= new ishml.Phrase().configure({caseSensitive:phrase.caseSensitive, filter:phrase.filter, full:phrase.full, greedy:phrase.greedy, keep:phrase.keep, lax:phrase.lax, longest:phrase.longest, minimum:phrase.minimum, maximum:phrase.maximum, mode:phrase.mode, regex:phrase.regex, semantics:phrase.semantics, separator:phrase.separator})
		var entries=Object.entries(phrase)
		entries.forEach(([key,value])=>
		{
			if (circularReferences.has(value))
			{
				clonedPhrase[key]=value
			}
			else
			{
				circularReferences.add(value)
				clonedPhrase[key]=_clone(value)
			}
			
		})
		return clonedPhrase
	}	
	return _clone(this)
}	
ishml.Phrase.prototype.configure =function({caseSensitive, filter, full, greedy, keep, lax, longest, minimum,maximum, mode, regex, semantics, separator}={})
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
ishml.Phrase.prototype.parse =function(text,lexicon)
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
								
								console.log(problem)	
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
								console.log(problem)
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
							console.log(problem)
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
		var phrase = this
		while (counter<this.maximum)
		{
			revisedCandidates.forEach(({gist,remainder})=>
			{
				//SNIP
				if (remainder.length>0)
				{
					var snippets=lexicon.search(remainder, {regex:phrase.regex,separator:phrase.separator, lax:phrase.lax, caseSensitive:phrase.caseSensitive, longest:phrase.longest, full:phrase.full})

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
ishml.Phrase.prototype.say =function(key,phrase)
{
//DEFECT:Should be using arrays.
	if (phrase instanceof ishml.Phrase)
	{
		this[key]=phrase
	}
	else
	{
		this[key]=new ishml.Phrase()

		this[key].caseSensitive=this.caseSensitive
		this[key].full=this.full
		this[key].lax=this.lax
		this[key].longest=this.longest
		this[key].separator=this.separator
		
	}	
	return this		
}