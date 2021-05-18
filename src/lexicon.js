ishml.Lexicon=function Lexicon() 
{
	if (this instanceof ishml.Lexicon)
	{

		Object.defineProperty(this, "trie", {value:{},writable: true})
		return this
	}
	else
	{
		return new Lexicon()
	}
}

ishml.Lexicon.prototype.register = function (...someLexemes) 
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
ishml.Lexicon.prototype.register = function (...someLexemes) 
{
	var lexemes=someLexemes
	var _as =function(...definitions)
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
			_trie.definitions=_trie.definitions.concat(definitions)
		})	
		return this
	}	
	return {as:_as.bind(this)}	
}
/*ishml.Lexicon.prototype.define = function (definition,...someLexemes) 
{
	someLexemes.forEach((lexeme)=>
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
}*/
ishml.Lexicon.prototype.search = function (searchText, {regex=false,separator=/^\s+/, caseSensitive=false, longest=false, full=false}={}) 
{
	var _trie = this.trie
	var _results = []
	if(regex)
	{
		var match=searchText.match(regex)
		if (match)
		{
			var result={}
			var definitions=[]
			definitions[0]={fuzzy:true}
			result.token=new ishml.Token(match[0],definitions)
			result.remainder=searchText.slice(match[0].length)
			if (separator && result.remainder.length>0)
			{
				var discard=result.remainder.match(separator)
				if (discard !== null)
				{
					if (discard[0] !==""){result.remainder=result.remainder.slice(discard[0].length)}
					_results.unshift(result)
				}
			}
			else
			{
				_results.unshift(result)
			}
			
		}
		return _results
	}
	else
	{
		for (let i=0; i < searchText.length; i++)
		{
			if (caseSensitive){var character=searchText.charAt(i)}
			else{var character=searchText.charAt(i).toLowerCase()}
			if ( ! _trie[character])
			{	
				if(longest|full)
				{
					_results= _results.slice(0,1)
					if(full && _results[0].remainder.length>0 ){_results=[]}
					else { return _results}
				}
				else
				{
					return _results
				}
			}
			else
			{	
				if(_trie[character].definitions)
				{
					_trie[character].definitions.forEach(definition=>
					{
						if (i<searchText.length-1)
						{	
							
							var result={}
							result.token=new ishml.Token(searchText.substring(0,i+1),definition)
							result.remainder=searchText.substring(i+1).slice(0)
							if (separator)
							{
								var discard=result.remainder.match(separator)
								if (discard !== null)
								{
									if (discard[0] !==""){result.remainder=result.remainder.slice(discard[0].length)}
									_results.unshift(result)
								}
							}
							else
							{
								_results.unshift(result)
							}
						}
						else
						{
							var result={}
							result.token=new ishml.Token(searchText.substring(0),definition)
							result.remainder=""
							_results.unshift(result)
						}	
					})
				}	
				_trie = _trie[character]
			}
		}
	}
	if(longest|full)
	{
		_results= _results.slice(0,1)
		if(full && _results[0].remainder.length>0 ){_results=[]}
	}
	return _results
}

ishml.Lexicon.prototype.unregister=function(lexeme,definition)
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