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