"use strict"
/*
ISC License

Copyright 2019-2024, Jennifer L Schmidt

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

https://whitewhalestories.com

@bikibird
*/

const ishml = {}
// #region utility functions
ishml.util={_seed:undefined}

ishml.util.enumerator=function* (aStart =1)
{
  let i = aStart;
  while (true) yield i++
}
ishml.cartesianProduct=function (a, b)
{
	if (a.length===0) return b
	let r= a.reduce((acc, x) => [...acc, ...b.map(y => [x, y])], [])
	return r

}

ishml.formatId=function(id)
{
	if(id)
	{ 
		return id.trim().toLowerCase().replace(/\s+/g, '_')
	}	
	else 
	{
		throw new Error("ERROR 0003: Unable to format id.")
	}
}
ishml.formatName=function(literals, ...expressions)
{
	if(literals)
	{ 
		return ishml.toString(literals, ...expressions).trim().replace("_"," ")
	}	
	else 
	{
		throw new Error("ERROR 0004: Unable to format name .")
	}
}
ishml.toString=(literals, ...expressions) => 
{
	if (literals.raw) return String.raw({ raw:literals }, ...expressions) //identity transform for template literals
	else return literals.toString() 	
}
ishml.util.autoId=ishml.util.enumerator()
ishml.util.random = function(seed=Math.floor(Math.random() * 2147483648)) 
{
	return {value:(seed* 16807 % 2147483647-1)/2147483646,seed:seed * 16807 % 2147483647}

}
/*ishml.util.reseed = function(seed=Math.floor(Math.random() * 2147483648)) 
{
	ishml.util._seed=seed	
}*/
ishml.util.shuffle=function(anArray,{length=null,seed=Math.floor(Math.random() * 2147483648)}={})
{
	var array=anArray.slice(0)
	var m = array.length
	var count=length||array.length
	for (let i=0; i < count; i++)
	{
		var {value,seed}=this.random(seed)
		let randomIndex = Math.floor(value * m--)
		let item = array[m]
		array[m] = array[randomIndex]
		array[randomIndex] = item
	}
	return {result:array.slice(-count),seed:seed}
}
// #endregion
// #region enumerations

