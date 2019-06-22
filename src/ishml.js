"use strict"
// Copyright 2018, Jennifer L Schmidt               
// Licensed under MIT license                       
// https://whitewhalestories.com/ishml/license.html 

var ISHML = ISHML || {}
ISHML.enum=ISHML.enum || {}
ISHML.enum.mode={all:0,any:1,apt:2} 
ISHML.Interpretation=function Interpretation(gist={},remainder=[])
{
	if (this instanceof ISHML.Interpretation)
	{
		if (gist instanceof Array)
		{
			this.gist=gist.slice(0)
		}
		else
		{
			this.gist=Object.assign({},gist)
		}
		this.remainder=remainder.slice(0)
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
	return this	
}

ISHML.Lexicon.prototype.lookup = function (lexeme) 
{
	var _trie = this.trie
	var j=0
	for (let i=0; i < lexeme.length; i++)
	{
		var character=lexeme.charAt(i).toLowerCase()
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
ISHML.Lexicon.prototype.search = function (lexeme, {separator=/[\,|\.|;|\!|\?|\s]/, lax=false, caseSensitive=false, greedy=false}={}) 
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
			if(greedy){return _results.slice(0,1)}
			else{return _results}
		}
		else
		{	
			if (_trie[character].definitions)
			{



				if (i<lexeme.length-1)
				{	
					if (lax || (separator===false) || (separator && separator.test(lexeme.substring(i+1))))
					{
						var result={definitions:_trie[character].definitions.slice(0)}
						result.remainder=lexeme.substring(i+1).slice(0)
						result.lexeme=lexeme.substring(0,i+1).slice(0)
						_results.unshift(result)
					}
				}
				else // if (i===lexeme.length-1) 
				{
					var result={definitions:_trie[character].definitions.slice(0)}
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


ISHML.Lexicon.prototype.tokenize  = function (text, {separator=/[\,|\.|;|\!|\?|\s]/, lax=false, caseSensitive=false, fuzzy=false,greedy=false,smooth=false}={})
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
				var entries=this.search(candidates[i].remainder,{greedy:greedy, lax:lax, caseSensitive:caseSensitive,separator:separator})
				if (entries.length>0)
				{	
					for (var j =0; j < entries.length; j++)
					{	

						var result={}
						var token=new ISHML.Token(entries[j].lexeme,entries[j].definitions)

						result.tokens=candidates[i].tokens.slice(0)
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
						var result={}
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
						result.tokens=candidates[i].tokens.slice(0)
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
ISHML.Parser.prototype.analyze=function(text, {caseSensitive=false, fuzzy=false, greedy=false, lax=false, smooth=false,separator=/[\,|\.|;|\!|\?|\s]/}={})
{    
	var tokenizations = this.lexicon.tokenize(text,{caseSensitive:caseSensitive, fuzzy:fuzzy, greedy:greedy, lax:lax, smooth:smooth, separator:separator})
	var interpretations=[]
	var partialInterpretations=[]
	var completeInterpretations=[]
	if (tokenizations.complete.length > 0)
	{
		tokenizations.complete.forEach((sequence)=>
		{
			var result=this.grammar.parse(sequence.tokens)
			if (result)
			{
				interpretations=interpretations.concat(result)
			}
		})

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
			return completeInterpretations
		}
		else
		{
			partialInterpretations.sort(function(first,second){return first.remainder.length - second.remainder.length})
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
ISHML.Rule=function Rule(key) 
{
	if (this instanceof ISHML.Rule)
	{
		Object.defineProperty(this, "minimum", {value:1, writable: true})
		Object.defineProperty(this, "maximum", {value:1, writable: true})
		Object.defineProperty(this, "mode", {value:0, writable: true})
		Object.defineProperty(this, "greedy", {value:false, writable: true})
		Object.defineProperty(this, "keep", {value:true, writable: true})
		Object.defineProperty(this, "filter", {value:()=>true, writable: true})
		Object.defineProperty(this, "semantics", {value:({gist,remainder})=>true, writable: true})
		return this
	}
	else
	{
		return new Rule(key)
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
ISHML.Rule.prototype.parse =function(someTokens)
{
	
	var remainder=someTokens.slice(0)
	var results=[]
	var keys=Object.keys(this)
	if (keys.length>0)
	//non-terminal
	{
		switch (this.mode) 
		{
			case ISHML.enum.mode.all:
				if (this.maximum ===1 ){var candidates=[new ISHML.Interpretation({},remainder)]}
				else {var candidates=[new ISHML.Interpretation([],remainder)]}
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
							if (remainder.length>0)
							{
								var snippets=this[key].parse(remainder.slice(0)) 
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
					if (this.maximum ===1 ){var candidates=[new ISHML.Interpretation({},remainder)]}
					else {var candidates=[new ISHML.Interpretation([],remainder)]}
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
									var snippets=this[key].parse(remainder.slice(0)) 
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
				if (this.maximum ===1 ){var candidates=[new ISHML.Interpretation({},remainder)]}
				else {var candidates=[new ISHML.Interpretation([],remainder)]}
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
								var snippets=this[key].parse(remainder.slice(0)) 
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
			if (remainder.length>0)
			{
				var token =	{definitions:remainder[0].definitions.filter(this.filter), lexeme:remainder[0].lexeme.slice(0)}
				if (token.definitions.length>0)
				{
					repetitions.push(token)
					if (!this.greedy)
					{
						if (counter>=this.minimum)
						{
							if (this.maximum===1)
							{
								results.push(new ISHML.Interpretation(token,remainder.slice(1)))//{gist:token,remainder:remainder.slice(1)})
							}
							else
							{
								results.push(new ISHML.Interpretation(repetitions, remainder.slice(1)))//{gist:repetitions.slice(0),remainder:remainder.slice(1)})
							}	
						}
					}	
					remainder=remainder.slice(1)
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
					results.push(new ISHML.Interpretation(repetitions[0],remainder))
				}
				else
				{
					results.push(new ISHML.Interpretation(repetitions, remainder))
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
	if (rule instanceof ISHML.Rule)
	{
		this[key]=rule
	}
	else
	{
		this[key]=new ISHML.Rule()
	}	
	return this		
}
ISHML.Token=function Token(lexeme="",definitions=[])
{
	if (this instanceof ISHML.Token)
	{
		this.lexeme=lexeme
		this.definitions=definitions.slice(0)
		return this
	}
	else
	{
		return new Token(lexeme,definitions)
	}
}
