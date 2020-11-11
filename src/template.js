ishml.Template=function(...precursor){return new ishml.Phrase(...precursor)}
ishml.Template.templateHandler=
{
	get:function(template, property) //a.b.c() becomes a(b(c()))
	{
		if (property==="asFunction"){return template}  //bare property without proxy
		
		if (template.name==="tags")//_.tag
		{
			return template(property)
		}
		var propertyAsFunction= ishml.Template[property].asFunction
		if (property==="tags") 
		{
			return new Proxy(propertyAsFunction,{get:function(target,property){return template(target(property))}})
		}
		else
		{
			return new Proxy((...precursor)=>template(propertyAsFunction(...precursor)),ishml.Template.templateHandler)
		}
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
		populate(...data)
		{
			super.populate(...data)
			counter=0
			return this
		}
		generate()
		{
			var phrases=super.generate()
			if(phrases.length===0)
			{
				return this.results
			}
			else
			{
				var phrase=Object.assign({},phrases[counter] )
				Object.assign(phrase,{index:counter, total:phrases.length, reset:false})
			}
			counter++
			if (counter>phrases.length-1)
			{
				counter=0
				this._reset()
				phrase.reset=true
			}
			this.text=phrase.value
			this.results=[phrase]
			return this.results
		}
	}(...data)
})
ishml.Template.defineClass("favor").as( class favorPhrase extends ishml.Phrase
{
	generate()
	{
		var phrases=super.generate()
		if(phrases.length===0)
		{
			return this.results
		}
		else
		{
			var {value:random,seed}=ishml.util.random(this._seed)
			this._seed=seed
			var c=phrases.length*(phrases.length+1)*random
			var counter=phrases.length-Math.floor((Math.sqrt(1+4*c)-1)/2)-1
			var phrase=Object.assign({},phrases[counter] )
			phrase.index=counter
			phrase.total=phrases.length
			this.text=phrase.value
			this.results=[phrase]
			return this.results
		}
	}
	
})
ishml.Template.defineClass("pick").as( class pickPhrase extends ishml.Phrase
{
	generate()
	{
		var phrases=super.generate()
		if(phrases.length===0)
		{
			this.text=""
			this.results=phrases
			return this.results
		}
		else
		{
			var {value:random,seed}=ishml.util.random(this._seed)
			this._seed=seed
			var counter=Math.floor(random*phrases.length)
			var phrase=Object.assign({},phrases[counter] )
			phrase.index=counter
			phrase.total=phrases.length
			this.text=phrase.value
			this.results=[phrase]
			return this.results
		}
	}
})
ishml.Template.define("refresh").as((...precursor)=>
{
	return new class refreshPhrase extends ishml.Phrase
	{
		generate()
		{
			this._reset()
			super.generate()
			return this.results
		}
	}(...precursor)
})
ishml.Template.define("series").as((...data)=>
{
	var counter=0
	var ended =false
	return new class seriesPhrase extends ishml.Phrase
	{
		populate(...data)
		{
			super.populate(...data)
			ended=false
			counter=0
			return this
		}
		generate()
		{
			var phrases=super.generate()
			if (ended)
			{
				this.text=""
				this.results=[]
				return this.results			}
			else
			{
				if(phrases.length===0)
				{
					this.text=""
					this.results=[]
					return this.results
				}
				else
				{
					var phrase=Object.assign({},phrases[counter] )
					Object.assign(phrase,{index:counter, total:phrases.length, reset:false})
				}
				counter++
				if (counter>phrases.length-1)
				{
					ended=true
					counter=0
					this._reset()
					phrase.reset=true
				}
			}	
			this.text=phrase.value
			this.results=[phrase]
			return this.results
		}
		_reset(){return this.precursor?._reset()}
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
		_reset()
		{
			super._reset()
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
		populate(...data)
		{
			super.populate(...data)
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
		_reset()
		{
			if(pin)
			{
				super._reset()
			}
		}
	}(...data)
})
ishml.Template.define("tags").as(function tags(tag)
{
	return new class tagsPhrase extends ishml.Phrase
	{
		generate()
		{
			this.results=this.tags[tag].generate()
			this.text=this.tags[tag].text
			return this.results
		}
	}	
})