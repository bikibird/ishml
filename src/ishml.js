"use strict"
var ISHML = ISHML || {}
//TO DO: composer function
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

	}	
}
ISHML.Rule=function Rule({minimum=1,maximum=1,skip=false,filter}={}) 
{
	if (this instanceof ISHML.Rule)
	{
		Object.defineProperty(this, "minimum", {value:minimum,writable: true})
		Object.defineProperty(this, "maximum", {value:maximum,writable: true})
		Object.defineProperty(this, "skip", {value:skip,writable: true})
		Object.defineProperty(this, "filter", {value:filter,writable: true})
		return this
	}
	else
	{
		return new Rule({minimum, maximum, skip, filter})
	}
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
