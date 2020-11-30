ishml.Phrase =class Phrase
{
	constructor(...precursor) 
	{
		Object.defineProperty(this,"id",{value:"",writable:true})
		Object.defineProperty(this,"phrases",{value:[],writable:true})
		Object.defineProperty(this,"results",{value:[],writable:true})
		Object.defineProperty(this,"_seed",{value:ishml.util.random().seed,writable:true})
		Object.defineProperty(this,"tags",{value:{},writable:true})
		Object.defineProperty(this,"tally",{value:0,writable:true})
		Object.defineProperty(this,"text",{value:"",writable:true})
		this._populate(...precursor)
		this.catalog()
		return this
	}
	get also()
	{
		var primaryPhrase=this
		return new Proxy((...precursor) => new class thenPhrase extends ishml.Phrase
		{
			constructor()
			{
				super()
				this.phrases[0]={value:primaryPhrase}
				this.phrases[1]={value:new ishml.Phrase(...precursor)}
				this.catalog()
			}
			generate()
			{
				var results=this.phrases[0].value.generate()
				if (results.length>0)
				{
					this.results=results.concat(this.phrases[1].value.generate())
					this.text=this.phrases[0].value.text+ this.phrases[1].value.text
				}
				else
				{
					this.results=results
					this.text=""
				}
				this.tally++
				return this.results
			}
		},ishml.Template.templateHandler)
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
	//_.cap.a.pick().tag("test")
	catalog()
	{
		this._catalogUp()
		this._catalogDown()
		return this
	}
	_catalogUp()
	{
		if (this.id)
		{
			this.tags[this.id]=this
		}
		this.phrases.forEach(phrase=>
		{
			if (phrase.value instanceof ishml.Phrase)
			{
				var tags= phrase.value._catalogUp()
				Object.keys(tags).forEach(key=>
				{
					if(!this.tags.hasOwnProperty(key))
					{
						this.tags[key]=tags[key]
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
			if (phrase.value instanceof ishml.Phrase)
			{
				Object.keys(this.tags).forEach(key=>
				{
					if (!phrase.value.tags.hasOwnProperty(key))
					{
						phrase.value.tags[key]=this.tags[key]
					}
					phrase.value._catalogDown()
				})
			}	
		})
	}
	get data()
	{
		if (this.results.length>0){return this.results[0]}
		else{return {}}
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
					result.subtotal=subtotal
					result.total=total
				})
				this.text=this.results.map(phrase=>phrase.value).join("")
				return this.results
			}
		}(this)
	}
	generate(phrases=this.phrases)
	{
		this.results=[]
		phrases.forEach((phrase)=>
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
						this.results=this.results.concat(deferredPhrase.generate().map(subPhrase=>Object.assign(Object.assign({},phrase),subPhrase)))
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
		this.tally++
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
				var total=this.results.length
				this.results=this.results.slice(-count)
				var subtotal=this.results.length
				this.results.forEach((result,index)=>
				{
					result.index=index
					result.subtotal=subtotal
					result.total=total
				})
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
				}while(!this.phrases[0].value.tags[tag].data.reset)
				this.results=results
				this.text=this.results.map(data=>data.value).join("")
				this.tally=this.tally-2
				return this.results	
			}
		}(this)
	}
	populate(literals, ...expressions)
	{
		if(this.phrases.length===1 && this.phrases[0].value instanceof ishml.Phrase)
		{
			this.phrases[0].value.populate(literals,...expressions)
		}
		else
		{
			this._populate(literals, ...expressions)
		}
		this.catalog()
		return this
	}
	_populate(literals, ...expressions)
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
					else //_populate("blah") or _populate(), _populate({properties}) _populate(x=>blah)
					{
						if(literals)
						{	
							
							if (literals instanceof Object && !(literals instanceof ishml.Phrase) && !(literals instanceof Function) ){data = literals}
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
					/*var target=this.tags[key]
					while(target.phrases.length===1 && target.phrases[0].value instanceof ishml.Phrase)
					{
						target=target.phrases[0].value
					}*/
					this.tags[key].populate(data[key])
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
		this.tally=0
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
			if(phrase.value instanceof ishml.Phrase)
			{
				phrase.value.seed(ishml.util.random(this._seed).seed)
			}	
		})
		return this
	}
	tag(id)
	{
		//this[id]=this
		this.id=id
		//this.catalog()
		return this
	}
	get tags()
	{
		return Object.assign(Object.assign({},this._tags),this._localTags)
	}
	get then()
	{
		var primaryPhrase=this
		return new Proxy((...precursor) => new class thenPhrase extends ishml.Phrase
		{
			constructor()
			{
				super()
				this.phrases[0]={value:primaryPhrase}
				this.phrases[1]={value:new ishml.Phrase(...precursor)}
				this.catalog()
			}
			generate()
			{
				var results=this.phrases[0].value.generate()
				if (results.length>0)
				{
					this.results=results
					this.text=this.phrases[0].value.text
				}
				else
				{
					this.results=this.phrases[1].value.generate()
					this.text=this.phrases[1].value.text
				}
				this.tally++
				return this.results
			}
		},ishml.Template.templateHandler)
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