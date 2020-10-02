/*
***anonoymous phrases:
var saying=ishml.Phrase`The ${ishml.Phrase(["cat","dog", "bird"]).pick()} is in the ${ishml.Phrase(["hat","box", "nest", "car"]).pick(})}.`

saying.say().text


var _=ishml.PHrase
var example1=_`The ${_(["cat","dog", "bird"]).pick()} is in the ${_(["hat","box", "nest"]).pick(})}.`
example1.say().text

***Refering to phrases

var example2=_`The ${{animal:_(["cat","dog", "bird"]).pick()}} is in the ${{container:_(["hat","box", "nest","car"]).pick()}}.`
example2.say().text
example2.say({animal:["hippo","flea","moose"],container:["woods", "water", "matchbox"]}).text
example2.say({animal:["otter", "fox", "werewolf"]}).text  //partial
example2.say(["hippo","flea","moose"],["woods", "water", "matchbox"]}).text
example2({animal:["hippo","flea","moose"],container:["woods", "water", "matchbox"]})
example2.say().text

var example3=_`The ${animal:_().pick()} is in the ${container:_``).pick(})}.`
example3({animal:["hippo","flea","moose"],container:["woods", "water", "matchbox"]}).say().text

***Reusable phrases

var saying=()=>_`The ${animal:_(["cat","dog", "bird"]).pick()} is in the ${container:_(["hat","box", "nest","car"]).pick(})}.`
var example4 =saying()
var example5 =saying()({animal:["hippo","flea","moose"],container:["woods", "water", "matchbox"]})
example4.say().text
example5.say().text

***Details of next

var saying=_`You may choose a ${{animals:animals.join({separator:" "})}}. You chose a ${{animal:animals.pick()}}`

Named phrases:
var a=ishml.Phrase`There is ${{animal:ishml.Phrase(["cat","dog", "bird"]).pick().cap()}} in ${{container:ishml.Phrase(["hat","box", "nest"]).cap().join({separator:", "})}}.`

Data subsitution:
a({animal:[{value:"baboon",size:5},{value:"flea",size:1},{value:"badger",size:3}],container:[{value:"shoebox",size:1},{value:"bed",size:5},{value:"cave",size:5}]}).text()

var a=ishml.Phrase`There is ${{animal:ishml.Phrase([{value:"baboon",size:5},{value:"flea",size:1},{value:"badger",size:3}]).pick().cap()}} in ${ishml.Phrase.if(a.animal.size<2)`hat`.else`house`}.`

var a=ishml.Phrase`There is ${{animal:ishml.Phrase([{value:"baboon",size:5},{value:"flea",size:1},{value:"badger",size:3}]).pick().cap()}} in ${ishml.Phrase.if(a.animal.size<2)`hat`.else`house`}.`

a=ishml.Phrase`<list>${{item:ishml.Phrase`<li>${{animal:ishml.Phrase(["cat","dog","bird"])`}}</li>}`.repeat(a.item.animal)}</list>`

factory function:

var a=()=>ishml.Phrase`There is ${{animal:ishml.Phrase(["cat","dog", "bird"]).pick()}} in ${{container:ishml.Phrase(["hat","box", "nest"]).pick()}}.`
var b=a()
var c=a()

Conditional:

var a=ishml.Phrase`There is a ${{animal:ishml.Phrase(["cat","dog", "bird"]).pick()}}${{container:" in a hat", if:(root)=>root.animal.value==="cat",else:" in the house"}}.`

var a=ishml.Phrase`There is a ${{animal:ishml.Phrase(["cat","dog", "bird"]).pick()}} in ${{container:"a hat", if:(root)=>root.animal.value==="cat"}}.`

var a=_`There is a ${_(["cat","dog", "bird"]).pick().tag("animal")}${_` in a hat`.if(x=>x.animal.value==="cat").else` in the house`}.`


Silent:
var a=ishml.Phrase`There is something ${{animal:ishml.Phrase(["cat","dog", "bird"]).pick(),silent:" "}} in ${{container:"a hat", if:()=>a.animal.value==="cat",else:"the house"}}.`

Looping

var _ =ishml.Phrase //easier to type and read.

var items = _`<li>${{li:_(["cat","dog", "bird"]).pick()}}</li>`.until(x=>x.li.reset)
var items = _`<li>${{li:_(["cat","dog", "bird"]).pick()}}</li>`.while(x=>!x.li.reset)

factory functions

var items = data=>_`<li>${{li:_(data).pick()}}</li>`.until(x=>x.li.reset)

inline data:
var a=_`The ${{animal:ishml.Phrase(["cat","dog","bird"]).pick()}} is in the ${{container:_(["hat","box","nest","house","burrow","bag"]).pick()}}.`
a.say().text	

var animals=["cat","dog","bird"]
var containers=["hat","box","nest","house","burrow","bag"]
var a=_`The ${{animal:ishml.Phrase(animals).pick()}} is in the ${{container:_(containers).pick()}}.`
a.say().text


complex data:
var data={
		animal:["cat","dog","bird"],
		container:["hat","box","nest","house","burrow","bag"]
	}
var a=_`The ${{animal:_().pick()}} is in the ${{container:_().pick()}}.`

a.say(data).text

a(data)  //set data without generating text

Simple Correlated Phrases:
var data={animal:
	[
		{value:"cat", container:"hat"},
		{value:"dog", container:"house"},
		{value:"bird", container:"nest"}
	]}
var a=_`The ${{animal:_``.pick()}} is in the ${{container:x=>x.animal.container}}.`
a.say(data)

var a=_`The ${{animal:_().pick()}} is in the ${{container:()=>a.animal.container}}.`
a.say(data)

Complex correlated phrases:
 (DEFECT: need to implement random for this example.)
var data={animal:
	[
		{value:"cat", container:["hat","bag","box"]},
		{value:"dog", container:["house","burrow","car"]},
		{value:"bird", container:["nest","tree","sky"]}
	]}


var a=_`The ${{animal:ishml.Phrase``.pick()}} is in the ${{container:x=>_``.pick()(x.animal.container)}}.`

var container=ishml.Phrase``.join({separator:" "})
var a=ishml.Phrase`The ${{animal:ishml.Phrase``.pick()}} is in the ${{container:x=>container(x.animal.container)}}.`

a.say(data)
{li:"cat", list:["hat","bag","box"]},
		{li:"dog", list:["house","burrow","car"]},
		{li:"bird", list:["nest","tree","sky"]}

Self nesting phrases:
  -- simple list
var data={items:{li:["cat","dog","bird"]}}
var items=()=>ishml.Phrase`<li>${{li:ishml.Phrase().pick()}}</li>`.until(x=>x.li.reset)
var list=()=>ishml.Phrase`<ol>${{items:items()}}</ol>`

var a=list()(data)
var a=list();a(data)



//outer most phrase has 


  -- self nesting list:

var _=ishml.Phrase
var list=()=>_`<ol>${{items:_`<li>${{li:_().pick()}}${{list:x=>list()(x.li.list),if:x=>x.li.list}}</li>`.until(x=>x.li.reset)}}</ol>`
var data={items:{li:[{value:"cat",list:{items:{li:["meow","howl"]}}},{value:"dog",list:{items:{li:["bark","howl"]}}},{value:"bird",list:{items:{li:["coo","peep"]}}}]}}

---with hoisting

var items=()=>ishml.Phrase`<li>${{li:ishml.Phrase().pick()}}${{list:x=>list()(x.li.list),if:x=>x.li.list}}</li>`.until(x=>x.li.reset)
var list=()=ishml.Phrase`<ol>${{items:items()}}</ol>`
var data={items:{li:[{value:"cat",list:{items:{li:["meow","howl"]}}},{value:"dog",list:{items:{li:["bark","howl"]}}},{value:"bird",list:{items:{li:["coo","peep"]}}}]}}


---with sublist

var _=ishml.Phrase
var sublist={list:x=>list()(x.li.list),if:x=>x.li.list}
var items=()=>ishml.Phrase`<li>${{li:ishml.Phrase().pick()}}${sublist}</li>`.until(x=>x.li.reset)
var list=()=>ishml.Phrase`<ol>${{items:items()}}</ol>`
var data={items:{li:[{value:"cat",list:{items:{li:["meow","howl"]}}},{value:"dog",list:{items:{li:["bark","howl"]}}},{value:"bird",list:{items:{li:["coo","peep"]}}}]}}

var _=ishml.Phrase
var list=()=>_`<ol>${{items:items()}}</ol>`
var items=()=>_`<li>${{li:ishml.Phrase().pick()}}${sublist}</li>`.until(x=>x.li.reset)
var sublist={list:x=>list()(x.li.list),if:x=>x.li.list}
var data={items:{li:[{value:"cat",list:{items:{li:["meow","howl"]}}},{value:"dog",list:{items:{li:["bark","howl"]}}},{value:"bird",list:{items:{li:["coo","peep"]}}}]}}


---comma list
var _=ishml.Phrase
var oxfordList=()=>_`${{item:_().pick()}}${{separator:", ", if:x=>x.item.index < x.item.total-1 && x.item.total>2}}${{separator:" and ", if:x=>x.item.index===0 && x.item.total===2}}${{separator:"and ", if:x=>x.item.index===x.item.total-2 && x.item.total>2}}`.until(x=>x.item.reset)

data={item:["cat","dog","bird","horse"]}

var data=["cat","dog","bird","horse"]
var animals=`Today I went to the country and saw a ${oxfordList({item:["cat","dog","bird","horse"]})} by the river.`

var list=(data,oxford=true)=>
{
	if(oxford)
	{
		var list=_`${{item:_().pick()}}${{separator:", ", if:x=>x.item.index < x.item.total-1 && x.item.total>2}}${{separator:" and ", if:x=>x.item.index===0 && x.item.total===2}}${{separator:"and ", if:x=>x.item.index===x.item.total-2 && x.item.total>2}}${{nothing:"nothing", if:x=>x.item.value===""}}`.until(x=>x.item.reset)
	}
	else
	{
		var list=_`${{item:_().pick()}}${{separator:", ", if:x=>x.item.index < x.item.total-2 && x.item.total>2}}${{separator:" and ", if:x=>x.item.index === x.item.total-2 && x.item.total>1}}${{nothing:"nothing", if:x=>x.item.value===""}}`.until(x=>x.item.reset)
	}	
	if(data)
	{
		return list(data)
	}
	else
	{
		return list
	}
}

---options for pick:
randomPick({curve:(index,total)=>({min:index/total, max:(index+1)/total}),seed,cycle=(total)=>total, last:"" )
pick({curve:(index,total)=>{min:index/total, max:(index+1)/total},cycle=(total)=>total, last:ishml.enum.random)

last: "string" or function or ishml.enum.reset
pick({curve:(index,total)=>({min:index/total, max:(index+1)/total}),seed,cycle=(total)=>total, last:"" )

.shuffle().pick()


uniformRandom=(x)=>
{
	return Math.floor(Math.random()*x.total)
}

pick({curve:(index,total)=>({min:index/total, max:(index+1)/total}),seed,cycle=Infinity, last:"" )

pick({curve:(index,array)=>index,reset=(index,array)=>index===array.length, seed,last:(index,array)=>array[array.length-1]})

curve: a function that returns an index into the array.
cycle: how many times to repeat. Defaults to Infinity. May be number or function.
last: The value to return once cycle completes.  defaults to "", may also be function
seed: random number

---Other transforms:

.shuffle({seed:.01})
.sort((a,b)=>a.item.weight > b.item.weight)
.filter(x=>x.weight> 10})
.concur((x,y)=>x.animal.size===y.size)
.first(value=1)
.last(value=1)
})
ishml.phrase`${gender:}`


prefixes and suffixes

_.prefix(ishml.lang.a).named("a")
_.prefix(ishm.lang.an).named("an")
_.prefix(x=>toUpperCase(x)).named("cap")
_.prefix(x=>x+"ing").named("ing")
var a=_`I saw ${_.cap.an(["otter","zebra","penguin"].pick())} ${_(["walk,sleep,eat"]).pick().ing} at the zoo.`

cap(an([]))

//then

_.series(["cat","dog","flea"]).then("pick")
_.series(["cat","dog","flea"]).then(()=>"")

*/
ishml.Phrase=function Phrase(literals, ...expressions)
{
	var populate=(data,index=0)=>
	{
		if (data instanceof Array) //if array and this phrase terminal, replace phrases with normalized data array.
		{
			if (ishml_phrase._terminal)
			{
				if (data.length===0){phrases=[]}
				else
				{
					ishml_phrase._phrases=data.map(phrase=> //normalize phrases
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
			}
			/*else  //this phrase non-terminal, but using anonymous data.  Match to nth entry in the concordance.
			{
				if(!(data===ishml.enum.mode.reset))
				{
					var key=Object.values(ishml_phrase._concordance.index)[index]
					ishml_phrase._phrases[ishml_phrase._concordance.key[key]].value(data)
				}	
			}*/	
		}
		/*else
		{
			if(!(data===ishml.enum.mode.reset))  //if data is an object, match members to named phrases
			{
				Object.keys(data).forEach(key=>
				{
					if(ishml_phrase._concordance.key.hasOwnProperty(key))
					{
						ishml_phrase._phrases[ishml_phrase._concordance.key[key]].value(data[key])
					}

				})
			}	
		}*/
	}
	var ishml_phrase=function(...data)
	{
		if (data.length>0)  //we have data
		{			
			data.forEach((item,index)=>
				{
					if(item._isIshmlPhrase)
					{
						var phrases=[item.say().text]
						populate(phrases,index)
					}
					else {populate(item,index)}
					
				}
			)	
			ishml_phrase.text=""
			return ishml_phrase
			
		}
		else 
		{
			var evaluation=[]
			//convert phrases into an array of {value:string, whatever:whatever}
			ishml_phrase._phrases.forEach((phrase,index)=>
			{
				var clause=phrase.value
				var clauseType=typeof clause
				if (clauseType=== "string"  || clauseType=== "number")  //value is string
				{
					var data =Object.assign({},phrase) //grab the meta data and data already gathered
					data.value=clause.toString()
					
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
							Object.assign(ishml_phrase,clause.getTags())  //always evaluate clause before getting tags
							data.value= subPhrases.reduce((result,subPhrase,index)=>
							{
								Object.assign(data,subPhrase)
								/*if (clause._concordance.index.hasOwnProperty(index))
								{
									data[clause._concordance.index[index]]=clause._phrases[index].value
								}*/
								
								return result+subPhrase.value
							},"")
							
							//Object.assign(data, clause._concordance.tags)
							//Object.assign(clause, clause._concordance.tags)	
						}

					}
				}
				/*if(ishml_phrase._concordance.index.hasOwnProperty(index))
				{
					var placeholder=ishml_phrase[ishml_phrase._concordance.index[index]]
					Object.keys(placeholder).forEach(key=>delete placeholder[key])
					Object.assign(placeholder,data)  
				}*/
				var evaluatedPhrase=Object.assign({},data)
				/*var silent=phrase.silent
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
				}*/
				evaluation.push(evaluatedPhrase)
			})
			
			ishml_phrase.text=evaluation.reduce((text,data)=>text+data.value,"")
			return evaluation
		}
		
	}
	Object.defineProperty(ishml_phrase,"_phrases",{value:[],writable:true})
	//Object.defineProperty(ishml_phrase,"_concordance",{value:{key:{},index:{},tags:{}},writable:true})
	
	
	if (literals && literals.length>0)
	{
		if (expressions.length===0)
		{
			Object.defineProperty(ishml_phrase,"_terminal",{value:true,writable:true})
			populate(literals)
		}
		else
		{
			if (typeof literals=== "string") //() notation
			{
				literals=[literals].concat(expressions)
				expressions=[]
			}

			if (literals[0].length !== 0)
			{
				ishml_phrase._phrases.push({value:literals[0]})
			}
			var index=1
			if(expressions.length>0)
			{
				Object.defineProperty(ishml_phrase,"_terminal",{value:false,writable:true})
				expressions.forEach(phrase=> 
				{
					
					/*if (typeof phrase === "object")  //phrase is an object. AKA named phrase
					{
						var key=Object.keys(phrase)[0]
						var normalizedPhrase=Object.assign({value:phrase[key]},phrase)
						var counter=ishml_phrase._phrases.push(normalizedPhrase)-1
						ishml_phrase._concordance.index[counter]=key
						ishml_phrase._concordance.key[key]=counter
						ishml_phrase[key]={}
					}
					else //anonymous phrase
					{ishml_phrase._phrases.push({value:phrase})}
					*/
					ishml_phrase._phrases.push({value:phrase})
					if (literals[index].length>0)
					{
						ishml_phrase._phrases.push({value:literals[index]})
					}
				/*	if(phrase._isIshmlPhrase)
					{
						Object.assign(ishml_phrase,phrase._concordance.tags)
					}*/
					index++
				})
			}
			else
			{
				Object.defineProperty(ishml_phrase,"_terminal",{value:true,writable:true})
			}	
			
			if (index < literals.length)
			{
				ishml_phrase._phrases=ishml_phrase._phrases.concat(literals.slice(index).map(literal=>({value:literal})))
			}
		}
	}
	else{Object.defineProperty(ishml_phrase,"_terminal",{value:true,writable:true})}	
	ishml.Phrase.attach(ishml_phrase,null)
	
	ishml_phrase.reset=function(){}
	return ishml_phrase
}


