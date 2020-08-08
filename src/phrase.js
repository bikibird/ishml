/*
anonoymous phrases:
var a=ishml.Phrase`There is ${ishml.Phrase(["cat","dog", "bird"]).next().cap()} in ${ishml.Phrase(["hat","box", "nest"]).cap().join({separator:", "})}.`

By reference phrases:
var animals=ishml.Phrase(["cat","dog", "bird"])

var a=ishml.Phrase`You may choose a ${animals:animals.join({separator:" "})}. You chose a ${{animal:animals.next()}}`
var a=ishml.Phrase`You may choose a ${animals:animals.join({separator:" "})}. You chose a ${{animal:animals.next()}}`

Named phrases:
var a=ishml.Phrase`There is ${{animal:ishml.Phrase(["cat","dog", "bird"]).next().cap()}} in ${{container:ishml.Phrase(["hat","box", "nest"]).cap().join({separator:", "})}}.`

Data subsitution:
a({animal:[{value:"baboon",size:5},{value:"flea",size:1},{value:"badger",size:3}],container:[{value:"shoebox",size:1},{value:"bed",size:5},{value:"cave",size:5}]}).say()

var a=ishml.Phrase`There is ${{animal:ishml.Phrase([{value:"baboon",size:5},{value:"flea",size:1},{value:"badger",size:3}]).next().cap()}} in ${ishml.Phrase.if(a.animal.size<2)`hat`.else`house`}.`

var a=ishml.Phrase`There is ${{animal:ishml.Phrase([{value:"baboon",size:5},{value:"flea",size:1},{value:"badger",size:3}]).next().cap()}} in ${ishml.Phrase.if(a.animal.size<2)`hat`.else`house`}.`

a=ishml.Phrase`<list>${{item:ishml.Phrase`<li>${{animal:ishml.Phrase(["cat","dog","bird"])`}}</li>}`.repeat(a.item.animal)}</list>`

factory function:

var a=()=>ishml.Phrase`There is ${{animal:ishml.Phrase(["cat","dog", "bird"]).next()}} in ${{container:ishml.Phrase(["hat","box", "nest"]).next()}}.`
var b=a()
var c=a()

Conditional:

var a=ishml.Phrase`There is a ${{animal:ishml.Phrase(["cat","dog", "bird"]).next()}}${{container:" in a hat", if:()=>a.animal.text==="cat",else:" in the house"}}.`

var a=ishml.Phrase`There is a ${{animal:ishml.Phrase(["cat","dog", "bird"]).next()}} in ${{container:"a hat", if:()=>a.animal.text==="cat"}}.`

Silent:
var a=ishml.Phrase`There is something ${{animal:ishml.Phrase(["cat","dog", "bird"]).next(),silent:" "}} in ${{container:"a hat", if:()=>a.animal.text==="cat",else:"the house"}}.`

*/
ishml.Phrase=function Phrase(literals, ...expressions)
{
	var result={phrases:[],placeholders:{}}
	var concordance={}
	if (literals.length>0)
	{
		if (literals[0].length !== 0)
		{
			
			result.phrases.push({value:literals[0]})
			
		}
		var index=1
		expressions.forEach(phrase=> //{animal:"cat",if:()=>true, else:"dog"} {ishml.phrase or function,if,else}, ishml.phrase or function
		{
			
			if (typeof phrase === "object")  //phrase is an object. AKA named phrase
			{
				var key=Object.keys(phrase)[0]
				result.placeholders[key]=phrase[key]
				var normalizedPhrase=Object.assign({value:phrase[key]},phrase)
				concordance[result.phrases.push(normalizedPhrase)-1]=key
			}
			else //anonymous phrase
			{result.phrases.push({value:phrase})}
			if (literals[index].length>0)
			{
				result.phrases.push({value:literals[index]})
			}
			index++
		})
		if (index < literals.length)
		{
			result.phrases=result.phrases.concat(literals.slice(index).map(literal=>({value:literal})))
		}
		result.total=result.phrases.length	
	}	
	var ishml_phrase=function(data)
	{
		if(data)
		{
			if (data instanceof Array)
			{
				result.phrases=data.map(phrase=>
				{
					if (typeof phrase === "string"){return {value:phrase}}
					else
					{
						if (phrase.hasOwnProperty("value")){return phrase}
						else {return Object.assign({value:Object.values(phrase)[0]})}
					}
				})
			}
			else
			{
				if(!(data===ishml.enum.mode.reset))
				{
					Object.keys(data).forEach(key=>
					{
						if(result.placeholders.hasOwnProperty(key))
						{
							result.placeholders[key](data[key])
						}

					})
				}	
			}
			return ishml_phrase
		}
		else {return result}
	}
	ishml.Phrase.attach(ishml_phrase, result.placeholders,concordance)
	return ishml_phrase
}
ishml.Phrase.attach=function(ishml_phrase,placeholders,concordance)
{
	var say=function(documentSelector)
	{
		var {phrases,placeholders,index:phraseIndex,total}=this()
		var saying= phrases.reduce((result,phrase,index)=>
		{
			if (phrase.hasOwnProperty("if")){var mainClause=phrase.if()}
			else {var mainClause=true}	
			if (mainClause)
			{
				if (typeof phrase.value === "function" )
				{
					if (phrase.value._isIshmlPhrase)
					{
						var phrasing=phrase.value.say()
					}
					else
					{
						var phrasing=phrase.value()
					}
					phrase.text=phrasing
				}
				else
				{
					phrase.text=phrase.value

				}
			}	
			else
			{
				if (typeof phrase.else === "function" )
				{
					if (phrase.else._isIshmlPhrase)
					{
						var phrasing=phrase.else.say()
					}
					else
					{
						var phrasing=phrase.else()
					}
					phrase.text=phrasing
				}
				else
				{
					phrase.text=phrase.else || ""
				}
					
			}
			if(isFinite(phraseIndex)){phrase.index=phraseIndex}
			if(isFinite(total)){phrase.total=total}
			if(this._concordance.hasOwnProperty(index))
			{					
				this[this._concordance[index]]=phrase
			}
			if (phrase.silent)
			{
				if (typeof phrase.silent === "string")
				{
					new RegExp(phrase.silent+ "+$");
  					return result.replace(new RegExp(phrase.silent+ "+$"), "");
				}
				return result
			}
			else {return result+phrase.text}
		},"")

		if (documentSelector)
		{
			var targetNodes = document.querySelectorAll(documentSelector)
			var fragment = document.createElement("template")
			fragment.innerHTML = saying
			fragment= fragment.content
			var _prepend = ()=>
			{
				targetNodes.forEach(node=>node.prepend(fragment))
				return saying
			}	
			var _append = ()=>
			{
				targetNodes.forEach(node=>node.append(fragment))
				return saying
			}
			var _replace= ()=>
			{
				targetNodes.forEach(node=>
				{
					while(node.firstChild){node.removeChild(node.firstChild)}
					node.append(fragment)
				})
				return saying
			}
			return {prepend:_prepend,append:_append,replace:_replace}
		}
		else 
		{
			return saying
		}
	}
	Object.keys(ishml.Phrase.transform).forEach(key=>
	{
		Object.defineProperty(ishml_phrase,key,{value:ishml.Phrase.transform[key],writable:true})

	})
	Object.keys(placeholders).forEach(key=>
	{
		ishml_phrase[key]=""
	})
	Object.defineProperty(ishml_phrase,"_concordance",{value:concordance,writable:true})
	Object.defineProperty(ishml_phrase,"_isIshmlPhrase",{value:true,writable:true})
	Object.defineProperty(ishml_phrase,"say",{value:say,writable:true})
	
}
//A transform function when called that returns a function that returns the actual transformation.  The transformation returns either text or an object countaining the phrases array and list of placeholders.  
ishml.Phrase.transform={}
ishml.Phrase.transform.cap=function()
{
	var target=this
	var ishml_phrase=function(data)
	{	
		if (data)
		{
			target(data)
			return ishml_phrase
		}
		else
		{
			var {phrases,placeholders,index,total}=target(data)
			phrases=phrases.map(phrase=>
			{
				if (phrase.value.length>0)
				{
					revisedPhrase=Object.assign({},phrase)
					revisedPhrase.value=phrase.value[0].toUpperCase()+phrase.value.slice(1)
					return revisedPhrase
				}	
			})
		}	
		var result={phrases:phrases,placeholders:placeholders,index:index,total:total}	
		return result
	}
	ishml.Phrase.attach(ishml_phrase,target,target._concordance)
	return ishml_phrase
}
ishml.Phrase.transform.indentity=function()
{
	var target=this
	ishml_phrase=function(data)
	{	
		if (data)
		{
			target(data)
			return ishml_phrase
		}
		else
		{
			var {phrases,placeholders,index,total}=target(data)
			var result={phrases:phrases,placeholders:placeholders,index:index,total:total}	
			return result
		}
	}

	ishml.Phrase.attach(ishml_phrase,target,target._concordance)
	return ishml_phrase
}

