ishml.Phrase =class Phrase
{
	constructor(...precursor) 
	{
		Object.defineProperty(this,"results",{value:[],writable:true})
		Object.defineProperty(this,"_seed",{value:ishml.util.random().seed,writable:true})
		Object.defineProperty(this,"tags",{value:null,writable:true})
		//Object.defineProperty(this,"_context",{value:this,writable:true})
		//Object.defineProperty(this,"_tagType",{value:false,writable:true})
		
		Object.defineProperty(this,"text",{value:"",writable:true})
		if (precursor.length===1)
		{
			if (precursor[0] instanceof ishml.Phrase)
			{
				Object.defineProperty(this,"_precursor",{value:precursor[0],writable:true})
				Object.defineProperty(this,"_phrases",{value:[],writable:true})
				//this._contextualize()
				return this
			}
			if (typeof precursor[0] === "function")
			{	
				//custom function must return a phrase
				Object.defineProperty(this,"_precursor",{value:precursor[0](),writable:true})
				Object.defineProperty(this,"_phrases",{value:[],writable:true})
				//this._contextualize()
				return this
			}
			//else treat as text.
			Object.defineProperty(this,"_precursor",{value:null,writable:true})
			Object.defineProperty(this,"_phrases",{value:[],writable:true})
			this.populate(...precursor)
			return this
		}
		else
		{
			Object.defineProperty(this,"_precursor",{value:null,writable:true})
			Object.defineProperty(this,"_phrases",{value:[],writable:true})
			if (precursor.length !== 0){this.populate(...precursor)}
			return this
		}	
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
				this.results=this._precursor.generate().filter(phrase=>rule(this.tags,phrase))
				this.text=this.results.map(phrase=>phrase.value).join("")
				return this.results
			}
		}(this)
	}
	//_list(_("aaa","bbb","ccc").tag("test")) 
	//ishml.Template`${ishml.Template.cycle(...data).tag("item",ishml.enum.tag.prefix)}`


	catalog(catalog={})
	{
		while (this._precursor  && !this._precursor.tags){this._precursor.catalog(catalog)}
		this._phrases.forEach(phrase=>
		{
			if (phrase.value instanceof ishml.Phrase && !phrase.value.tags)
			{
				phrase.value.catalog(catalog)
			}
		})
		
		Object.assign(catalog,this)
		this.tags=catalog
		this._phrases.forEach(phrase=>
		{
			if (phrase.value instanceof ishml.Phrase)
			{
				if(phrase.value.tags)
				{
					Object.assign(phrase.value.tags,catalog)
				}
			}
		})
		return this
	}
	else(literals,...expressions)
	{
		var alternativePhrase=new ishml.Phrase(literals,...expressions)
		return new class elsePhrase extends ishml.Phrase
		{
			generate()
			{
				this.results=this._precursor.generate()
				
				if (this.results.length===0)
				{
					this.results=alternativePhrase.generate()
					this.text=alternativePhrase.text
				}
				else 
				{
					this.text=this._precursor.text
				}
				return this.results
			}
		}(this)
	}
	_evaluate(subPhrase)
	{
		if (subPhrase instanceof ishml.Phrase)
		{ 
			return {value:subPhrase.generate().map(subPhrase=>subPhrase.value).join("")}
		}
		else
		{
			return {value:subPhrase.toString()}
		}	
	}
	first(count=1)
	{
		return new class firstPhrase extends ishml.Phrase
		{
			generate()
			{
				this.results=this._precursor.generate().slice(0,count)
				this.text=this.results.map(phrase=>phrase.value).join("")
				return this.results
			}
		}(this)
	}
	generate()
	{
		var phrases=this._precursor?.generate() ?? this._phrases
		//defer evaluation of functions to second pass
		this.results=[]
		phrases.forEach((phrase,index)=>
		{
			if (! (phrase.value instanceof Function))
			{
				this.results[index]=Object.assign(Object.assign({},phrase),this._evaluate(phrase.value))
			}
		})
		phrases.forEach((phrase,index)=>
		{
			if (this.results[index]===undefined  )  
			{
				var deferredPhrase=phrase.value(this)//var deferredPhrase=phrase.value(this._context)
				this.results[index]=Object.assign(Object.assign({},phrase),this._evaluate(deferredPhrase))
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
				this.results=this._precursor.generate()
				if(rule(this.tags))
				{
					this.text=this._precursor.text
					return this.results
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
	join({separator="", trim=true}={})
	{
		return new class joinPhrase extends ishml.Phrase
		{
			generate()
			{
				this.results=this._precursor.generate()
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
				this.results=this._precursor.generate.slice(-count)
				//Object.assign(this,this._precursor)
				this.text=this.results.map(phrase=>phrase.value).join("")
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
				this.results=this._precursor.generate().map(phrase=>
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
				this.results=[]
				do 
				{
					this.results=this.results.concat(this._precursor.generate())
				}while(!this.tags[tag].data.reset)//while(!this._context[tag].data.reset)
				this.text=this.results.map(data=>data.value).join("")
				return this.results	
			}
		}(this)
	}
	get phrases()
	{
		return this._phrases
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
							if (literals instanceof Object){data = literals}
							else {data=[literals]}
						}
						else {data=[]}
					}
				}
			}
		}				
		if (data instanceof Array) //normalize array and replace _phrases
		{
			if (data.length===0){this._phrases=[]}
			else
			{
				this._phrases=data.map(phrase=> //normalize phrases
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
			if (data instanceof ishml.Phrase)
			{
				this._precursor=data
			}
			else
			{
				Object.keys(data).forEach(key=>
				{
					if (this.tags?.hasOwnProperty(key))
					{
						var target=this.tags[key]
						while (target._precursor){target=target._precursor}
						target.populate(data[key])
					}
				})
			}	
		}
		//this._contextualize()
		return this
	}
	prepend(documentSelector="#story")
	{
		var targetNodes = document.querySelectorAll(documentSelector)
		targetNodes.forEach(node=>node.prepend(this.htmlTemplate().content))
	}
	_reset()
	{ 
		this._precursor?._reset()
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
				this.results=[]
				do
				{
					this.results=this.results.concat(this._precursor.generate())
				}while(rule(this.tags))//while(rule(this._context))
				this.text=this.results.map(data=>data.value).join("")
				return this.results	
			}
		}(this)
	}
	say(seed) //generates text output
	{
		
		if (seed>=0)
		{
			this.seed(seed)
		}
		this.generate()
		return this
	}
	seed(seed) //generates text output
	{
		if (seed>=0 && seed <1){this._seed=Math.floor(seed* 2147483648)}
		else
		{
			if(!seed){this._seed=ishml.util.random().seed}
			else{this._seed=seed}
		}
		if (this._precursor){this._precursor.seed(this._seed)}
		this._phrases.forEach(phrase=>
		{
			if(phrase.value instanceof ishml.Phrase)
			{
				phrase.value.seed(ishml.util.random(this._seed).seed)
			}	
		})
		return this
	}
	get data()
	{
		if (this.results.length>0){return this.results[0]}
		else{return {}}
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
				this.results=transformer(this._precursor.generate().slice(0).map(phrase=>Object.assign({},phrase)))
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
				this.results=[]
				while(rule(this.tags))
				{
					this.results=this.results.concat(this._precursor.generate())
				}
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