/*
anonoymous phrases:
var a=ishml.Phrase`There is ${ishml.Phrase(["cat","dog", "bird"]).next().cap()} in ${ishml.Phrase(["hat","box", "nest"]).cap().join({separator:", "})}.`

By reference phrases:
var animals=ishml.Phrase(["cat","dog", "bird"])
var a=ishml.Phrase`You may choose a ${animal:animals.join({separator:" "})}. You chose a ${{animal:animals.next()}}}`



Named phrases:
var a=ishml.Phrase`There is ${{animal:ishml.Phrase(["cat","dog", "bird"]).next().cap()}} in ${{container:ishml.Phrase(["hat","box", "nest"]).cap().join({separator:", "})}}.`

Data subsitution:
a({animal:[{value:"baboon",size:5},{value:"flea",size:1},{value:"badger",size:3}],container:[{value:"shoebox",size:1},{value:"bed",size:5},{value:"cave",size:5}]}).say()


factory function:

var a=()=>ishml.Phrase`There is ${{animal:ishml.Phrase(["cat","dog", "bird"]).next()}} in ${{container:ishml.Phrase(["hat","box", "nest"]).next()}}.`
var b=a()
var c=a()


*/
ishml.Phrase=function Phrase(literals, ...expressions)
{
	var result={phrases:[],placeholders:{}}
	if (literals.length>0)
	{
		if (literals[0].length !== 0)
		{
			
			result.phrases.push({value:literals[0]})
		}
		var index=1
		expressions.forEach(phrase=>
		{
			if (!(typeof phrase === "function"))
			{
				var key=Object.keys(phrase)[0]
				result.placeholders[key]=phrase[key]
				result.phrases.push({value:phrase[key]})
			}
			else {result.phrases.push({value:phrase})}
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
							//result.placeholders[key].populate(data[key])
							result.placeholders[key](data[key])
						}

					})
				}	
			}
			return ishml_phrase
		}
		else {return result}
	}
	
	Object.assign(ishml_phrase,ishml.Phrase.transform)
	//ishml_phrase.populate=ishml_phrase //DEFECT:Needed anymore?
	
	return ishml_phrase
}
//A transform function when called that returns a function that returns the actual transformation.  The transformation returns either text or an object countaining the phrases array and list of placeholders.  
ishml.Phrase.transform={}

ishml.Phrase.transform.say=function(documentSelector)
{
	var {phrases}=this()
	var saying= phrases.reduce((result,phrase)=>
	{
		if (typeof phrase.value === "function" )
		{
			if (phrase.value.name==="ishml_phrase"){var phrasing=phrase.value.say()}
			else{var phrasing= phrase.value()}
			return result+phrasing
		}
		else {return result+phrase.value}
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

			var result={phrases:[phrases[counter]],placeholders:placeholders}	

			
			counter++
			if (counter===phrases.length){counter=0}
			
			return result
		}	
	}
	Object.assign(ishml_phrase,ishml.Phrase.transform)
	//ishml_phrase.populate=target.populate
	return ishml_phrase
}

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
			var {phrases,placeholders}=target(data)
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
		var result={phrases:phrases,placeholders:placeholders}	
		return result
	}
	Object.assign(ishml_phrase,ishml.Phrase.transform)
	//ishml_phrase.populate=target.populate
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
			var {phrases,placeholders}=target(data)
			var result={phrases:phrases,placeholders:placeholders}	
			return result
		}
	}

	Object.assign(ishml_phrase,ishml.Phrase.transform)
	//ishml_phrase.populate=target.populate
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
					if (phrase.value.name==="ishml_phrase")
					{
						
						var phrasing=phrase.value.say()+((index===last && trim)?"":separator)
					}
					else{var phrasing= phrase.value()}
					return result+phrasing+((index===last && trim)?"":separator)
				}
				else 
				{
					return result+phrase.value+((index===last && trim)?"":separator)
				}
			},"")	
			phrase={value:phrase}
			var result={phrases:[phrase],placeholders:placeholders}	
			
			return result
		}	
	}
	Object.assign(ishml_phrase,ishml.Phrase.transform)
	//ishml_phrase.populate=target.populate
	return ishml_phrase
}
