 /*
var a=ishml.Passage`this is a ${{test:ishml.Passage``.chance().sticky()}}...`
a.test.rephrase(["cat","dog", "fish"])

passages[0]="this is a "
passages[1]=this.test
passages[2]=" ..."
this.test=ishml.Passage

Expressions may also reference other Templates:

var test4=ishml.Template`${test1}${test2}($test3}`

passages[0]=test1
passages[1]=test2
passages[2]=test3

var test4=ishml.Template`${test1}${test2}($test3}`



list=ishml.Passage`${"item"}${`, `}.unless((passages,index)=>passages.length<3)`.join()

if items.length=1: item
if items.length=2: item and item
if items.length>2: item, item,.. and item


.join, .shuffle, .cycle, .list .end .repeat
list=ishml.Passage`${"item"}`.list(oxford=false)

spaces=ishml.Passage`${"item"} `.cycle().join()


ishml.Passage`You may pick from ${thing:ishml.Passage``.join()}.  You chose ${this.thing}.`

*/


ishml.Passage = function Passage(literals, ...expressions) 
{
	if (this instanceof ishml.Passage) 
	{
		
		Object.defineProperty(this, "passages", { value: [], writable: true })
		Object.defineProperty(this, "options", { value: {}, writable: true })
		Object.defineProperty(this, "options", { value: {}, writable: true })
		Object.defineProperty(this, "seed", { value: Math.floor(Math.random() * 2147483648), writable: true })
		this.join()
		this.rephrase(literals,expressions)
		

	}
	else 
	{
		return new Passage(literals, ...expressions)
	}	
	
}
ishml.Passage.prototype.next=function(options)
{
	return this.generator.next(options)
}
ishml.Passage.prototype.join=function(modifier=(result,passage,index,passages)=>"")
{
	var self=this
	
	const joiner=function* ()
	{
		var result=self.passages.reduce((result, passage, index)=>
		{
			if (passage instanceof ishml.Passage)
			{

				return result + passage.next().value.toLocaleString()+modifier(result,passage, index,this.passages)
				
			}
			else
			{
				 return result + passage.toLocaleString()+modifier(result,passage, index,this.passages)
				
			}

		},"")

		this.generator= this[Symbol.iterator]()  //automatically reset for next time

		yield result
		
	}
	this[Symbol.iterator]=joiner
	this.generator= this[Symbol.iterator]()
	return this
}

ishml.Passage.prototype.cycle=function({modifier=()=>""}={})
{
	var self=this
	const cycler=function* ()
	{
		var result=""
		var i=0
		while(true)
		{
			while (i<self.passages.length)
			{

				if (self.passages[i] instanceof ishml.Passage)
				{

					result = self.passages[i].next().value.toLocaleString()
					
				}
				else
				{
					result = self.passages[i].toLocaleString()
				}
				yield result
				i++
			}
			if (self.options.sticky)
			{
				if(self.options.sticky===true)
				{
					self.options.sticky=self.passages[i-1]
				}
				while(true)
				{
					yield self.options.sticky
				}
			}
			i=0
		}
	}
	this[Symbol.iterator]=cycler
	this.generator= this[Symbol.iterator]()
	return this
}

ishml.Passage.prototype.chance=function({modifier=()=>"",seed}={})
{
	if(seed){this.seed=seed}
	var self=this
	const chancer=function* ()
	{
		
		var result=""
		while(true)
		{
			var i=Math.floor(self.passages.length*this.random())
			if (self.passages[i] instanceof ishml.Passage)
			{

				result = self.passages[i].next().value.toLocaleString()
				
			}
			else
			{
				result = self.passages[i].toLocaleString()
			}
			if (self.options.sticky)
			{
				if(self.options.sticky===true)
				{
					self.options.sticky=self.passages[i]
				}
				while(true)
				{
					yield self.options.sticky
				}
			}
			yield result
		}	
	}
	this[Symbol.iterator]=chancer
	this.generator= this[Symbol.iterator]()
	return this
}


ishml.Passage.prototype.random = function(seed) 
{
	if (seed)
	{
		this.seed=seed
	}
	var random=(this.seed-1)/2147483646
	this.seed =this.seed * 16807 % 2147483647
	return random
}


ishml.Passage.prototype.shuffleArray=function(anArray,aCount=undefined)
{
	var array=anArray.slice(0)
	var m = array.length
	var count=aCount||array.length
	for (let i=0; i < count; i++)
	{
		let randomIndex = Math.floor(this.random() * m--)
		let item = array[m]
		array[m] = array[randomIndex]
		array[randomIndex] = item
	}
	return array.slice(-count)
}



