"use strict"
var ISHML = ISHML || {}
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
ISHML.Lexicon=function Lexicon() 
{
	if (this instanceof ISHML.Lexicon)
	{

		Object.defineProperty(this, "trie", {value:{},writable: true})
		return this
	}
	else
	{
		return new Lexicon()
	}
}

ISHML.Lexicon.prototype.unregister=function(aTerm,aDefinition)
{
	var term=aTerm.toLowerCase()
	var _trie = this.trie
	var j=0
	for (let i=0; i < term.length; i++)
	{
		var character=term.charAt(i)
		if ( ! _trie[character])
		{
			return []
		}
		else
		{	
			_trie = _trie[character]
		}
	}
	if (_trie.hasOwnProperty("definitions"))
	{
		_trie.definitions=_trie.definitions.filter((def)=>
		{
			var mismatch=Object.entries(aDefinition).some(([key,value])=>
			{
				if(def[key]!==value)
				{
					return true
				}
			})
			if (mismatch){return true}
			else {return false}	
		})
		if (_trie.definitions.length===0)
		{
			delete _trie.definitions
		}
	}	
}

ISHML.Lexicon.prototype.lookup = function (aTerm) 
{
	var _trie = this.trie
	var j=0
	for (let i=0; i < aTerm.length; i++)
	{
		var character=aTerm.charAt(i).toLowerCase()
		if ( ! _trie[character])
		{
			return []
		}
		else
		{	
			_trie = _trie[character]
		}
	}
	return _trie.definitions||[]
}
ISHML.Lexicon.prototype.register = function (...someTerms) 
{
	var terms=someTerms
	var _as =function(aDefinition)
	{
		terms.forEach((term)=>
		{
			var _trie = this.trie
			for (let i = 0, length =term.length; i < length; i++)
			{
				var character = term.charAt(i)
				_trie = (_trie[character] =_trie[character] || {})
			}
			if (!_trie.definitions)
			{
				_trie.definitions= []
			}
			_trie.definitions.push(aDefinition)
		})	
		return this
	}	
	return {as:_as.bind(this)}	
}
ISHML.Lexicon.prototype.search = function (aLexeme, {aSeparator=/[\,|\.|;|\!|\?|\s]/, greedy=false}={}) 
{
	var _trie = this.trie
	var _results = []
	var j=0

	//trim leading separators.
	while(aSeparator.test(aLexeme[j])){j++}

	for (let i=j; i < aLexeme.length; i++)
	{
			var character=aLexeme.charAt(i).toLowerCase()
			if ( ! _trie[character])
			{
				if(greedy){return _results.slice(0,1)}
				else{return _results}
				
			}
			else
			{	
				if (_trie[character].definitions)
				{
					if (i<aLexeme.length-1 && aSeparator.test(aLexeme.substring(i+1)))
					{	
						var result={definitions:_trie[character].definitions.slice(0)}
						result.remainder=aLexeme.substring(i+1).slice(0)
						result.lexeme=aLexeme.substring(0,i+1).slice(0)
						_results.unshift(result)
					}
					else if (i===aLexeme.length-1)
					{
						var result={}
						result.definitions=_trie[character].definitions.slice(0)
						result.remainder=""
						result.lexeme=aLexeme.slice(0)
						_results.unshift(result)
					}
				}
				_trie = _trie[character]
			}
	}
	
	if(greedy){return _results.slice(0,1)}
	else{return _results}
}


ISHML.Lexicon.prototype.tokenize  = function* (aText, {aSeparator=/[\,|\.|;|\!|\?|\s]/, fuzzy=false,greedy=false}={})
{
	var candidates=[{tokens:[],remainder:aText}]
	var revisedCandidates
	while(candidates.length>0)
	{
		revisedCandidates=[]
		for (var i =0; i < candidates.length; i++)
		{	
			if (candidates[i].remainder.length>0)
			{
				var entries=this.search(candidates[i].remainder,{greedy:greedy})
				if (entries.length>0)
				{	
					for (var j =0; j < entries.length; j++)
					{	

						var result={}
						var token={definitions:entries[j].definitions,lexeme:entries[j].lexeme}

						result.tokens=candidates[i].tokens.slice(0)
						result.tokens.push(token)
						result.remainder=entries[j].remainder.replace(aSeparator,"")
						
						if (result.remainder.length>0)
						{
							revisedCandidates.push(result)
						}
						else
						{
							delete result.remainder
							console.log(result)
							yield result
						}	
					}	
				}
				else
				{
					if (fuzzy)
					{
						var result={}
						var k=0
						var fuzz=""

						while( k < candidates[i].remainder.length && !aSeparator.test(candidates[i].remainder[k])  )
						{
							fuzz=+candidates[i].remainder[k]
							k++
						}

						var definitions=[]
						defintions[0]={fuzz:fuzz,lexeme:fuzz}
						var token={definitions:definitions,lexeme:entries[j].lexeme}

						result.tokens=candidates[i].tokens.slice(0)
						result.tokens.push(token)
						result.remainder=candidates[i].remainder.slice(k).replace(aSeparator,"")

					}
					//else throw away candidate
				}
			}
		}
		candidates=revisedCandidates
	}	
}
ISHML.Rule=function Rule(key) 
{
	if (this instanceof ISHML.Rule)
	{
		Object.defineProperty(this, "minimum", {value:1, writable: true})
		Object.defineProperty(this, "maximum", {value:1, writable: true})
		Object.defineProperty(this, "mode", {value:0, writable: true})
		Object.defineProperty(this, "filter", {value:()=>true, writable: true})
		Object.defineProperty(this, "semantics", {value:({gist,remainder})=>true, writable: true})
		return this
	}
	else
	{
		return new Rule(key)
	}
}

ISHML.Rule.prototype.enum={snap:0,pick:1,skip:2}

ISHML.Rule.prototype.clone =function()
{
	var clonedRule= new ISHML.Rule().configure({minimum:this.minimum,maximum:this.maximum,
		mode:this.mode,filter:this.filter, semantics:this.semantics})
	var entries=Object.entries(this)
	entries.forEach(([key,value])=>{clonedRule[key]=value.clone()})
	return clonedRule
}	
ISHML.Rule.prototype.configure =function({minimum,maximum,mode,filter,semantics}={})
{
	if(minimum !== undefined){this.minimum=minimum}
	if(maximum !== undefined){this.maximum=maximum}
	if(mode !== undefined){this.mode=mode}
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
					phrase.gist[key]=snippet.gist
					phrase.remainder=snippet.remainder.slice(0)
				}
				else 
				{
					phrase.gist=gist.slice(0)
					if(phrase.gist.length===counter){phrase.gist.push({})}
					phrase.gist[counter][key]=snippet.gist
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
							//if (this[key].minimum===0){phrases.push({gist:gist,remainder:remainder.slice(0)})}
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
