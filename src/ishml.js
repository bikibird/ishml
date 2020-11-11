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
ishml.enum.degree={positive:Symbol('positive'),comparative:Symbol('comparative'),superlative:Symbol('superaltive')} 
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
ishml.Phrase =class Phrase
{
	constructor(...precursor) 
	{
		Object.defineProperty(this,"phrases",{value:[],writable:true})
		Object.defineProperty(this,"results",{value:[],writable:true})
		Object.defineProperty(this,"_seed",{value:ishml.util.random().seed,writable:true})
		Object.defineProperty(this,"tags",{value:{},writable:true})
		Object.defineProperty(this,"text",{value:"",writable:true})
		this.populate(...precursor)
		return this
	}
	append(documentSelector="#story")
	{
		var targetNodes = document.querySelectorAll(documentSelector)
		targetNodes.forEach(node=>node.append(this.htmlTemplate().content))
		return this
	}
	concur(condition)
	{
		if (typeof condition ==="function"){var rule=condition}
		else {var rule = ()=>condition}
		return new class concurPhrase extends ishml.Phrase
		{
			generate()
			{
				super.generate()
				this.results=this.results.filter(phrase=>rule(this.tags,phrase))
				this.text=this.results.map(phrase=>phrase.value).join("")
				return this.results
			}
		}(this)
	}
	get catalog()
	{
		this._catalogTags()
		return this
	}
	_catalogTags(catalog={})
	{
		Object.assign(catalog,this)
		Object.keys(this).forEach(key=>{delete this[key]})
		this.phrases.forEach(phrase=>
		{
			if (phrase.value instanceof ishml.Phrase)
			{
				phrase.value._catalogTags(catalog)
			}
		})
		Object.assign(this.tags,catalog)
	}
	get data()
	{
		if (this.results.length>0){return this.results[0]}
		else{return {}}
	}
	else(literals,...expressions)
	{
		var alternativePhrase=new ishml.Phrase(literals,...expressions)
		return new class elsePhrase extends ishml.Phrase
		{
			generate()
			{
				super.generate()
				
				if (this.results.length===0)
				{
					this.results=alternativePhrase.generate()
					this.text=alternativePhrase.text
				}
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
				this.results=this.results.slice(0,count)
				this.text=this.results.map(phrase=>phrase.value).join("")
				return this.results
			}
		}(this)
	}
	generate()
	{
		this.results=[]
		this.phrases.forEach((phrase,index)=>
		{
			if (phrase.value instanceof ishml.Phrase) 
			{
				this.results=this.results.concat(phrase.value.generate().map(subPhrase=>Object.assign(Object.assign({},phrase),subPhrase)))
			}
			else
			{
				if (phrase.value instanceof Function)
				{
					var deferredPhrase=phrase.value(this.tags)
					if (deferredPhrase instanceof ishml.Phrase)
					{
						this.results=this.results.concat(deferredPhrase.value.generate().map(subPhrase=>Object.assign(Object.assign({},phrase),subPhrase)))
					}
					else
					{
						this.results=this.results.concat(Object.assign(Object.assign({},phrase),{value:deferredPhrase.toString()}))
					}
				}
				else
				{
					this.results=this.results.concat(Object.assign(Object.assign({},phrase),{value:phrase.value.toString()}))
				}
			}
		})
		this.text=this.results.map(data=>data.value).join("")
		return this.results
	}
	htmlTemplate()
	{
		var template = document.createElement("template")
		template.innerHTML = this.text
		return template
	}
	if(condition)
	{
		if (typeof condition ==="function"){var rule=condition}
		else {var rule = ()=>condition}
		return new class ifPhrase extends ishml.Phrase
		{
			generate()
			{
				super.generate()
				if(!rule(this.tags))
				{
					this.results=[]
					this.text=""
				}
				return this.results
			}
		}(this)
	}
	get inner()
	{
		if (this.phrases.length>0 && this.phrases[0].value instanceof ishml.Phrase)
		{
			return this.phrases[0].value
		}
		else
		{
			return null
		}
	}
	join({separator="", trim=true}={})
	{
		return new class joinPhrase extends ishml.Phrase
		{
			generate()
			{
				super.generate()
				var last=this.results.length-1
				this.text=this.results.map(phrase=>phrase.value).reduce((result,phrase,index,)=>result+phrase+((index===last && trim)?"":separator),"")	
				this.results=[{value:this.text}]
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
				this.results=this.results.slice(-count)
				return this.results
			}
		}(this)
	}
	modify(modifier)
	{
		return new class modifyPhrase extends ishml.Phrase
		{
			generate()
			{
				super.generate()
				this.results=this.results.map(phrase=>
				{
					var modifiedPhrase=Object.assign({},phrase)
					return Object.assign(modifiedPhrase,{value:modifier(phrase)})
				})	
				this.text=this.results.map(phrase=>phrase.value).join("")
				return this.results
			}
		}(this)
	}
	per(id)
	{
		var tag=id

		return new class perPhrase extends ishml.Phrase
		{
			generate()
			{
				var results=[]
				do 
				{
					results=results.concat(super.generate())
				}while(!this.tags[tag].data.reset)
				this.results=results
				this.text=this.results.map(data=>data.value).join("")
				return this.results	
			}
		}(this)
	}
	populate(literals, ...expressions)
	{
		var data=[]
		if (literals)
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
							interleaving.push({value:expression})
							if (literals[index].length>0)
							{
								interleaving.push({value:literals[index]})
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
						data=literals
					}
					else //populate("blah") or populate(), populate({properties}) 
					{
						if(literals)
						{	
							if (literals instanceof Object && !(literals instanceof ishml.Phrase) ){data = literals}
							else {data=[literals]}
						}
						else {data=[]}
					}
				}
			}
		}				
		if (data instanceof Array) //normalize array and replace phrases
		{
			if (data.length===0){this.phrases=[]}
			else
			{
				this.phrases=data.map(phrase=> //normalize phrases
				{
					var phraseType=typeof phrase
					if (phraseType ==="object")
					{
						if (phrase instanceof ishml.Phrase)
						{
							return {value:phrase}
						}
						else
						{
							if (phrase.hasOwnProperty("value")){return phrase}
							else 
							{
								var revisedPhrase=Object.assign({},phrase)
								revisedPhrase.value=Object.values(phrase)[0]
								return revisedPhrase
							}
						}
					}
					else
					{
						if (phraseType==="function")
						{
							return {value:phrase}
						}
						if (phraseType === "string"){return {value:phrase}}
						else{return{value:phrase.toString()}}
					}
				})
			}	
		}
		else  // ishml phrase or simple data object
		{
			Object.keys(data).forEach(key=>
			{
				if (this.tags.hasOwnProperty(key))
				{
					var target=this.tags[key]
					while(target.phrases.length===1 && target.phrases[0].value instanceof ishml.Phrase)
					{
						target=target.phrases[0].value
					}
					target.populate(data[key])
				}
			})
		}
		return this
	}
	prepend(documentSelector="#story")
	{
		var targetNodes = document.querySelectorAll(documentSelector)
		targetNodes.forEach(node=>node.prepend(this.htmlTemplate().content))
	}
	_reset()
	{ 
		this.phrases.forEach(phrase=>
		{
			if(phrase.value instanceof ishml.Phrase){phrase.value._reset()}	
		})
		return this
	}
	replace(documentSelector="#story")
	{
		var targetNodes = document.querySelectorAll(documentSelector)
		targetNodes.forEach(node=>
		{
			while(node.firstChild){node.removeChild(node.firstChild)}
			node.append(this.htmlTemplate().content)
		})
		return this
	}	
	repeat(condition)
	{
		if (typeof condition ==="function"){var rule=condition}
		else {var rule = ()=>condition}
		return new class repeatPhrase extends ishml.Phrase
		{
			generate()
			{
				var results=[]
				do
				{
					results=results.concat(super.generate())
				}while(rule(this.tags))
				this.results=results
				this.text=this.results.map(data=>data.value).join("")
				return this.results	
			}
		}(this)
	}
	say(seed) 
	{
		
		if (seed>=0)
		{
			this.seed(seed)
		}
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
			if(phrase.value instanceof ishml.Phrase)
			{
				phrase.value.seed(ishml.util.random(this._seed).seed)
			}	
		})
		return this
	}
	tag(id)
	{
		this[id]=this
		return this
	}
	transform(transformer)
	{
		return new class transformPhrase extends ishml.Phrase
		{
			generate()
			{
				this.results=transformer(super.generate().slice(0).map(phrase=>Object.assign({},phrase)))
				this.text=phrases.map(phrase=>phrase.value).join("")
				return this.results
			}
		}(this)
	}
	while(condition)
	{
		if (typeof condition ==="function"){var rule=condition}
		else {var rule = ()=>condition}
		return new class whilePhrase extends ishml.Phrase
		{
			generate()
			{
				var results=[]
				while(rule(this.tags))
				{
					results=results.concat(super.generate())
				}
				this.results=results
				this.text=this.results.map(data=>data.value).join("")
				return this.results	
			}
		}(this)
	}
}
ishml.Phrase.prototype.then=ishml.Phrase.prototype.else
ishml.Phrase.defineClass=function(id)
{
	var as= (phraseClass)=>
	{
		Object.defineProperty(ishml.Phrase.prototype,id,
		{
			get()
			{
			  return new phraseClass(this)
			}
		})
	}
	return {as:as}	
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



ishml.Template=function(...precursor){return new ishml.Phrase(...precursor)}
ishml.Template.templateHandler=
{
	get:function(template, property) //a.b.c() becomes a(b(c()))
	{
		if (property==="asFunction"){return template}  //bare property without proxy
		
		if (template.name==="tags")//_.tag
		{
			return template(property)
		}
		var propertyAsFunction= ishml.Template[property].asFunction
		if (property==="tags") 
		{
			return new Proxy(propertyAsFunction,{get:function(target,property){return template(target(property))}})
		}
		else
		{
			return new Proxy((...precursor)=>template(propertyAsFunction(...precursor)),ishml.Template.templateHandler)
		}
	}
}
ishml.Template.defineClass=function(id)
{
	var as= (phraseClass)=>
	{
		ishml.Template[id]=new Proxy((...precursor)=>new phraseClass(...precursor),ishml.Template.templateHandler)
	}
	return {as:as}	
}
ishml.Template.define=function(id)
{
	var as= (phraseFactory)=>
	{
		ishml.Template[id]=new Proxy(phraseFactory,ishml.Template.templateHandler)
	}
	return {as:as}	
}
ishml.Template.define("cycle").as((...data)=>
{
	var counter=0
	return new class cyclePhrase extends ishml.Phrase
	{
		populate(...data)
		{
			super.populate(...data)
			counter=0
			return this
		}
		generate()
		{
			var phrases=super.generate()
			if(phrases.length===0)
			{
				return this.results
			}
			else
			{
				var phrase=Object.assign({},phrases[counter] )
				Object.assign(phrase,{index:counter, total:phrases.length, reset:false})
			}
			counter++
			if (counter>phrases.length-1)
			{
				counter=0
				this._reset()
				phrase.reset=true
			}
			this.text=phrase.value
			this.results=[phrase]
			return this.results
		}
	}(...data)
})
ishml.Template.defineClass("favor").as( class favorPhrase extends ishml.Phrase
{
	generate()
	{
		var phrases=super.generate()
		if(phrases.length===0)
		{
			return this.results
		}
		else
		{
			var {value:random,seed}=ishml.util.random(this._seed)
			this._seed=seed
			var c=phrases.length*(phrases.length+1)*random
			var counter=phrases.length-Math.floor((Math.sqrt(1+4*c)-1)/2)-1
			var phrase=Object.assign({},phrases[counter] )
			phrase.index=counter
			phrase.total=phrases.length
			this.text=phrase.value
			this.results=[phrase]
			return this.results
		}
	}
	
})
ishml.Template.defineClass("pick").as( class pickPhrase extends ishml.Phrase
{
	generate()
	{
		var phrases=super.generate()
		if(phrases.length===0)
		{
			this.text=""
			this.results=phrases
			return this.results
		}
		else
		{
			var {value:random,seed}=ishml.util.random(this._seed)
			this._seed=seed
			var counter=Math.floor(random*phrases.length)
			var phrase=Object.assign({},phrases[counter] )
			phrase.index=counter
			phrase.total=phrases.length
			this.text=phrase.value
			this.results=[phrase]
			return this.results
		}
	}
})
ishml.Template.define("refresh").as((...precursor)=>
{
	return new class refreshPhrase extends ishml.Phrase
	{
		generate()
		{
			this._reset()
			super.generate()
			return this.results
		}
	}(...precursor)
})
ishml.Template.define("series").as((...data)=>
{
	var counter=0
	var ended =false
	return new class seriesPhrase extends ishml.Phrase
	{
		populate(...data)
		{
			super.populate(...data)
			ended=false
			counter=0
			return this
		}
		generate()
		{
			var phrases=super.generate()
			if (ended)
			{
				this.text=""
				this.results=[]
				return this.results			}
			else
			{
				if(phrases.length===0)
				{
					this.text=""
					this.results=[]
					return this.results
				}
				else
				{
					var phrase=Object.assign({},phrases[counter] )
					Object.assign(phrase,{index:counter, total:phrases.length, reset:false})
				}
				counter++
				if (counter>phrases.length-1)
				{
					ended=true
					counter=0
					this._reset()
					phrase.reset=true
				}
			}	
			this.text=phrase.value
			this.results=[phrase]
			return this.results
		}
		_reset(){return this.precursor?._reset()}
	}(...data)
})
ishml.Template.define("shuffle").as((...data)=>
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
			this.text=this.results.map(phrase=>phrase.value).join("")
			return this.results
		}
		_reset()
		{
			super._reset()
			reshuffle=true
			return this
		}
		
	}(...data)
})
ishml.Template.define("pin").as((...data)=>
{
	var pin =true
	return new class pinPhrase extends ishml.Phrase
	{
		populate(...data)
		{
			super.populate(...data)
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
		_reset()
		{
			if(pin)
			{
				super._reset()
			}
		}
	}(...data)
})
ishml.Template.define("tags").as(function tags(tag)
{
	return new class tagsPhrase extends ishml.Phrase
	{
		generate()
		{
			this.results=this.tags[tag].generate()
			this.text=this.tags[tag].text
			return this.results
		}
	}	
})
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
