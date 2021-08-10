
//ishml.template=(...precursor)=>new ishml.Phrase(...precursor)
ishml.template={}
//new Proxy((...precursor)=>new ishml.Phrase(...precursor),ishml.templateHandler)
ishml.template.__handler=
{
	 //_.a.b.c() becomes _.a(b(c()))
	 //_.a.tags.b becomes 
	 //_.a.cap.pick("cat","dog","frog")
	 //t=>_.a.cap(t.noun.description.z)

	//if template[asfunction] is undefined, property is tag phrase.
	

	get:function(template, property,receiver)
	{
		//template is function that returns a prhase
		if (property==="asFunction")
		{
			//property === "asFunction"
			return template	 
		}
/*		if (template.name==="echo" )//_.tags or _.echo
		{
			return new Proxy(template(property),
			{
				get:function(target,datum,receiver)
				{
					if (Reflect.has(target,datum,receiver))  //taggedPhrase.datum
					{
						return Reflect.get(target,datum,receiver)
					}
					else
					{
						return ishml.template.data(target,datum)
					}
				}
			})
		}
*/		
		if (ishml.template[property]===undefined) //property names tagged phrase _.animal _.a.animal
		{
			var echo=ishml.template.echo.asFunction(property)
			
			return new Proxy(template(echo), //property === tagged phrase e.g. animal
			{
				get:function(target,datum,receiver)  // datum === data.datum
				{
					if (Reflect.has(target,datum,receiver))
					{
						return Reflect.get(target,datum,receiver) //taggedPhrase.datum
					}
					else
					{
						if (template.name==="_"){return ishml.template.data(echo,datum)}//strip off outer phrase 
						if (template.name==="next"){return ishml.template.data(template(echo),datum)}
						else {return template(ishml.template.data(echo,datum))}
					}
				}
			})
		}
		var propertyAsFunction= ishml.template[property].asFunction // get template corresponding to property string
/*		if (property==="echo")  //_.blah.tags or //_.blah.echo
		{
			return new Proxy(propertyAsFunction,
				{
					get:function(tagged,property)
					{
						return  new Proxy(template(tagged(property)),
						{
							get:function(target,datum,receiver)
							{
								if (Reflect.has(target,datum,receiver))
								{
									return Reflect.get(target,datum,receiver)
								}
								else
								{
									var taggedPhrase=tagged(property)
									return template(ishml.template.data(taggedPhrase,datum))
								}
							}

						})
					}
				})
		}*/
		if (template.name==="_") //property is a function and so don't need initial outer phrase
		{
			return new Proxy((...precursor)=>propertyAsFunction(...precursor),ishml.template.__handler)
		}
		else //Nest property function inside template function.  Wrap in proxy so that next property can be read
		{
		return new Proxy((...precursor)=>template(propertyAsFunction(...precursor)),ishml.template.__handler)
		}	
			
	}
}
ishml.template.defineClass=function(id)
{
	var as= (phraseClass)=>
	{
		ishml.template[id]=new Proxy((...precursor)=>new phraseClass(...precursor),ishml.template.__handler)
	}
	return {as:as}	
}
ishml.template.define=function(id)
{
	var as= (phraseFactory)=>
	{
		ishml.template[id]=new Proxy(phraseFactory,ishml.template.__handler)
	}
	return {as:as}	
}
//ishml.template.define("_").as((...data)=>new ishml.Phrase(...data))
ishml.template._=new Proxy(function _(...data){return new ishml.Phrase(...data)},ishml.template.__handler)
ishml.template.define("cycle").as((...data)=>
{
	var counter=0
	return new class cyclePhrase extends ishml.Phrase
	{
		populate(literals, ...expressions)
		{
			super.populate(literals, ...expressions)
			counter=0
			return this
		}
		generate()
		{
			if (this.phrases.length===0)
			{
				this.results=[]
				this.results[0]={value:"",index:0, total:0, reset:true}
				this.text=""
				var total=0
			}
			else
			{	
				if (this.phrases.length===1 && this.phrases[0].value instanceof ishml.Phrase)
				{
					var results=super.generate()
					var total=this.results.length
					results=results.slice(counter,counter+1)
				}
				else
				{
					var results=super.generate(this.phrases.slice(counter,counter+1))
					var total=this.phrases.length
				}
				Object.assign(results[0],{index:counter, total:total, reset:counter===total-1})
				this.results=results
				this.text=results[0].value
			}	
			counter++
			if (counter===total || total===0)
			{
				counter=0
				this.reset()
			}
			return this.results
		}
	}(...data)
})
ishml.template.define("echo").as(function echo(tag)
{
	return new class echoPhrase extends ishml.Phrase
	{
		constructor()
		{
			super()
			this.echo=true
		}
		generate()
		{
			if (this.echo){this.results=this.tags[tag].results}
			else{this.results=this.tags[tag].generate()}
			this.text=this.tags[tag].text
			this.tally=this.tags[tag].tally
			return this.results
		}
		get inner()
		{
			return this.tags[tag].inner
		}
	}()		
})
ishml.template.define("ante").as(function ante(outer)
{
	return new class antePhrase extends ishml.Phrase
	{
		constructor()
		{
			super(outer)
			if (outer.echo===true)
			{
				this.echo=true
			}
		}
		generate()
		{
			var counter=0
			var target=this
			while (target.constructor.name === "antePhrase")
			{
				counter++
				target=target.inner
			}
			for (let i = 0; i <counter; i++)
			{
				target=target.inner
			}	
						this.results=target.generate()
			this.text=target.text
			this.tally=target.tally
			return this.results
		}
	}()		
})


