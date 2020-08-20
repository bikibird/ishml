/*
anonoymous phrases:
var a=ishml.Phrase`There is ${ishml.Phrase(["cat","dog", "bird"]).next().cap()} in ${ishml.Phrase(["hat","box", "nest"]).cap().join({separator:", "})}.`

By reference phrases:
var animals=ishml.Phrase(["cat","dog", "bird"])

var a=ishml.Phrase`You may choose a ${{animals:animals.join({separator:" "})}}. You chose a ${{animal:animals.next()}}`

Named phrases:
var a=ishml.Phrase`There is ${{animal:ishml.Phrase(["cat","dog", "bird"]).next().cap()}} in ${{container:ishml.Phrase(["hat","box", "nest"]).cap().join({separator:", "})}}.`

Data subsitution:
a({animal:[{value:"baboon",size:5},{value:"flea",size:1},{value:"badger",size:3}],container:[{value:"shoebox",size:1},{value:"bed",size:5},{value:"cave",size:5}]}).text()

var a=ishml.Phrase`There is ${{animal:ishml.Phrase([{value:"baboon",size:5},{value:"flea",size:1},{value:"badger",size:3}]).next().cap()}} in ${ishml.Phrase.if(a.animal.size<2)`hat`.else`house`}.`

var a=ishml.Phrase`There is ${{animal:ishml.Phrase([{value:"baboon",size:5},{value:"flea",size:1},{value:"badger",size:3}]).next().cap()}} in ${ishml.Phrase.if(a.animal.size<2)`hat`.else`house`}.`

a=ishml.Phrase`<list>${{item:ishml.Phrase`<li>${{animal:ishml.Phrase(["cat","dog","bird"])`}}</li>}`.repeat(a.item.animal)}</list>`

factory function:

var a=()=>ishml.Phrase`There is ${{animal:ishml.Phrase(["cat","dog", "bird"]).next()}} in ${{container:ishml.Phrase(["hat","box", "nest"]).next()}}.`
var b=a()
var c=a()

Conditional:

var a=ishml.Phrase`There is a ${{animal:ishml.Phrase(["cat","dog", "bird"]).next()}}${{container:" in a hat", if:(root)=>root.animal.value==="cat",else:" in the house"}}.`

var a=ishml.Phrase`There is a ${{animal:ishml.Phrase(["cat","dog", "bird"]).next()}} in ${{container:"a hat", if:(root)=>root.animal.value==="cat"}}.`

Silent:
var a=ishml.Phrase`There is something ${{animal:ishml.Phrase(["cat","dog", "bird"]).next(),silent:" "}} in ${{container:"a hat", if:()=>a.animal.value==="cat",else:"the house"}}.`

Looping

var _ =ishml.Phrase //easier to type and read.

var items = _`<li>${{li:_(["cat","dog", "bird"]).next()}}</li>`.until(x=>x.li.reset)
var items = _`<li>${{li:_(["cat","dog", "bird"]).next()}}</li>`.while(x=>!x.li.reset)

factory functions

var items = data=>_`<li>${{li:_(data).next()}}</li>`.until(x=>x.li.reset)

inline data:
var a=_`The ${{animal:ishml.Phrase(["cat","dog","bird"]).next()}} is in the ${{container:_(["hat","box","nest","house","burrow","bag"]).next()}}.`
a.say().text	

var animals=["cat","dog","bird"]
var containers=["hat","box","nest","house","burrow","bag"]
var a=_`The ${{animal:ishml.Phrase(animals).next()}} is in the ${{container:_(containers).next()}}.`
a.say().text


complex data:
var data={
		animal:["cat","dog","bird"],
		container:["hat","box","nest","house","burrow","bag"]
	}
var a=_`The ${{animal:_().next()}} is in the ${{container:_().next()}}.`

a.say(data).text

a(data)  //set data without generating text

Simple Correlated Phrases:
var data={animal:
	[
		{value:"cat", container:"hat"},
		{value:"dog", container:"house"},
		{value:"bird", container:"nest"}
	]}
var a=_`The ${{animal:_``.next()}} is in the ${{container:x=>x.animal.container}}.`
a.say(data)

var a=_`The ${{animal:_().next()}} is in the ${{container:()=>a.animal.container}}.`
a.say(data)

Complex correlated phrases:
 (DEFECT: need to implement random for this example.)
var data={animal:
	[
		{value:"cat", container:["hat","bag","box"]},
		{value:"dog", container:["house","burrow","car"]},
		{value:"bird", container:["nest","tree","sky"]}
	]}


var a=_`The ${{animal:ishml.Phrase``.next()}} is in the ${{container:x=>_``.next()(x.animal.container)}}.`

var container=ishml.Phrase``.join({separator:" "})
var a=ishml.Phrase`The ${{animal:ishml.Phrase``.next()}} is in the ${{container:x=>container(x.animal.container)}}.`

a.say(data)
{li:"cat", list:["hat","bag","box"]},
		{li:"dog", list:["house","burrow","car"]},
		{li:"bird", list:["nest","tree","sky"]}

Self nesting phrases:
  -- simple list
var data={items:{li:["cat","dog","bird"]}}
var items=()=>ishml.Phrase`<li>${{li:ishml.Phrase().next()}}</li>`.until(x=>x.li.reset)
var list=()=>ishml.Phrase`<ol>${{items:items()}}</ol>`

var a=list()(data)
var a=list();a(data)



//outer most phrase has 


  -- self nesting list:

var _=ishml.Phrase
var list=()=>_`<ol>${{items:_`<li>${{li:_().next()}}${{list:x=>list()(x.li.list),if:x=>x.li.list}}</li>`.until(x=>x.li.reset)}}</ol>`
var data={items:{li:[{value:"cat",list:{items:{li:["meow","howl"]}}},{value:"dog",list:{items:{li:["bark","howl"]}}},{value:"bird",list:{items:{li:["coo","peep"]}}}]}}

---with hoisting
var items=()=>ishml.Phrase`<li>${{li:ishml.Phrase().next()}}${{list:x=>list()(x.li.list),if:x=>x.li.list}}</li>`.until(x=>x.li.reset)
var list=function(){return ishml.Phrase`<ol>${{items:items()}}</ol>`}
var data={items:{li:[{value:"cat",list:{items:{li:["meow","howl"]}}},{value:"dog",list:{items:{li:["bark","howl"]}}},{value:"bird",list:{items:{li:["coo","peep"]}}}]}}

---with sublist

var _=ishml.Phrase
var sublist={list:x=>list()(x.li.list),if:x=>x.li.list}
var items=()=>ishml.Phrase`<li>${{li:ishml.Phrase().next()}}${sublist}</li>`.until(x=>x.li.reset)
var list=function(){return ishml.Phrase`<ol>${{items:items()}}</ol>`}
var data={items:{li:[{value:"cat",list:{items:{li:["meow","howl"]}}},{value:"dog",list:{items:{li:["bark","howl"]}}},{value:"bird",list:{items:{li:["coo","peep"]}}}]}}

*/
ishml.Phrase=function Phrase(literals, ...expressions)
{
	var phrases=[]
	var concordance={key:{},index:{}}
	
	if (literals && literals.length>0)
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
						else 
						{
							var revisedPhrase=Object.assign({},phrase)
							revisedPhrase.value=Object.values(phrase)[0]
							return revisedPhrase
						}
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
		else 
		{
			var evaluation=[]
			//convert phrases into an array of {value:string, whatever:whatever}
			phrases.forEach((phrase,index)=>
			{
				//phrase.value is either a string, a function, ishml.Phrase, any of which must be evaluated  Phrase.whatever must be captured {value:evaluation, whatever}
				
				if (phrase.hasOwnProperty("if"))
				{
					if (phrase.if(ishml_phrase))
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

				var clauseType=typeof clause
				if (clauseType=== "string")  //value is string
				{
					var data =Object.assign({},phrase)
					data.value=clause
				}
				else
				{
					if (clauseType==="function")  
					{
						if(!clause._isIshmlPhrase)  //clause might be normal function or function that returns ishml_phrase function
						{
							clause=clause(ishml_phrase)  //evaluate to string, number, or ishml Phrase
							if(typeof clause !=="function") //if not ishml phrase, treat as simple value
							{
								var data =Object.assign({},phrase)
								data.value=clause
							}
							//else ishml phrase so proceed with next if statement 
						}
						if (clause._isIshmlPhrase) //clause is an ishml_phrase
						{
							var data={}
							var subPhrases=clause()
							data.value= subPhrases.reduce((result,subPhrase)=>
							{
								Object.assign(data,subPhrase)
								return result+subPhrase.value
							},"")	
						}

					}
				}
				if(ishml_phrase._concordance.index.hasOwnProperty(index))
				{
					var placeholder=ishml_phrase[ishml_phrase._concordance.index[index]]
					Object.keys(placeholder).forEach(key=>delete placeholder[key])
					Object.assign(placeholder,data)
				}
				var evaluatedPhrase=Object.assign({},data)
				var silent=phrase.silent
				if (silent)
				{
					if (silent !== true)
					{
						var last=evaluation.length-1
						if(last >=0)
						{
						
							if (typeof silent==="string")
							{
								evaluation[last].value=evaluation[last].value.replace(new RegExp(silent+ "+$"), "")
							}
							else
							{
								evaluation[last].value=evaluation[last].value.replace(silent, "")
							}
						}
					}
					evaluatedPhrase.value=""	
				}
				evaluation.push(evaluatedPhrase)
			})
			return evaluation
		}
	}
	ishml.Phrase.attach(ishml_phrase,concordance)
	return ishml_phrase
}
ishml.Phrase.attach=function(ishml_phrase,target)
{
	var hasDataFor=function(key)
	{
		if (Object.keys(this[key]).length>0){return true}
		else {false}
	}
	var say=function(data) //generates text output
	{
		if (data){this(data)}
		this.text=this().reduce((result,item)=>result+item.value,"")
		return this
	}
	var htmlTemplate=function()
	{
		var template = document.createElement("template")
		template.innerHTML = this.text
		return template
	}
	var prepend=function(documentSelector="#story")
	{
		var targetNodes = document.querySelectorAll(documentSelector)
		targetNodes.forEach(node=>node.prepend(this.htmlTemplate().content))
	}
	var append=function(documentSelector="#story")
	{
		var targetNodes = document.querySelectorAll(documentSelector)
		targetNodes.forEach(node=>node.append(this.htmlTemplate().content))
		return this
	}	
	var replace=function(documentSelector="#story")
	{
		var targetNodes = document.querySelectorAll(documentSelector)
		targetNodes.forEach(node=>
		{
			while(node.firstChild){node.removeChild(node.firstChild)}
			node.append(this.htmlTemplate().content)
		})
		return this
	}	
	
	Object.keys(ishml.Phrase.transform).forEach(key=>
	{
		Object.defineProperty(ishml_phrase,key,{value:ishml.Phrase.transform[key],writable:true})

	})
	if (target._isIshmlPhrase)
	{
		Object.assign(ishml_phrase,target)
		Object.defineProperty(ishml_phrase,"_concordance",{value:target._concordance,writable:true})
	}
	else
	{
		Object.keys(target.key).forEach(key=>
		{
			ishml_phrase[key]={}
		})
		Object.defineProperty(ishml_phrase,"_concordance",{value:target,writable:true})
	}
	Object.defineProperty(ishml_phrase,"_isIshmlPhrase",{value:true,writable:true})
	Object.defineProperty(ishml_phrase,"hasDataFor",{value:hasDataFor,writable:true})
	Object.defineProperty(ishml_phrase,"say",{value:say,writable:true})
	Object.defineProperty(ishml_phrase,"prepend",{value:prepend,writable:true})
	Object.defineProperty(ishml_phrase,"append",{value:append,writable:true})
	Object.defineProperty(ishml_phrase,"replace",{value:replace,writable:true})
	Object.defineProperty(ishml_phrase,"text",{value:"",writable:true})
	Object.defineProperty(ishml_phrase,"htmlTemplate",{value:htmlTemplate,writable:true})

}
//A transform function when called that returns a function that returns the actual transformation.  The transformation returns either text or an object countaining the phrases array and list of placeholders.  
ishml.Phrase.transform={}

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
			var data={}
			data.value=phrases.reduce((result,phrase,index,)=>
			{
				if (phrase.value._isIshmlPhrase)
				{
					var value=phrase.value()
					if (typeof value==="object"){var phrasing=value.value}
					else {var phrasing=value}
				}
				else 
				{
					if (typeof phrase.value ==="object")
					{
						var phrasing=phrase.value.value
						data=object.assign(data,phrase.value)
					}
					else {var phrasing=phrase.value}
				}
				return result+phrasing+((index===last && trim)?"":separator)
			},"")	

			return [data]
		}	
	}
	ishml.Phrase.attach(ishml_phrase,target)
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
			target(data)
			counter=0
			return ishml_phrase
		}
		else
		{
			var phrases=target(data)
			var phrase=phrases[counter]
			phrase.index=counter
			phrase.total=phrases.length

			counter++
			if (counter===phrases.length)
			{
				counter=0
				phrase.reset=true
			}
			else
			{
				phrase.reset=false
			}
			
			return [phrase]
		}	
	}
	ishml.Phrase.attach(ishml_phrase,target)
	return ishml_phrase
}
ishml.Phrase.transform.until=function(condition)
{
	//var a =ishml.Phrase`<li>${{item:ishml.Phrase(["cat","dog", "bird"]).next()}}</li>`.until((list)=>list.item.reset)
	var target=this
	var untilCondition=condition
	var ishml_phrase=function(data)
	{
		if (data)
		{
			target(data)
			return ishml_phrase
		}
		else
		{
			var revisedPhrases=[]
			do 
			{
				var phrases=target(data)
				revisedPhrases=revisedPhrases.concat(phrases)
			}
			while (!untilCondition(target))
			return revisedPhrases
		}
	}	
	ishml.Phrase.attach(ishml_phrase,target)
	return ishml_phrase
}	
ishml.Phrase.transform.while=function(condition)
{
	//var a =ishml.Phrase`<li>${{item:ishml.Phrase(["cat","dog", "bird"]).next()}}</li>`.while((list)=>!list.item.reset)
	var target=this
	var whileCondition=condition
	var ishml_phrase=function(data)
	{
		if (data)
		{
			target(data)
			return ishml_phrase
		}
		else
		{
			var revisedPhrases=[]
			do 
			{
				var phrases=target(data)
				revisedPhrases=revisedPhrases.concat(phrases)
			}
			while (whileCondition(target))
			return revisedPhrases
		}
	}	
	ishml.Phrase.attach(ishml_phrase,target)
	return ishml_phrase
}
/***************DEFECT: examples of custom transforms.  Remove from final release and add to documentation.  */

ishml.Phrase.transform.identity=function()
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
			var phrases=target()
			return phrases.slice(0)
		}
	}

	ishml.Phrase.attach(ishml_phrase,target)
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
			var phrases=target(data)
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
		return phrases
	}
	ishml.Phrase.attach(ishml_phrase,target)
	return ishml_phrase
}