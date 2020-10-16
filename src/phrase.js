/*
***Creating phrases

//default data
var _=ishml.Phrase

var example1 = _`Hello world.`  //template literal notation
var example2 = _("Venus","Earth","Mars") //simple list
var example3 = _(["Venus","Earth","Mars"]) //simple list
var example4 = _([{value:"Venus", position:2},{value:"Earth", position:3},{value:"Mars", position:4}])// complex list
_([{planet:"Venus", position:2},{planet:"Earth", position:3},{planet:"Mars", position:4}])// complex list

var example5 =_()  //Deferred population

//Nested phrases
var example6 = _`Hello ${_("Venus","Earth","Mars")}.`  //inline nested template
var example7 = _`Hello ${example2}.`  //nested template

**** populating phrases

example2("mercury","jupiter","saturn")
example2("mercury","jupiter","saturn")



//deferred population
var example5 =_()


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
	var populate=(data)=>
	{
		if (data instanceof Array) //Treat as terminal phrase
		{
			if (data.length===0){ishml_phrase._phrases=[]}
			else
			{
				ishml_phrase._phrases=data.map(phrase=> //normalize phrases
				{
					var phraseType=typeof phrase
					if (phraseType ==="object")
					{

						if (phrase.hasOwnProperty("value")){return phrase}
						else 
						{
							var revisedPhrase=Object.assign({},phrase)
							revisedPhrase.value=Object.values(phrase)[0]
							return revisedPhrase
						}
					}
					else
					{
						if (phraseType === "string" || phraseType === "function"){return {value:phrase}}
						else{return{value:phrase.toString()}}
					}
				})
			}	
		}
		else  //object  attempt to match to tags
		{
			ishml_phrase._phrases.forEach(phrase=>
			{
				if (phrase.value._isIshmlPhrase)
				{
					var tags=phrase.value.getTags()
					
					for (const tag of Object.keys(tags))
					{
						if (data.hasOwnProperty(tag))
						{
							phrase.value(data[tag])
							break
						}
					}
				}
			})
		}
	}
	var ishml_phrase=function(...data)
	{
		if (data.length>0)  //we have data
		{			
			if (data.length >1 ) // data is simple list of args
			{
				populate(data)
			}	
			else  //unwrap arg array
			{
				populate(data[0])
			}	
			ishml_phrase.text=""
			return ishml_phrase
			
		}
		else 
		{
			var evaluation=[]
			//convert phrases into an array of {value:string, whatever:whatever}
			ishml_phrase._phrases.forEach((phrase)=>
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
							clause.setOuter(ishml_phrase)		
							var data={}
							var subPhrases=clause()
							Object.assign(ishml_phrase,clause.getTags())  //always evaluate clause before getting tags
							data.value= subPhrases.reduce((result,subPhrase)=>
							{
								Object.assign(data,subPhrase)

								return result+subPhrase.value
							},"")
						}
					}
				}
				var evaluatedPhrase=Object.assign({},data)
				evaluation.push(evaluatedPhrase)
			})
			
			ishml_phrase.text=evaluation.reduce((text,data)=>text+data.value,"")
			return evaluation
		}
		
	}
	Object.defineProperty(ishml_phrase,"_phrases",{value:[],writable:true})
	if (literals)
	{
		if( literals.hasOwnProperty("raw"))
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
						ishml_phrase._phrases.push({value:phrase})
						if (literals[index].length>0)
						{
							ishml_phrase._phrases.push({value:literals[index]})
						}
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
		else
		{
			if (expressions.length >0 ) // data is simple list of args
			{
				expressions.unshift(literals)
				populate(expressions)
				if(expressions.some(expression=>(typeof expression==="function")))
				{
					Object.defineProperty(ishml_phrase,"_terminal",{value:false,writable:true})
				}
				else
				{
					Object.defineProperty(ishml_phrase,"_terminal",{value:true,writable:true})
				}
			}	
			else  
			{
				if (literals instanceof Array)
				{
					if(literals.some(expression=>(typeof expression==="function")))
					{
						Object.defineProperty(ishml_phrase,"_terminal",{value:false,writable:true})
					}
					else
					{
						Object.defineProperty(ishml_phrase,"_terminal",{value:true,writable:true})
					}
				}
				else //object
				{
					Object.defineProperty(ishml_phrase,"_terminal",{value:false,writable:true})
				}
				populate(literals) //DEFECT: ishml.Phrase("cat") needs to be (["cat"])
			}
		}	
	}
	else{Object.defineProperty(ishml_phrase,"_terminal",{value:true,writable:true})}	
	ishml.Phrase.attach(ishml_phrase,null)
	Object.defineProperty(ishml_phrase,"_reset",{value:function(){},writable:true})
	return ishml_phrase
}


ishml.Phrase.attach=function(ishml_phrase,receiver)
{

	var say=function(seed) //generates text output
	{
		
		if (seed>=0)
		{
			this.seed(seed)
		}
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
		if(this._receiver){Object.assign(tags,this._receiver.getTags())}
		return tags
	}
	var getTaggedPhrases=function() 
	{
		var tags={}
		if(this._id){tags[this._id]=this._tag}
		if(this._receiver){Object.assign(tags,this._receiver.getTags())}
		return tags
	}
	var seed=function(seed) //generates text output
	{
		if (seed>=0 && seed <1){this._seed=Math.floor(seed* 2147483648)}
		else
		{
			if(!seed){this._seed=ishml.util.random().seed}
			else{this._seed=seed}
		}
		if (this._receiver){this._receiver.seed(this._seed)}
		this._phrases.forEach(phrase=>
		{
			if(phrase.value._isIshmlPhrase)
			{
				phrase.value.seed(ishml.util.random(this._seed).seed)
			}	
		})
		return this
	}
	var setOuter=function(outerPhrase)
	{
		this.outer=outerPhrase
		if(this._receiver){this._receiver.setOuter(outerPhrase)}
	}

	Object.keys(ishml.Phrase.suffix).forEach(key=>
	{
		Object.defineProperty(ishml_phrase,key,{get:ishml.Phrase.suffix[key]})

	})
	Object.keys(ishml.Phrase.transform).forEach(key=>
	{
		Object.defineProperty(ishml_phrase,key,{value:ishml.Phrase.transform[key],writable:true})

	})
	if (receiver && receiver._isIshmlPhrase)
	{
		Object.assign(ishml_phrase,receiver)
		Object.defineProperty(ishml_phrase,"_phrases",{value:receiver._phrases,writable:true})
		Object.defineProperty(ishml_phrase,"_terminal",{value:receiver._terminal,writable:true})
	}
	Object.defineProperty(ishml_phrase,"append",{value:append,writable:true})
	Object.defineProperty(ishml_phrase,"outer",{value:null,writable:true})
	Object.defineProperty(ishml_phrase,"getTags",{value:getTags,writable:true})
	Object.defineProperty(ishml_phrase,"getTaggedPhrases",{value:getTaggedPhrases,writable:true})
	Object.defineProperty(ishml_phrase,"htmlTemplate",{value:htmlTemplate,writable:true})
	Object.defineProperty(ishml_phrase,"_isIshmlPhrase",{value:true,writable:true})
	Object.defineProperty(ishml_phrase,"prepend",{value:prepend,writable:true})
	Object.defineProperty(ishml_phrase,"replace",{value:replace,writable:true})
	Object.defineProperty(ishml_phrase,"say",{value:say,writable:true})
	Object.defineProperty(ishml_phrase,"_seed",{value:ishml.util.random().seed,writable:true})
	Object.defineProperty(ishml_phrase,"seed",{value:seed,writable:true})
	Object.defineProperty(ishml_phrase,"setOuter",{value:setOuter,writable:true})
	Object.defineProperty(ishml_phrase,"_receiver",{value:receiver,writable:true})
	Object.defineProperty(ishml_phrase,"_tag",{value:null,writable:true})
	Object.defineProperty(ishml_phrase,"text",{value:"",writable:true})
	
}

ishml.Phrase.prefixHandler=
{
	get:function(prefix, property) //a.b.c() becomes a(b(c()))
	{
		//if(property==="isPrefix"){return true}
	
		if (property==="nextPrefix"){return prefix} //bare property without proxy
		
		var nextPrefix= ishml.Phrase[property].nextPrefix
		var prefixer=(...data)=>
		{	
			return prefix(nextPrefix(...data))//a.b(data) becomes a(b(data))
		}
		return new Proxy(prefixer,this)
	}
}
ishml.Phrase.suffix={}
ishml.Phrase.transform={}

//pick({mode:ishml.Phrase.mode.serial or random or favor,})

ishml.Phrase.transform.concur=function(condition) //pos
{
	//var a =ishml.Phrase`The ${{animal:ishml.Phrase([{value:"cat",size:2},{value:"dog",size:2}, {value:"bird",size:1}]).pick}} in the ${{container:ishml.Phrase([{value:"hat",size:2},{value:"box",size:2}, {value:"nest",size:1}]).concur((container)=>a.animal.size===container.size).pick}}`
	var receiver=this
	var ishml_phrase=function(...data)
	{
		if (data.length>0)
		{
			receiver(...data)
			ishml_phrase.text=""
			return ishml_phrase
		}
		else
		{

			var phrases=receiver()
			Object.assign(ishml_phrase,receiver)
			phrases= phrases.filter((phrase)=>
			{
				return condition(phrase)
			})

			ishml_phrase.text =phrases.reduce((text,data)=>text+data.value,"")
			return phrases

		}
	}	
	ishml.Phrase.attach(ishml_phrase,receiver)
	Object.defineProperty(ishml_phrase,"_reset",{value:function(){receiver._reset()},writable:true})
	return ishml_phrase
}
ishml.Phrase._setReceiver=function(...data)
{
	if (typeof data[0] ==="function")
	{
		if (data[0]._isIshmlPhrase)
		{
			var receiver=data[0]
		}
		else
		{
			var receiver=data[0]()  //custom function must return ishml_phrase
		}
		
	}	
	else
	{
		var receiver=ishml.Phrase(...data)
	}
	return receiver
}
ishml.Phrase.cycle= new Proxy(function(...anIshmlPhrase)
{
	var counter=0
	var receiver=ishml.Phrase._setReceiver(...anIshmlPhrase)
	var ishml_phrase=function(...data)
	{	
		if (data.length>0)
		{
			receiver(...data)
			counter=0
			ishml_phrase.text=""
			return ishml_phrase
		}
		else
		{
			
			var phrases=receiver()
			Object.assign(ishml_phrase,receiver)
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
				receiver._reset()
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
	ishml.Phrase.attach(ishml_phrase,receiver)
	Object.defineProperty(ishml_phrase,"_reset",{value:function(){receiver._reset()},writable:true})
	return ishml_phrase		
},ishml.Phrase.prefixHandler)

//var b=_`They had ${_([{value:"cat",size:3,adj:"sleepy"},{value:"dog",size:3,adj:"bouncy"},{value:"mouse",size:1,adj:"nervous"}]).pick.tag("animal").s.tag("animals")} at the petstore.  So I got a ${x=>x.animal}.  How many ${x=>x.animals} do you have?  My ${x=>x.animal} is ${x=>x.animal.adj}${_` and also small`.if(x=>x.animal.size<3).else` and also fluffy`}.
/*ishml.Phrase.transform.else=function(...alternative)
{
	var elsePhrase= ishml.Phrase(...alternative)
	var receiver=this
	var ishml_phrase=function(...data)
	{	
		if (data.length>0)
		{
			receiver(...data)
			ishml_phrase.text=""
			return ishml_phrase
		}
		else
		{
			var phrases=receiver()
			if (phrases.length===1 && phrases[0].value==="")
			{
				phrases=elsePhrase()
				Object.assign(ishml_phrase,elsePhrase)
				ishml_phrase._id=null
				ishml_phrase.text=phrases.reduce((text,data)=>text+data.value,"")
				return phrases
			}
			else
			{
				Object.assign(ishml_phrase,receiver)
				ishml_phrase._id=null
				ishml_phrase.text=phrases.reduce((text,data)=>text+data.value,"")
				return phrases
			}	
		}
	}
	ishml.Phrase.attach(ishml_phrase,receiver)
	Object.defineProperty(ishml_phrase,"_reset",{value:function(){receiver._reset()},writable:true})
	return ishml_phrase
}*/