ishml.Phrase.transform.join=function(options)
{
	var {separator=" ",trim=true}=options
	var target=this
	var ishml_phrase=function(data)
	{	
		if (data)
		{
			target(data)
			return ishml_phrase
		}
		else
		{
			var {phrases,placeholders}=target()
			var last=phrases.length-1
			var phrase=phrases.reduce((result,phrase,index,)=>
			{
				if (typeof phrase.value === "function" )
				{
					if (phrase.value._isIshmlPhrase)
					{
						var phrasing=phrase.value.say()+((index===last && trim)?"":separator)
					}
					else
					{
						var phrasing=phrase.value()+((index===last && trim)?"":separator)
					}
					return result+phrasing+((index===last && trim)?"":separator)
				}
				else 
				{
					return result+phrase.value+((index===last && trim)?"":separator)
				}
			},"")	
			phrase={value:phrase}
			var result={phrases:[phrase],placeholders:placeholders,index:0,total:1}	
			
			return result
		}	
	}
	ishml.Phrase.attach(ishml_phrase,target,target._concordance)
	return ishml_phrase
}
ishml.Phrase.transform.next=function()
{
	var counter=0
	var target=this
	var ishml_phrase=function(data)
	{	
		if (data)
		{
			//target.populate(data)
			target(data)
			counter=0
			return ishml_phrase
		}
		else
		{
			var {phrases,placeholders}=target(data)

			var result={phrases:[phrases[counter]],placeholders:placeholders, index:counter,total:phrases.length}	
			counter++
			if (counter===phrases.length){counter=0}
			
			return result
		}	
	}
	ishml.Phrase.attach(ishml_phrase,target,target._concordance)
	return ishml_phrase
}
ishml.Phrase.transform.repeat=function(count)
{
	var target=this
	var ishml_phrase=function(data)
	{
		if (data)
		{
			target(data)
			return ishml_phrase
		}
		else
		{
			var {phrases,placeholders}=target(data)
			var revisedPhrases=[]
			for (let i=0; i<count; i++ )
			{
				revisedPhrases=revisedPhrases.concat(phrases)
			}
			
			var result={phrases:revisedPhrases,placeholders:placeholders}	
			return result
		}	
	}	
	ishml.Phrase.attach(ishml_phrase,target,target._concordance)
	return ishml_phrase
}	


