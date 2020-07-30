"use strict"
/*
ISC License

Copyright 2019-2020, Jennifer L Schmidt

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

https://whitewhalestories.com
*/

var ishml = ishml || {}
//const Ishmael = Ishmael || ishml  //Call me Ishmael.
ishml.enum=ishml.enum || {}
ishml.enum.mode={all:Symbol('all'),any:Symbol('any'),apt: Symbol('apt'),reset: Symbol('reset')} 
ishml.enum.number={singular:Symbol('singular'),plural:Symbol('plural')} 
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
ishml.Interpretation=function Interpretation(gist={},remainder="",valid=true)
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

		this.remainder=remainder.slice()
		this.valid=valid
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
					result.remainder=result.remainder.slice(discard.length)
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
									result.remainder=result.remainder.slice(discard[0].length)
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
	var {snippets:result}=this.grammar.parse(text,this.lexicon)
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
		Object.defineProperty(this, "entire", {value:false, writable: true})
		Object.defineProperty(this, "full", {value:false, writable: true})
		Object.defineProperty(this, "filter", {value:(definition)=>true, writable: true})
		Object.defineProperty(this, "greedy", {value:false, writable: true})
		Object.defineProperty(this, "keep", {value:true, writable: true})
		Object.defineProperty(this, "longest", {value:false, writable: true})
		Object.defineProperty(this, "minimum", {value:1, writable: true})
		Object.defineProperty(this, "maximum", {value:1, writable: true})
		Object.defineProperty(this, "mode", {value:ishml.enum.mode.all, writable: true})
		Object.defineProperty(this, "semantics", {value:(interpretation)=>true, writable: true})
		Object.defineProperty(this, "mismatch", {value:(interpretation)=>false, writable: true})
		Object.defineProperty(this, "separator", {value:/^\s/, writable: true})
		Object.defineProperty(this, "regex", {value:false, writable: true})
		//for composing
		Object.defineProperty(this, "phrases", {value:[], writable: true})
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
		var clonedRule= new ishml.Rule().configure({caseSensitive:rule.caseSensitive, entire:rule.entire, filter:rule.filter, full:rule.full, greedy:rule.greedy, keep:rule.keep,longest:rule.longest, minimum:rule.minimum, maximum:rule.maximum, mode:rule.mode, mismatch:rule.mismatch, regex:rule.regex, semantics:rule.semantics, separator:rule.separator,phrases:rule.phrases})
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
//DEFECT Entire not documented.
ishml.Rule.prototype.configure =function({caseSensitive, entire,filter, full, greedy, keep, longest, minimum,maximum, mode,mismatch, regex, semantics, separator, shuffle, phrases}={})
{

	if(caseSensitive !== undefined){this.caseSensitive=caseSensitive}
	if(entire !== undefined){this.entire=entire}
	if(filter !== undefined){this.filter=filter}
	if(full !== undefined){this.full=full}
	if(greedy !== undefined){this.greedy=greedy}
	if(keep !== undefined){this.keep=keep}
	if(longest !== undefined){this.longest=longest}
	if(minimum !== undefined){this.minimum=minimum}
	if(maximum !== undefined){this.maximum=maximum}
	if(mode !== undefined){this.mode=mode}
	if(mismatch !== undefined){this.mismatch=mismatch}
	if(regex !== undefined){this.regex=regex}
	if(semantics !== undefined){this.semantics=semantics}
	if(separator !== undefined){this.separator=separator}
	if(phrases !== undefined){this.phrases=phrases}
	return this
}
ishml.Rule.prototype.parse =function(text,lexicon)
{
	var someText=text.slice(0)
	var results=[]

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
						revisedCandidates.forEach(candidate=>
						{	
							var {gist,remainder,valid}=candidate
							//SNIP
							if (remainder.length>0)
							{
								var {snippets}=this[key].parse(remainder.slice(0),lexicon) 
								snippets.forEach((snippet)=>
								{
									
									var phrase=new ishml.Interpretation(gist,snippet.remainder,snippet.valid && valid)
									if (this.maximum ===1 )
									{
										if(this[key].keep || !phrase.valid){phrase.gist[key]=snippet.gist}
									}
									else 
									{
										if(phrase.gist.length===counter){phrase.gist.push({})}
										if(this[key].keep  || !phrase.valid){phrase.gist[counter][key]=snippet.gist}
									}
									phrases.push(phrase)
								
								})
							}  
						})
						if (this[key].minimum===0)
						{
							revisedCandidates=revisedCandidates.concat(phrases.slice(0))
						}
						else
						{
							revisedCandidates=phrases.slice(0)
						}
						
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
							revisedCandidates.forEach(candidate=>
							{
								var {gist,remainder,valid}=candidate
							//SNIP
								if (remainder.length>0)
								{
									var {snippets}=this[key].parse(remainder.slice(0),lexicon) 
									snippets.forEach((snippet)=>
									{
										
										var phrase=new ishml.Interpretation(gist,snippet.remainder,snippet.valid && valid)
										if (this.maximum ===1 )
										{
											if(this[key].keep || !phrase.valid){phrase.gist=snippet.gist}
										}
										else 
										{
											if(phrase.gist.length===counter){phrase.gist.push({})}
											if(this[key].keep || !phrase.valid){phrase.gist[counter]=snippet.gist}
										}
										phrases.push(phrase)
										
									})
								}

							})
							if (this[key].minimum===0)
							{
								revisedCandidates=phrases.slice(0)
							}
							else
							{
								revisedCandidates=phrases.slice(0) 
							}
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
						revisedCandidates.forEach(candidate=>
						{
							var {gist,remainder,valid}=candidate
							//SNIP
							if (remainder.length>0)
							{
								var {snippets}=this[key].parse(remainder.slice(0),lexicon) 
								snippets.forEach((snippet)=>
								{
									
									var phrase=new ishml.Interpretation(gist,snippet.remainder,snippet.valid && valid)
									if (this.maximum ===1 )
									{
										if(this[key].keep || !phrase.valid){phrase.gist=snippet.gist}
									}
									else 
									{
										if(phrase.gist.length===counter){phrase.gist.push({})}
										if(this[key].keep || !phrase.valid){phrase.gist[counter]=snippet.gist}
									}
									phrases.push(phrase)
									
								})
							}

						})
						
						if (this[key].minimum===0)
						{
							
							revisedCandidates=phrases.slice(0)
						}
						else
						{
							revisedCandidates=phrases.slice(0) 
						}
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
			revisedCandidates.forEach((candidate)=>
			{

				var {gist,remainder,valid}=candidate
				//SNIP
				if (remainder.length>0)
				{
					var snippets=lexicon.search(remainder, {regex:rule.regex,separator:rule.separator, caseSensitive:rule.caseSensitive, longest:rule.longest, full:rule.full})

					snippets.forEach((snippet)=>
					{
						if (this.filter(snippet.token.definition))
						{
							var phrase=new ishml.Interpretation(gist,snippet.remainder,snippet.valid && valid)
							if (this.maximum ===1 )
							{
								if(this.keep || !phrase.valid){phrase.gist=snippet.token}
							}
							else 
							{
								if(phrase.gist.length===counter){phrase.gist.push({})}
								if(this.keep || !phrase.valid){phrase.gist[counter]=snippet.token}
							}
							phrases.push(phrase)
						}	
						
					})
				}
			})
			
			revisedCandidates=phrases.slice(0) //}
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
	results=results.map(interpretation=>
	{
		if(interpretation.remainder.length>0 && this.entire)
		{
			interpretation.valid=false
		}
		return interpretation
	})
	
	if (!results.some(interpretation=>interpretation.valid))
	{
		if (results.length===0){results=candidates}
		results=results.reduce((revisedResults, interpretation) =>
		{
			var revisedInterpretation=this.mismatch(interpretation)
			if (revisedInterpretation)
			{
				if (revisedInterpretation)
				{
					revisedResults.push(revisedInterpretation)
				}
			}
			return revisedResults

		},[])

	}

	results=results.reduce((revisedResults, interpretation) =>
	{
		if (interpretation.valid)
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
		}
		else
		{
			revisedResults.push(interpretation)
		}
		return revisedResults

	},[])
	if (results.length>0)
	{
		return {snippets:results}	
	}
	else
	{
		return {snippets:[]}
	}	
}
ishml.Rule.prototype.snip =function(key,rule)
{
	
	if (rule instanceof ishml.Rule)
	{
		this[key]=rule
	}
	else
	{
		this[key]=new ishml.Rule(key)

		this[key].caseSensitive=this.caseSensitive
		this[key].full=this.full
		this[key].longest=this.longest
		this[key].separator=this.separator
		
	}	
	return this		
}



ishml.Token=function Token(lexeme="",definition)
{
	if (this instanceof ishml.Token)
	{
		this.lexeme=lexeme.slice(0)
		this.definition=definition
		return this
	}
	else
	{
		return new Token(lexeme,definition)
	}
}
ishml.Token.prototype.clone=function() 
{
	return new ishml.Token(this.lexeme,this.definition)
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
	ishml.util._seed =ishml.util._seed* 16807 % 2147483647
	return (ishml.util._seed-1)/2147483646
}
ishml.util.reseed = function(aSeed=Math.floor(Math.random() * 2147483648)) 
{
	//var seed=aSeed % 2147483647
	//if (seed <= 0){seed += 2147483646}
	ishml.util._seed=aSeed	
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
