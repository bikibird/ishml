ISHML.Rule=function Rule(key) 
{
	if (this instanceof ISHML.Rule)
	{
		Object.defineProperty(this, "minimum", {value:1, writable: true})
		Object.defineProperty(this, "maximum", {value:1, writable: true})
		Object.defineProperty(this, "mode", {value:0, writable: true})
		Object.defineProperty(this, "keep", {value:true, writable: true})
		Object.defineProperty(this, "filter", {value:()=>true, writable: true})
		Object.defineProperty(this, "semantics", {value:({gist,remainder})=>true, writable: true})
		return this
	}
	else
	{
		return new Rule(key)
	}
}

ISHML.Rule.prototype.enum={snap:0,pick:1}

ISHML.Rule.prototype.clone =function()
{
	var clonedRule= new ISHML.Rule().configure({minimum:this.minimum,maximum:this.maximum,
		mode:this.mode,keep:this.keep,filter:this.filter, semantics:this.semantics})
	var entries=Object.entries(this)
	entries.forEach(([key,value])=>{clonedRule[key]=value.clone()})
	return clonedRule
}	
ISHML.Rule.prototype.configure =function({minimum,maximum,mode,keep,filter,semantics}={})
{
	if(minimum !== undefined){this.minimum=minimum}
	if(maximum !== undefined){this.maximum=maximum}
	if(mode !== undefined){this.mode=mode}
	if(keep !== undefined){this.keep=keep}
	if(filter !== undefined){this.filter=filter}
	if(semantics !== undefined){this.semantics=semantics}
	return this
}
ISHML.Rule.prototype.parse =function(someTokens)
{
	var snip=(phrases,key,counter,gist,remainder)=>
	{
		//snip updates phrases with results of parsing remainder against key
		//if (this[key].minimum===0){phrases.push({gist:gist,remainder:remainder.slice(0)})}
		if (remainder.length>0)
		{
			var snippets=this[key].parse(remainder.slice(0)) 
			snippets.forEach((snippet)=>
			{
				var phrase={}
				if (this.maximum ===1 )
				{
					phrase.gist=Object.assign({},gist)
					if(this[key].keep){phrase.gist[key]=snippet.gist}
					phrase.remainder=snippet.remainder.slice(0)
				}
				else 
				{
					phrase.gist=gist.slice(0)
					if(phrase.gist.length===counter){phrase.gist.push({})}
					if(this[key].keep){phrase.gist[counter][key]=snippet.gist}
					phrase.remainder=snippet.remainder.slice(0)
				}
				phrases.push(phrase)
			})
		}	
	}
	var remainder=someTokens.slice(0)
	var results=[]
	var keys=Object.keys(this)
	if (keys.length>0)
	//non-terminal
	{
		switch (this.mode) 
		{
			case this.enum.snap:
				if (this.maximum ===1 ){var candidates=[{gist:{},remainder:remainder.slice(0)}]}
				else {var candidates=[{gist:[],remainder:remainder.slice(0)}]}
				var counter = 0
				var phrases=[]
				if (this.minimum===0)
				{
					results=results.concat(candidates)
				}
				while (counter<this.maximum)
				{
					keys.forEach((key)=>
					{
						candidates.forEach(({gist,remainder})=>
						{	
							snip(phrases,key,counter,gist,remainder)  //snip updates phrases with results of parsing remainder against key
							if (this[key].minimum===0){phrases.push({gist:Object.assign({},gist),remainder:remainder.slice(0)})}
						})
						candidates=phrases.slice(0)
						phrases=[]
					})
					counter++
					if (candidates.length===0)
					{
						break
					}
					else
					{
						if (counter >= this.minimum)
						{
							results=results.concat(candidates)
						}
					}
				}	
				break
				
			case this.enum.pick:
				if (this.maximum ===1 ){var candidates=[{gist:{},remainder:remainder.slice(0)}]}
				else {var candidates=[{gist:[],remainder:remainder.slice(0)}]}

				if (this.minimum===0){results=results.concat(candidates)}
				
				keys.forEach((key)=>
				{
					var counter = 0
					var phrases=[]
					var revisedCandidates=candidates.slice(0)
					while (counter<this.maximum)
					{
						revisedCandidates.forEach(({gist,remainder})=>snip(phrases,key,counter,gist,remainder))
						revisedCandidates=phrases.slice(0)
						phrases=[]
						counter++
						if (revisedCandidates.length===0){break}
						else
						{
							if (counter >= this.minimum){results=results.concat(revisedCandidates)}
						}
					}	
				})	
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
			if (remainder.length>0)
			{
				var token =	{definitions:remainder[0].definitions.filter(this.filter), lexeme:remainder[0].lexeme.slice(0)}
				if (token.definitions.length>0)
				{
					repetitions.push(token)
					if (counter>=this.minimum)
					{
						if (this.maximum===1)
						{
							results.push({gist:token,remainder:remainder.slice(1)})
						}
						else
						{
							results.push({gist:repetitions.slice(0),remainder:remainder.slice(1)})
						}	
					}
					remainder=remainder.slice(1)
				}
				else {break}
				counter++
			}
			else {break}	
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
ISHML.Rule.prototype.part =function(key,rule)
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