//var a= _("cat","dog","mouse").series.then("frog","toad").pick
//var a= _("cat","dog","mouse").series.then`frog`
//var a=_.series("cat","dog","mouse").then.pick("frog","toad")
ishml.Phrase.transform.then=function(...data)
{
	
	var receiver1=this
	var receiver2= ishml.Phrase(...data)
	var receiver=this
	if (receiver2._phrases.length===0)
	{
		var populateReceiver2=true
	}
	var ishml_phrase=function(...data)
	{	
		if (data.length>0)
		{
			receiver=receiver1
			receiver(...data)
			ishml_phrase.text=""
			return ishml_phrase
		}
		else
		{
			var phrases=receiver()
			if (phrases.length===1 && phrases[0].value==="")
			{
				if (populateReceiver2)
				{
					receiver2(receiver._phrases)
					populateReceiver2=false
				}
				phrases=receiver2()
				Object.assign(ishml_phrase,receiver2)
				ishml_phrase._id=null
				ishml_phrase.text=phrases.reduce((text,data)=>text+data.value,"")
				return phrases
			}
			else
			{
				Object.assign(ishml_phrase,receiver)
				ishml_phrase._id=null
				ishml_phrase.text=phrases.reduce((text,data)=>text+data.value,"")
				return phrases
			}	
		}
	}
	ishml.Phrase.attach(ishml_phrase,receiver)
	Object.defineProperty(ishml_phrase,"_reset",{value:function(){receiver._reset()},writable:true})
	return ishml_phrase
}
ishml.Phrase.transform.else=ishml.Phrase.transform.then
ishml.Phrase.transform.join=function({separator="", trim=true}={})
{
	var receiver=this
	var ishml_phrase=function(...data)
	{	
		if (data.length>0)
		{
			receiver(...data)
			ishml_phrase.text=""
			return ishml_phrase
		}
		else
		{
			var phrases=receiver()
			Object.assign(ishml_phrase,receiver)
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
	ishml.Phrase.attach(ishml_phrase,receiver)
	Object.defineProperty(ishml_phrase,"_reset",{value:function(){receiver._reset()},writable:true})
	return ishml_phrase
}

ishml.Phrase.favor=new Proxy(function(...anIshmlPhrase)
{
	var receiver=ishml.Phrase._setReceiver(...anIshmlPhrase)
	var ishml_phrase=function(...data)
	{	
		if (data.length>0)
		{
			receiver(...data)
			counter=0
			ishml_phrase.text=""
			return ishml_phrase
		}
		else
		{
			var phrases=receiver()
			Object.assign(ishml_phrase,receiver)
			if(phrases.length===0)
			{
				var phrase={value:""}
				Object.assign(ishml_phrase,phrase)
				return [phrase]
			}
			else
			{
				var {value:random,seed}=ishml.util.random(ishml_phrase._seed)
				ishml_phrase._seed=seed
				var c=phrases.length*(phrases.length+1)*random
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
	ishml.Phrase.attach(ishml_phrase,receiver)
	Object.defineProperty(ishml_phrase,"_reset",{value:function(){receiver._reset()},writable:true})
	return ishml_phrase		
},ishml.Phrase.prefixHandler)
ishml.Phrase.transform.first=function(count=1)
{
	var receiver=this

	var ishml_phrase=function(...data)
	{	
		if (data.length>0)
		{
			receiver(...data)
			ishml_phrase.text=""
			return ishml_phrase
		}
		else
		{
			var phrases=receiver().slice(0,count)
			Object.assign(ishml_phrase,receiver)
			ishml_phrase.text =phrases.reduce((text,data)=>text+data.value,"")
			
		}
	}
	ishml.Phrase.attach(ishml_phrase,receiver)
	Object.defineProperty(ishml_phrase,"_reset",{value:function(){receiver._reset()},writable:true})
	return ishml_phrase		
}
//_.shuffle.cycle("cat", "dog","mouse") vs. _.cycle.pin.shuffle("cat", "dog","mouse")
ishml.Phrase.pin=new Proxy(function(...anIshmlPhrase)
{
	var receiver=ishml.Phrase._setReceiver(...anIshmlPhrase)
	var phrases =null
	var ishml_phrase=function(...data)
	{	
		if (data.length>0)
		{
			receiver(...data)
			phrases=null
			ishml_phrase.text=""
			return ishml_phrase
		}
		else
		{
			if (!phrases)
			{
				phrases=receiver()
				Object.assign(ishml_phrase,receiver)
				ishml_phrase.text=phrases.reduce((text,data)=>text+data.value,"")
				
			}

			return phrases
			
		}
	}
	ishml.Phrase.attach(ishml_phrase,receiver)
	Object.defineProperty(ishml_phrase,"_reset",{value:function(){},writable:true})
	return ishml_phrase		
},ishml.Phrase.prefixHandler)
//var b=_`They had ${_([{value:"cat",size:3,adj:"sleepy"},{value:"dog",size:3,adj:"bouncy"},{value:"mouse",size:3,adj:"nervous"}]).pick.tag("animal").s.tag("animals")} at the petstore.  So I got a ${x=>x.animal}.  How many ${x=>x.animals} do you have?  My ${x=>x.animal} is ${x=>x.animal.adj}{x=>if(x.animal.size <3){" and also small"}else{" and also big"}}.`

ishml.Phrase.transform.if=function(condition=()=>true)
{
	var receiver=this
	var rule
	if (typeof condition ==="function"){rule=condition}
	else {rule = ()=>condition}

	var ishml_phrase=function(...data)
	{	
		if (data.length>0)
		{
			receiver(...data)
			ishml_phrase.text=""
			return ishml_phrase
		}
		else
		{
			if(rule(ishml_phrase.outer))
			{
				var phrases=receiver()
				Object.assign(ishml_phrase,receiver)
				ishml_phrase._id=null
				ishml_phrase.text=phrases.reduce((text,data)=>text+data.value,"")
				return phrases
			}
			else
			{
				var phrase={value:""}
				ishml_phrase.text=phrase.value
				Object.assign(ishml_phrase,phrase)
				ishml_phrase.text=""
				return [phrase]
			}
		}
	}
	ishml.Phrase.attach(ishml_phrase,receiver)
	Object.defineProperty(ishml_phrase,"_reset",{value:function(){receiver._reset()},writable:true})
	return ishml_phrase
}

ishml.Phrase.transform.last=function(count=1)
{
	var receiver=this

	var ishml_phrase=function(...data)
	{	
		if (data.length>0)
		{
			receiver(...data)
			ishml_phrase.text=""
			return ishml_phrase
		}
		else
		{
			var phrases=receiver().slice(-count)
			Object.assign(ishml_phrase,receiver)
			ishml_phrase.text=phrases.reduce((text,data)=>text+data.value,"")
			return phrases
		}
	}
	ishml.Phrase.attach(ishml_phrase,receiver)
	Object.defineProperty(ishml_phrase,"_reset",{value:function(){receiver._reset()},writable:true})
	return ishml_phrase		
}
//_`<li>${{animal:_(["goose","chicken","rhino"]).series()}}</li>`.per("animal")
ishml.Phrase.transform.per=function(id)
{
	var receiver=this
	var tag=id
	var ishml_phrase=function(...data)
	{	
		if (data.length>0)
		{
			receiver(...data)
			length=data.length
			ishml_phrase.text=""
			return ishml_phrase
		}
		else
		{
			for (const phrase of ishml_phrase._phrases)
			{
				if (phrase.value._isIshmlPhrase)
				{
					var tags=phrase.value.getTags()
					if (tags.hasOwnProperty(tag))
					{
						var length=phrase.value._phrases.length
						break
					}
					
				}
			}

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
					var phrases=receiver()
					Object.assign(ishml_phrase,receiver)
					revisedPhrases=revisedPhrases.concat(phrases)
					
				}
				ishml_phrase.text=revisedPhrases.reduce((text,data)=>text+data.value,"")
				return revisedPhrases
			}	
		}
	}
	ishml.Phrase.attach(ishml_phrase,receiver)
	Object.defineProperty(ishml_phrase,"_reset",{value:function(){receiver._reset()},writable:true})
	return ishml_phrase		
}
ishml.Phrase.pick=new Proxy(function(...anIshmlPhrase)
{
	var receiver=ishml.Phrase._setReceiver(...anIshmlPhrase)
	var ishml_phrase=function(...data)
	{	
		if (data.length>0)
		{
			receiver(...data)
			ishml_phrase.text=""
			return ishml_phrase
		}
		else
		{
			var phrases=receiver()
			Object.assign(ishml_phrase,receiver)
			if(phrases.length===0)
			{
				var phrase={value:""}
				ishml_phrase.text=""
				Object.assign(ishml_phrase,phrase)
				return [phrase]
			}
			else
			{
				var {value:random,seed}=ishml.util.random(ishml_phrase._seed)
				ishml_phrase._seed=seed
				var counter=Math.floor(random*phrases.length)
				var phrase=phrases[counter] 
				phrase.index=counter
				phrase.total=phrases.length

			}
			ishml_phrase.text=phrase.value
			Object.assign(ishml_phrase,phrase)
			return [phrase]
		}
	}
	ishml.Phrase.attach(ishml_phrase,receiver)
	Object.defineProperty(ishml_phrase,"_reset",{value:function(){receiver._reset()},writable:true})
	return ishml_phrase		
},ishml.Phrase.prefixHandler)

ishml.Phrase.transform.repeat=function(condition)
{
	//var a =ishml.Phrase`<li>${{item:ishml.Phrase(["cat","dog", "bird"]).series()}}</li>`.until((list)=>list.item.reset)
	var receiver=this
	if (typeof condition==="function"){var untilCondition=condition}
	else {var untilCondition =()=>condition}	
	var ishml_phrase=function(...data)
	{
		if (data.length>0)
		{
			receiver(...data)
			ishml_phrase.text=""
			return ishml_phrase
		}
		else
		{
			var revisedPhrases=[]
			var repetitions=untilCondition(receiver)
			var counter=0
			
			do
			{
				var phrases=receiver()
				Object.assign(ishml_phrase,receiver)
				revisedPhrases=revisedPhrases.concat(phrases)
				counter++
			} while (counter<repetitions)
			ishml_phrase.text=revisedPhrases.reduce((text,data)=>text+data.value,"")
			return revisedPhrases
		}
	}	
	ishml.Phrase.attach(ishml_phrase,receiver)
	Object.defineProperty(ishml_phrase,"_reset",{value:function(){receiver._reset()},writable:true})
	return ishml_phrase
}

//_.(["cat","dog","frog"]).series.then("mouse")
//_.(["cat","dog","frog"]).series.then(ishml.Phrase().pick())
ishml.Phrase.series=new Proxy(function(...anIshmlPhrase)
{
	var counter=0
	var ended =false
	var receiver=ishml.Phrase._setReceiver(...anIshmlPhrase)
	var ishml_phrase=function(...data)
	{	
		if (data.length>0)
		{
			receiver=receiver1
			receiver(...data)
			counter=0
			ended=false
			ishml_phrase.text=""
			return ishml_phrase
		}
		else
		{
			
			var phrases=receiver()
			Object.assign(ishml_phrase,receiver)
			if (ended)
			{
				ishml_phrase.text=""
				var phrase={value:""}
				Object.assign(ishml_phrase,phrase)
				return  [phrase]
			}
			else
			{
				if(phrases.length===0)
				{
					var phrase={value:""}
					ishml_phrase.text=""
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
					ended=true
				}
				ishml_phrase.text=phrase.value
				Object.assign(ishml_phrase,phrase)
				return [phrase]
			}
			
			
		}
	}
	ishml.Phrase.attach(ishml_phrase,receiver)
	Object.defineProperty(ishml_phrase,"_reset",{value:function(){receiver._reset()},writable:true})
	return ishml_phrase		
},ishml.Phrase.prefixHandler)

ishml.Phrase.shuffle=new Proxy(function(...anIshmlPhrase)
{
	//ishml.Phrase(["cat","dog", "bird"]).shuffle.cycle
	//ishml.Phrase(["cat","dog", "bird"]).shuffle.fixed.cycle
	var receiver=ishml.Phrase._setReceiver(...anIshmlPhrase)
	var result =null
	var ishml_phrase=function(...data)
	{	
		if (data.length>0)
		{
			receiver(...data)
			result=null
			ishml_phrase.text=""
			return ishml_phrase
		}
		else
		{
			if (!result)
			{
				var {value:random,seed}=ishml.util.random(ishml_phrase._seed)
				ishml_phrase._seed=seed
				result=ishml.util.shuffle(receiver(),random)
				Object.assign(ishml_phrase,receiver)
			}

			ishml_phrase.text=result.result.reduce((text,data)=>text+data.value,"")
			return result.result
			
		}
	}
	ishml.Phrase.attach(ishml_phrase,receiver)
	Object.defineProperty(ishml_phrase,"_reset",{value:function(){receiver._reset();result=null},writable:true})
	return ishml_phrase	
			
},ishml.Phrase.prefixHandler)

ishml.Phrase.transform.tag=function(id)
{
	var receiver=this
	var phrases =[]
	var ishml_phrase=function(...data)
	{	
		if (data.length>0)
		{
			receiver(...data)
			phrases=[]
			ishml_phrase.text=""
			return ishml_phrase
		}
		else
		{
			phrases=receiver()
			var id=ishml_phrase._id
			ishml_phrase.text=phrases.reduce((text,data)=>text+data.value,"")
			ishml_phrase._tag=ishml.Phrase(phrases.map((phrase)=>
			{
				return Object.assign({},phrase)
			}))
			Object.assign(ishml_phrase._tag,receiver)
			ishml_phrase._tag._id=null
			return phrases
		}
	}
	ishml.Phrase.attach(ishml_phrase,receiver)
	ishml_phrase._id=id
	ishml_phrase.getTags=ishml_phrase.getTaggedPhrases
	Object.defineProperty(ishml_phrase,"_reset",{value:function(){receiver._reset()},writable:true})
	return ishml_phrase		
}

ishml.Phrase.transform.until=function(condition)
{
	//var a =ishml.Phrase`<li>${{item:ishml.Phrase(["cat","dog", "bird"]).series()}}</li>`.until((list)=>list.item.reset)
	var receiver=this
	var untilCondition=condition
	var ishml_phrase=function(...data)
	{
		if (data.length>0)
		{
			receiver(...data)
			ishml_phrase.text=""
			return ishml_phrase
		}
		else
		{
			var revisedPhrases=[]
			do 
			{
				var phrases=receiver()
				Object.assign(ishml_phrase,receiver)
				revisedPhrases=revisedPhrases.concat(phrases)
			}
			while (!untilCondition(receiver))
			ishml_phrase.text=revisedPhrases.reduce((text,data)=>text+data.value,"")
			
			return revisedPhrases
		}
	}	
	ishml.Phrase.attach(ishml_phrase,receiver)
	Object.defineProperty(ishml_phrase,"_reset",{value:function(){receiver._reset()},writable:true})
	return ishml_phrase
}	
ishml.Phrase.transform.while=function(condition)
{
	//var a =ishml.Phrase`<li>${{item:ishml.Phrase(["cat","dog", "bird"]).pick()}}</li>`.while((list)=>!list.item.reset)
	var receiver=this
	var whileCondition=condition
	var ishml_phrase=function(...data)
	{
		if (data.length>0)
		{
			receiver(...data)
			ishml_phrase.text=""
			return ishml_phrase
		}
		else
		{
			var revisedPhrases=[]
			do 
			{
				var phrases=receiver()
				Object.assign(ishml_phrase,receiver)
				revisedPhrases=revisedPhrases.concat(phrases)
			}
			while (whileCondition(receiver))
			ishml_phrase.text=revisedphrases.reduce((text,data)=>text+data.value,"")
			return revisedPhrases
		}
	}	
	ishml.Phrase.attach(ishml_phrase,receiver)
	Object.defineProperty(ishml_phrase,"_reset",{value:function(){receiver._reset()},writable:true})
	return ishml_phrase
}

ishml.Phrase.phraseModifier=function(modifier)
{

	var prefix= id=>
	{
		var prefixer=(...anIshmlPhrase)=>
		{
			var receiver=ishml.Phrase._setReceiver(...anIshmlPhrase)
			var ishml_phrase=function(...data)
			{	
				if (data.length>0)
				{
					receiver(...data)
					ishml_phrase.text=""
					return ishml_phrase
				}
				else
				{
					var phrases=modifier(receiver())()
					Object.assign(ishml_phrase,receiver)
					ishml_phrase.text=phrases.reduce((text,data)=>text+data.value,"")
					return phrases
				}
			}	
			ishml.Phrase.attach(ishml_phrase,receiver)
			return ishml_phrase
		}

		ishml.Phrase[id]=new Proxy(prefixer,ishml.Phrase.prefixHandler)
		
	}	
	
	var suffix=(id)=>
	{
		var suffixer=function()
		{
			var receiver=this
			var ishml_phrase=function(...data)
			{	
				if (data.length>0)
				{
					receiver(...data)
					ishml_phrase.text=""
					return ishml_phrase
				}
				else
				{
					var phrases=modifier(receiver())()
					Object.assign(ishml_phrase,receiver)
					ishml_phrase.text=phrases.reduce((text,data)=>text+data.value,"")
					return phrases
				}
			}	
			ishml.Phrase.attach(ishml_phrase,receiver)
			Object.defineProperty(ishml_phrase,"_reset",{value:function(){receiver._reset()},writable:true})
			return ishml_phrase
		}
		ishml.Phrase.suffix[id]=suffixer
	}	
	return {prefix:prefix,suffix:suffix}
}	
ishml.Phrase.modifier=function(modifier)
{ 
	if (modifier._isIshmlPhrase){return ishml.Phrase.phraseModifier(modifier)}
	var prefix= id=>
	{
		var prefixer=(...anIshmlPhrase)=>
		{
			var receiver=ishml.Phrase._setReceiver(...anIshmlPhrase)
			var ishml_phrase=function(...data)
			{	
				if (data.length>0)
				{
					receiver(...data)
					ishml_phrase.text=""
					return ishml_phrase
				}
				else
				{
					var phrases=receiver().map(phrase=>
					{
						phrase.value=modifier(phrase)
						return phrase
					})
					Object.assign(ishml_phrase,receiver)
					ishml_phrase.text=phrases.reduce((text,data)=>text+data.value,"")
					return phrases

				}
			}	
			ishml.Phrase.attach(ishml_phrase,receiver)
			Object.defineProperty(ishml_phrase,"_reset",{value:function(){receiver._reset()},writable:true})
			return ishml_phrase
		}
		ishml.Phrase[id]=new Proxy(prefixer,ishml.Phrase.prefixHandler)
		
		
		return this
	}	
	var suffix=(id)=>
	{
		var suffixer=function()
		{
			var receiver=this
			var ishml_phrase=function(...data)
			{	
				if (data.length>0)
				{
					receiver(...data)
					ishml_phrase.text=""
					return ishml_phrase
				}
				else
				{
					var phrases=receiver().map(phrase=>
					{
						phrase.value=modifier(phrase)
						return phrase
					})
					Object.assign(ishml_phrase,receiver)
					ishml_phrase.text=phrases.reduce((text,data)=>text+data.value,"")
					return phrases
				}
			}	
			ishml.Phrase.attach(ishml_phrase,receiver)
			return ishml_phrase
		}

		ishml.Phrase.suffix[id]=suffixer

		return this
	}
	return {prefix:prefix,suffix:suffix}
}