// #endregion
// #region regex
ishml.regex=ishml.regex||{}
ishml.regex.floatingPointNumber=/^-?([0-9]*[.])?[0-9]+/
ishml.regex.whitespace=/^\s+/
ishml.regex.word=/^\w*/
// #endregion
// #region Factories and Classes
// #region Interpretation 
ishml.Interpretation=function Interpretation(gist={},remainder="",valid=true,lexeme)
{
	
	if (this instanceof ishml.Interpretation)
	{
		this.lexeme=lexeme??""
		if (gist instanceof Array)
		{
			this.gist=gist.map(g=>
			{
				if (g instanceof ishml.Token)
				{
					return g.clone()
					//this.gist.lexeme=this.lexeme
					//g.lexeme=this.lexeme
					//return g
				}	
				else
				{
					return Object.assign({},g)
					
				}	

			})
		}
		else
		{
			if(gist instanceof ishml.Token)
			{
				this.gist=gist.clone()
				//this.gist.lexeme=this.lexeme
			}
			else
			{
				this.gist=Object.assign({},gist)
				this.gist.lexeme=this.lexeme
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

// #endregion
// #region Lexicon
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

ishml.Lexicon.prototype.search = function (searchText, {regex=false,separator=/^\s+/, caseSensitive=false, full=false, longest=false, lax=false}={}) 
{
	var _trie = this.trie
	var _results = []
	if(regex)
	{
		var match=searchText.match(regex)
		if (match)
		{
			var result={}
			result.token=new ishml.Token(match[0],{fuzzy:true, match:match[0]})
			result.remainder=searchText.slice(match[0].length)
			if (separator && result.remainder.length>0)
			{
				var discard=result.remainder.match(separator)
				if (discard !== null)
				{
					if (discard[0] !==""){result.remainder=result.remainder.slice(discard[0].length)}
					_results.unshift(result)
				}
				else 
				{ 
					if (lax)
					{
						_results.unshift(result)
					}
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
			if ( ! (_trie[character] ))
			{	
				if(longest || full)
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
							if (separator  && result.remainder.length >0)
							{
								var discard=result.remainder.match(separator)
								if (discard !== null)
								{
									if (discard[0] !==""){result.remainder=result.remainder.slice(discard[0].length)}
									_results.unshift(result)
								}
								else 
								{ 
									if (lax)
									{
										_results.unshift(result)
									}
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
ishml.Lexicon.prototype.split = function (searchText, ...settings) 
{
	var result
	var results=[]
	var fuzzyText=""
	var {fuzzySeparator}=settings[0]
	var remainder=searchText
	while(remainder.length>0)
	{
		result=this.search(remainder,...settings)
		if (result.length===0)
		{
			var word =remainder.split(fuzzySeparator,1)[0]
			fuzzyText+=word+" "
			remainder=remainder.slice(word.length+1)
		}
		else
		{
			
			if (fuzzyText.length>0)
			{
				results.push({token:new ishml.Token(fuzzyText,{fuzzy:true, match:fuzzyText,}),remainder:remainder})
				fuzzyText=""
			}
			results=results.concat(result[0])
			remainder=result[0].remainder
			
		}
		
	}
	if (fuzzyText.length>0)
	{
		results.push({token:new ishml.Token(fuzzyText.trim(),{fuzzy:true, match:fuzzyText}),remainder:""})
	}
	return results
}
ishml.Lexicon.prototype.unregister=function(lexeme,definition)
{
	var _lexeme=lexeme
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
// #endregion
// #region Narrative
// This function is assigned to objects like nouns and plot points to add narrative functionality
// example: {id:"my_noun", _:ishml.narrative}
ishml.narrative=function narrative(literals, ...expressions)  
{
	if (literals){this.narrative=ishml.template(literals, ...expressions)}
	else {return this.narrative}
	return this
}
// #endregion
// #region Parser
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
	{	var validInterpretations=completeInterpretations.filter(interpretation=>interpretation.valid===true)
		if(validInterpretations.length>0) {return {success:true, interpretations:validInterpretations}}
		else {return {success:true, interpretations:completeInterpretations}}
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

// #endregion
// #region Rule
ishml.Rule=function Rule() 
{
	if (this instanceof ishml.Rule)
	{
		
		Object.defineProperty(this, "caseSensitive", {value:false, writable: true})
		Object.defineProperty(this, "entire", {value:false, writable: true})
		Object.defineProperty(this, "filter", {value:(definition)=>true, writable: true})
		Object.defineProperty(this, "full", {value:false, writable: true})
		Object.defineProperty(this, "greedy", {value:false, writable: true})
		Object.defineProperty(this, "keep", {value:true, writable: true})
		Object.defineProperty(this, "lax", {value:false, writable: true})
		Object.defineProperty(this, "longest", {value:false, writable: true})
		Object.defineProperty(this, "minimum", {value:1, writable: true})
		Object.defineProperty(this, "maximum", {value:1, writable: true})
		Object.defineProperty(this, "mode", {value:ishml.Rule.all, writable: true})
		Object.defineProperty(this, "prefer", {value:false, writable: true})
		Object.defineProperty(this, "semantics", {value:(interpretation)=>true, writable: true})
		Object.defineProperty(this, "mismatch", {value:(interpretation)=>false, writable: true})
		Object.defineProperty(this, "separator", {value:/^\s/, writable: true})
		Object.defineProperty(this, "regex", {value:false, writable: true})

		return this
	}
	else
	{
		return new Rule()
	}
}
ishml.Rule.all=Symbol('all')
ishml.Rule.any=Symbol('any')
ishml.Rule.apt= Symbol('apt')
ishml.Rule.prototype.clone =function()
{
	var circularReferences=new Set()

	function _clone(rule)
	{
		var clonedRule= new ishml.Rule().configure({caseSensitive:rule.caseSensitive, entire:rule.entire, filter:rule.filter, full:rule.full, greedy:rule.greedy, keep:rule.keep,longest:rule.lax,longest:rule.longest, minimum:rule.minimum, maximum:rule.maximum, mode:rule.mode, mismatch:rule.mismatch, prefer:rule.prefer, regex:rule.regex, semantics:rule.semantics, separator:rule.separator})
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
ishml.Rule.prototype.configure =function({caseSensitive, entire, filter, full, greedy, keep, longest, lax, minimum,maximum, mode,mismatch,prefer, regex, semantics, separator}={})
{

	if(caseSensitive !== undefined){this.caseSensitive=caseSensitive}
	if(entire !== undefined){this.entire=entire}
	if(filter !== undefined){this.filter=filter}
	if(full !== undefined){this.full=full}
	if(greedy !== undefined){this.greedy=greedy}
	if(keep !== undefined){this.keep=keep}
	if(lax !== undefined){this.lax=lax}
	if(longest !== undefined){this.longest=longest}
	if(minimum !== undefined){this.minimum=minimum}
	if(maximum !== undefined){this.maximum=maximum}
	if(mode !== undefined){this.mode=mode}
	if(mismatch !== undefined){this.mismatch=mismatch}
	if(prefer !== undefined){this.prefer=prefer}
	if(regex !== undefined){this.regex=regex}
	if(semantics !== undefined){this.semantics=semantics}
	if(separator !== undefined){this.separator=separator}
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
			case ishml.Rule.all:
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
									var phrase=new ishml.Interpretation(gist,snippet.remainder,snippet.valid && valid,
										candidate.lexeme+remainder.slice(0,remainder.length-snippet.remainder.length))										
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
							if (this[key].greedy && phrases.length>0)
							{
								revisedCandidates=phrases.slice(0)
							}
							else
							{
								revisedCandidates=revisedCandidates.concat(phrases.slice(0))
							}
							
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
			case ishml.Rule.any:
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
										var phrase=new ishml.Interpretation(gist,snippet.remainder,snippet.valid && valid,
											candidate.lexeme+remainder.slice(0,remainder.length-snippet.remainder.length))
											//remainder.slice(0,remainder.length-snippet.remainder.length))
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
			case ishml.Rule.apt:
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
									var phrase=new ishml.Interpretation(gist,snippet.remainder,snippet.valid && valid,
										candidate.lexeme+remainder.slice(0,remainder.length-snippet.remainder.length))
										//remainder.slice(0,remainder.length-snippet.remainder.length))
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
					var snippets=lexicon.search(remainder, {regex:rule.regex,separator:rule.separator, caseSensitive:rule.caseSensitive, longest:rule.longest, full:rule.full, lax:rule.lax})

					snippets.forEach((snippet)=>
					{
						if (this.filter(snippet.token.definition))
						{
							var phrase=new ishml.Interpretation(gist,snippet.remainder,snippet.valid && valid,
								candidate.lexeme+remainder.slice(0,remainder.length-snippet.remainder.length))
								//remainder.slice(0,remainder.length-snippet.remainder.length))
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
// #endregion
// #region Phrase

ishml.Phrase =class Phrase
{
	constructor(...precursor) 
	{
		Object.defineProperty(this,"id",{value:"",writable:true})
		Object.defineProperty(this,"echo",{value:false,writable:true})
		Object.defineProperty(this,"ended",{value:false,writable:true})
		Object.defineProperty(this,"_locked",{value:false,writable:true})
		Object.defineProperty(this,"_erasable",{value:false,writable:true})
		Object.defineProperty(this,"phrases",{value:[],writable:true})
		Object.defineProperty(this,"re",{value:false,writable:true})
		Object.defineProperty(this,"_property",{value:"",writable:true})
		Object.defineProperty(this,"_results",{value:[],writable:true})
		Object.defineProperty(this,"_seed",{value:ishml.util.random().seed,writable:true})
		Object.defineProperty(this,"_tag",{value:"",writable:true})
		Object.defineProperty(this,"tags",{value:{},writable:true})
		//Object.defineProperty(this,"tally",{value:0,writable:true})
		Object.defineProperty(this,"text",{value:"",writable:true})
		this.fill(...precursor)
		this.catalog()
		return new Proxy(this, ishml.Phrase.__handler)
	}
	get also()  //Joins second phrase if first phrase generates non empty string
	{
		var primaryPhrase=this
		return new Proxy((...precursor) => new class alsoPhrase extends ishml.Phrase
		{
			constructor()
			{
				super()
				this.phrases[0]=primaryPhrase
				this.phrases[1]=new ishml.Phrase(...precursor)
				this.catalog()
			}
			generate()
			{
				var results=this.phrases[0].generate()
				if (results.length>1 || (results.length===1 && results[0].value!==""))
				{
					this.results=results.concat(this.phrases[1].generate())
					this.text=this.toString()
				}
				else
				{
					this.results=results
					this.text=""
				}
				return this.results
			}
		},ishml.template.__handler)
	}
	get when()
	{
		var primaryPhrase=this
		return new Proxy((...precursor) => new class whenPhrase extends ishml.Phrase
		{
			constructor()
			{
				super()
				this.phrases[0]=primaryPhrase
				this.phrases[1]=new ishml.Phrase(...precursor)
				this.catalog()
			}
			generate()
			{
				this.phrases[1].generate()
				if (this.phrases[1].text)
				{
					this.phrases[0].generate()
					this.text=this.phrases[0].text + this.phrases[1].text
					this.results=[{value:this.text}]
				}
				else
				{
					this.results=[{value:""}]
					this.text=""
				}

				return this.results
			}
		},ishml.template.__handler)
	}
	get _() //joins two phrases without space
	{
		var primaryPhrase=this
		return new Proxy((...precursor) => new class spacePhrase extends ishml.Phrase
		{
			constructor()
			{
				super()
				this.phrases[0]=primaryPhrase
				this.phrases[1]=new ishml.Phrase(...precursor)
				this.catalog()
			}
			generate()
			{
				super.generate()
				this.text=this.toString()
				return this.results
			}
		},ishml.template.__handler)
	}
	get spc()  //joins two phrases with space
	{
		var primaryPhrase=this
		return new Proxy((...precursor) => new class spcPhrase extends ishml.Phrase
		{
			constructor()
			{
				super()
				this.phrases[0]=primaryPhrase
				this.phrases[1]=new ishml.Phrase(...precursor)
				this.catalog()
			}
			generate()
			{
				var results1=this.phrases[0].generate()
				var results2=this.phrases[1].generate()
				if (
					(results1.length>1 || (results1.length===1 && results1[0].value!=="")) &&
					(results2.length>1 || (results2.length===1 && results2[0].value!==""))
				){var space=" "}
				else{var space=""}
				
				this.results=results1.concat([{value:space}],results2)
				this.text=this.toString()
				return this.results
			}
		},ishml.template.__handler)
	}
	get spc1()  //joins 2 phrases with space  if first phrase generates non-empty string. 
	{
		var primaryPhrase=this
		return new Proxy((...precursor) => new class spc1Phrase extends ishml.Phrase
		{
			constructor()
			{
				super()
				this.phrases[0]=primaryPhrase
				this.phrases[1]=new ishml.Phrase(...precursor)
				this.catalog()
			}
			generate()
			{
				var results1=this.phrases[0].generate()
				var results2=this.phrases[1].generate()
				if (
					(results1.length>1 || (results1.length===1 && results1[0].value!=="")) &&
					(results2.length>1 || (results2.length===1 && results2[0].value!==""))
				) {this.results=results1.concat([{value:" "}],results2)}
				else {this.results=results1}
				this.text=this.toString()
				return this.results
			}
		},ishml.template.__handler)
	}
	get spc2()  //joins 2 phrases with space  if and only if both phrases generate non-empty strings. 
	{
		var primaryPhrase=this
		return new Proxy((...precursor) => new class spc2Phrase extends ishml.Phrase
		{
			constructor()
			{
				super()
				this.phrases[0]=primaryPhrase
				this.phrases[1]=new ishml.Phrase(...precursor)
				this.catalog()
			}
			generate()
			{
				var results1=this.phrases[0].generate()
				var results2=this.phrases[1].generate()
				if (
					(results1.length>1 || (results1.length===1 && results1[0].value!=="")) &&
					(results2.length>1 || (results2.length===1 && results2[0].value!==""))
				) {this.results=results1.concat([{value:" "}],results2)}
				else {this.results=[{value:""}]}
				this.text=this.toString()
				return this.results
			}
		},ishml.template.__handler)
	}
	get comma()  //joins two phrases with , or space
	{
		var primaryPhrase=this
		return new Proxy((...precursor) => new class spacePhrase extends ishml.Phrase
		{
			constructor()
			{
				super()
				this.phrases[0]=primaryPhrase
				this.phrases[1]=new ishml.Phrase(...precursor)
				this.catalog()
			}
			generate()
			{
				var results1=this.phrases[0].generate()
				var results2=this.phrases[1].generate()
				if (
					(results1.length>1 || (results1.length===1 && results1[0].value!=="")) &&
					(results2.length>1 || (results2.length===1 && results2[0].value!==""))
				){var space=", "}
				else{var space=" "}
				
				this.results=results1.concat([{value:space}],results2)
				this.text=this.toString()
				return this.results
			}
		},ishml.template.__handler)
	}

	get comma2()  //joins two phrases with , or period
	{
		var primaryPhrase=this
		return new Proxy((...precursor) => new class spacePhrase extends ishml.Phrase
		{
			constructor()
			{
				super()
				this.phrases[0]=primaryPhrase
				this.phrases[1]=new ishml.Phrase(...precursor)
				this.catalog()
			}
			generate()
			{
				var results1=this.phrases[0].generate()
				var results2=this.phrases[1].generate()
				if (
					(results1.length>1 || (results1.length===1 && results1[0].value!=="")) &&
					(results2.length>1 || (results2.length===1 && results2[0].value!==""))
				){var space=", "}
				else{var space=". "}
				
				this.results=results1.concat([{value:space}],results2)
				this.text=this.toString()
				return this.results
			}
		},ishml.template.__handler)
	}

	append(documentSelector)
	{
		if (documentSelector)
		{
			var targetNodes = document.querySelectorAll(documentSelector)
			targetNodes.forEach(node=>node.append(this.htmlTemplate().content))
		}	
		return this
	}
	catalog()
	{
		this._catalogUp()
		this._catalogDown()
		return this
	}
	_catalogUp() //add child tags and this tag to this's tags 
	{
		if (this.id)
		{
			this.tags[this.id]=this  //Add this to its own tags
		}
		this.phrases.forEach(phrase=> 
		{
			if (phrase instanceof ishml.Phrase )
			{
				var tags= phrase._catalogUp()  // recursive catalog for sub phrases
				Object.keys(tags).forEach(key=>
				{
					if(!this.tags[key])
					{
						this.tags[key]=tags[key] //add sub phrases to this's tags
					} 
				})
			}
		})
		return this.tags
	}
	_catalogDown()
	{
		this.phrases.forEach(phrase=>
		{
			if (phrase instanceof ishml.Phrase)
			{
				Object.keys(this.tags).forEach(key=>
				{
					if (!phrase.tags[key])
					{
						phrase.tags[key]=this.tags[key]  //add selfs tags to sub phrases
					}	
					phrase._catalogDown()  //recursively
				})
			}	
		})
	}

//There are three different ways to specify a condition.
//Concur should work like then  _.hobby.concur.person.interest
	concur(tag,condition)
	{
		if (typeof condition ==="function"){var rule=condition} //rule defined by function that returns boolean
		else 
		{
			if (condition){var rule = (a,b)=>b.map(item=>item[condition]).includes(a[condition])} 
			else {var rule = (a,b)=>b.map(item=>item.value).includes(a.value)}
		}
		return new class concurPhrase extends ishml.Phrase
		{
			generate()
			{
				super.generate()
				this.results=this.results.filter(item=>rule(item,this.tags[tag].results))
				this.text=this.toString()
				return this.results
			}
		}(this)
	}

	first(count=1)
	{
		return new class firstPhrase extends ishml.Phrase
		{
			generate()
			{
				super.generate()
				var total=this.results.length
				this.results=this.results.slice(0,count)
				var subtotal=this.results.length
				this.results.forEach((result,index)=>
				{
					result.index=index
					result.rank=index+1
					result.subtotal=subtotal
					result.total=total
				})
				this.text=this.toString
				return this.results
			}
		}(this)
	}
	erase(...tags)
	{
		var erasures=tags.flat()
		if (erasures.length===0){erasures=Object.keys(this.tags)}
		erasures.forEach(erasure=>{if (this.tags[erasure]._erasable){this.tags[erasure].phrases=[]}})
		return this
	}
	generate(phrases=this.phrases)
	{
		this.results=[]
		phrases.forEach((phrase)=>
		{
			if (phrase.generate) 
			{
				this.results=this.results.concat(phrase.generate())
			}
			else
			{
				if(Object.getPrototypeOf(phrase)===Object.prototype)
				{
					if(phrase.hasOwnProperty("value"))
					{
						if (phrase.value.generate){this.results=this.results.concat(phrase.value.generate())}
						else{this.results=this.results.concat(phrase)}
					}
					else
					{
						var values=Object.values(phrase)
						if (values.length>0)
						{
							if (values[0].generate){this.results=this.results.concat(values[0].generate())}
							else{this.results.push(Object.assign({value:values[0]},phrase))}
						}
						else 
						{
							this.results.push({value:""})
						}
					}
				}
				else
				{
					this.results.push({value:phrase})
				}
			}
		})
		this.text=this.toString()
		return this.results
	}
	htmlTemplate()
	{
		var template = document.createElement("template")
		template.innerHTML = this.text
		return template
	}
	get inner()
	{
		if (this.phrases.length>0 && this.phrases[0] instanceof ishml.Phrase)
		{
			return this.phrases[0]
		}
		else
		{
			return this
		}
	}
	join({separator=" ", trim=true}={})
	{
		return new class joinPhrase extends ishml.Phrase
		{
			generate()
			{
				super.generate()
				var last=this.results.length-1
				this.text=this.results.map(item=>item.value).reduce((result,phrase,index,)=>result+phrase+((index===last && trim)?"":separator),"")	
				if (this.text){this.results=[{value:this.text}]}
				return this.results
			}
		}(this)
	}
	last(count=1)
	{
		return new class lastPhrase extends ishml.Phrase
		{
			generate()
			{
				super.generate()
				var total=this.results.length
				this.results=this.results.slice(-count)
				var subtotal=this.results.length
				this.results.forEach((result,index)=>
				{
					result.index=index
					result.rank=index+1
					result.subtotal=subtotal
					result.total=total
				})
				return this.results
			}
		}(this)
	}
	get match()
	{
		var thisPhrase=this
		return new Proxy((precursor) => new class matchPhrase extends ishml.Phrase
		{
			constructor()
			{
				super()
				this.phrases[0]=thisPhrase  //hobbies
				this.phrases[1]=precursor  //person
				this.catalog()
			}
			generate()
			{
				var a=this.phrases[0].generate()
				var b= this.phrases[1].generate()
				this.results=a.filter(a=>b.map(item=>item.value).includes(a.value))
				this.text=this.toString()
				return this.results
			}
		},ishml.template.__handler)
	}
	//Unlike expand, modify takes a function to be applied to each of this phrases results.
	modify(modifier,...data)
	{
		if(data.length>0)
		{
			if(data.length===1 && data[0] instanceof ishml.Phrase){var target=data[0]}
		}
		else {var target=this}
		return new class modifyPhrase extends ishml.Phrase
		{
			constructor()
			{
				if (target){super(target)}
				else{super(...data)}
			}
			generate()
			{
				super.generate()
				this.results=this.results.map(item=>
				{
					var modifiedPhrase=Object.assign({},item)
					return Object.assign(modifiedPhrase,{value:modifier(item)})
				})	
				this.text=this.toString()
				return this.results
			}
		}()
	}
	slot(rank)
	{
		return new class slotPhrase extends ishml.Phrase
		{
			constructor(primaryPhrase)
			{
				super(primaryPhrase,rank)
				this.catalog()
			}
			generate()
			{
				super.generate()
				var rank=parseInt(this.phrases[1])
				this.results=[Object.assign({index:rank-1 ,rank:rank ,total:this.results[0].length},this.results[rank-1])]
				this.text=this.toString()
				return this.results
			}
		}(this)
	}
	transform(transformer,...data)
	{
		if(data.length>0)
		{
			if(data.length===1 && data[0] instanceof ishml.Phrase){var target=data[0]}
		}
		else {var target=this}
	
		return new class transformPhrase extends ishml.Phrase
		{
		constructor()
			{
				if (target){super(target)}
				else{super(...data)}
		
			}

			generate()
			{
				this.results=transformer(super.generate().slice(0).map(item=>Object.assign({},item)))
				this.text=this.toString()
				return this.results
			}
		}()
	}
	//_`${_.pick.animal()} `.per.ANIMAL("cat","dog","frog")
	get per()
	{
		var primaryPhrase=this
		return new Proxy((...precursor) => new class perPhrase extends ishml.Phrase
		{
			constructor()
			{
				super()
				this.phrases[0]=primaryPhrase
				if (precursor.length === 1 && precursor[0] instanceof ishml.Phrase){this.phrases[1]=precursor[0]}
				else(this.phrases[1]= new ishml.Phrase(...precursor))
				this.catalog()
				
			}
			generate()
			{
				this.results=[]
				for (let index = 0; index < this.phrases[1].generate().length; index++) {
					this.results=this.results.concat(this.phrases[0].generate())
				}
				this.text=this.toString()
				return this.results	
			}
		},ishml.template.__handler)
	}
	//fill figures out the core phrase to fill
	//_fill formats data and assigns to phrases array.
	//DEFECT: Do we need to catalog after filling?
	fill(...items)
	{
		if (items.length===1 && Object.getPrototypeOf(items[0])===Object.prototype)  //Might be POJO destined for tagged phrases.
		{
			if (!items[0]._tagPhrase)
			{
				this.erase()
				Object.keys(items[0]).forEach(key=>
				{
					if (this.tags.hasOwnProperty(key))
					{
						this.tags[key].erasable=true
						this.tags[key].fill({_tagPhrase:true,_data:items[0][key]}) 
					}
				})
				//this.catalog()
				return this	
			}

		}
		if (this.phrases.length===1 && this.phrases[0] instanceof ishml.Phrase)  //send items down to the core phrase
		{
			this.phrases[0].fill(...items)
			//this.catalog()
			return this	

		}
		//We're at the core so update phrase array with items.

		//this.erase()  //get rid of leftovers from last fill
		if(!(items[0]===undefined) && (Object.getPrototypeOf(items[0])===Object.prototype && items[0]?._tagPhrase))
		{
			this._fill(items[0]._data)
		}
		else {this._fill(...items)}
		//this.catalog()
		return this 
	}
	_fill(literals, ...expressions)
	{
		var data=[]
		if (literals !== undefined)
		{
			var index=1
			if( literals.hasOwnProperty("raw"))
			{
				if (expressions.length===0)  //_`blah`
				{
					data=literals
				}
				else //_`blah${}blah` interleave literals into expressions.
				{
					
					if(expressions.length>0)
					{
						var interleaving=expressions.reduce((interleaving,expression)=>
						{
							interleaving.push(expression)
							if (literals[index].length>0)
							{
								interleaving.push(literals[index])
							}
							index++
							return interleaving
						},[])
						
					}
					
					if (literals[0].length !== 0)
					{
						interleaving.unshift(literals[0])
					
					}
					if (index < literals.length)
					{
						interleaving=interleaving.concat(literals.slice(index))
					}
					data=interleaving
				}
			}
			else //function call notation
			{
				if (expressions.length >0 ) // data is simple list of args
				{
					data=[literals].concat(expressions)
				}	
				else  
				{
					if (literals instanceof Array)//_(["blah","blah",_()]) 
					{
						data=literals //avoid wrapping array in array because (a,b,c) is equivalent notation to [a,b,c]
					}
					else //_fill("blah") or _fill(), _fill({properties}) _fill(x=>blah)
					{
						if(literals)
						{	
							data=[literals]
						}
					}
				}
			}
		}				

		if (data.length===0){this.phrases=data}
		else
		{
			this.phrases=data.map(phrase=> //normalize phrases
			{
				//if (phrase===undefined || phrase === null){return ""}
				var phraseType=typeof phrase
				if(phraseType==="string" ||Object.getPrototypeOf(phrase)===Object.prototype || phrase.generate || phraseType==="function" )
				{return phrase}

				return phrase.toString()

			})
		}	
		return this
	}
	prepend(documentSelector)
	{
		if (documentSelector)
		{
			var targetNodes = document.querySelectorAll(documentSelector)
			targetNodes.forEach(node=>node.prepend(this.htmlTemplate().content))
		}	
		return this
	}
	
	replace(documentSelector)
	{
		if (documentSelector)
		{
			var targetNodes = document.querySelectorAll(documentSelector)
			targetNodes.forEach(node=>
			{
				while(node.firstChild){node.removeChild(node.firstChild)}
				node.append(this.htmlTemplate().content)
			})
		}	
		return this
	}	
	reset()
	{ 
		this.phrases.forEach(phrase=>
		{
			if(phrase instanceof ishml.Phrase){phrase.reset()}	
		})
		return this
	}
	get results(){return this._results}
	set results(value){this._results=value}
	say(seed) 
	{
		if (seed>=0){this.seed(seed)}
		this.generate()
		return this
	}
	seed(seed) 
	{
		if (seed>=0 && seed <1){this._seed=Math.floor(seed* 2147483648)}
		else
		{
			if(!seed){this._seed=ishml.util.random().seed}
			else{this._seed=seed}
		}
		this.phrases.forEach(phrase=>
		{
			if(phrase instanceof ishml.Phrase)
			{
				phrase.seed(ishml.util.random(this._seed).seed)
			}	
		})
		return this
	}
	tag(id)
	{
		this.id=id
		this.catalog()
		return this
	}
	lock(id)
	{
		this._locked=true
		return this
	}
	get then()
	{
		var primaryPhrase=this
		return new Proxy((...precursor) => new class thenPhrase extends ishml.Phrase
		{
			constructor()
			{
				super()
				this.phrases[0]=primaryPhrase
				this.phrases[1]=new ishml.Phrase(...precursor)
				this.catalog()
			}
			generate()
			{
				var results=this.phrases[0].generate()
				if (results.length>1 || (results.length===1 && results[0].value!==""))
				{
					this.results=results
					this.text=this.phrases[0].text
				}
				else
				{
					this.results=this.phrases[1].generate()
					this.text=this.phrases[1].text
				}
				return this.results
			}
		},ishml.template.__handler)
	}
	

	//Unlike modify, expand takes a phrase factory and applies the results of this phrase to it.
	expand(phraseFactory)
	{
		var thisPhrase=this
		return new class expandPhrase extends ishml.Phrase
		{
			generate()
			{
				this.results=thisPhrase.generate()
				this.text=this.toString()
				if (this.text)
				{
					if(this.results.length===1 && this.results[0].value instanceof Array)
					{
						this.results=phraseFactory(this.results[0].value).generate().map(item=>Object.assign({},item))	
					}
					else
					{
						this.results=phraseFactory(this.results).generate().map(item=>Object.assign({},item))
					}
					this.text=this.toString()
				}
				else 
				{
					this.results=[]
					this.text=""
				}
				return this.results
			}
		}(this)
	}
	toString()
	{
		return this.results.map(result=>
		{	
			if (result===undefined){return ""}
			if (Object.getPrototypeOf(result)===Object.prototype)
			{
				if ( result.hasOwnProperty("value"))
				{
					return result.value.toString()
				}
				var value =Object.values(result)[0]
				if (value===undefined){return ""}
				return value.toString()
			}
		}).join("")	
	}
	
}
ishml.Phrase.define=function(id)
{
	var as= (phraseFactory)=>
	{
		Object.defineProperty(ishml.Phrase.prototype,id,
		{
			get()
			{
				return phraseFactory(this)
			}
		})
	}
	return {as:as}	
}
ishml.Phrase.__handler=
{
	get: function(target, property, receiver) 
	{
		if (Reflect.has(target,property,receiver)) 
		{
			return Reflect.get(target,property,receiver)
		}
		else 
		{
			if (property.toUpperCase()===property) 
			{
				return new ishml.Phrase(target).tag(property.toLowerCase())
			}
			else
			{
				if(target.constructor.name==="siblingPhrase"){return ishml.template.child(target,property)}
				else{return ishml.template.sibling(target,property)}
			}
		}
	}	
}

// #endregion
// #region Template
ishml.template={}
ishml.template.__handler=
{
	 //_.a.b.c() becomes _.a(b(c()))
	 //_.a.b.c.TAG() becomes _.a(b(c())) c() is tagged
	 //_.a.TAG.b.c() becomes _.a(b(c())) b(c()) is tagged
	 //_.a.b.tag becomes _.a(b(echo(tag)))
	 //_.a.b.tag.data1 becomes _.a(b(data1(echo(tag)))))
	 //_.a.b.tag.data1.data2 becomes _.a(b(datadata1(echo(tag)))))
	 //_.a.tags.b becomes 
	 //_.a.cap.pick("cat","dog","frog")
	 //t=>_.a.cap(t.noun.description.z)

	//if template[asFunction] is undefined, property refers to a tagged phrase.
	get:function(template, property,receiver)
	{
		//template is function that returns a phrase
		if (property==="asFunction")
		{
			return template	 
		}
		//_.a.b.c() becomes _.a(b(c()))
		if (ishml.template.hasOwnProperty(property)) //property is a template
		{
			return new Proxy
			(
				function(...precursor)
				{
					return template(ishml.template[property].asFunction(...precursor))
				},		
				ishml.template.__handler
			)
		}
		//_.a.b.c.TAG() becomes _.a(b(c())) c() is tagged
	 	//_.a.TAG.b.c() becomes _.a(b(c())) b(c()) is tagged
		if (property.toUpperCase()===property)  //property is request to create a tagged phrase
		{
			var finalPhraseFactory=(...precursor)=>template(new ishml.Phrase(...precursor).tag(property.toLowerCase()))
			var priorPhraseFactory=(...precursor)=> new ishml.Phrase(...precursor).tag(property.toLowerCase())
			var handler=Object.assign(
				{
					wrapper:template,
					prior:priorPhraseFactory,
					sibling:true //next property request for sibling
				},
				ishml.template.__handler	
			)
			return new Proxy(finalPhraseFactory,handler)
		}
		if (this.sibling)  //property is request for sibling phrase
		{
			var finalPhraseFactory=()=>this.wrapper(ishml.template.sibling(this.prior(),property))
			var priorPhraseFactory=()=>ishml.template.sibling(this.prior(),property)
			var handler=Object.assign(
				{
					wrapper:this.wrapper,
					prior:priorPhraseFactory,
					child:true  //next property request is for child
				},
				ishml.template.__handler	
			)
			return new Proxy(finalPhraseFactory,handler)			

		}
		if (this.child)
		{
			var finalPhraseFactory=()=>this.wrapper(ishml.template.child(this.prior(),property))
			var priorPhraseFactory=()=>ishml.template.child(this.prior(),property)
			var handler=Object.assign(
				{
					wrapper:this.wrapper,
					prior:priorPhraseFactory,
					child:true  //all future property request are for children
				},
				ishml.template.__handler	
			)
			return new Proxy(finalPhraseFactory,handler)	
		}
		//property is neither request for child nor sibling; must be echo phrase
		var finalPhraseFactory=()=>template(ishml.template.echo(property))
		var priorPhraseFactory=()=>ishml.template.echo(property)
		var handler=Object.assign(
			{
				wrapper:template,
				prior:priorPhraseFactory,
				sibling:true //next property request for sibling
			},
			ishml.template.__handler	
		)
		return new Proxy(finalPhraseFactory,handler)
	}
}

ishml.template.defineClass=function(id)
{
	var as= (phraseClass)=>
	{
		ishml.template[id]=new Proxy((...precursor)=>new phraseClass(...precursor),ishml.template.__handler)
	}
	return {as:as}	
}
ishml.template.define=function(id)
{
	var as= (phraseFactory)=>
	{
		ishml.template[id]=new Proxy(phraseFactory,ishml.template.__handler)
	}
	return {as:as}	
}
ishml.template._=new Proxy
(
	function _(...data)
	{
		if (data.length===1 && data[0] instanceof ishml.Phrase) return data[0]
		else return new ishml.Phrase(...data)
	}
	,ishml.template.__handler
)
ishml.template.define("cycle").as((...data)=>
{
	var counter=0
	return new class cyclePhrase extends ishml.Phrase
	{
		fill(literals, ...expressions)
		{
			super.fill(literals, ...expressions)
			counter=0
			return this
		}
		generate()
		{
			var results=[]	
			if (this.phrases.length===1 && this.phrases[0] instanceof ishml.Phrase)
			{
				results=super.generate()
				var total=this.results.length
				results=results.slice(counter,counter+1)
			}
			else
			{
				var results=super.generate(this.phrases.slice(counter,counter+1))
				var total=this.phrases.length
			}
			if (this.results.length===0)
			{
				this.results=[{value:"",index:0, rank:0, total:0,  reset:true}]
				this.text=""
				var total=0
			}
			else
			{
				Object.assign(results[0],{index:counter, rank:counter+1,total:total, reset:counter===total-1})
				this.results=results
				this.text=results[0].value
			}	
			counter++
			if (counter===total || total===0)
			{
				counter=0
				this.reset()
			}
			return this.results
		}
	}(...data)
})
ishml.template.echo=function echo(tag)
{
	return new class echoPhrase extends ishml.Phrase
	{
		constructor()
		{
			super()
			if (tag instanceof ishml.Phrase){this.phrases[0]=tag}
			this.echo=true
		}
		generate()
		{
			if (this.phrases.length===0){this.phrases[0]=this.tags[tag]}

			if (this.echo){this.results=this.phrases[0].results}
			else{this.results=this.phrases[0].generate()}
			this.text=this.toString()
		//	this.tally=this.phrases[0].value.tally
			return this.results
		}
		get inner()
		{
			if (this.phrases.length===0){var innerPhrase= echo(this.tags[tag].inner)}
			else {var innerPhrase= echo(this.phrases[0].inner)}
			innerPhrase.echo=this.echo
			return innerPhrase
		}
		get results()
		{
			if (this.phrases.length===0){tag.results}
			else {return super.results}
		}
		set results(value){this._results=value}
	}()		
}
//_.blah.echo.data.data
//_blah.data.data

ishml.template.sibling=function sibling(phrase, property)
{
	return new class siblingPhrase extends ishml.Phrase
	{
		constructor()
		{
			super()
			this.phrases[0]=phrase
		}
		generate()
		{
			this.results=this.phrases[0].generate()
			if (this.results.length===1 && this.results[0][property].generate)
			{
				this.results= this.results[0][property].generate()
			}
			else
			{	
				this.results=this.results.map(result=>({value:result[property]}))
			}	
			/*Object.assign
			(
				{},
				(result[property].data?{value:result[property].data()}:{value:result[property]})
			))*/
			this.text=this.toString()
			//this.tally=this.phrases[0].value.tally
			return this.results
		}
	}()		
}
ishml.template.define("child").as(function child(parent,property)
{
	return new class childPhrase extends ishml.Phrase
	{
		constructor()
		{
			super()
			this.phrases[0]=parent
		}
		generate()
		{
			this.results=this.phrases[0].generate()
			if (this.results.length===1 && this.result[0].value[property].generate)
			{
				this.results= this.results[0].value[property].generate()
			}
			else
			{	
				this.results=this.results.map(result=>({value:result.value[property]}))
			}
			
			/*Object.assign
			(
				{},
				(result.value[property].data?{value:result.value[property].data()}:{value:result.value[property]})
			))*/
			this.text=this.toString()
			//this.tally=this.phrases[0].value.tally
			return this.results
		}
	}()		
})
ishml.template.define("ante").as(function ante(outer)
{
	return new class antePhrase extends ishml.Phrase
	{
		constructor()
		{
			super(outer)
		}
		generate()
		{
			var target=this.inner
			this.results=target.generate()
			this.text=target.text
		//	this.tally=target.tally
			return this.results
		}

		get inner()
		{
			var counter=0
			var target=this
			while (target.constructor.name === "antePhrase")
			{
				counter++
				target=target.phrases[0] //.value
			}
			for (let i = 0; i <counter; i++)
			{
				target=target.inner
			}	
			return target
		}
	}()		
})

ishml.template.defineClass("favor").as( class favorPhrase extends ishml.Phrase
{
	generate()
	{
		if(this.phrases.length===0)
		{
			this.text=""
			this.results=[]
			//this.tally++
			return this.results
		}
		else
		{
			var {value:random,seed}=ishml.util.random(this._seed)
			this._seed=seed
			
			if (this.phrases.length===1 && this.phrases[0] instanceof ishml.Phrase)
			{
				var results=super.generate()
				var total=results.length
				var c=total*(total+1)*random
				var counter=total-Math.floor((Math.sqrt(1+4*c)-1)/2)-1
				results=results.slice(counter,counter+1)
			}
			else
			{
				var total=this.phrases.length
				var c=total*(total+1)*random
				var counter=total-Math.floor((Math.sqrt(1+4*c)-1)/2)-1
				var results=super.generate(this.phrases.slice(counter,counter+1))
			}

			results.forEach(phrase=>
			{
				phrase.index=counter
				phrase.rank=counter+1
				phrase.total=total
			})
			this.results=results
			return this.results
		}
	}
	
})
ishml.template.define("pick").as((...data)=>
{
	var previous
	return new class pickPhrase extends ishml.Phrase
	{
		generate()
		{
			if(this.phrases.length===0)
			{
				this.text=""
				this.results=[]
				//this.tally++
				return this.results
			}
			else
			{
				var {value:random,seed}=ishml.util.random(this._seed)
				this._seed=seed
				if (this.phrases.length===1 && this.phrases[0] instanceof ishml.Phrase)
				{
					var results=super.generate()
					var total=results.length
					var counter=Math.floor(random*total)
					if (counter===previous){counter =(counter+1)%total}
					previous=counter
					results=results.slice(counter,counter+1)
				}
				else
				{
					var total=this.phrases.length
					var counter=Math.floor(random*total)
					if (counter===previous){counter =(counter+1)%total}
					previous=counter
					var results=super.generate(this.phrases.slice(counter,counter+1))
				}

				results.forEach(phrase=>
				{
					phrase.index=counter
					phrase.rank=counter+1
					phrase.total=total
				})
				this.results=results
				return this.results
			}
		}
	}(...data)
})
ishml.template.define("re").as((phrase)=>
{
	phrase.re=true
	return phrase
})

ishml.template.define("cull").as((...precursor)=>
{
	return new class cullPhrase extends ishml.Phrase
	{
		generate()
		{
			super.generate()
			this.results=this.results.reduce((results,item)=>
			{
				if (item.value){ results.push(item)}
				return results
			},[])
			return this.results
		}
	}(...precursor)
})
ishml.template.define("refresh").as((...precursor)=>
{
	return new class refreshPhrase extends ishml.Phrase
	{
		generate()
		{
			this.reset()
			super.generate()
			return this.results
		}
	}(...precursor)
})
ishml.template.defineClass("roll").as( class rollPhrase extends ishml.Phrase
{
	generate()
	{
		if(this.phrases.length===0)
		{
			this.text=""
			this.results=[]
			//this.tally++
			return this.results
		}
		else
		{
			var {value:random,seed}=ishml.util.random(this._seed)
			this._seed=seed
			if (this.phrases.length===1 && this.phrases[0] instanceof ishml.Phrase)
			{
				var results=super.generate()
				var total=results.length
				var counter=Math.floor(random*total)
				results=results.slice(counter,counter+1)
			}
			else
			{
				var total=this.phrases.length
				var counter=Math.floor(random*total)
				var results=super.generate(this.phrases.slice(counter,counter+1))
			}

			results.forEach(phrase=>
			{
				phrase.index=counter
				phrase.rank=counter+1
				phrase.total=total
			})
			this.results=results
			return this.results
		}
	}
})
ishml.template.define("series").as((...data)=>
{
	var counter=0
	return new class seriesPhrase extends ishml.Phrase
	{
		fill(literals, ...expressions)
		{
			super.fill(literals, ...expressions)
			this.ended=false
			counter=0
			return this
		}
		generate()
		{
			var results=[]	
			if (this.phrases.length===1 && this.phrases[0] instanceof ishml.Phrase)
			{
				var results=super.generate()
				var total=results.length
				results=results.slice(counter,counter+1)
			}
			else
			{
				var results=super.generate(this.phrases.slice(counter,counter+1))
				var total=this.phrases.length
			}
			if (this.ended || this.results.length===0 )
			{
				this.results=[{value:"",index:0, rank:0, total:0,  reset:true}]
				this.text=""
				var total=0
			}
			else
			{
				Object.assign(results[0],{index:counter, rank:counter+1,total:total})
				this.results=results
				this.text=results[0].value.toString()
			}

			counter++
			if (counter===total)
			{
				this.ended=true
				counter=0
			}
			return this.results
		}
		reset()
		{
			super.reset()
			this.ended=false
			counter=0
			return this
		}
	}(...data)
})
ishml.template.define("shuffle").as((...data)=>
{
	var reshuffle =true
	return new class shufflePhrase extends ishml.Phrase
	{
		generate()
		{
			if (reshuffle)
			{
				super.generate()
				var {value:random,seed}=ishml.util.random(this._seed)
				this._seed=seed
				this.results=ishml.util.shuffle(this.results,random).result
				reshuffle=false
			}
			this.text=this.toString()
			return this.results
		}
		
		fill(literals, ...expressions)
		{
			super.fill(literals, ...expressions)
			reshuffle=true
		}
		reset()
		{
			super.reset()
			reshuffle=true
			return this
		}
		
	}(...data)
})

ishml.template.define("pin").as((...data)=>
{
	var pin =true
	return new class pinPhrase extends ishml.Phrase
	{
		fill(literals, ...expressions)
		{
			super.fill(literals, ...expressions)
			pin =true
			return this
		}
		generate()
		{
			if (pin)
			{
				super.generate()
				pin=false
			}
			
			return this.results
		}
		reset()
		{
			if(pin)
			{
				super.reset()
			}
		}
	}(...data)
})
ishml.template.define("spc").as((...precursor)=>
{
	return new class spacePhrase extends ishml.Phrase
	{
		generate()
		{
			super.generate()
			
			this.text=this.toString()
			
			if (this.text!==""){var space=" "}
			else{var space=""}
			this.results.unshift({value:space})
			this.text=space+this.text
			
			return this.results
		}
	}(...precursor)
})

ishml.template.define("next").as(function next(precursor)
{
	precursor.echo=false
	return precursor
})

// #endregion
// #region narrative

// #region Token
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
// #endregion
// #endregion
// #region viewpoint
ishml.viewpoint=function(actor)
{
	if(actor)
	{
		this._viewpoint=actor
	}	
	return this._viewpoint
}
// #endregion
ishml.clock=new Date()
ishml.interval= 60000  //1 minute
ishml.turn=1
ishml.glossary=new ishml.Lexicon()
ishml.grammar=new ishml.Rule()
ishml.parser=null
ishml.tense={imperative:0,present:1, past:2, perfect:3}
ishml._viewpoint=null
ishml.undoLength=10
ishml.lang={}
ishml.phrasebook_handler=
{
	get: function(target, property,receiver) 
	{ 
		if (Reflect.has(target,property)){return Reflect.get(target,property,receiver)}
		else 
		{
			//magic properties
			target[property]=new Proxy({},ishml.phrasebook_handler)
			return target[property]
		}
	}
}
ishml.phrasebook=new Proxy({},ishml.phrasebook_handler)

ishml.configure=function(options)
{
	//DEFECT TO DO seed, name, author, etc.
}

// #region storytelling
ishml.tell=function(timeline="player") 
{
	while(this.storyline[timeline].length>0)
	{
		Object.keys(this.storyline).forEach(timeline=>
		{
			this.storyline[timeline].forEach((episode,index)=>
			{
				if (!episode.start() || episode.start() <= this.clock)
				{
					if (episode.resolve(this.clock).told){episode.narrate()}
				}
			})
			this.storyline[timeline]=this.storyline[timeline].filter(episode=>!episode.told)
		})
		this.tick()
	}	
	this.turn++
	return this
}

ishml.introduce=function(episode) 
{
	var timeline=episode.timeline()
	if (!this.storyline.hasOwnProperty(timeline))
	{
		this.storyline[timeline]=[]
	}

	this.storyline[timeline].push(episode)
	return this
}	
// #endregion

/* A turn is a processing of all the episodes on the the storyline.  An episode is a plotpoint.narrate with bound arguments.*/ 

ishml.tick=function(ticks=1)
{
	this.clock.setTime(this.clock.getTime() + (this.interval*ticks))
}

// #region semantics

ishml.net={}  //semantic network, where nouns and facts live.
ishml.index={}  // indexes for semantic network
ishml.classes={}  //Classes that users might want to extend
ishml.proxies={}
ishml.proxies.newless= //instantiate a class without new operator
{
	apply: function (target, thisArg, args)  //temporary proxy for creating new-less class instances
	{
		return new target(...args)
	}
} 


// #region adjective

ishml.adjective=function(literals, ...expressions)
//adjective`locked`.opposite`unlocked`.describes`security`  -- boolean adjective
//adjective`dark,dim,bright`.describes`lighting`  -- enum
//adjective`tall`.value(72).describes`height` -- numbers and strings

//select`tall _people_ who carry a ring that is not iron` --"tall" and "who" filter the _people_ noun list
{
	var names=ishml.formatName(literals, ...expressions).split(",")
		
	if (names.length>1){var type="enum"}
	else{ var type="boolean"}	//may be overridden by value()
	var adjOpposite=null
	var adjValue=null
	var describes=(literals, ...expressions)=>
	{
		if(literals===undefined) throw new Error(`ERROR 0001: Adjective ${names.toString} describes undefined property.`)
		let property=ishml.formatName(literals, ...expressions)
		let length=names.length
		names.forEach((name,index) => 
		{
			if (type==="enum")
			{
				ishml.glossary.register(name).as({part: "adjective", value:index, filter:noun=>noun[property]===index,
					toggle:noun=>noun[property]=(noun[property]+1)%length , property:property})
			}
			else if(type=="boolean")
			{
				ishml.glossary.register(name).as({part: "adjective", value:true, filter:noun=>noun[property]===true, 
					toggle:noun => noun[property]=!noun[property], property:property})
				if (adjOpposite)
				{
					ishml.glossary.register(adjOpposite).as({part: "adjective", value:false, filter:noun=>noun[property]===false, 
						toggle:noun => noun[property]=!noun[property],property:property})
				}
			}
			else  //value
			{
				ishml.glossary.register(name).as({part: "adjective",value:adjValue,filter:noun=>noun[property]===adjValue,
					toggle:noun=>{},property:property})
			}
		})
		return ishml
	}
	var opposite=(literals, ...expressions)=>
	{
		type="boolean"
		adjOpposite=ishml.formatName(literals, ...expressions)
		return {describes:describes}
	}
	
	var value=(v)=> //some other value that isn't an enum or boolean
	{
		type="value"
		adjValue=v
		return {describes:describes}
	}

	if (type==="enum") return {describes:describes}
	else return {describes:describes, opposite:opposite, value:value}
}
// #endregion

// #region Fact
ishml.fact=new Proxy 
(
	class Fact
	{
		constructor(statement={tense:0,mood:0,voice:0,polarity:0}) //ishml.fact({predicate:{},tense:1,mood:0,voice:0,polarity:0,arguments:{subject:{},carry:{}},nouns:[]}
		{
			let keys=Object.keys(statement.arguments)
			let id=statement.nouns[0] //+"_"+fact.predicate.verb
			for (let index = 1; index < keys.length; index++) {id=id+"_"+keys[index]+"_"+statement.arguments[keys[index]]}
			statement.nouns=statement.nouns.map(noun=>ishml.net[noun]?ishml.net[noun]:ishml.noun`${noun}`)
			keys.forEach(key=>{statement.arguments[key]=ishml.net[statement.arguments[key]]}) //subject:"player" to subject:player
			Object.defineProperty(this, "id",{value:id,enumerable:false})
			Object.defineProperty(this, "predicate",{value:statement.predicate,enumerable:false})
			Object.defineProperty(this, "tense",{value:statement.tense,enumerable:false})
			Object.defineProperty(this, "mood",{value:statement.mood,enumerable:false})
			//Object.defineProperty(this, "voice",{value:statement.voice,enumerable:false})  //all facts in network are active voice
			Object.defineProperty(this, "polarity",{value:statement.polarity,enumerable:false})
			Object.defineProperty(this, "nouns",{value:statement.nouns,enumerable:false})
			Object.defineProperty(this, "history",{value:[],enumerable:false})
			Object.assign(this,statement.arguments)

			//ishml.net[id]=this


		}

		get prepositions(){return Object.keys(this).slice(2)}
		get verb(){return Object.keys(this)[1]}

	/*	reify()
		{
			this.predicate.reify(this)
		}*/
	},
	ishml.proxies.newless
)
// #endregion

// #region noun
ishml.proxies.noun=
{	
	//noun.property(value) sets value of property and returns noun
	//noun.property() returns value of property

	get: function(target, property, receiver) //receiver is proxy.
	{
		var methods=
		{
			
			description:(literals, ...expressions)=>
			{
				if(literals===undefined) return target.description
				target.description=ishml.template._(literals,...expressions)
				return receiver
			},
			
			name:(literals, ...expressions)=>
			{
				if(literals===undefined) return target.name
				let name=ishml.formatName(literals, ...expressions)
				target.name=name
				ishml.glossary.register(name).as({part: "noun", key:target.id})
				return receiver
			},
		}
		if (typeof target[property] === "function") return target[property]
		if(methods.hasOwnProperty(property)) return methods[property]
		if (property==="id") return target[property]

		return function(value)
		{
			if (value===undefined){return target[property]}

			//DEFECT to do: dispatch proposed change to plot
			target[property]=value

			//DEFECT to do: dispatch change to plot

			return receiver
		}

	}
	
}
ishml.noun=new Proxy
(
	class Noun
	{
		constructor(literals, ...expressions) // maybe template literal notation or function notation
		{
			Object.defineProperty(this, "id",{value:ishml.formatId(ishml.toString(literals, ...expressions)),enumerable:false})
			Object.defineProperty(this, "description",{value:ishml.template._,enumerable:false,writable:true})
			Object.defineProperty(this, "name",{value:ishml.formatName(this.id),enumerable:false,writable:true})
			let noun=new Proxy(this,ishml.proxies.noun)
			ishml.net[this.id]=noun
			ishml.glossary.register(this.name).as({part: "noun",  key:this.id})
			return noun
		}
		aka(literals, ...expressions)
		{
			ishml.glossary.register(ishml.formatName(ishml.toString(literals, ...expressions))).as({part: "noun", key:this.id})	
			return this
		}
		kind(literals, ...expressions)
		{
			let kind=ishml.net[ishml.formatName(literals, ...expressions)]
			if (kind)
			{
				Object.keys(kind).forEach((key)=>
				{
					this[key]=kind[key]()
				})
			}
			else throw new Error("ERROR 0002: Unable to assign kind ${kind} to ${this.id}.")
			return this
		}
	},
	ishml.proxies.newless	
)
// #endregion

// #region predicate

//predicate`connect to on north`.adverb`one-way`.reify(reality=>reality).select(reality||nounList=>reality).check(reality||nounList=>proposition)

//oak door connects bar to foyer on north.  
//adverbs supply hints for processing reify and select
//magic portal connects bar to foyer on north one-way. -- adverbs may appear at end
//magic portal one-way connects bar to foyer on north. -- adverbs may appear before verb
//twisty passage one-way connects bar to foyer on north. twisty passage one-way connects foyer to bar on east. 

//ishml.lang.es("verb") --third person present tense: she leaps.

ishml.classes.Predicate=class Predicate
{
	constructor(literals, ...expressions) // maybe template literal notation or function notation
	{
		let name=ishml.toString(literals, ...expressions)
		let p_strings=name.split(" ")
		Object.defineProperty(this, "id",{value:ishml.formatId(name),enumerable:false})
		//Object.defineProperty(this, "name",{value:ishml.formatName(this.id),enumerable:false,writable:true})
		Object.defineProperty(this, "verb",{value:ishml.formatName(p_strings[0]),enumerable:false,writable:false})
		Object.defineProperty(this, "prepositions",{value:p_strings.splice(1),enumerable:false,writable:false})
		Object.defineProperty(this, "mutual",{value:false,enumerable:false})
		Object.defineProperty(this, "exclusive",{value:false,enumerable:false})

		ishml.lang.conjugate(this.verb,"active","affirmative")
			.concat(ishml.lang.conjugate(this.verb,"active","negative"))
			.forEach(conjugation=>
			{
				let name=conjugation.name
				delete conjugation.name
				conjugation.predicate=this
				ishml.glossary.register(name).as(conjugation)
			})
		this.prepositions.forEach(preposition=>
		{
			ishml.glossary.register(preposition).as({part:"preposition", key:preposition, predicate:this})
		})	
		return new Proxy(this,ishml.proxies.predicate)		
	}

	adverb(literals, ...expressions)
	{
		ishml.glossary.register(ishml.toString(literals, ...expressions)).as({part: "adverb",  predicate:this})
		return this

	}
	aka(literals, ...expressions)
	{
		let verb=ishml.toString(literals, ...expressions)
		ishml.lang.conjugate(verb,"active","affirmative")
			.concat(ishml.lang.conjugate(verb,"active","negative"))
			.forEach(conjugation=>
			{
				let name=conjugation.name
				delete conjugation.name
				conjugation.predicate=this
				ishml.glossary.register(name).as(conjugation)
			})
		return this
	}
	check(reality)
	{
		//TO DO: use reality to find facts in ishml.net that match 

		if (reality.size>0) return true
		return false
	}
	passive(literals, ...expressions)
	{
		let verb=ishml.toString(literals, ...expressions)
		ishml.lang.conjugate(verb,"passive","affirmative")
			.concat(ishml.lang.conjugate(verb,"passive","negative"))
			.forEach(conjugation=>
			{
				let name=conjugation.name
				delete conjugation.name
				conjugation.predicate=this
				ishml.glossary.register(name).as(conjugation)
			})
	}
	reify(statement) //{predicate, tense, mood, voice, polarity, arguments, nouns}
	{
		let fact=ishml.fact(statement)
		ishml.net[fact.id]=fact
		statement.nouns.forEach((noun,index)=>
		{
			let indicator =ishml.index[this.id]
			if (!indicator)indicator=ishml.index[this.id]=[]
			if (indicator[index])
			{
				if(indicator[index][noun.id])indicator[index][noun.id].add(fact)
				else indicator[index][noun.id]=ishml.reality().add(fact)
			}
			else indicator[index]={[noun.id]:ishml.reality().add(fact)}
		})
		return this
	}
	select(statement)
	{
		//TO DO: use statement to find facts in ishml.net that match 
		
		let reality=ishml.reality()
	
		statement.nouns.every((noun,nounIndex)=>
		{
			let entry=ishml.index[this.id][nounIndex][noun]
			if (entry)
			{
				if (nounIndex===0)
				{
					reality=reality.union(entry)
				}
				else 
				{
					reality=reality.intersection(index[nounIndex][entry])
				}
				return true
			}
			else
			{
				reality.clear()
				return false
			}
		})
		return reality
	}
}
ishml.proxies.predicate=
{	
	//use setter/getter for properties
	//predicate.property() returns value of property predicate.property(value) sets property with value
	get: function(target, property, receiver) //receiver is proxy.
	{
		if (typeof target[property] === "function" || property==="id") return target[property]
		return function(value)
		{
			if (value===undefined){return target[property]}
			target[property]=value
			return receiver
		}
	}	
}

ishml.predicate=new Proxy(ishml.classes.Predicate,ishml.proxies.newless)
// #endregion

// #region reality
ishml.reality=new Proxy
(
	class Reality extends Set 
	{
		
		constructor(placeholder)
		{
			super()
			Object.defineProperty(this, "placehoder",{value:placeholder,enumerable:false,writable:false})
		}
		filter(filter)
		{
			var reality = new Reality()
			this.forEach((fact)=>
			{
				if (filter(fact)){reality.add(fact)}

			})
			return reality
		}
		/* filters:
		afterTurn
		beforeTurn
		fromTurn
		throughTurn
		afterTick
		beforeTick
		fromTick
		throughTick
		ever
		never
		now
		filter

		+ all operations inherited from Set.

		check returns boolean .size >0 

		*/
		
	},ishml.proxies.newless
)
// #endregion

// #region dsl


/* EBNF:
	dsl=>facts
	facts=>fact"."+
	fact=>subject predicate
	subject=>"("fact")"|nounPhrase
	predicate=>verb verbComplement
	verbComplement=>target prepositionalPhrase*
	target=>"("fact")"|nounPhrase
	prepositionalPhrase=>preposition complement
	complement=>"("fact")"|nounPhrase
	nounPhrase=>[article] adjectives* noun
	noun=>lexiconNoun|placeholder
	wildcard=>/^_[a-zA-Z]\w*[a-zA-Z _]_/
	placeholder=>/^#[a-zA-Z]\w*[a-zA-Z _]#/
	
Test:

A wildcard is used for matching in select statements.  A placeholder is used for creating nouns on the fly.

oak door connects bar to foyer on north.  -- implies abuttal implies reciprocal connection foyer to bar on south
exit connects bar to foyer on north. -- generic exit.
magic portal one-way connects bar to foyer on north. -- one-way adverb suppresses abuttal and reciprocal connection.
twisty passage one-way connects bar to foyer on north. twisty passage one-way connects foyer to bar on east.  --two-way connection without reciprocity and abuttal.
chute one-way connects bar to foyer.  bar abuts foyer on bottom


	 
*/

ishml.dsl={}
ishml.dsl.placeholder=ishml.Rule().configure({separator:/^\s*|\.|\,/,regex:/^#[a-zA-Z][\w ]*#/})
ishml.dsl.wildcard=ishml.Rule().configure({separator:/^\s*|\.|\,/,regex:/^\_[a-zA-Z][\w ]*\_/})
ishml.dsl.nounPhrase=ishml.Rule()
	.snip("article").snip("adjectives").snip("noun")

ishml.dsl.nounPhrase.configure({semantics:interpretation=>
{
	const definition=interpretation.gist.noun.definition
	const key=definition.key??definition.match
	const adjectives=interpretation.gist.adjectives?.map(adjective=>adjective.definition)//.forEach(adjective=>ishml.net[key]?.[adjective.property]()===adjective.value)
	interpretation.gist={adjectives:adjectives, nouns:[key]}

	return true
}})
ishml.dsl.nounPhrase.article.configure({separator:/^\s*|\.|\,/,minimum:0,filter:(definition)=>definition?.part==="article"})
ishml.dsl.nounPhrase.adjectives.configure({separator:/^\s*|\.|\,/,minimum:0,maximum:Infinity,filter:(definition)=>definition?.part==="adjective"})
ishml.dsl.nounPhrase.noun.configure({mode:ishml.Rule.apt,semantics:interpretation=>
	{
		console.log(interpretation)
		return true
	}})
	.snip(0)
	.snip(1,ishml.dsl.placeholder)
	.snip(2,ishml.dsl.wildcard)
ishml.dsl.nounPhrase.noun[0].configure({separator:/^\s*|\.|\,/,filter:(definition)=>definition?.part==="noun",})	

ishml.dsl.argument=ishml.Rule().configure({mode:ishml.Rule.apt,semantics:interpretation=>
{
	let gist=interpretation.gist
	return true

}})
.snip(0)
.snip(1,ishml.dsl.nounPhrase)

ishml.dsl.argument[0].snip("(").snip("statement",ishml.dsl.statement).snip(")")
ishml.dsl.argument[0]["("].configure({regex:/^\(/})
ishml.dsl.argument[0][")"].configure({regex:/^\)/})

ishml.dsl.statement=ishml.Rule().configure({semantics:interpretation=> //Due to wildcards, each statement may involve multiple facts.  
{
	let verb=interpretation.gist.predicate.verb.definition
	let argumentList=[]
	let gist=[]	
	argumentList.push({key:"subject", value:interpretation.gist.subject},{key:verb.predicate.verb,value:interpretation.gist.predicate.directObject})
	interpretation.gist.predicate.prepositionalPhrases?.forEach(phrase=>nouns.push({key:phrase.preposition.definition.key,value:phrase.target}))

	argumentList.forEach((argument,argumentIndex)=> 
	{

/*
{	
    "key": "subject",
    "value": {
        "adjectives": [
            {
                "part": "adjective",
                "value": 72,
                "property": "height"
            }
        ],
        "nouns": [
            "_person_"
        ]
    }
}
 */
		
		argument.value.wildcard={}
		argument.value.nouns=argument.value.nouns.reduce((accumulator,noun,index)=>  //resolve wildcards
		{
			if (noun.startsWith("_"))
			{
				accumulator=accumulator.concat(Object.keys(ishml.index[verb.predicate.id]?.[index]??{}))
				argument.value.wildcard[noun.slice(1,-1)]=argumentIndex
			}
			else accumulator.push(noun)
			return accumulator
		},[])
		argument.value.adjectives?.forEach(adjective=>  //apply adjectives to nouns
		{
			argument.value.nouns=argument.value.nouns.filter(noun=>
			{
				if (noun.startsWith("#")) return true
				else return ishml.net[noun][adjective.property]()===adjective.value
				
			})
		})	
	})
	const wildcard={}
	argumentList.forEach(argument=> //collect all wildcards across all arguments.
	{
		Object.assign(wildcard,argument.value.wildcard)
	})
	argumentList.map(argument=>argument.value.nouns.map(value=>({[argument.key]:value})))
	.reduce((a,b)=> //create array of all possible argumentSets.
	{ 
		let result=[]
		a.forEach(x=>{b.forEach(y=>{result.push(Object.assign({},x,y))})})
		return result
	})
	.forEach(argumentSet=>  //{subject, verb:directObject, preposition:indirectObject, etc.}
	{
		let nouns=[]
		let keys=Object.keys(argumentSet)
		keys.forEach(key=>{nouns.push(argumentSet[key])})
		if (verb.voice==ishml.lang.passive) // change voice to active and swap subject and direct object
		{
			verb.voice=ishml.lang.active
			let subject=nouns[1] 
			nouns[1]=nouns[0]
			nouns[0]=subject
			//[nouns[0], nouns[1]] = [nouns[1], nouns[0]] 
			subject=argumentSet["subject"]
			argumentSet.subject=argumentSet[keys[1]]
			argumentSet[keys[1]]=subject
		}

		let statement={predicate:verb.predicate,tense:verb.tense,mood:verb.mood,voice:verb.voice,polarity:verb.polarity,arguments:argumentSet}
		statement.wildcard=wildcard
		statement.nouns=nouns
		gist.push(statement)
	})

	interpretation.gist=gist
	console.log(interpretation.gist)

	return true

}})
.snip("subject",ishml.dsl.argument).snip("predicate")



ishml.dsl.statement.subject.configure({semantics:interpretation=>
{
	let gist=interpretation.gist
	return true
}})


ishml.dsl.statement.predicate.configure({semantics:interpretation=>
{
	let gist=interpretation.gist
	return true

}})

ishml.dsl.statement.predicate	
.snip("verb").snip("directObject",ishml.dsl.argument).snip("prepositionalPhrases")


ishml.dsl.statement.predicate.verb.configure({filter:(definition)=>definition?.part==="verb"})

ishml.dsl.statement.predicate.prepositionalPhrases.configure({minimum:0,maximum:Infinity,greedy:true})
	.snip("preposition").snip("target",ishml.dsl.argument)

ishml.dsl.statement.predicate.prepositionalPhrases.preposition.configure({filter:(definition)=>definition?.part==="preposition"})


ishml.dsl.statements=ishml.Rule().configure({maximum:Infinity, semantics:interpretation=>
{
	interpretation.gist=interpretation.gist.reduce((a,b)=>a.concat(b.statement),[])
	return true
}})
.snip("statement",ishml.dsl.statement).snip("period")

ishml.dsl.statements.period.configure({regex:/^\./ })

ishml.dslParser=ishml.Parser({ lexicon: ishml.glossary, grammar: ishml.dsl.statements})




ishml.reify=function(literals, ...expressions)
{

	var source=ishml.toString(literals, ...expressions)
	
	let {success,interpretations}=ishml.dslParser.analyze(source)
	if (success)
	{
		
		if (interpretations.length==0)
		{
			throw new Error("ERROR 0006: Unable to parse reify source code-- no interpretations.")
		} 
		else if (interpretations.length>1) 
		{
			throw new Error("ERROR 0007: Unable to parse reify source code-- more than one interpretation.")
		}
		else
		{
			interpretations[0].gist.forEach(statement=>
			{
				const keys=Object.keys(statement.arguments)
				
				statement.nouns.forEach((noun,index)=>
				{
					if (noun.startsWith("#") ) //add ad-hoc nouns to semantic network.
					{
						const nounId=noun.slice(1,-1)
						
						if (!ishml.net[nounId]) ishml.noun(nounId)
						statement.nouns[index]=nounId
						statement.arguments[keys[index]]=nounId
					}
				})
				statement.predicate.reify(statement)
			})
		}
	}
	else
	{
		console.log(interpretations)
		throw new Error("ERROR 0005: Unable to parse reify source code.")

	}

}
ishml.select=function(literals, ...expressions)
{
	var source=ishml.toString(literals, ...expressions)
	
	let {success,interpretations}=ishml.dslParser.analyze(source)
	if (success)
	{
		
		if (interpretations.length==0)
		{
			throw new Error("ERROR 0006: Unable to parse reify source code-- no interpretations.")
		} 
		else if (interpretations.length>1) 
		{
			throw new Error("ERROR 0007: Unable to parse reify source code-- more than one interpretation.")
		}
		else
		{
/*
[
   
    {
        "predicate": {},
        "tense": 1,
        "mood": 0,
        "voice": 0,
        "polarity": 0,
        "arguments": {
            "subject": "charlotte",
            "carry": "#scissors#"
        },
        "wildcard": {
            "person": 0
        },
        "nouns": [
            "charlotte",
            "#scissors#"
        ]
    }
] */
			
			const statements= interpretations[0].gist
			let reality=ishml.reality(statements.reduce((placeholder,statement)=>Object.assign(placeholder,statement.wildcard),{}))
			statements.forEach(statement=> //select facts that match statement
			{
				reality=reality.union(statement.predicate.select(statement))

			})
			return reality

		}
	}
	else
	{
		console.log(interpretations)
		throw new Error("ERROR 0005: Unable to parse reify source code.")

	}

}

// #region plot

ishml.plot={}

ishml.storyline=function()  //triggers upon fact creations
{

}



// #end region
// #region error messages
var errors=
{

}
// #end region