ishml.template.defineClass("favor").as( class favorPhrase extends ishml.Phrase
{
	generate()
	{
		if(this.phrases.length===0)
		{
			this.text=""
			this.results=[]
			this.tally++
			return this.results
		}
		else
		{
			var {value:random,seed}=ishml.util.random(this._seed)
			this._seed=seed
			
			if (this.phrases.length===1 && this.phrases[0].value instanceof ishml.Phrase)
			{
				var results=super.generate()
				var total=results.length
				var c=total*(total+1)*random
				var counter=total-Math.floor((Math.sqrt(1+4*c)-1)/2)-1
				results=results.slice(counter,counter+1)
			}
			else
			{
				var total=this.phrases.length
				var c=total*(total+1)*random
				var counter=total-Math.floor((Math.sqrt(1+4*c)-1)/2)-1
				var results=super.generate(this.phrases.slice(counter,counter+1))
			}

			results.forEach(phrase=>
			{
				phrase.index=counter
				phrase.total=total
			})
			this.results=results
			return this.results
		}
	}
	
})
ishml.template.define("pick").as((...data)=>
{
	var previous
	return new class pickPhrase extends ishml.Phrase
	{
		generate()
		{
			if(this.phrases.length===0)
			{
				this.text=""
				this.results=[]
				this.tally++
				return this.results
			}
			else
			{
				var {value:random,seed}=ishml.util.random(this._seed)
				this._seed=seed
				if (this.phrases.length===1 && this.phrases[0].value instanceof ishml.Phrase)
				{
					var results=super.generate()
					var total=results.length
					var counter=Math.floor(random*total)
					if (counter===previous){counter =(counter+1)%total}
					previous=counter
					results=results.slice(counter,counter+1)
				}
				else
				{
					var total=this.phrases.length
					var counter=Math.floor(random*total)
					if (counter===previous){counter =(counter+1)%total}
					previous=counter
					var results=super.generate(this.phrases.slice(counter,counter+1))
				}

				results.forEach(phrase=>
				{
					phrase.index=counter
					phrase.total=total
				})
				this.results=results
				return this.results
			}
		}
	}(...data)
})
ishml.template.define("re").as((...precursor)=>
{
	return new class rePhrase extends ishml.Phrase
	{
		generate()
		{
			super.generate()
			this.results.forEach(result=>
			{
				result.re=true
			})
			this.text=""
			return this.results
		}
	}(...precursor)
})
ishml.template.define("refresh").as((...precursor)=>
{
	return new class refreshPhrase extends ishml.Phrase
	{
		generate()
		{
			this.reset()
			super.generate()
			return this.results
		}
	}(...precursor)
})
ishml.template.defineClass("roll").as( class rollPhrase extends ishml.Phrase
{
	generate()
	{
		if(this.phrases.length===0)
		{
			this.text=""
			this.results=[]
			this.tally++
			return this.results
		}
		else
		{
			var {value:random,seed}=ishml.util.random(this._seed)
			this._seed=seed
			if (this.phrases.length===1 && this.phrases[0].value instanceof ishml.Phrase)
			{
				var results=super.generate()
				var total=results.length
				var counter=Math.floor(random*total)
				results=results.slice(counter,counter+1)
			}
			else
			{
				var total=this.phrases.length
				var counter=Math.floor(random*total)
				var results=super.generate(this.phrases.slice(counter,counter+1))
			}

			results.forEach(phrase=>
			{
				phrase.index=counter
				phrase.total=total
			})
			this.results=results
			return this.results
		}
	}
})
ishml.template.define("series").as((...data)=>
{
	var counter=0
	var ended =false
	return new class seriesPhrase extends ishml.Phrase
	{
		populate(literals, ...expressions)
		{
			super.populate(literals, ...expressions)
			ended=false
			counter=0
			return this
		}
		generate()
		{
			if (ended || this.phrases.length===0)
			{
				this.text=""
				this.results=[]
				this.tally++
				return this.results
			}
			else
			{
				if (this.phrases.length===1 && this.phrases[0].value instanceof ishml.Phrase)
				{
					var results=super.generate()
					var total=results.length
					results=results.slice(counter,counter+1)
				}
				else
				{
					var results=super.generate(this.phrases.slice(counter,counter+1))
					var total=this.phrases.length
				}
				if(results.length===1)
				{
					Object.assign(results[0],{index:counter, total:total})
					this.results=results
					this.text=results[0].value
				}
			}
			counter++
			if (counter===total)
			{
				ended=true
				counter=0
			}
			return this.results
		}
		reset()
		{
			super.reset()
			ended=false
			counter=0
			return this
		}
	}(...data)
})
ishml.template.define("shuffle").as((...data)=>
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
		
		populate(literals, ...expressions)
		{
			super.populate(literals, ...expressions)
			reshuffle=true
		}
		reset()
		{
			super.reset()
			reshuffle=true
			return this
		}
		
	}(...data)
})
ishml.template.define("pin").as((...data)=>
{
	var pin =true
	return new class pinPhrase extends ishml.Phrase
	{
		populate(literals, ...expressions)
		{
			super.populate(literals, ...expressions)
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
		reset()
		{
			if(pin)
			{
				super.reset()
			}
		}
	}(...data)
})

ishml.template.define("next").as(function next(precursor)
{
	precursor.echo=false
	return precursor
})
ishml.template.data=function data(target,property)
{
	return new class dataPhrase extends ishml.Phrase
	{
		constructor()
		{
			super(target)  //echo.phrase
			this.echo=target.echo
			return this
		}
		generate()
		{
			if (this.echo) {this.results=target.results}
			else {this.results=target.generate()}
			if (this.results.length>0)
			{
				this.results[0].value=this.results[0][property]
				this.text=this.results[0].value
			}
			return this.results
		}
		get inner()
		{
			var phrase=data(this.phrases[0].value.inner,property)
			phrase.echo=this.echo
			return phrase
		}
	}
}