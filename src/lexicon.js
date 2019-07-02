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

ISHML.Lexicon.prototype.register = function (...someLexemes) 
{
	var lexemes=someLexemes
	var _as =function(definition)
	{
		lexemes.forEach((lexeme)=>
		{
			var _trie = this.trie
			for (let i = 0, length =lexeme.length; i < length; i++)
			{
				var character = lexeme.charAt(i)
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
ISHML.Lexicon.prototype.search = function (lexeme, {separator=/\s/, lax=false, caseSensitive=false, greedy=false, full=false}={}) 
{
	var _trie = this.trie
	var _results = []
	var j=0

	//trim leading separators.
	if (separator){while(separator.test(lexeme[j])){j++}}

	for (let i=j; i < lexeme.length; i++)
	{
		if (caseSensitive){var character=lexeme.charAt(i)}
		else{var character=lexeme.charAt(i).toLowerCase()}
		if ( ! _trie[character])
		{	
			if(greedy|full)
			{
				_results= _results.slice(0,1)
				if(full && _results[0].remainder.length>0 ){_results=[]}
				else { return _results}
			}
		}
		else
		{	
			if (_trie[character].definitions)
			{
				if (i<lexeme.length-1)
				{	
					if (lax || (separator===false) || (separator && separator.test(lexeme.substring(i+1))))
					{
						var result={}
						result.token=new ISHML.Token(lexeme.substring(0,i+1),_trie[character].definitions)
						result.remainder=lexeme.substring(i+1).slice(0)
						_results.unshift(result)
					}
				}
				else // if (i===lexeme.length-1) 
				{
					var result={}
					result.token=new ISHML.Token(lexeme,_trie[character].definitions)
					result.remainder=""
					_results.unshift(result)
				}
			}
			_trie = _trie[character]
		}
	}
	
	if(greedy|full)
	{
		_results= _results.slice(0,1)
		if(full && _results[0].remainder.length>0 ){_results=[]}
	}
	return _results
}
ISHML.Lexicon.prototype.tokenize  = function (text, {separator=/\s/, lax=false, caseSensitive=false, full=false, fuzzy=false,greedy=false,smooth=false}={})
{
	var candidates=[new ISHML.Tokenization([],text)]
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
				var entries=this.search(candidates[i].remainder,{full:full,greedy:greedy, lax:lax, caseSensitive:caseSensitive,separator:separator})
				if (entries.length>0)
				{	
					for (var j =0; j < entries.length; j++)
					{	

						var result=new ISHML.Tokenization(candidates[i].tokens)
						var token=entries[j].token
						result.tokens.push(token)
						if(separator){result.remainder=entries[j].remainder.replace(separator,"")}
						else{result.remainder=entries[j].remainder}
						
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
						var k=0
						var fuzz=""
						if (separator)
						{
							while( k < candidates[i].remainder.length && !separator.test(candidates[i].remainder[k])  )
							{
								
								fuzz=`${fuzz}${candidates[i].remainder[k]}`
								k++
							}
						}
						else 
						{
							fuzz=candidates[i].remainder[k]
							k=1
						}
						var result=new ISHML.Tokenization(candidates[i].tokens)
						if(fuzzy)
						{
							var token=new ISHML.Token(fuzz,[{fuzz:fuzz}])
							result.tokens.push(token)
						}
						if(separator){result.remainder=candidates[i].remainder.slice(k).replace(separator,"")}
						else {result.remainder=candidates[i].remainder.slice(k)}

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
						var result=new ISHML.Tokenization(candidates[i].tokens,candidates[i].remainder)
						results.partial.push(result)
					}
				}
			}
		}
		candidates=revisedCandidates
	}	

	return results
}
ISHML.Lexicon.prototype.unregister=function(lexeme,definition)
{
	var _lexeme=lexeme.toLowerCase()
	var _trie = this.trie
	var j=0
	for (let i=0; i < _lexeme.length; i++)
	{
		var character=_lexeme.charAt(i)
		if ( ! _trie[character])
		{
			return this
		}
		else
		{	
			_trie = _trie[character]
		}
	}
	if (definition !== undefined)
	{
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
			if (_trie.definitions.length===0 )
			{
				delete _trie.definitions
			}
		}
	}
	else
	{
		delete _trie.definitions
	}
	return this	
}