ishml.Phrase.attach=function(ishml_phrase,target)
{

	var say=function(seed) //generates text output
	{
		//if (data.length>0){this(...data)}
		if (Number.isInteger(seed))
		{
			this._seed=seed
		}

		//this.text=this().reduce((result,item)=>result+item.value,"")
		this()
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
	var getTags=function()
	{
		var tags={}
		if(this._target){Object.assign(tags,this._target.getTags())}
		return tags
	}
	var getTaggedPhrases=function() 
	{
		var tags={}
		if(this._id){tags[this._id]=this._tag}
		if(this._target){Object.assign(tags,this._target.getTags())}
		return tags
	}

	Object.keys(ishml.Phrase.suffix).forEach(key=>
	{
		Object.defineProperty(ishml_phrase,key,{get:ishml.Phrase.suffix[key]})

	})
	Object.keys(ishml.Phrase.transform).forEach(key=>
	{
		Object.defineProperty(ishml_phrase,key,{value:ishml.Phrase.transform[key],writable:true})

	})
	if (target && target._isIshmlPhrase)
	{
		Object.assign(ishml_phrase,target)
		//Object.defineProperty(ishml_phrase,"_concordance",{value:target._concordance,writable:true})
		Object.defineProperty(ishml_phrase,"_phrases",{value:target._phrases,writable:true})
		Object.defineProperty(ishml_phrase,"_terminal",{value:target._terminal,writable:true})
	}
	/*else
	{
		Object.keys(target.key).forEach(key=>
		{
			ishml_phrase[key]={}
		})
		//Object.defineProperty(ishml_phrase,"_concordance",{value:target,writable:true})
	}*/
	
	Object.defineProperty(ishml_phrase,"_isIshmlPhrase",{value:true,writable:true})
	Object.defineProperty(ishml_phrase,"_target",{value:target,writable:true})
	Object.defineProperty(ishml_phrase,"_tag",{value:null,writable:true})
	Object.defineProperty(ishml_phrase,"getTags",{value:getTags,writable:true})
	Object.defineProperty(ishml_phrase,"getTaggedPhrases",{value:getTaggedPhrases,writable:true})
	Object.defineProperty(ishml_phrase,"say",{value:say,writable:true})
	Object.defineProperty(ishml_phrase,"_seed",{value:ishml.util.random().seed,writable:true})
	Object.defineProperty(ishml_phrase,"prepend",{value:prepend,writable:true})
	Object.defineProperty(ishml_phrase,"append",{value:append,writable:true})
	Object.defineProperty(ishml_phrase,"replace",{value:replace,writable:true})
	Object.defineProperty(ishml_phrase,"text",{value:"",writable:true})
	Object.defineProperty(ishml_phrase,"htmlTemplate",{value:htmlTemplate,writable:true})

}
//A transform function when called that returns a function that returns the actual transformation.  The transformation returns either text or an object countaining the phrases array and list of placeholders.  


/*ishml.Phrase.prefix=function(modifier,returnsString=true)
{
	var named= id=>
	{
		if (returnsString)
		{
			//Convert to ishml phrase generator instead.
			var prefixer=(data)=>
			{
				if (typeof data=== "function")
				{
					var target=data()
					if (target._isIshmlPhrase)
					{
						target=[target.say().text]
					}
					
				}
				if(!target instanceof Array)
				{
					target=[target]
				}
				
				var ishml_phrase=function(...data)
				{	
					if (data.length>0)
					{
						target(...data)
						return ishml_phrase
					}
					else
					{
						var phrases=target()
						phrases.forEach(phrase=>
						{
							phrase.value=modifier(phrase.value)
						})
						return phrases.slice(0)
					}
				}	
				ishml.Phrase.attach(ishml_phrase,target)
				return ishml_phrase(data)
			}
		}
		else
		{
			
				var prefixer=(data)=>modifier(data)

		}
	
		ishml.Phrase[id]=new Proxy(prefixer,ishml.Phrase.prefixHandler)
		
		return this
	}	

	return {named:named}	
}*/

ishml.Phrase.prefixHandler=
{
	get:function(prefix, property, receiver) //a.b.c() becomes a(b(c()))
	{
		if(property==="isPrefix"){return true}
	
		if (property==="nextPrefix"){return prefix} //bare property without proxy
		
		var nextPrefix= ishml.Phrase[property].nextPrefix//Reflect.get(target,property,receiver)
		var prefixer=(data)=>
		{	
			
			return prefix(nextPrefix(data))//a.b(data) becomes a(b(data))
			
		}
		return new Proxy(prefixer,this)
		
	}
}
ishml.Phrase.suffix={}
ishml.Phrase.transform={}

//pick({mode:ishml.Phrase.mode.serial or random or favor,})

ishml.Phrase.transform.concur=function(condition)
{
	//var a =ishml.Phrase`The ${{animal:ishml.Phrase([{value:"cat",size:2},{value:"dog",size:2}, {value:"bird",size:1}]).pick}} in the ${{container:ishml.Phrase([{value:"hat",size:2},{value:"box",size:2}, {value:"nest",size:1}]).concur((container)=>a.animal.size===container.size).pick}}`
	var target=this
	var ishml_phrase=function(...data)
	{
		if (data.length>0)
		{
			target(...data)
			ishml_phrase.text=""
			return ishml_phrase
		}
		else
		{

			var phrases=target()
			Object.assign(ishml_phrase,target)
			phrases= phrases.filter((phrase)=>
			{
				return condition(phrase)
			})

			ishml_phrase.text =phrases.reduce((text,data)=>text+data.value,"")
			return phrases

		}
	}	
	ishml.Phrase.attach(ishml_phrase,target)
	ishml_phrase.reset=function(){target.reset()}
	return ishml_phrase
}
ishml.Phrase.suffix.cycle=function()
{
	var counter=0
	var target=this
	var ishml_phrase=function(...data)
	{	
		if (data.length>0)
		{
			target(...data)
			counter=0
			ishml_phrase.text=""
			return ishml_phrase
		}
		else
		{
			
			var phrases=target()
			Object.assign(ishml_phrase,target)
			if(phrases.length===0)
			{
				Object.assign(ishml_phrase,{index:0, total:0, reset:true})
				return [{value:""}]
			}
			else
			{
				var phrase=phrases[counter] 
				Object.assign(ishml_phrase,{index:counter, total:phrases.length, reset:false})
			}

			counter++
			if (counter===phrases.length)
			{
				counter=0
				target.reset()
				ishml_phrase.reset=true
			}
			else
			{
				ishml_phrase.reset=false
			}
			ishml_phrase.text =phrase.value
			Object.assign(ishml_phrase,phrase)
			return [phrase]
		}
	}
	ishml.Phrase.attach(ishml_phrase,target)
	ishml_phrase.reset=function(){target.reset()}
	return ishml_phrase		
}
ishml.Phrase.transform.join=function({separator="", trim=true}={})
{
	var target=this
	var ishml_phrase=function(...data)
	{	
		if (data.length>0)
		{
			target(...data)
			ishml_phrase.text=""
			return ishml_phrase
		}
		else
		{
			var phrases=target()
			Object.assign(ishml_phrase,target)
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
			ishml_phrase.text =data.value
			return [data]
		}	
	}
	ishml.Phrase.attach(ishml_phrase,target)
	ishml_phrase.reset=function(){target.reset()}
	return ishml_phrase
}

ishml.Phrase.suffix.favor=function()
{
	var target=this
	var ishml_phrase=function(...data)
	{	
		if (data.length>0)
		{
			target(...data)
			counter=0
			ishml_phrase.text=""
			return ishml_phrase
		}
		else
		{
			var phrases=target()
			Object.assign(ishml_phrase,target)
			if(phrases.length===0)
			{
				var phrase={value:""}
				Object.assign(ishml_phrase,phrase)
				return [phrase]
			}
			else
			{
				var c=phrases.length*(phrases.length+1)*Math.random()
				var counter=phrases.length-Math.floor((Math.sqrt(1+4*c)-1)/2)-1
				var phrase=phrases[counter] 
				phrase.index=counter
				phrase.total=phrases.length

			}
			ishml_phrase.text =phrase.value
			Object.assign(ishml_phrase,phrase)
			return [phrase]
		}
	}
	ishml.Phrase.attach(ishml_phrase,target)
	ishml_phrase.reset=function(){target.reset()}
	return ishml_phrase		
}
ishml.Phrase.transform.first=function(count=1)
{
	var target=this

	var ishml_phrase=function(...data)
	{	
		if (data.length>0)
		{
			target(...data)
			ishml_phrase.text=""
			return ishml_phrase
		}
		else
		{
			var phrases=target().slice(0,count)
			Object.assign(ishml_phrase,target)
			ishml_phrase.text =phrases.reduce((text,data)=>text+data.value,"")
			
		}
	}
	ishml.Phrase.attach(ishml_phrase,target)
	ishml_phrase.reset=function(){target.reset()}
	return ishml_phrase		
}
ishml.Phrase.suffix.fixed=function()
{
	var target=this
	var phrases =null
	var ishml_phrase=function(...data)
	{	
		if (data.length>0)
		{
			target(...data)
			phrases=null
			ishml_phrase.text=""
			return ishml_phrase
		}
		else
		{
			if (!phrases)
			{
				phrases=target()
				Object.assign(ishml_phrase,target)
				ishml_phrase.text=phrases.reduce((text,data)=>text+data.value,"")
				
			}

			return phrases
			
		}
	}
	ishml.Phrase.attach(ishml_phrase,target)
	ishml_phrase.reset=function(){}
	return ishml_phrase		
}
ishml.Phrase.transform.last=function(count=1)
{
	var target=this

	var ishml_phrase=function(...data)
	{	
		if (data.length>0)
		{
			target(...data)
			ishml_phrase.text=""
			return ishml_phrase
		}
		else
		{
			var phrases=target().slice(-count)
			Object.assign(ishml_phrase,target)
			ishml_phrase.text=phrases.reduce((text,data)=>text+data.value,"")
			return phrases
		}
	}
	ishml.Phrase.attach(ishml_phrase,target)
	ishml_phrase.reset=function(){target.reset()}
	return ishml_phrase		
}

/*ishml.Phrase.transform.suffix=function()
{
	var target=this
	var done =false
	var ishml_phrase=function(...data)
	{	
		if (data.length>0)
		{
			target(...data)
			done = false
			return ishml_phrase
		}
		else
		{
			if (done){return [{value:""}]}
			else
			{
				done = true
				return target()
			}
			
		}
	}
	ishml.Phrase.attach(ishml_phrase,target)
	return ishml_phrase		
}*/
//_`<li>${{animal:_(["goose","chicken","rhino"]).series()}}</li>`.per("animal")
ishml.Phrase.transform.per=function(id)
{
	var target=this
	var tag=id
	var ishml_phrase=function(...data)
	{	
		if (data.length>0)
		{
			target(...data)
			length=data.length
			ishml_phrase.text=""
			return ishml_phrase
		}
		else
		{
			//var length =target._phrases[target._concordance.key[placeholder]].value._phrases.length
			var length=ishml_phrase[tag]._phrases.length
			if(length===0)
			{
				var phrase={value:""}
				this.text =""
				return [phrase]
			}
			else
			{
				var revisedPhrases=[]
				for (let index = 0; index < length; index++)
				{
					var phrases=target()
					Object.assign(ishml_phrase,target)
					revisedPhrases=revisedPhrases.concat(phrases)
					
				}
				ishml_phrase.text=revisedPhrases.reduce((text,data)=>text+data.value,"")
				return revisedPhrases
			}	
		}
	}
	ishml.Phrase.attach(ishml_phrase,target)
	ishml_phrase.reset=function(){target.reset()}
	return ishml_phrase		
}
ishml.Phrase.suffix.pick=function()
{
	var target=this
	var ishml_phrase=function(...data)
	{	
		if (data.length>0)
		{
			target(...data)
			ishml_phrase.text=""
			return ishml_phrase
		}
		else
		{
			var phrases=target()
			Object.assign(ishml_phrase,target)
			if(phrases.length===0)
			{
				var phrase={value:""}
				ishml_phrase.text=""
				Object.assign(ishml_phrase,phrase)
				return [phrase]
			}
			else
			{
				var counter=Math.floor(Math.random()*phrases.length)
				var phrase=phrases[counter] 
				phrase.index=counter
				phrase.total=phrases.length

			}
			ishml_phrase.text=phrase
			Object.assign(ishml_phrase,phrase)
			return [phrase]
		}
	}
	ishml.Phrase.attach(ishml_phrase,target)
	ishml_phrase.reset=function(){target.reset()}
	return ishml_phrase		
}
ishml.Phrase.transform.repeat=function(condition)
{
	//var a =ishml.Phrase`<li>${{item:ishml.Phrase(["cat","dog", "bird"]).series()}}</li>`.until((list)=>list.item.reset)
	var target=this
	if (typeof condition==="function"){var untilCondition=condition}
	else {var untilCondition =()=>condition}	
	var ishml_phrase=function(...data)
	{
		if (data.length>0)
		{
			target(...data)
			ishml_phrase.text=""
			return ishml_phrase
		}
		else
		{
			var revisedPhrases=[]
			var repetitions=untilCondition(target)
			var counter=0
			
			do
			{
				var phrases=target()
				Object.assign(ishml_phrase,target)
				revisedPhrases=revisedPhrases.concat(phrases)
				counter++
			} while (counter<repetitions)
			ishml_phrase.text=revisedPhrases.reduce((text,data)=>text+data.value,"")
			return revisedPhrases
		}
	}	
	ishml.Phrase.attach(ishml_phrase,target)
	ishml_phrase.reset=function(){target.reset()}
	return ishml_phrase
}
//_.(["cat","dog","frog"]).series({then:""})  
//_.(["cat","dog","frog"]).series({then:ishml.Phrase().pick())
ishml.Phrase.transform.series=function({then=""}={})
{
	var counter=0
	var ended =false
	var target1=this
	if (typeof then ==="function"){target2=then}
	else {target2 = ()=>[then]}
	target=target1
	var ishml_phrase=function(...data)
	{	
		if (data.length>0)
		{
			target=target1
			target(...data)
			counter=0
			ended=false
			ishml_phrase.text=""
			return ishml_phrase
		}
		else
		{
			
			var phrases=target()
			Object.assign(ishml_phrase,target)
			if (target===target1)
			{
				if(phrases.length===0)
				{
					var phrase={value:then, ended:true}
					ishml_phrase.text=phrase.value
					Object.assign(ishml_phrase,phrase)
					return [phrase]
				}
				else
				{
					var phrase=phrases[counter] 
					phrase.index=counter
					phrase.total=phrases.length

				}

				counter++
				if (counter===phrases.length)
				{
					target=target2  //transfer control over to then
					target(phrases) 
					counter=0
				}
				ishml_phrase.text=phrase.value
				Object.assign(ishml_phrase,phrase)
				return [phrase]
			}
			else 
			{
				ishml_phrase.text=phrases.reduce((text,data)=>text+data.value,"")
				Object.assign(ishml_phrase,phrase)
				return phrases
			}
			
		}
	}
	ishml.Phrase.attach(ishml_phrase,target)
	ishml_phrase.reset=function(){target.reset()}
	return ishml_phrase		
}

ishml.Phrase.suffix.shuffled=function()
{
	//ishml.Phrase(["cat","dog", "bird"]).shuffled.cycle
	//ishml.Phrase(["cat","dog", "bird"]).shuffled.fixed.cycle
	var target=this
	var result =null
	var ishml_phrase=function(...data)
	{	
		if (data.length>0)
		{
			target(...data)
			result=null
			ishml_phrase.text=""
			return ishml_phrase
		}
		else
		{
			if (!result)
			{
				result=ishml.util.shuffle(target())
				Object.assign(ishml_phrase,target)
			}

			ishml_phrase.text=result.result.reduce((text,data)=>text+data.value,"")
			return result.result
			
		}
	}
	ishml.Phrase.attach(ishml_phrase,target)
	ishml_phrase.reset=function()
	{
		target.reset()
		result=null
	}
	return ishml_phrase	
			
}

ishml.Phrase.transform.tag=function(id)
{
	var target=this
	var phrases =[]
	var ishml_phrase=function(...data)
	{	
		if (data.length>0)
		{
			target(...data)
			phrases=[]
			ishml_phrase.text=""
			return ishml_phrase
		}
		else
		{
			phrases=target()
			var id=ishml_phrase._id
			ishml_phrase.text=phrases.reduce((text,data)=>text+data.value,"")
			ishml_phrase._tag=ishml.Phrase(phrases.map((phrase)=>
			{
				return Object.assign({},phrase)
			}))
			Object.assign(ishml_phrase._tag,target)
			ishml_phrase._tag._id=null
			return phrases
		}
	}
	ishml.Phrase.attach(ishml_phrase,target)
	ishml_phrase._id=id
	ishml_phrase.getTags=ishml_phrase.getTaggedPhrases
	//ishml_phrase._concordance.tags[id]=ishml_phrase
	ishml_phrase.reset=function(){}
	return ishml_phrase		
}

ishml.Phrase.transform.until=function(condition)
{
	//var a =ishml.Phrase`<li>${{item:ishml.Phrase(["cat","dog", "bird"]).series()}}</li>`.until((list)=>list.item.reset)
	var target=this
	var untilCondition=condition
	var ishml_phrase=function(...data)
	{
		if (data.length>0)
		{
			target(...data)
			ishml_phrase.text=""
			return ishml_phrase
		}
		else
		{
			var revisedPhrases=[]
			do 
			{
				var phrases=target()
				Object.assign(ishml_phrase,target)
				revisedPhrases=revisedPhrases.concat(phrases)
			}
			while (!untilCondition(target))
			ishml_phrase.text=revisedPhrases.reduce((text,data)=>text+data.value,"")
			
			return revisedPhrases
		}
	}	
	ishml.Phrase.attach(ishml_phrase,target)
	ishml_phrase.reset=function(){target.reset()}
	return ishml_phrase
}	
ishml.Phrase.transform.while=function(condition)
{
	//var a =ishml.Phrase`<li>${{item:ishml.Phrase(["cat","dog", "bird"]).pick()}}</li>`.while((list)=>!list.item.reset)
	var target=this
	var whileCondition=condition
	var ishml_phrase=function(...data)
	{
		if (data.length>0)
		{
			target(...data)
			ishml_phrase.text=""
			return ishml_phrase
		}
		else
		{
			var revisedPhrases=[]
			do 
			{
				var phrases=target()
				Object.assign(ishml_phrase,target)
				revisedPhrases=revisedPhrases.concat(phrases)
			}
			while (whileCondition(target))
			ishml_phrase.text=revisedphrases.reduce((text,data)=>text+data.value,"")
			return revisedPhrases
		}
	}	
	ishml.Phrase.attach(ishml_phrase,target)
	ishml_phrase.reset=function(){target.reset()}
	return ishml_phrase
}


/***************DEFECT: examples of custom transforms.  Remove from final release and add to documentation.  */

ishml.Phrase.transform.identity=function()
{
	var target=this
	var ishml_phrase=function(...data)
	{	
		if (data.length>0)
		{
			target(...data)
			return ishml_phrase
		}
		else
		{
			var phrases=target()
			return phrases.slice(0)
		}
	}

	ishml.Phrase.attach(ishml_phrase,target)
	ishml_phrase.reset=function(){target.reset()}
	return ishml_phrase
}
ishml.Phrase.transform.cap=function()
{
	var target=this
	var ishml_phrase=function(...data)
	{	
		if (data.length>0)
		{
			target(...data)
			ishml_phrase.text=""
			return ishml_phrase
		}
		else
		{
			var phrases=target()
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
ishml.Phrase.phraseModifier=function(modifier)
{

	var prefix= id=>
	{
		var prefixer=(data)=>
		{
			if (typeof data ==="function")
			{
				if (data._isIshmlPhrase)
				{
					var target=data
				}
				else
				{
					var target=data()  //custom function must return ishml_phrase
				}
				
			}	
			else
			{
				var target=ishml.Phrase(data)
			}
			var ishml_phrase=function(...data)
			{	
				if (data.length>0)
				{
					target(...data)
					ishml_phrase.text=""
					return ishml_phrase
				}
				else
				{
					var phrases=modifier(target())()
					Object.assign(ishml_phrase,target)
					ishml_phrase.text=phrases.reduce((text,data)=>text+data.value,"")
					return phrases
				}
			}	
			ishml.Phrase.attach(ishml_phrase,target)
			return ishml_phrase
		}

		ishml.Phrase[id]=new Proxy(prefixer,ishml.Phrase.prefixHandler)
		
	}	
	
	var suffix=(id)=>
	{
		var suffixer=function()
		{
			var target=this
			var ishml_phrase=function(...data)
			{	
				if (data.length>0)
				{
					target(...data)
					ishml_phrase.text=""
					return ishml_phrase
				}
				else
				{
					var phrases=modifier(target())()
					Object.assign(ishml_phrase,target)
					ishml_phrase.text=phrases.reduce((text,data)=>text+data.value,"")
					return phrases
				}
			}	
			ishml.Phrase.attach(ishml_phrase,target)
			ishml_phrase.reset=function(){target.reset}
			return ishml_phrase
		}
		ishml.Phrase.suffix[id]=suffixer
	}	
	return {prefix:prefix,suffix:suffix}
}	
ishml.Phrase.modifier=function(modifier)
{  //DEFECT: should do deep copy of phrases.
	if (modifier._isIshmlPhrase){return ishml.Phrase.phraseModifier(modifier)}
	var prefix= id=>
	{
		var prefixer=(data)=>
		{
			if (data._isIshmlPhrase)
			{
				var target=data
			}	
			else
			{
				var target=ishml.Phrase(data)
			}
			var ishml_phrase=function(...data)
			{	
				if (data.length>0)
				{
					target(...data)
					ishml_phrase.text=""
					return ishml_phrase
				}
				else
				{
					var phrases=target().map(phrase=>
					{
						phrase.value=modifier(phrase)
						return phrase
					})
					Object.assign(ishml_phrase,target)
					ishml_phrase.text=phrases.reduce((text,data)=>text+data.value,"")
					return phrases

				}
			}	
			ishml.Phrase.attach(ishml_phrase,target)
			ishml_phrase.reset=function(){target.reset}
			return ishml_phrase
		}
		ishml.Phrase[id]=new Proxy(prefixer,ishml.Phrase.prefixHandler)
		
		
		return this
	}	
	var suffix=(id)=>
	{
		var suffixer=function()
		{
			var target=this
			var ishml_phrase=function(...data)
			{	
				if (data.length>0)
				{
					target(...data)
					ishml_phrase.text=""
					return ishml_phrase
				}
				else
				{
					var phrases=target().map(phrase=>
					{
						phrase.value=modifier(phrase)
						return phrase
					})
					Object.assign(ishml_phrase,target)
					ishml_phrase.text=phrases.reduce((text,data)=>text+data.value,"")
					return phrases
				}
			}	
			ishml.Phrase.attach(ishml_phrase,target)
			return ishml_phrase
		}

		ishml.Phrase.suffix[id]=suffixer

		return this
	}
	return {prefix:prefix,suffix:suffix}

}
