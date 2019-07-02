"use strict"
/*
ISC License

Copyright 2019, Jennifer L Schmidt

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/

var ISHML = ISHML || {}
var Ishmael = Ishmael || ISHML  //Call me Ishmael.
ISHML.enum=ISHML.enum || {}
ISHML.enum.mode={all:0,any:1,apt:2} 
ISHML.Interpretation=function Interpretation(gist={},remainder)
{
	if (this instanceof ISHML.Interpretation)
	{
		if (gist instanceof Array)
		{
			this.gist=gist.slice(0)
		}
		else
		{
			if(gist instanceof ISHML.Token)
			{
				this.gist=gist.clone()
			}
			else
			{
				this.gist=Object.assign({},gist)
			}	
		}
		if(remainder)
		{
			this.remainder=remainder.clone()
		}
		else
		this.remainder=new ISHML.Tokenization()
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
ISHML.Parser=function Parser({lexicon,grammar}={})
{
	if (this instanceof ISHML.Parser)
	{
		this.lexicon=lexicon
		this.grammar=grammar
	}
	else
	{
		return new Parser({lexicon:lexicon,grammar:grammar})
	}
}
ISHML.Parser.prototype.analyze=function(text, {caseSensitive=false, full=false, fuzzy=false, greedy=false, lax=false, smooth=false,separator=/\s/}={})
{    
	var tokenizations = this.lexicon.tokenize(text,{caseSensitive:caseSensitive, full:full, fuzzy:fuzzy, greedy:greedy, lax:lax, smooth:smooth, separator:separator})
	var interpretations=[]
	var partialInterpretations=[]
	var completeInterpretations=[]
	if (tokenizations.complete.length > 0)
	{
		tokenizations.complete.forEach((sequence)=>
		{
			var result=this.grammar.parse(sequence)
			if (result)
			{
				interpretations=interpretations.concat(result)
			}
		})

		interpretations.forEach((interpretation)=>
		{
			if (interpretation.remainder.tokens.length>0)
			{
				partialInterpretations.push(interpretation)
			}
			else
			{
				completeInterpretations.push(interpretation)
			}
		})
		if (completeInterpretations.length>0)
		{	
			return completeInterpretations
		}
		else
		{
			partialInterpretations.sort(function(first,second){return first.remainder.tokens.length - second.remainder.tokens.length})
			const error=new Error("Incomplete interpretation.")
			error.interpretations=partialInterpretations
			throw error
		}
	}
	else
	{
		const error=new Error("Incomplete tokenization.")
		error.tokenizations=tokenizations.partial
		throw error
	}	
}
ISHML.Rule=function Rule() 
{
	if (this instanceof ISHML.Rule)
	{
		Object.defineProperty(this, "minimum", {value:1, writable: true})
		Object.defineProperty(this, "maximum", {value:1, writable: true})
		Object.defineProperty(this, "mode", {value:0, writable: true})
		Object.defineProperty(this, "greedy", {value:false, writable: true})
		Object.defineProperty(this, "keep", {value:true, writable: true})
		Object.defineProperty(this, "filter", {value:(definition)=>true, writable: true})
		Object.defineProperty(this, "semantics", {value:(interpretation)=>true, writable: true})
		return this
	}
	else
	{
		return new Rule()
	}
}

ISHML.Rule.prototype.clone =function()
{
	var clonedRule= new ISHML.Rule().configure({minimum:this.minimum,maximum:this.maximum,
		mode:this.mode,greedy:this.greedy,keep:this.keep,filter:this.filter, semantics:this.semantics})
	var entries=Object.entries(this)
	entries.forEach(([key,value])=>{clonedRule[key]=value.clone()})
	return clonedRule
}	
ISHML.Rule.prototype.configure =function({minimum,maximum,mode,greedy,keep,filter,semantics}={})
{
	if(minimum !== undefined){this.minimum=minimum}
	if(maximum !== undefined){this.maximum=maximum}
	if(mode !== undefined){this.mode=mode}
	if(greedy !== undefined){this.greedy=greedy}
	if(keep !== undefined){this.keep=keep}
	if(filter !== undefined){this.filter=filter}
	if(semantics !== undefined){this.semantics=semantics}
	return this
}
ISHML.Rule.prototype.parse =function(tokenization)
{
	
	var someTokens=tokenization.clone()
	var results=[]
	var keys=Object.keys(this)
	if (keys.length>0)
	//non-terminal
	{
		switch (this.mode) 
		{
			case ISHML.enum.mode.all:
				if (this.maximum ===1 ){var candidates=[new ISHML.Interpretation({},someTokens)]}
				else {var candidates=[new ISHML.Interpretation([],someTokens)]}
				var counter = 0
				var phrases=[]
				var revisedCandidates=candidates.slice(0)
				while (counter<this.maximum)
				{
					for (let key of keys)
					{
						revisedCandidates.forEach(({gist,remainder})=>
						{	
							//SNIP
							if (remainder.tokens.length>0)
							{
								var snippets=this[key].parse(remainder.clone()) 
								snippets.forEach((snippet)=>
								{
									var phrase=new ISHML.Interpretation(gist,snippet.remainder)
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
			case ISHML.enum.mode.any:
					if (this.maximum ===1 ){var candidates=[new ISHML.Interpretation({},someTokens)]}
					else {var candidates=[new ISHML.Interpretation([],someTokens)]}
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
								if (remainder.tokens.length>0)
								{
									var snippets=this[key].parse(remainder.clone()) 
									snippets.forEach((snippet)=>
									{
										var phrase=new ISHML.Interpretation(gist,snippet.remainder)
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
			case ISHML.enum.mode.apt:
				if (this.maximum ===1 ){var candidates=[new ISHML.Interpretation({},someTokens)]}
				else {var candidates=[new ISHML.Interpretation([],someTokens)]}
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
							if (remainder.tokens.length>0)
							{
								var snippets=this[key].parse(remainder.clone()) 
								snippets.forEach((snippet)=>
								{
									var phrase=new ISHML.Interpretation(gist,snippet.remainder)
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
		var counter=1
		var repetitions=[]
		while (counter<=this.maximum)
		{
			if (someTokens.tokens.length>0)
			{
				var token =	new ISHML.Token(someTokens.tokens[0].lexeme, someTokens.tokens[0].definitions.filter(this.filter))
				if (token.definitions.length>0)
				{
					repetitions.push(token)
					if (!this.greedy)
					{
						if (counter>=this.minimum)
						{
							if (this.maximum===1)
							{
								results.push(new ISHML.Interpretation(token,new ISHML.Tokenization(someTokens.tokens.slice(1),someTokens.remainder)))
							}
							else
							{
								results.push(new ISHML.Interpretation(repetitions,new ISHML.Tokenization(someTokens.tokens.slice(1),someTokens.remainder)))//{gist:repetitions.slice(0),remainder:remainder.slice(1)})
							}	
						}
					}	
					someTokens.tokens=someTokens.tokens.slice(1)
				}
				else {break}
				counter++
			}
			else {break}	
		}
		if (this.greedy)
		{
			if (counter-1>=this.minimum)
			{
				if (this.maximum===1)
				{
					results.push(new ISHML.Interpretation(repetitions[0],someTokens))
				}
				else
				{
					results.push(new ISHML.Interpretation(repetitions, someTokens))
				}	
			}
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
ISHML.Rule.prototype.snip =function(key,rule)
{
	if (typeof key !== "number")
	{
		var formattedKey=ISHML.util.formatKey(key)
	}
	else
	{
		var formattedKey=key
	}

	if (rule instanceof ISHML.Rule)
	{
		this[formattedKey]=rule.clone()
	}
	else
	{
		this[formattedKey]=new ISHML.Rule()
	}	
	return this		
}
ISHML.Token=function Token(lexeme="",definitions=[])
{
	if (this instanceof ISHML.Token)
	{
		this.lexeme=lexeme.slice(0)
		this.definitions=definitions.slice(0)
		return this
	}
	else
	{
		return new Token(lexeme,definitions)
	}
}
ISHML.Token.prototype.clone=function() 
{
	return new ISHML.Token(this.lexeme,this.definitions)
}
ISHML.Tokenization=function Tokenization(tokens=[],remainder="")
{
   if (this instanceof ISHML.Tokenization)
	{
		this.tokens=tokens.slice(0)
		this.remainder=remainder.slice(0)
		return this
	}
	else
	{
		return new Tokenization(tokens,remainder)
	}
}
ISHML.Tokenization.prototype.clone=function() 
{
	return new ISHML.Tokenization(this.tokens,this.remainder)
}
ISHML.util={_seed:undefined}

ISHML.util.enumerator=function* (aStart =1)
{
  let i = aStart;
  while (true) yield i++
}

ISHML.util.formatKey=function(aKey)
{
	return aKey.replace(/\s+/g, '_')
}

ISHML.util.random = function() 
{
	this._seed = this._seed * 16807 % 2147483647
	return (this._seed-1)/2147483646
}
ISHML.util.reseed = function(aSeed=Math.floor(Math.random() * 2147483648)) 
{
	var seed=aSeed % 2147483647
	if (seed <= 0){seed += 2147483646}
	this._seed=seed	
}
ISHML.util.shuffle=function(anArray,aCount=undefined)
{
	var array=anArray.slice(0)
	var m = array.length
	var count=aCount||array.length
	for (let i=0; i < count; i++)
	{
		let randomIndex = Math.floor(this.random() * m--)
		let item = array[m]
		array[m] = array[randomIndex]
		array[randomIndex] = item
	}
	return array.slice(-count)
}