ishml.Passage.prototype.sticky=function(sticky=true)
{
	this.options.sticky=sticky
	return this
}


ishml.Passage.prototype.shuffle=function(seed)
{
	this.options.shuffle=shuffle
	return this
}
ishml.Passage.prototype.reverse=function(reverse)
{
	this.options.reverse=reverse
	return this
}
ishml.Passage.prototype.minimum=function(minimum)
{
	this.options.minimum=minimum
	return this
}
ishml.Passage.prototype.maximum=function(maximum)
{
	this.options.maximum=maximum
	return this
}
ishml.Passage.prototype.sort=function(sortation)
{
	return this
}
ishml.Passage.prototype.filter=function(filtration)
{
	return this
}



ishml.Passage.prototype.reset=function()
{
	this.generator= this[Symbol.iterator]()
}
ishml.Passage.prototype.rephrase = function(literals, expressions=[])
{
	this.passages=[]
	if (literals[0].length !== 0)
	{
		this.passages.push(literals[0])
	}
	var index=1
	expressions.forEach(passage=>
	{
		
		
		if(typeof passage ==="string" )
		{
			//placeholder template
			if (!this.hasOwnProperty(passage))
			{
				this[passage]=ishml.Passage([passage])
			}
			this.passages.push(this[passage])
		}
		else
		{
			if(passage instanceof ishml.Passage )
			{
				//anonymout template
				passages.push(passage)
			}
			else
			{
				
				//named template
				var key=Object.keys(passage)[0]
				
				if (passage[key] instanceof ishml.Passage)
				{
					if (!this.hasOwnProperty(key))
					{
						this[key]=passage[key]
					}

					
					this.passages.push(this[key])
				}
				
			}
		}
		
		if (literals[index].length>0)
		{
			this.passages.push(literals[index])
		}
		index++
	}) 
	if(index<literals.length)
	{
		this.passages=this.passages.concat(literals.slice(index))
	}
	this.reset()
	return this
}
/*
//{random, shuffle, cycle, last, repeat, sticky}
ishml.Template.prototype.choose = function(options)
{
	var self=this
	
	this.next=(function* (options)
	{
		var result=""
		self.passages.forEach(passage=>
		{

			if (passage instanceof ishml.Template)
			{

				result = passage.next().value.toLocaleString()
			}
			else
			{
				result = passage.toLocaleString()
			}
			yield ({value:result, done:false})
		})
		return ({value:result, done:true})
		
	})(options).next

	this.generator=ishml.Template.prototype.choose.bind(this,options)
	
	return this
}
ishml.Template.prototype.hello=function*(options)
{
	while(true)
	{
		yield "hello"
	}	
}

ishml.Template.prototype.reset=function()
{
	this.generator()
	return this
}
ishml.Template.prototype.join = function (options)
{
	this.next=()=>
	{
		var result=""
		this.passages.forEach(passage=>
		{

			if (passage instanceof ishml.Template)
			{

				result += passage.next().value.toLocaleString()
			}
			else
			{
				result += passage.toLocaleString()
			}
		})
		return {value:result, done:true}
	}
	this.generator= ishml.Template.prototype.join.bind(this,options)
	return this
}

ishml.Template.prototype.compose = function ()
{
	var result=""
		this.passages.forEach(passage=>
		{

			if (passage instanceof ishml.Template)
			{

				result += passage.compose()
			}
			else
			{
				if(this.isIterator(passage))
				{
					result += passage.next.value.toLocaleString()
				}
				else
				{
					result += passage.toLocaleString()
				}
			}
		})
}	



ishml.Template.prototype.rephrase = function(literals, ...expressions)
{
	var index=0
		expressions.forEach(passage=>
		{
			rephrase
			if (literals[index].length !== 0)
			{
				this.passages.push(literals[index])
			}
			if(typeof passage ==="string" )
			{
				//placeholder template
				if (!this.hasOwnProperty(passage))
				{
					this[passage]=ishml.Template``
				}
				this.passages.push(this[passage])
			}
			else
			{
				if(passage instanceof ishml.Template || this.isIterator(passage))
				{
					//anonymout template
					passages.push(passage)
				}
				else
				{
					
					//named template
					var key=Object.keys(passage)[0]
					
					if (passage[key] instanceof ishml.Template)
					{
						if (!this.hasOwnProperty(key))
						{
							this[key]=passage[key]
						}

						
						this.passages.push(this[key])
					}
					
				}
			}
			index++
		}) 
		if (index<literals.length)
		{
			this.passages=this.passages.concat(literals.slice(index).filter(value=>value.length>0))
		}
		this.reset()
		return this
}
*/

