/*
anonoymous phrases:
var a=ishml.Phrase`There is ${ishml.Phrase(["cat","dog", "bird"]).next().cap()} in ${ishml.Phrase(["hat","box", "nest"]).cap().join({separator:", "})}.`

By reference phrases:
var animals=ishml.Phrase(["cat","dog", "bird"])

var a=ishml.Phrase`You may choose a ${{animals:animals.join({separator:" "})}}. You chose a ${{animal:animals.next()}}`

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
	var phrases=[]
	var concordance={key:{},index:{}}
	if (literals.length>0)
	{
		if (literals[0].length !== 0)
		{
			
			phrases.push({value:literals[0]})
			
		}
		var index=1
		expressions.forEach(phrase=> //{animal:"cat",if:()=>true, else:"dog"} {ishml.phrase or function,if,else}, ishml.phrase or function
		{
			
			if (typeof phrase === "object")  //phrase is an object. AKA named phrase
			{
				var key=Object.keys(phrase)[0]
				var normalizedPhrase=Object.assign({value:phrase[key]},phrase)
				var counter=phrases.push(normalizedPhrase)-1
				concordance.index[counter]=key
				concordance.key[key]=counter
			}
			else //anonymous phrase
			{phrases.push({value:phrase})}
			if (literals[index].length>0)
			{
				phrases.push({value:literals[index]})
			}
			index++
		})
		if (index < literals.length)
		{
			phrases=phrases.concat(literals.slice(index).map(literal=>({value:literal})))
		}
		
	}	
	var ishml_phrase=function(data)
	{
		if(data)
		{
			if (data instanceof Array)
			{
				phrases=data.map(phrase=> //normalize phrases
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
						if(concordance.key.hasOwnProperty(key))
						{
							phrases[concordance.key[key]].value(data[key])
						}

					})
				}	
			}
			return ishml_phrase
		}
		else {return phrases}
	}
	ishml.Phrase.attach(ishml_phrase,concordance)
	return ishml_phrase
}
ishml.Phrase.attach=function(ishml_phrase,concordance)
{
	var toString=function(phrases)
	{
		var text= phrases.reduce((result,phrase)=>
		{
			if(typeof phrase.value ==="object")
			{
				if (phrase.value.hasOwnProperty("value"))
				{
					var value=phrase.value.value
				}
				else {var value=Object.values(phrase.value)[0]}
			}
			else {var value=phrase.value}
			if (phrase.silent)
			{
				if (typeof phrase.silent === "string")
				{
					new RegExp(phrase.silent+ "+$");
					return result.replace(new RegExp(phrase.silent+ "+$"), "");
				}
				return result
			}
			else {return result+value}
		},"")
		return text
	}
	var flatten=function()
	{
		var result=[]
		var phrases=this()
		
		phrases.forEach((phrase,index)=>
		{
			if (phrase.hasOwnProperty("if"))
			{
				if (phrase.if())
				{
					var clause=phrase.value
				}
				else
				{
					if (phrase.hasOwnProperty("else"))
					{
						var clause=phrase.else
					}
					else
					{
						var clause=""
					}
				}
			}
			else {var clause=phrase.value}
			if (typeof clause === "function" )
			{
				if (clause._isIshmlPhrase)
				{

					var flattenedPhrases=clause.flatten()
					var meta={}
					var data={}
					flattenedPhrases.forEach(phrase=>
					{
						console.log(phrase)
						meta=Object.assign(meta, phrase.meta)
						data=Object.assign(data, phrase.value)
					})
					if(this._concordance.index.hasOwnProperty(index))
					{					
						this[this._concordance.index[index]]={text:toString(flattenedPhrases),meta:meta,data:data}
					}
					result=result.concat(flattenedPhrases)
				}
				else
				{
					result=result.concat({value:clause()})
				}
			}
			else {result.push({value:clause,meta:phrase.meta})}

			
		})
		return result
		
	}
		
	var say=function(documentSelector) //generates text output
	{
		var saying=toString(this.flatten())
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
	Object.keys(concordance.key).forEach(key=>
	{
		ishml_phrase[key]={}
	})
	Object.defineProperty(ishml_phrase,"_concordance",{value:concordance,writable:true})
	Object.defineProperty(ishml_phrase,"_isIshmlPhrase",{value:true,writable:true})
	Object.defineProperty(ishml_phrase,"flatten",{value:flatten,writable:true})
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
			var phrases=target(data)
			phrases=phrases.map(phrase=>
			{
				if (phrase.value.length>0)
				{
					revisedPhrase=Object.assign({},phrase)
					revisedPhrase.value=phrase.value[0].toUpperCase()+phrase.value.slice(1)
					revisedPhrase.meta.cap=true
					return revisedPhrase
				}	
			})
		}	
		return phrases
	}
	ishml.Phrase.attach(ishml_phrase,target._concordance)
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
			var phrases=target(data)
			return phrases.slice(0)
		}
	}

	ishml.Phrase.attach(ishml_phrase,target._concordance)
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
			var phrases=target()
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
			phrase={value:phrase,meta:{join:true}}
			
			var result=[phrase]	
			
			return result
		}	
	}
	ishml.Phrase.attach(ishml_phrase,target._concordance)
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
			var phrases=target(data)
			var phrase=phrases[counter]
			phrase.meta={index:counter,total:phrases.length}
			
			counter++
			if (counter===phrases.length){counter=0}
			
			return [phrase]
		}	
	}
	ishml.Phrase.attach(ishml_phrase,target._concordance)
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
			var {phrases}=target(data)
			var revisedPhrases=[]
			for (let i=0; i<count; i++ )
			{
				revisedPhrases=revisedPhrases.concat(phrases)
			}
			return revisedPhrases
		}	
	}	
	ishml.Phrase.attach(ishml_phrase,target._concordance)
	return ishml_phrase
}	


