ishml.Template=function (...precursor){return new ishml.Phrase(...precursor)}
ishml.Template.templateHandler=
{
	 //_.a.b.c() becomes _.a(b(c()))
	 //_.a.tags.b becomes 
	 //_.a.cap.pick("cat","dog","frog")
	 //t=>_.a.cap(t.noun.description.z)

	get:function(template, property,receiver)
	{
		//template is function that returns a prhase
		if (property==="asFunction")
		{
			//property === "asFunction"
			return template	 
		}
		if (template.name==="tags" ||template.name==="echo" )//_.tags or _.echo
		{
			return template(property)
		}
		var propertyAsFunction= ishml.Template[property].asFunction // get template corresponding to property string
		if (property==="tags" || property==="echo")  //_.blah.tags or //_.blah.echo
		{
			return new Proxy(propertyAsFunction,{get:function(target,property){return template(target(property))}})
		}
		
				//Nest property function inside template function.  Wrap in proxy so that next property can be read
		return new Proxy((...precursor)=>template(propertyAsFunction(...precursor)),ishml.Template.templateHandler)
			
	}
}

ishml.Template.defineClass=function(id)
{
	var as= (phraseClass)=>
	{
		ishml.Template[id]=new Proxy((...precursor)=>new phraseClass(...precursor),ishml.Template.templateHandler)
	}
	return {as:as}	
}
ishml.Template.define=function(id)
{
	var as= (phraseFactory)=>
	{
		ishml.Template[id]=new Proxy(phraseFactory,ishml.Template.templateHandler)
	}
	return {as:as}	
}
ishml.Template.define("cycle").as((...data)=>
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
ishml.Template.define("echo").as(function echo(tag)
{
	return new class echoPhrase extends ishml.Phrase
	{
		generate()
		{
			this.results=this.tags[tag].results
			this.text=this.tags[tag].text
			this.tally=this.tags[tag].tally
			return this.results
		}
	}		
})

ishml.Template.defineClass("favor").as( class favorPhrase extends ishml.Phrase
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
ishml.Template.define("pick").as((...data)=>
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
ishml.Template.define("re").as((...precursor)=>
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
ishml.Template.define("refresh").as((...precursor)=>
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
ishml.Template.defineClass("roll").as( class rollPhrase extends ishml.Phrase
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
ishml.Template.define("series").as((...data)=>
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
ishml.Template.define("shuffle").as((...data)=>
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
ishml.Template.define("pin").as((...data)=>
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

ishml.Template.define("tags").as(function tags(tag,precursor)
{
	return new class tagsPhrase extends ishml.Phrase
	{
		generate()
		{
			this.results=this.tags[tag].generate()
			this.text=this.tags[tag].text
			this.tally=this.tags[tag].tally
			return this.results
		}
	}	
})
