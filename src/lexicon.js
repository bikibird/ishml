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
ISHML.Lexicon.prototype.search = function (searchText, {regex=false,separator=/^\s+/, lax=false, caseSensitive=false, longest=false, full=false}={}) 
{
	var _trie = this.trie
	var _results = []
	
	//trim leading separators.
	if (separator && separator.test(searchText))
	{
		var trimmedText=searchText.split(separator,2)[1]
	}
	else
	{
		var trimmedText=searchText
	}
	if(regex)
	{
		var match=trimmedText.match(regex)
		if (match)
		{
			var result={}
			var definitions=[]
			definitions[0]={fuzzy:true}
			result.token=new ISHML.Token(match[1],definitions)
			result.remainder=match[2]
			_results.push(result)

		}
		return _results
		
	}
	else
	{
		
		for (let i=0; i < trimmedText.length; i++)
		{
			if (caseSensitive){var character=trimmedText.charAt(i)}
			else{var character=trimmedText.charAt(i).toLowerCase()}
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
				if (_trie[character].definitions)
				{
					if (i<trimmedText.length-1)
					{	
						if (lax || (separator===false) || (separator && separator.test(trimmedText.substring(i+1))))
						{
							var result={}
							result.token=new ISHML.Token(trimmedText.substring(0,i+1),_trie[character].definitions)
							result.remainder=trimmedText.substring(i+1).slice(0)
							_results.unshift(result)
						}
					}
					else // if (i===trimmedtext.length-1) 
					{
						var result={}
						result.token=new ISHML.Token(trimmedText.substring(0),_trie[character].definitions)
						result.remainder=""
						_results.unshift(result)
					}
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