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

ISHML.Lexicon.prototype.unregister=function(term,definition)
{
	var _term=term.toLowerCase()
	var _trie = this.trie
	var j=0
	for (let i=0; i < _term.length; i++)
	{
		var character=_term.charAt(i)
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
			var mismatch=Object.entries(definition).some(([key,value])=>
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

ISHML.Lexicon.prototype.lookup = function (term) 
{
	var _trie = this.trie
	var j=0
	for (let i=0; i < term.length; i++)
	{
		var character=term.charAt(i).toLowerCase()
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
	var _as =function(definition)
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
			_trie.definitions.push(definition)
		})	
		return this
	}	
	return {as:_as.bind(this)}	
}
ISHML.Lexicon.prototype.search = function (lexeme, {separator=/[\,|\.|;|\!|\?|\s]/, greedy=false}={}) 
{
	var _trie = this.trie
	var _results = []
	var j=0

	//trim leading separators.
	while(separator.test(lexeme[j])){j++}

	for (let i=j; i < lexeme.length; i++)
	{
			var character=lexeme.charAt(i).toLowerCase()
			if ( ! _trie[character])
			{
				if(greedy){return _results.slice(0,1)}
				else{return _results}
				
			}
			else
			{	
				if (_trie[character].definitions)
				{
					if (i<lexeme.length-1 && separator.test(lexeme.substring(i+1)))
					{	
						var result={definitions:_trie[character].definitions.slice(0)}
						result.remainder=lexeme.substring(i+1).slice(0)
						result.lexeme=lexeme.substring(0,i+1).slice(0)
						_results.unshift(result)
					}
					else if (i===lexeme.length-1)
					{
						var result={}
						result.definitions=_trie[character].definitions.slice(0)
						result.remainder=""
						result.lexeme=lexeme.slice(0)
						_results.unshift(result)
					}
				}
				_trie = _trie[character]
			}
	}
	
	if(greedy){return _results.slice(0,1)}
	else{return _results}
}


ISHML.Lexicon.prototype.tokenize  = function (text, {separator=/[\,|\.|;|\!|\?|\s]/, fuzzy=false,greedy=false,smooth=false}={})
{
	var candidates=[{tokens:[],remainder:text}]
	var revisedCandidates
	var results={}
	results.complete=[]
	results.partial=[]

	
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
						result.remainder=entries[j].remainder.replace(separator,"")
						
						if (result.remainder.length>0)
						{
							revisedCandidates.push(result)
						}
						else
						{
							results.complete.push(result)
						}	
					}	
				}
				else
				{
					if (fuzzy || smooth)
					{
						var result={}
						var k=0
						var fuzz=""

						while( k < candidates[i].remainder.length && !separator.test(candidates[i].remainder[k])  )
						{
							fuzz=`${fuzz}${candidates[i].remainder[k]}`
							k++
						}
						result.tokens=candidates[i].tokens.slice(0)
						if(fuzzy)
						{
							var token={definitions:[{fuzz:fuzz}],lexeme:fuzz}
							result.tokens.push(token)
						}
						result.remainder=candidates[i].remainder.slice(k).replace(separator,"")

						if (result.remainder.length>0)
						{
							revisedCandidates.push(result)
						}
						else
						{
							results.complete.push(result)
						}

					}
					else
					{
						var result={}
						
						result.tokens=candidates[i].tokens.slice(0)
						result.remainder=candidates[i].remainder.slice(0)
						results.partial.push(result)
					}
				}
			}
		}
		candidates=revisedCandidates
	}	
	return results
}