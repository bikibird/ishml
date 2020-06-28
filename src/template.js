 /*
The ${"thing"} in the ${"place"} is ${"state"}.
var thing= ishml.Template(["cat","dog","bird"])
var li=ishml.template`<li>${item:items}</li>`
var test=ishml.Template`The ${"thing"} in the ${"place"} is ${"state"}. Poor ${"thing"}.`
var test=ishml.Template`The ${{thing:ishml.template`cat`}} in the ${"place"} is ${"state"}. Poor ${"thing"}.`
var test=ishml.Template`The ${{list:li.recite(thing)}} in the ${"place"} is ${"state"}. Poor ${"thing"}.`
Creates enumerable properties as templates: this.thing, this.place, this.state

passages[0]="The "
passages[1]=this.thing
passages[2]=" in the "
passages[3]=this.place
passages[4]=" is "
passages[5]=this.state
passages[6]=". Poor "
passages[7]=this.thing
passages[8]="."

Emmpty strings should be excluded from template array.

test.thing.phrasing(["ball","cat","flower"])
test.phrasing({thing:["ball","cat","flower"],place:["backyard", "alley","shoebox"]})

Expressions may also reference other Templates:

var test4=ishml.Template`${test1}${test2}($test3}`

var test4=ishml.Template`${test1}${test2}($test3}`

var test=ishml.Template
`${"name"} bought <ol>${{things:ishml.Template`<li>${"thing"}</li>`.join()}}</ol>`
test.name.rephrase(["Alice","Bob"])
test.things.rephrase(["yo-yo", "gum", "pencils"])

.join, .shuffle, .cycle, .list .end .repeat


*/
ishml.Template = function Template(literals, ...expressions) 
{
	if (this instanceof ishml.Template) 
	{
		var self=this
		Object.defineProperty(this, "passages", { value: [], writable: true })
		Object.defineProperty(this, Symbol.iterator, { value:self, writable: true })
		Object.defineProperty(this, "generator", { value:self.choose, writable: true })
		Object.defineProperty(this, "behaviors", { value: [], writable: true })
		this.rephrase(literals,...expressions)
		

	}
	else 
	{
		return new Template(literals, ...expressions)
	}
}

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
/*ishml.Template.prototype.join = function(options)
{
	const self=this
	const joiner=(function*({ repeat="-1", last="", seperator=""}={})
	{
		var result=""
		self.passages.forEach(passage=>
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
		while (true)
		{
			yield result
		}	
	})(options)
	this.iterator=joiner
	this.generator=ishml.Template.prototype.join.bind(this,options)
	return this
}
*/	
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

