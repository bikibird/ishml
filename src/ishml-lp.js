"use strict"
/*
ISC License

Copyright 2019, Jennifer L Schmidt

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

https://whitewhalestories.com
*/

var ishml = ishml || {}
//var Ishmael = Ishmael || ishml  //Call me Ishmael.
ishml.enum=ishml.enum || {}
ishml.enum.mode={all:Symbol('all'),any:Symbol('any'),apt: Symbol('apt')} 
ishml.enum.pos=
{
	adjective:Symbol("adjective"),
	adverb:Symbol("adverb"),
	conjunction:Symbol("conjunction"),
	noun:Symbol("noun"),
	prefix:Symbol("prefix"),
	preposition:Symbol("preposition"),
	suffix:Symbol("suffix"),
	verb:Symbol("verb")
}
ishml.Interpretation=function Interpretation(gist={},remainder)
{
	if (this instanceof ishml.Interpretation)
	{
		if (gist instanceof Array)
		{
			this.gist=gist.slice(0)
		}
		else
		{
			if(gist instanceof ishml.Token)
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
			this.remainder=remainder.slice()
		}
		else
		this.remainder=""
		return this
	}
	else
	{
		return new Interpretation(gist,remainder)
	}
}
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
ishml.Lexicon.prototype.search = function (searchText, {regex=false,separator=/^\s+/, lax=false, caseSensitive=false, longest=false, full=false}={}) 
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
			result.token=new ishml.Token(match[0],definitions)
			result.remainder=trimmedText.slice(match[0].length)
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
							result.token=new ishml.Token(trimmedText.substring(0,i+1),_trie[character].definitions)
							result.remainder=trimmedText.substring(i+1).slice(0)
							_results.unshift(result)
						}
					}
					else // if (i===trimmedtext.length-1) 
					{
						var result={}
						result.token=new ishml.Token(trimmedText.substring(0),_trie[character].definitions)
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
ishml.Parser=function Parser({lexicon,grammar}={})
{
	if (this instanceof ishml.Parser)
	{
		this.lexicon=lexicon
		this.grammar=grammar
	}
	else
	{
		return new Parser({lexicon:lexicon,grammar:grammar})
	}
}
ishml.Parser.prototype.analyze=function(text)
{    
	var interpretations=[]
	var partialInterpretations=[]
	var completeInterpretations=[]

	var {snippets:result,error}=this.grammar.parse(text,this.lexicon)
	if (result)
	{
		interpretations=interpretations.concat(result)
	}

	interpretations.forEach((interpretation)=>
	{
		if (interpretation.remainder.length>0)
		{
			partialInterpretations.push(interpretation)
		}
		else
		{
			delete interpretation.error
			completeInterpretations.push(interpretation)
		}
	})
	if (completeInterpretations.length>0)
	{	
		return {success:true, interpretations:completeInterpretations}
	}
	else
	{
		if (partialInterpretations.length>0)
		{
			return {success:false, interpretations: partialInterpretations.sort(function(first,second){return first.remainder.length - second.remainder.length})}
		}
		else
		{
			return { success: false}
		}
	}
}
ishml.regex=ishml.regex||{}
ishml.regex.word=/(^\w*)(.*)/
ishml.regex.floatingPointNumber=/^-?([0-9]*[.])?[0-9]+/
ishml.Rule=function Rule() 
{
	if (this instanceof ishml.Rule)
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
		Object.defineProperty(this, "mode", {value:ishml.enum.mode.all, writable: true})
		Object.defineProperty(this, "semantics", {value:(interpretation)=>true, writable: true})
		Object.defineProperty(this, "separator", {value:/^\s/, writable: true})
		Object.defineProperty(this, "regex", {value:false, writable: true})
		return this
	}
	else
	{
		return new Rule()
	}
}

ishml.Rule.prototype.clone =function()
{
	var circularReferences=new Set()

	function _clone(rule)
	{
		var clonedRule= new ishml.Rule().configure({caseSensitive:rule.caseSensitive, filter:rule.filter, full:rule.full, greedy:rule.greedy, keep:rule.keep, lax:rule.lax, longest:rule.longest, minimum:rule.minimum, maximum:rule.maximum, mode:rule.mode, regex:rule.regex, semantics:rule.semantics, separator:rule.separator})
		var entries=Object.entries(rule)
		entries.forEach(([key,value])=>
		{
			if (circularReferences.has(value))
			{
				clonedRule[key]=value
			}
			else
			{
				circularReferences.add(value)
				clonedRule[key]=_clone(value)
			}
			
		})
		return clonedRule
	}	
	return _clone(this)
}	
ishml.Rule.prototype.configure =function({caseSensitive, filter, full, greedy, keep, lax, longest, minimum,maximum, mode, regex, semantics, separator}={})
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
ishml.Rule.prototype.parse =function(text,lexicon)
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
		var rule = this
		while (counter<this.maximum)
		{
			revisedCandidates.forEach(({gist,remainder})=>
			{
				//SNIP
				if (remainder.length>0)
				{
					var snippets=lexicon.search(remainder, {regex:rule.regex,separator:rule.separator, lax:rule.lax, caseSensitive:rule.caseSensitive, longest:rule.longest, full:rule.full})

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
ishml.Rule.prototype.snip =function(key,rule)
{
	if (typeof key !== "number")
	{
		var formattedKey=key.replace(/\s+/g, '_')
	}
	else
	{
		var formattedKey=key
	}

	if (rule instanceof ishml.Rule)
	{
		this[formattedKey]=rule
	}
	else
	{
		this[formattedKey]=new ishml.Rule()

		this[formattedKey].caseSensitive=this.caseSensitive
		this[formattedKey].full=this.full
		this[formattedKey].lax=this.lax
		this[formattedKey].longest=this.longest
		this[formattedKey].separator=this.separator
		
	}	
	return this		
}
ishml.Token=function Token(lexeme="",definitions=[])
{
	if (this instanceof ishml.Token)
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
ishml.Token.prototype.clone=function() 
{
	return new ishml.Token(this.lexeme,this.definitions)
}
ishml.util={_seed:undefined}

ishml.util.enumerator=function* (aStart =1)
{
  let i = aStart;
  while (true) yield i++
}

ishml.util.formatId=function(id)
{
	if(id)
	{ 
		if (typeof(id)==="string"){return id.replace(/\s+/g, '_')}
		else{return id.id.replace(/\s+/g, '_')}
	}	
	else 
	{
		return "auto" + ishml.util.autoid.next().value.toString()
	}
}
ishml.util.autoid=ishml.util.enumerator()
ishml.util.random = function() 
{
	this._seed = this._seed * 16807 % 2147483647
	return (this._seed-1)/2147483646
}
ishml.util.reseed = function(aSeed=Math.floor(Math.random() * 2147483648)) 
{
	var seed=aSeed % 2147483647
	if (seed <= 0){seed += 2147483646}
	this._seed=seed	
}
ishml.util.shuffle=function(anArray,aCount=undefined)
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
