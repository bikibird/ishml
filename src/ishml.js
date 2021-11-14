"use strict"
/*
ISC License

Copyright 2019-2021, Jennifer L Schmidt

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

https://whitewhalestories.com
*/

var ishml = ishml || {}
// #region utility functions
ishml.util={_seed:undefined}

ishml.util.enumerator=function* (aStart =1)
{
  let i = aStart;
  while (true) yield i++
}

ishml.util.formatId=function(id)
{
	if(id)
	{ 
		if (typeof(id)==="string"){return id.replace(/\s+/g, '_')}
		else{return id.id.replace(/\s+/g, '_')}
	}	
	else 
	{
		return "auto" + ishml.util.autoid.next().value.toString()
	}
}
ishml.util.autoid=ishml.util.enumerator()
ishml.util.random = function(seed=Math.floor(Math.random() * 2147483648)) 
{
	return {value:(seed* 16807 % 2147483647-1)/2147483646,seed:seed * 16807 % 2147483647}

}
/*ishml.util.reseed = function(seed=Math.floor(Math.random() * 2147483648)) 
{
	ishml.util._seed=seed	
}*/
ishml.util.shuffle=function(anArray,{length=null,seed=Math.floor(Math.random() * 2147483648)}={})
{
	var array=anArray.slice(0)
	var m = array.length
	var count=length||array.length
	for (let i=0; i < count; i++)
	{
		var {value,seed}=this.random(seed)
		let randomIndex = Math.floor(value * m--)
		let item = array[m]
		array[m] = array[randomIndex]
		array[randomIndex] = item
	}
	return {result:array.slice(-count),seed:seed}
}
// #endregion
// #region enumerations
ishml.lighting={dark:1,dim:2,bright:3}

// #endregion
// #region regex
ishml.regex=ishml.regex||{}
ishml.regex.word=/(^\w*)(.*)/
ishml.regex.floatingPointNumber=/^-?([0-9]*[.])?[0-9]+/
// #endregion
// #region Factories and Classes
// #region Plotpoint 

ishml.Plotpoint = function Plotpoint(id,summary)
{
	if (this instanceof ishml.Plotpoint)
	{
		Object.defineProperty(this, "id", {value:ishml.util.formatId(id),writable: true})
		Object.defineProperty(this, "unfold", {value:ishml.Plotpoint.prototype.unfoldSubplot ,writable: true})

		Object.defineProperty(this, "uid", {value:ishml.util.formatId(),writable: true})
		Object.defineProperty(this, "twist", {value:{},writable: true})
		Object.defineProperty(this, "lexeme", {value:"",writable: true})
		this.points[this.uid]=this

		return new Proxy(this,ishml.Plotpoint.handler)
	}
	else 
	{
		return new Plotpoint(id,summary)
	}
}
Object.defineProperty(ishml.Plotpoint.prototype, "points", {value:{},writable: true})
ishml.Plotpoint.prototype[Symbol.iterator]=function(){return Object.values(this)[Symbol.iterator]()}
ishml.Plotpoint.prototype.add = function (id,summary)
{
	if (id instanceof ishml.Plotpoint)
	{
		var plotpoint = id
	}
	else 
	{
		var plotpoint = new ishml.Plotpoint(id,summary)
	}
	this[id] = plotpoint
	return this
}
ishml.Plotpoint.prototype.Episode=function(){return new ishml.Episode(this)}
ishml.Plotpoint.prototype.heed = function (aDocumentSelector)
{
	var element = document.querySelector(aDocumentSelector)
	var eventString = "click"
	if (element)
	{
		if (element.classList.contains("ishml-input"))
		{
			eventString = "keyup"
		}
		return new Promise((resolve) =>
		{
			if (ishml.util._harkenings[aDocumentSelector])
			{
				var harkeningHandler = ishml.util._harkenings[aDocumentSelector][eventString]
				if (harkeningHandler)
				{
					element.removeEventListener(eventString, harkeningHandler)
				}
			}
			element.addEventListener(eventString, function handler(e)
			{
				if (e.key === "Enter")
				{
					var input = 
					{
						text: e.target.value,
						agent: (e.target.dataset.agent || "player"),
						target: e.target,
						grammar: ishml.grammar[e.target.dataset.grammar] || ishml.grammar.input
					}
					e.target.value = ""
					e.target.removeEventListener(eventString, handler)
					if (harkeningHandler)
					{
						e.target.addEventListener(eventString, harkeningHandler)
					}
					resolve(input)
				}
			})
		})
	}
}
ishml.Plotpoint.prototype.toString=function()
{
	return this.unfold.name.replaceAll("_"," ")
}
ishml.Plotpoint.prototype.generate=function()
{
	return [{value:this.toString()}]
}
ishml.Plotpoint.prototype.verbs=function(...verbs)
{
	var particle, preposition
	var thisPlotpoint=this
	var result={
		particle:p=>
		{
			particle=p
			return result
		},
		preposition:p=>
		{
			preposition=p
			return result
		},
		register:(options)=>
		{
			if (options)
			{
				if (typeof options==="number")
				{
					var entry={select:thisPlotpoint,part:"verb", valence:options}
				}
				else 
				{
					var entry = Object.assign({select:thisPlotpoint,part:"verb"},options)
				}
			}
			else
			{
				var entry={select:thisPlotpoint,part:"verb", valence:1}
			}
			if (particle){entry.particle=particle}
			if (preposition){entry.preposition=preposition}
			ishml.lexicon.register(...verbs).as(entry)
			return thisPlotpoint
		}
	}
	return result
}

	
//DOCUMENTATION:  unfold should return false if twist not handled to allow siblings to have a chance at resolving. Return truthy value if plotpoint resolves twist. Returned object may return information to parent plotpoint, which the parent can use to determine whether it is successful. Twist may be modified, which also conveys info back to the parent.


ishml.Plotpoint.prototype.unfoldSubplot = function (twist) 
{
	var episodes=[]
	var episode
	for (const plotpoint of this)
	{
		episode=plotpoint.unfold(twist)
		if (episode){episodes=episodes.concat(episode)}
	}
	episodes=episodes.sort((a,b)=>b.salience()-a.salience())
	if (episodes.length>0){return episodes[0]}
	else {return undefined}
}
ishml.Plotpoint.handler=
{
	get: function(target, property,receiver) 
	{ 
		if (Reflect.has(target,property)){return Reflect.get(target,property,receiver)}
		else 
		{
			//magic plotpoints
			target[property]=new ishml.Plotpoint(property,property)
			return target[property]
		}
	}
}
// #endregion
// #region Episode 
//Episodes are added to the storyline through ishml.introduce.  
//
/*
	configuration={salience,start,stop,etc}
*/

/*
	ishml tells and episode in the following order
	resolve prolog
	resolve episode
	resolve epilog
	narrate prolog
	narrate episode
	narrate epilog

Abridge and revise REPLACE the prior episode in the evaluation change with the most salient episode returned from the episode generator provided. The new episode has the stock property set to the prior episode in the evaluation chain, which the new epsisode may use in its narration or resolution.	

1.2.3

Before sets new episode's prolog to prior episode in the evaluation chain
episode2.prolog=episode1
episode3.prolog=episode2

resolve episode 3 :



*/
ishml.Episode=function Episode(/*plot*/) 
{
	
	if (this instanceof Episode)
	{
		Object.defineProperty(this, "abridged", {value:false,writable: true})
		Object.defineProperty(this, "epilog", {value:false, writable: true})
		Object.defineProperty(this, "prolog", {value:false, writable: true})
		//Object.defineProperty(this, "retracted", {value:false, writable: true})
		Object.defineProperty(this, "_narration", {value:()=>_``.say().append("#story"),writable: true})
		Object.defineProperty(this, "_resolution", {value:()=>true,writable: true})
		Object.defineProperty(this, "_timeline", {value:null,writable: true})
		Object.defineProperty(this, "stock", {value:null,writable: true})

		Object.defineProperty(this, "told", {value:false,writable: true})
		//Object.defineProperty(this, "twist", {value:plot?.twist,writable: true})
		Object.defineProperty(this, "lexeme", {value:"",writable: true})
		return this
	}
	else
	{
		return new Episode(plot)
	}	
}
/* The abridge method returns the most salient episode generated from the subplot of the plotpoint.  The abridged property is set to true, which causes all future revise method calls on the evaluation chain to be ignored.  Append method calls are NOT ignored.*/
ishml.Episode.prototype.abridge = function (createEpisode)
{
	if (this.abridged){return this}
	
	var episode=createEpisode()

 	if (!episode)
	{
		this.abridged=false
		return this
	}
    else 
	{
		//episode.twist=this.twist
		episode.stock=this
		episode.abridged=true
		return episode.timeline(episode._timeline ?? this._timeline).salience(episode._salience ?? this._salience)
	}
}

/* The revise method returns the most salient episode generated from the subplot of the plotpoint or returns this if the current episode in the evaluation chain is an abridged episode or no episode is generated from the subplot.*/
ishml.Episode.prototype.revise = function (createEpisode)
{
	if (this.abridged){return this}
	if (createEpisode)
	{
		var episode=createEpisode()
		if (!episode)
		{
			return this
		}
			episode.stock=this
			//episode.twist=this.twist
			return episode.timeline(episode._timeline ?? this._timeline).salience(episode._salience ?? this._salience)

	}
	else { return this}
}

/* The append method returns the most salient episode generated from the subplot of the plotpoint or a new,empty, episode if no plotpoint.  The new episode's prolog property is set to the prior episode in the evaluation chain. */
ishml.Episode.prototype.append = function (createEpisode)
{
	if (createEpisode)
	{
		var episode=createEpisode()
		if (!episode){return  this}
		
	}
	else
	{
		var episode=new ishml.Episode()
		
	}
	//episode.twist=this.twist
	episode.stock=this
	episode.prolog=this
	return episode.timeline(episode._timeline ?? this._timeline).salience(episode._salience ?? this._salience)
}

ishml.Episode.prototype.prepend = function (createEpisode)
{
	if (createEpisode)
	{
		var episode=createEpisode()
		if (!episode){return  this}
		
	}
	else
	{
		var episode=new ishml.Episode()
		
	}
	//episode.twist=this.twist
	episode.stock=this
	episode.epilog=this
	return episode.timeline(episode._timeline ?? this._timeline).salience(episode._salience ?? this._salience)
}



/*
// add code here for narration that occurs before stock narration 

this.stock()?.episode.narrate()  // comment out for instead of stock narration

//add code here for behavior that occurs before or instead of stock episode.

this.stock()?.episode.resolve()  //comment out for instead of stock behavior

// add code here for behavior that occurs after stock behavior

// add code here for narration that occurs 
return this
*/
ishml.Episode.prototype.narrate=function narrate()
{
	if (!this.twist?.silently)
	{
		if (this.prolog){this.prolog.narrate()}
		this._narration(this)
		if (this.epilog){this.epilog.narrate()}
	}	
	return this
}
ishml.Episode.prototype.narration=function(narration)
{
	if (narration!==undefined)
	{
		this._narration=narration
		return this
	}
	else {return this._narration}
	
}
ishml.Episode.prototype.resolution=function(resolution)
{
	
	this._resolution=resolution
	return this
}
ishml.Episode.prototype.resolve=function resolve(time)
{

	if (this.prolog){this.prolog.resolve(time)}
	this.told=this._resolution(this,time)??true
	if (this.epilog){this.epilog.resolve(time)}
	return this
}


ishml.Episode.prototype.salience=function(salience)
{
	if(salience===undefined){return this._salience}
	{
		this._salience=salience
		return this
	}
}
ishml.Episode.prototype.start=function(...start)
{
	if(start.length===0){return this._start}
	{
		this._start=start[0]
		return this
	}
}

ishml.Episode.prototype.stop=function(...stop)
{
	if(stop.length===0){return this._stop}
	{
		this._stop=stop[0]
		return this
	}
}
ishml.Episode.prototype.timeline=function(timeline)
{
	if(timeline===undefined){return this._timeline}
	{
		this._timeline=timeline
		return this
	}
}
// #endregion
// #region Knot 
/*
A knot has
non-enumerable properties
id
uid
and user defined enumerable properties

enumerable cords
	each cord has a ply:

Cords only no other user defined properties.  twists are a set of plotpoints that apply to the ply.
*/ 
ishml.Knot= class Knot
{
	constructor(id) //,uid)
	{
		this.id=id
		this.name=id.replace("_"," ")
		this.description=this.name
		Object.defineProperty(this, "lexeme", {value:"",writable: true})
		/*Object.defineProperty(this, "id", {value:id,writable: true}) //
		Object.defineProperty(this, "name", {value:id.replace("_"," "),writable: true}) //local name
		Object.defineProperty(this, "description", {value:this.name,writable: true}) */
		return this 
	}
	get cord()
	{
		//Returns cord with ply representing this knot.
		return new ishml.Cord(this)
	}
	get knot(){return this}
	get ply()
	{
		//Turns bare knot into a ply.
		return new ishml.Ply(this.id,this)
		
	}

	get cords()
	{
		
		return Object.values(this).filter(cord=>cord instanceof ishml.Cord) 	
	}
	configure(...configuration)
	{
		configuration.flat().forEach(item=>
			{
				Object.assign(this,item)		
			})
		return this
	}	
/*	defineCord(name)
	{
		return {as:(aFunction)=>
		{
			Object.defineProperty(this, "name", 
			{
				value:new Proxy(new ishml.Cord(),{get:aFunction}),
				writable: true,
				enumerable:true
			})
		}}
		
	}
	*/
	nearby(hops)
	{
		return new ishml.Cord(this).nearby(hops)
	}
	plural(...nouns)
	{
		this.configure({number:ishml.lang.number.plural})
		ishml.lexicon.register(...nouns).as({part:"noun", select:this.cord})
		return this
	}
	realm(hops)
	{
		return new ishml.Cord(this).realm(hops)
	}
	singular(...nouns)
	{
		this.configure({number:ishml.lang.number.singular})
		ishml.lexicon.register(...nouns).as({part:"noun", number:ishml.lang.number.singular, select:this.cord})

		return this
	}
	tie(...someCordage)
	{
/*$.thing.cup.tie("cord:ply").to(otherKnot/otherPly) --one-way relation converse===null
$.thing.cup.tie("cord:ply=otherCord:otherPly").to(otherKnot/otherPly) --converse relation converse === another ply
$.thing.cup.tie("cord:ply-otherCord:otherPly").to(otherKnot/otherPly) --mutual relation converse === another ply, but when ply properties updated, other ply is updated automatically because both share the same properties object.
$.thing.cup.tie("cord:ply@otherCord:otherPly").to(otherKnot/otherPly) --reflexive relation converse=== this ply.

*/
		var cordages=someCordage.filter(cordage=>
			{
				if (cordage?.cord instanceof ishml.Cord)
				{
					if (cordage?.id){this[cordage.id]=cordage.cord}
					else (this[cordage.cord.id]=cordage.cord)
					return false
				}
				else
				{
					if (cordage instanceof ishml.Cord)
					{
						this[cord.id]=cord
					}
				}
				return true
			})
		cordages=cordages.flat(Infinity).map(cordage=>ishml.Cord.cordage[ishml.util.formatId(cordage)]??cordage).flat(Infinity)
		var thisKnot=this
		var tie=(from,to)=>
		{
			if (from instanceof ishml.Knot)
			{
				var fromKnot=from
			}
			else
			{
				if (from instanceof ishml.Ply)
				{
					var fromKnot=from.knot
				}
				else
				{
					var fromKnot=new ishml.Knot(from)
				}	
			}
			if (to instanceof ishml.Knot)
			{
				var toKnot=to
			}
			else
			{
				if (to instanceof ishml.Ply)
				{
					var toKnot=to.knot
				}
				else
				{
					var toKnot=new ishml.Knot(to)
				}	
			}
			cordages.forEach((cordage)=>
			{
				//parse the cordage
				var [fore,aft]=cordage.split(/[-=@]/)
				var mutual=cordage.includes("-")
				var reflexive=cordage.includes("@")
				var converse=cordage.includes("=")
				var [foreCordId,forePlyId]=fore.split(":").map(id=>ishml.util.formatId(id.trim()))
				if (foreCordId)
				{
					if (!forePlyId){forePlyId=toKnot.id}
					//create the new fore ply
					var forePly=new ishml.Ply(forePlyId,toKnot)
					forePly.from=fromKnot
					forePly.cordId=foreCordId
					if (fromKnot.hasOwnProperty(foreCordId))
					{
						fromKnot[foreCordId][forePlyId]=forePly
					}	
					else
					{
						var cord = new ishml.Cord()
						cord.id=foreCordId
						cord[forePlyId]=forePly
						fromKnot[foreCordId]=cord
					}
				}	
	//exit:north=entrance:south
	//foyer.exit.north points to kitchen
	//foyer.exit.north.converse equivalent to foyer.exit.north.entrance.south which points back to foyer
	//kitchen.entrance.south points to foyer
	//kitchen.entrance.south.converse equivalent to  kitchen.entrance.south.exit.north which points back to foyer				
				if (mutual || converse || reflexive)
				{
					//create the new aft ply
					var [aftCordId,aftPlyId]=aft.split(":").map(id=>ishml.util.formatId(id.trim()))	
					if (!aftCordId){aftCordId=foreCordId}
					if (!aftPlyId){aftPlyId=fromKnot.id}

					if (reflexive)
					{
						if (!aftPlyId){aftPlyId=foreCordId}
						var aftPly=new ishml.Ply(aftPlyId,toKnot)
					}
					else 
					{
						if (!aftPlyId){aftPlyId=toKnot.id}
						var aftPly=new ishml.Ply(aftPlyId,fromKnot)
					}                                                                      

					aftPly.from=toKnot
					aftPly.cordId=aftCordId

					if (toKnot.hasOwnProperty(aftCordId))
					{
						toKnot[aftCordId][aftPlyId]=aftPly
					}	
					else
					{
						var cord = new ishml.Cord()
						cord.id=aftCordId
						cord[aftPlyId]=aftPly
						toKnot[aftCordId]=cord
					}
					if (foreCordId){forePly.converse=aftPly}
					aftPly.converse=forePly
				}
			})
		}		
		
		var from =(...someKnots)=>
		{
			someKnots.forEach(knot=>tie(knot,thisKnot))	
			return thisKnot
		}

		var to = (...someKnots)=>
		{
			someKnots.forEach(knot=>tie(thisKnot,knot))
			return thisKnot
		}

		var back = ()=>
		{
			tie(thisKnot,thisKnot)
			return thisKnot
		}
		return {to:to, from:from, back:back}
	}
	where(condition)
	{
		if (condition(this)){return this}
		else {return null}
	}


}
// #endregion
// #region Ply 
/*
The purpose of a knot is to hold data.
A Knot has cords.
A Cord is is made up of plies.
	Set operations may be performed on cords to return a new set of plies in cord.
A Ply is a connection between two knots.
	A ply has a from knot and to knot. The ply may have a weight and other user defined properties.




$.thing.cup.tie("cord:ply").to(otherKnot/otherPly) --one-way relation converse===null
$.thing.cup.tie("cord:ply=otherCord:otherPly").to(otherKnot/otherPly) --converse relation converse === another ply
$.thing.cup.tie("cord:ply-otherCord:otherPly").to(otherKnot/otherPly) --mutual relation converse === another ply, but when ply properties updated, other ply is updated automatically because both share the same properties object.
$.thing.cup.tie("cord:ply@otherCord:otherPly").to(otherKnot/otherPly) --reflexive relation converse=== this ply.

//$.place.kitchen.tie("exit:north-entrance:south").to($.place.foyer)
//$.person.Lizzy.tie("friendship=friendship").to($.person.Charlotte)

*/ 
ishml.Ply= class Ply
{
	constructor(id,knot)
	{
		if (id)
		{
			this.id=id

			if (knot instanceof ishml.Knot)
			{
				var k=knot
			}
			else
			{
				if (knot){var k=new ishml.Knot(knot)}
				else{var k=new ishml.Knot(id)}

			}
			this.knot=k //destination
			//this.twists={}
			this.ply={weight:1}
		}
		else
		{
			this.id=null
			this.knot=null
			this.ply=null
		}	
		Object.defineProperty(this, "lexeme", {value:"",writable: true})
		this.hop=0
		this.cost=0
		/*this.adjunct=null //for adjunctive cording  What???? probably meant cord hopping*/
		this.advance=null //a ply created during entwining
		this.retreat=null //a ply created during entwining
		this.converse=null // a ply created during tying for reflexive, mutual and converse
		this.cordId="" // name of thie from knot cord where this ply lives
		this.from=null //the knot where this ply lives
		//this.mutual=false -- not needed just share this.ply mutually
		return new Proxy(this, ishml.Ply.handler)
	}
	get aft()
	{
		var ply=this
		while (ply.retreat){ply=ply.retreat}
		return ply
	}
	check(condition)
	{
		if (condition(this)){return this}
		else return null
	}
	get cord()
	{
		
		return new ishml.Cord(this) 	
	}

	entwine({ply,via=null,condition=()=>true})
	{

		//Duplicate two plies and connect advance and retreat
		if (ply instanceof ishml.Knot){var otherPly=knot.toPly()}
		else {var otherPly=ply}
		if (via)
		{
			if(this.knot.hasOwnProperty(via) && this.knot[via] instanceof ishml.Cord)
			{
				if(this.knot[via].hasOwnProperty(otherPly.id))
				{
					if (condition(this,otherPly))
					{

						var tail=this.plait()
						var head=otherPly.plait()
					
						tail.via=via
						tail.advance=head
						tail.retreat=this.retreat

						head.advance=null
						head.retreat=tail
						head.advance=tail
						
						return {tail:tail,head:head}
					}
				}

			}
			return {aft:null,fore:null}
		}	

		var tail=this.plait()
		var head=otherPly.plait()
	
		tail.advance=head
		tail.retreat=this.retreat

		head.advance=null
		head.retreat=tail
		head.advance=tail
		
		return {aft:tail,fore:head}
	}	
	get fore()
	{
		var ply=this
		while (ply.advance){ply=ply.advance}
		return ply
	}
	//get knots(){return new ishml.Tangle(this.knot)}
	plait()
	{
		//create a new ply from this ply.  shallow copy of members.
		var plait=new Ply(this.id,this.knot)
		plait.cost=this.cost
		plait.ply=this.ply
		plait.hop=this.hop
		plait.cost=this.cost
		plait.converse=this.converse // a ply created during tying
		plait.cordId=this.cordId // name of of from knot cord where this ply lives
		plait.from=this.from

		return plait
	}
	//$.thing.ring.nearby(1).via("in","over","under").contains(player,{via})
	nearby(hops)
	{
		return new ishml.Cord(this).nearby(hops)
	}
	path(destination,{filter=(ply)=>true,minimum=1,maximum=Infinity,via,cost=(ply,leg)=>ply.cost+leg.ply.weight}={})
	{
		function insert (ply)
		{

			heap.push(ply)

			/* Bubble Up */

			if (heap.length > 1)
			{
				let current = heap.length - 1

				/* Traversing up the parent node until the current node (current) is greater than the parent (current/2)*/
				while (current > 1 && heap[Math.floor(current/2)].cost > heap[current].cost)
				{

					/* Swapping the two nodes by using the ES6 destructuring syntax*/
					[heap[Math.floor(current/2)], heap[current]] = [heap[current], heap[Math.floor(current/2)]]
					current = Math.floor(current/2)
				}
			}
			
		}
		
		function remove()
		{
			let smallest = heap[1]

			/* When there are more than two elements in the array, we put the right most element at the first position
				and start comparing nodes with the child nodes
			*/
			if (heap.length > 2)
			{
				heap[1] = heap[heap.length-1]
				heap.splice(heap.length - 1)

				if (heap.length === 3)
				{
					if (heap[1].cost > heap[2].cost)
					{
						[heap[1], heap[2]] = [heap[2], heap[1]]
					}
					return smallest
				}

				let current = 1
				let leftChildIndex = current * 2
				let rightChildIndex = current * 2 + 1

				while (heap[leftChildIndex] && heap[rightChildIndex] && (heap[current].cost < heap[leftChildIndex].cost || heap[current].cost < heap[rightChildIndex].cost))
				{
					if (heap[leftChildIndex].cost < heap[rightChildIndex].cost)
					{
						[heap[current], heap[leftChildIndex]] = [heap[leftChildIndex], heap[current]]
						current = leftChildIndex
					}
					else
					{
						[heap[current], heap[rightChildIndex]] = [heap[rightChildIndex], heap[current]]
						current = rightChildIndex
					}

					leftChildIndex = current * 2
					rightChildIndex = current * 2 + 1
				}
			}

			/* If there are only two elements in the array, we directly splice out the first element */

			else if (heap.length === 2) 
			{
				heap.splice(1, 1)
			} 
			else
			{
				return null
			}

			return smallest
		}
		
		if (destination instanceof ishml.Knot){var target=destination.toPly()}
		else {var target=destination}
		if (via)
		{
			var way=new Set([].concat(via))
			var anyway=false
		}
		else
		{
			var anyway=true
		}	
		this.retreat=null
		this.hop=0
		this.cost=0
		var heap=[null]
		insert(this.plait())
		
		var visited = new Set()
		var path= []
		while (heap.length>1)
		{
			var ply=remove(heap)
			
			if (ply.cost<=maximum)
			{
				if (ply.knot===target.knot && ply.cost>=minimum)
				{
					
					//found! ply.retreat already set. we new just need to retreat all the way back to find the ply in the path and return that. 
					var head=null  //destination knot
					while (ply) //walk retreat path of destination and set advance path.
					{
						ply.advance=head //advance
						path.unshift(ply) //add ply to path list to be returned
						head=ply //retreat one hop
						ply=ply.retreat //retreat one hop
						//exit loop once ply is null.  last retreat points to null.
					}	
					return {aft:path[0],fore:path[path.length-1]}
				}
				else
				{
					if (!visited.has(ply.knot) && filter(ply))
					{
						visited.add(ply.knot)
						ply.knot.cords.forEach(cord => 
						{
							if (anyway || way.has(cord.id) )
							{
								Object.values(cord).forEach((child)=>
								{
									if (!visited.has(child.knot))
									{
										var leg=child.plait()
										leg.hop=ply.hop+1
										leg.cost=cost(ply,leg)
										leg.retreat=ply
										leg.via=cord.id

										insert(leg)
									}
								})
							}	
						})
					}
				}
			}		
		}
		return {aft:null,fore:null}  //not found
	}
	realm(hops)
	{
		return new ishml.Cord(this).realm(hops)
	}
	retie(...knots)
	{
		//forePly.converse=aftPly
		//			aftPly.converse=forePly
		var id
		var forePly=this  //player.in.foyer  //player.in.foyer.from === player knot
		var aftPly=this?.converse ?? null  //foyer.contains.player
		forePly.from[forePly.cordId].delete(forePly)  //remove foyer ply from player
		aftPly?.from[aftPly.cordId].delete(aftPly)  //remove player from foyer
		
		var cord=new ishml.Cord(...knots)
		cord.forEach(ply=>  //$.place.cloakroom
		{
			id=forePly.id===forePly.knot.id?ply.knot.id:forePly.id
			forePly.from[forePly.cordId]=forePly.from[forePly.cordId] ?? new ishml.Cord()
			forePly.id=id
			forePly.from[forePly.cordId].add(forePly)
			forePly.knot=ply.knot
			
			if (aftPly)
			{
				id=aftPly.id===aftPly.knot.id?this.from.id:aftPly.id
				ply.knot[aftPly.cordId]=ply.knot[aftPly.cordId] ?? new ishml.Cord()
				aftPly.id=id
				ply.knot[aftPly.cordId].add(aftPly)
				aftPly.from=ply.knot
				forePly.converse=aftPly
				aftPly.converse=forePly
			}	
		})
	
		return this

		//return this.knot.tie(...cordage)
	}

	subtract(...cordage)
	{
		return this.cord.subtract(...cordage)
	}
	untie(cordId)
	{
/*Knot must have been reached by traveling along a tie.
$.room.kitchen.untie() removes the room tie for kitchen and returns kitchen.knot.
$.room.kitchen.exit.north removes the exit north tie to foyer and returns north.knot, the bare foyer knot.

$.room.kitchen.exit.north.untie()
*/
		this.from[this.cordId]._plies.delete(this)
		delete this.from[this.cordId][this.id]
		var converse=this.converse
		if (converse)
		{
			converse.from[converse.cordId]._plies.delete(converse)
			delete converse.from[converse.cordId][converse.id]
		}
		return this
	}

	where(condition)
	{
		if (condition(this)){return this}
		else {return null}
	}
}


//custom properties are returned from .ply.  if not found on .ply, then returned from .knot.  Example, description.
ishml.Ply.handler=
{

	get: function(target, property, receiver) 
	{
		if (Reflect.has(target,property)){return Reflect.get(target,property, receiver)}
		var ply=Reflect.get(target,"ply")
		if(ply.hasOwnProperty(property))
		{
			
			return ply[property]
		}
		var knot=Reflect.get(target,"knot")
		if (knot)
		{
			if(Reflect.has(knot,property))
			{
				if (!(knot[property] instanceof ishml.Cord)  && typeof knot[property]==="function" )
				{
					return function(...args){return knot[property](args)}
				}
				else {return knot[property]}
			}	
		}
		else {return new ishml.Cord()}	
	},
	set: function(target, property, value, receiver)
	{
		if (Reflect.has(target,property)){return Reflect.set(target,property,value,receiver)}
		var ply=Reflect.get(target,"ply")
		if(ply.hasOwnProperty(property))
		{
			ply[property]=value
			return true
		}
		var knot=Reflect.get(target,"knot")
		
		if(knot.hasOwnProperty(property))
		{
			knot[property]=value
			return true
		}
		else
		{
			ply[property]=value
			return true
		}
	}	
}


//$.place.kitchen.tie("exit:north<entrance:south").to($.place.foyer)
//$.person.Lizzy.tie("friendship<friendship").to($.person.Charlotte)
//$.tie("select").to("green")

//$.thing.cup(is<describes).to($.select.green)

//$.select.green.tie("describes:is").to($.thing.cup)
//$.select.green.tie("describes:is").to($.thing.ball)

//$.select.green.describes.cup
//$.cup.is.green

// #endregion
// #region Cord 
ishml.Cord =class Cord extends Function //(function Cord(){})
{
	//a cord is a collection of unrelated plies
	constructor(...members) 
	{
		super()
		Object.setPrototypeOf(this, ishml.Cord.prototype)
		Object.defineProperty(this,"id",{writable:true})
		Object.defineProperty(this,"__plies",{value:new Set(),writable:true})
		Object.defineProperty(this,"_select",{value:null,writable:true})
		Object.defineProperty(this, "lexeme", {value:"",writable: true})
		members.forEach(member=>
		{
			if (member instanceof Set ||member instanceof ishml.Cord ||member instanceof Array)
			{
				member.forEach((item)=>
				{
					if (item instanceof ishml.Ply)
					{
						this._plies.add(item)
						this[item.id]=item
					}
					else
					{
						if (item instanceof ishml.Knot)
						{
							this._plies.add(item.ply)
							this[item.id]=item.ply
						}
					}
					
				})
			}
			else
			{
				if (member instanceof ishml.Ply)
				{
					this._plies.add(member)
					this[member.id]=member
				}
				else
				{
					if (member instanceof ishml.Knot)
					{
						this._plies.add(member.ply)
						this[member.id]=member.ply
					}
					else
					{
						if (typeof member === "function")
						{
							this._select=member
						}
					}
				}
				
			}
		})	
		return new Proxy(this,ishml.Cord.handler)
	}
	[Symbol.iterator](){return this._plies.values()[Symbol.iterator]()}
	get _plies()
	{
		if(this._select){return this._select()._plies}
		else{return this.__plies}
	}
	add(...members)
	{
		members.forEach(member=>
		{
			if (member instanceof Cord || member instanceof Set || member instanceof Array)
			{
				member.forEach((item)=>
				{
					if (item instanceof ishml.Ply)
					{
						this._plies.add(item)
						this[item.id]=item
					}
					else
					{
						if (item instanceof ishml.Knot)
						{
							this._plies.add(item.ply)
							this[item.id]=item.ply
						}
					}
				})
			}
			else
			{
				if (member instanceof ishml.Ply)
				{
					this._plies.add(member)
					this[member.id]=member
				}
				else
				{
					if (member instanceof ishml.Knot)
					{
						this._plies.add(member.ply)
						this[member.id]=member.ply
					}
				}
			}
		})	
		return this	
	}
	get converse()
	{
		var cord = new ishml.Cord()
		/*if (cordId)
		{
			for ( const ply of this[cordId]._plies){cord.add(ply.converse)}
		}
		else
		{*/	
			for ( const ply of this._plies){cord.add(ply.converse)}
		//}	
		return cord
	}
	get cord(){return this}
	cross(other)
	{
		
		var per=crossing=>
		{
			var cord = new ishml.Cord()
			for (const a of this)
			{
				for (const b of other)
				{
					var result=crossing(a,b)
					try
					{
						if (result===true)
						{
							cord.add(a)
						}
						else 
						{
							if (result instanceof ishml.Ply || result instanceof ishml.Cord)
							{
								cord.add(result)
							}
							
						}
					}
					catch 
					{
						
					}	
				}
			}
			return cord
		}
		return {per:per}
	}
	generate(property="name")
	{
		return this.map(ply=>
		{
			var knot=ply.knot
			var data={}
			Object.keys(ply).forEach(key=>
			{
				data["ply_"+key]=ply[key]
			})
			Object.assign(data,ply.knot)
			if (property===undefined){data.value=knot.name}
			else
			{
				if (property===""){data.value=""}
				else{data.value=knot[property]}
			}
			return data
		})
	}
	delete(...plies)
	{
		var cord=new ishml.Cord(...plies)
		cord.forEach((ply)=>
		{
			if(ply instanceof ishml.Ply)
			{
				//DEFECT deleting key when there may be more than one ply with the same id
				delete this[ply.id]
				this._plies.delete(ply)
			}
			else
			{
				
				if (ply)
				{
					ply.forEach((ply)=>
					{
						if(ply instanceof ishml.Ply)
						{
							//DEFECT deleting key when there may be more than one ply with the same id
							delete this[ply.id]
							this._plies.delete(ply)
						}
					})
				}	
				
			}
		})
		return this
	}
	get disjoint()
	{
		var knots=new Set()
		var cord=new ishml.Cord()
		this._plies.forEach(ply=>
		{
			if (!knots.has(ply.knot))
			{
				knots.add(ply.knot)
				cord.add(ply)
			}
		})
		return cord
	}
	akin(...someCord)
	{
		var knots=this.knots.toSet
		var otherKnots = (new ishml.Cord(...someCord)).knots.toSet
		if (knots.size===otherKnots.size)
		{
			return [...knots].every(knot=>otherKnots.has(knot))
		}
		else {return false}
	}
	filter(condition)
	{
		return new ishml.Cord([...this._plies].filter(condition))
	}
	get isEmpty()
	{
		return this.size===0
	}
	slice(start=0,end=1)
	{
		return new ishml.Cord([...this._plies].slice(0,1))
	}
	forEach(f)
	{
		this.plies.toArray.forEach(f)
	}
	has(ply)
	{
		if (ply instanceof ishml.Ply)
		{
			if (this._plies.has(ply)){return true}
			return false
		}	
		else {return [...this._plies].some(ply=>ply.knot===ply)}
	}
	intersect (cord)
	{
		var otherCord=new ishml.Cord(cord)
		var cord=new ishml.Cord()
		this.forEach(ply=>
		{
			if (otherCord.has(ply.knot))
			{
				cord.add(ply)
			}
		})
		return cord
	}
	get knot(){return[...this._plies][0].knot}
	get knots()
	{
		var thisCord=this
		return new Proxy({},
		{
			get: function(target, property, receiver) 
			{
				if (property==="toArray"){return 	[...thisCord._plies].map(ply=>ply.knot)}
				if (property==="toSet"){return new Set([...thisCord._plies].map(ply=>ply.knot))}
				return [...thisCord._plies].map(ply=>ply.knot[property])
			}			
		})	
	}
	last(count=1)
	{
		return new ishml.Cord([...this._plies].slice(-1,-count))
	}
	map(map)
	{
		return [...this._plies].map(map)
	}
	middle(count=1)
	{
		return new ishml.Cord([...this._plies].slice(count,-count))
	}
	most(count=1)
	{
		return new ishml.Cord([...this._plies].slice(count-1,-1))
	}
	//$.thing.ring.nearby(1).via("in","over","under").contains(player,{via})
	nearby(hops)
	{
		var visited
		var result
		var neighbors 
		var thisCord = this
		var adjacencies=(cord,keys)=>
		{
			var adjacent=new ishml.Cord()
			if (keys)
			{
				keys.forEach((key)=>
				{	
					cord.forEach(ply=>{adjacent.add(ply.knot[key])})
				})
			}
			else
			{
				cord.forEach(ply=>{adjacent.add(ply.knot.cords)})
			}
			
			return adjacent
		}
		return {
			via:(...cordage)=>
			{
				var i=hops?hops-1:Infinity
				result=adjacencies(this, cordage)
				visited = new ishml.Cord(result)
				while (i>0)
				{
					neighbors=adjacencies(result, cordage).subtract(visited)
					if (neighbors.size===0){return new ishml.Cord()}
					visited.add(neighbors)
					result= new ishml.Cord(neighbors)
					i--
				}
				return result
			}
		}	
	}
	path(destination,{filter=(knot)=>true,minimum=1,maximum=Infinity,via,cost=(ply,leg)=>ply.cost+leg.ply.weight}={})
	{
		var fore=new ishml.Cord()
		var aft=new ishml.Cord()
		var path
		this.cross(destination).per(
		(a,b)=>
		{
			path=a.path(b,{filter:filter,minimum:minimum,maximum:maximum,via:via,cost:cost})
			fore.add(path.fore)
			aft.add(path.aft)
		})
		return {fore:fore,aft:aft}
	}
	get text()
	{
		var cord=this
		return new Proxy(()=>{},
		{
			apply:function(target,thisArg,args)
			{
				if(args.length===0)
				{
					return ishml.Template.list(cord.knots.name).say().text
				}
			},
			get: function(target,property)
			{

				return ishml.Template.list(cord.knots[property]).say().text
			}
			
		})

	}
	get ply(){return[...this._plies][0]}
	orient(property,plies)
	{
		/*
		 $.thing.ring.worn_by($.actor.player)

		 $.actor.player.wears.ring

		 $.thing.ring.worn_by.player.converse

		*/
		var otherCord=new ishml.Cord(plies)
		var cord=new ishml.Cord()

		if (plies)
		{

			for (const thisPly of this ) //$.thing.ring
			{
				var targetCord=thisPly.knot[property]//$.thing.ring.worn_by
			

				for (const targetPly of targetCord) //$.thing.ring.worn_by  aka player
				{
					for (const otherPly of otherCord) //$.actor.player
					{
						if (targetPly.knot===otherPly.knot)
						{
							cord.add(targetPly.converse) //$.thing.ring.worn_by.converse aka ring
							break
						}
					}
				}	
			}
		}
		else
		{
			for (const thisPly of this ) //$.thing.ring
			{
				var targetCord=thisPly.knot[property]//$.thing.ring.worn_by
				for (const targetPly of targetCord) //$.thing.ring.worn_by  aka player
				{
					cord.add(targetPly.converse) //$.thing.ring.worn_by.converse aka ring
				}	
			}
		}
		return cord
	}
	get plies()
	{
		var thisCord=this
		return new Proxy({},
		{
			get: function(target, property) 
			{
				if (property==="toArray"){return 	[...thisCord._plies]}
				if (property==="toSet"){return thisCord._plies}
				return [...thisCord._plies].map(ply=>ply[property])
			}			
		})	
	}
	//portable.reachable($.actor.player.in, {via:"in"})
	reachable(destination,{filter=(knot)=>true,minimum=1,maximum=Infinity,via,cost=(ply,leg)=>ply.cost+leg.ply.weight}={})
	{
		return this.cross(destination).per(
		(a,b)=>
		{
			var {aft}=a.path(b,{filter:filter,minimum:minimum,maximum:maximum,via:via,cost:cost})
			if (aft) {return true}
			else {return false}
		})
	}
	realm(hops)
	{
		var visited
		var result
		var neighbors 
		var size
		var thisCord=this
		var adjacencies=(cord,keys)=>
		{
			var adjacent=new ishml.Cord()
			if (keys)
			{
				keys.forEach((key)=>
				{	
					cord.forEach(ply=>{adjacent.add(ply.knot[key])})
				})
			}
			else
			{
				cord.forEach(ply=>{adjacent.add(ply.knot.cords)})
			}
			
			return adjacent
		}
		return {
			via:(...cordage)=>
			{
				var i=hops?hops-1:Infinity
				result=adjacencies(thisCord, cordage)
				visited=new ishml.Cord(thisCord).add(result)
				while (i>0)
				{
					neighbors=adjacencies(result, cordage).subtract(visited)
					if (neighbors.size===0){break}
					visited.add(neighbors)
					result.add(neighbors)
					i--
				}
				return result
			}
		}	
	}
	recite(recitation=(ply)=>ply.knot.id)
	{
		var result=[]
		this._plies.forEach((ply)=>
		{
			result.push(recitation(ply))
		})
		return result
	}
	retie(...knots)
	{
		if(this.size)
		{
			this.forEach(ply=>
			{
				ply.retie(...knots)
			})
		}
		else
		{
			this.add(...knots)
		}	
		return this
	}
	reduce(f){return [...this.__plies].reduce(f)}
	shuffle(quantity)
	{
		var count=quantity||this.size
		return new ishml.Cord(ishml.util.shuffle([...this._plies],count))
	}
	get size()
	{
		//if(_select){return this._select().size}

		return this._plies.size
	}
	sort(sorting)
	{
		return new Cord([...this._plies].sort(sorting))
	}
	subtract(...someKnots)
	{
		var a=new ishml.Cord(this)
		var b=new ishml.Cord(...someKnots).knots.toSet
		a.forEach(ply=>
		{
			if(b.has(ply.knot))
			{
				delete a[ply.id]
				a._plies.delete(ply)
			}
		})
		return a
	}
	tie(...someCordage)
	{
		var from =(...fromCords)=>
		{
			var fromCord= new ishml.Cord(...fromCords)

			fromCord.forEach(ply=>
			{
				this.forEach((toPly)=>
				{
					ply.knot.tie(...someCordage).to(toPly.knot)
				})	
			})
			return this	
		}

		var to = (...toCords)=>
		{
			var toCord=new ishml.Cord(...toCords)
			this.forEach((ply)=>
			{
				toCord.forEach(toPly=>
					{
						ply.knot.tie(...someCordage).to(toPly.knot)
					})
			})
			
			return this
		}
		return {to:to, from:from}
	}
	untie(cordId)
	{
		var cord=cordId?this[cordId].converse:this

		cord._plies.forEach(ply=>
		{
			ply.untie()
		})
		return this
	}
	where(condition)
	{
		if (condition(this)){return this}
		else return new Cord()
	}
}
ishml.Cord.cordage={}
ishml.Cord.handler=
{	
	apply: function(target, thisArg, cords)
	{
		/*
		$.thing.ring.worn_by($.actor.player)

		$.actor.player.wears.ring

		$.thing.ring.worn_by.player.converse

		*/
		if (target._select){return target._select(cords)}
		var cord=new ishml.Cord()

		if (cords.length>0)
		{
			cords.forEach((c)=>
			{
				if (typeof c === "string")  //$.actor.player.in("cloakroom") $.place.foyer.exit("cloakroom") $.place.foyer.exit("west")
				{
					target.forEach(targetPly=>
					{
						if (targetPly.id===c ||targetPly.knot.id===c)cord.add(targetPly)
					})	
				}
				else
				{
					var otherCord=new ishml.Cord(c)
					target.forEach(targetPly=>
					{
						otherCord.forEach(otherPly=>
						{
							if (targetPly.knot===otherPly.knot){cord.add(targetPly)}
						})
					})
				}	
			})
		}
		else
		{
			cord.add(target) //Called cord without parameters.  Need to return the orignal cord. Can't just return target, because not wrapped in proxy. 
		}
		return cord

	},
	set: function(target, property, value, receiver)
	{
		if (value instanceof ishml.Ply)
		{
			target[property]=value
			target._plies.add(value)
			return true
		}
		else{return Reflect.set(target,property,value,receiver)}
	},
	get: function(target, property, receiver) 
	{
		//if cord contains ply, return the ply
		//$.room.kitchen.exit.north
		if (target._select){return target._select()[property]}
		if (Reflect.has(target,property,receiver))  //return the ply 
		{
			return Reflect.get(target,property,receiver)
		}
		else 
		{
			// Return  the ply where the knot id matches the property name.
			//$.kitchen.exit.foyer 
			target._plies.forEach(ply=>
			{
				if (ply.knot?.id===property){return ply}
			})
			//if some plies in the cord point to knots which point cords matching the property, return a cord of the plies of matching cords.  Fast travel along cords
			//$.actor.lizzy.friend.friend
			var cord=new ishml.Cord()
			target._plies.forEach(ply=>
			{
					cord.add(ply.knot[property])	
			})
			return cord

		}
	}
}
// #endregion
// #region Interpretation 
ishml.Interpretation=function Interpretation(gist={},remainder="",valid=true,lexeme)
{
	this.lexeme=lexeme??""
	if (this instanceof ishml.Interpretation)
	{
		if (gist instanceof Array)
		{
			this.gist=gist.map(g=>
			{
				g.lexeme=this.lexeme
				return g	
			})
		}
		else
		{
			if(gist instanceof ishml.Token)
			{
				this.gist=gist.clone()
				this.gist.lexeme=this.lexeme
			}
			else
			{
				this.gist=Object.assign({},gist)
				this.gist.lexeme=this.lexeme
			}	
		}
		

		this.remainder=remainder.slice()
		this.valid=valid
		return this
	}
	else
	{
		return new Interpretation(gist,remainder)
	}
}

// #endregion
// #region Lexicon
ishml.Lexicon=function Lexicon() 
{
	if (this instanceof ishml.Lexicon)
	{

		Object.defineProperty(this, "trie", {value:{},writable: true})
		return this
	}
	else
	{
		return new Lexicon()
	}
}

ishml.Lexicon.prototype.register = function (...someLexemes) 
{
	var lexemes=someLexemes
	var _as =function(definition)
	{
		lexemes.forEach((lexeme)=>
		{
			var _trie = this.trie
			for (let i = 0, length =lexeme.length; i < length; i++)
			{
				var character = lexeme.charAt(i)
				_trie = (_trie[character] =_trie[character] || {})
			}
			if (!_trie.definitions)
			{
				_trie.definitions= []
			}
			_trie.definitions.push(definition)
		})	
		return this
	}	
	return {as:_as.bind(this)}	
}
ishml.Lexicon.prototype.register = function (...someLexemes) 
{
	var lexemes=someLexemes
	var _as =function(...definitions)
	{
		lexemes.forEach((lexeme)=>
		{
			var _trie = this.trie
			for (let i = 0, length =lexeme.length; i < length; i++)
			{
				var character = lexeme.charAt(i)
				_trie = (_trie[character] =_trie[character] || {})
			}
			if (!_trie.definitions)
			{
				_trie.definitions= []
			}
			_trie.definitions=_trie.definitions.concat(definitions)
		})	
		return this
	}	
	return {as:_as.bind(this)}	
}
/*ishml.Lexicon.prototype.define = function (definition,...someLexemes) 
{
	someLexemes.forEach((lexeme)=>
	{
		var _trie = this.trie
		for (let i = 0, length =lexeme.length; i < length; i++)
		{
			var character = lexeme.charAt(i)
			_trie = (_trie[character] =_trie[character] || {})
		}
		if (!_trie.definitions)
		{
			_trie.definitions= []
		}
		_trie.definitions.push(definition)
	})	
	return this
}*/
ishml.Lexicon.prototype.search = function (searchText, {regex=false,separator=/^\s+/, caseSensitive=false, longest=false, full=false}={}) 
{
	var _trie = this.trie
	var _results = []
	if(regex)
	{
		var match=searchText.match(regex)
		if (match)
		{
			var result={}
			var definitions=[]
			definitions[0]={fuzzy:true}
			result.token=new ishml.Token(match[0],definitions)
			result.remainder=searchText.slice(match[0].length)
			if (separator && result.remainder.length>0)
			{
				var discard=result.remainder.match(separator)
				if (discard !== null)
				{
					if (discard[0] !==""){result.remainder=result.remainder.slice(discard[0].length)}
					_results.unshift(result)
				}
			}
			else
			{
				_results.unshift(result)
			}
			
		}
		return _results
	}
	else
	{
		for (let i=0; i < searchText.length; i++)
		{
			if (caseSensitive){var character=searchText.charAt(i)}
			else{var character=searchText.charAt(i).toLowerCase()}
			if ( ! _trie[character])
			{	
				if(longest|full)
				{
					_results= _results.slice(0,1)
					if(full && _results[0].remainder.length>0 ){_results=[]}
					else { return _results}
				}
				else
				{
					return _results
				}
			}
			else
			{	
				if(_trie[character].definitions)
				{
					_trie[character].definitions.forEach(definition=>
					{
						if (i<searchText.length-1)
						{	
							
							var result={}
							result.token=new ishml.Token(searchText.substring(0,i+1),definition)
							result.remainder=searchText.substring(i+1).slice(0)
							if (separator)
							{
								var discard=result.remainder.match(separator)
								if (discard !== null)
								{
									if (discard[0] !==""){result.remainder=result.remainder.slice(discard[0].length)}
									_results.unshift(result)
								}
							}
							else
							{
								_results.unshift(result)
							}
						}
						else
						{
							var result={}
							result.token=new ishml.Token(searchText.substring(0),definition)
							result.remainder=""
							_results.unshift(result)
						}	
					})
				}	
				_trie = _trie[character]
			}
		}
	}
	if(longest|full)
	{
		_results= _results.slice(0,1)
		if(full && _results[0].remainder.length>0 ){_results=[]}
	}
	return _results
}

ishml.Lexicon.prototype.unregister=function(lexeme,definition)
{
	var _lexeme=lexeme.toLowerCase()
	var _trie = this.trie
	var j=0
	for (let i=0; i < _lexeme.length; i++)
	{
		var character=_lexeme.charAt(i)
		if ( ! _trie[character])
		{
			return this
		}
		else
		{	
			_trie = _trie[character]
		}
	}
	if (definition !== undefined)
	{
		if (_trie.hasOwnProperty("definitions"))
		{
			_trie.definitions=_trie.definitions.filter((def)=>
			{
				var mismatch=Object.entries(definition).some(([key,value])=>
				{
					if(def[key]!==value)
					{
						return true
					}
				})
				if (mismatch){return true}
				else {return false}	
			})
			if (_trie.definitions.length===0 )
			{
				delete _trie.definitions
			}
		}
	}
	else
	{
		delete _trie.definitions
	}
	return this	
}
// #endregion
// #region Parser
ishml.Parser=function Parser({lexicon,grammar}={})
{
	if (this instanceof ishml.Parser)
	{
		this.lexicon=lexicon
		this.grammar=grammar
	}
	else
	{
		return new Parser({lexicon:lexicon,grammar:grammar})
	}
}
ishml.Parser.prototype.analyze=function(text)
{    
	var interpretations=[]
	var partialInterpretations=[]
	var completeInterpretations=[]
	var {snippets:result}=this.grammar.parse(text,this.lexicon)
	if (result)
	{
		interpretations=interpretations.concat(result)
	}
 	interpretations.forEach((interpretation)=>
	{
		if (interpretation.remainder.length>0)
		{
			partialInterpretations.push(interpretation)
		}
		else
		{
			
			completeInterpretations.push(interpretation)
		}
	})
	if (completeInterpretations.length>0)
	{	var validInterpretations=completeInterpretations.filter(interpretation=>interpretation.valid===true)
		if(validInterpretations.length>0) {return {success:true, interpretations:validInterpretations}}
		else {return {success:true, interpretations:completeInterpretations}}
	}
	else
	{
		if (partialInterpretations.length>0)
		{
			return {success:false, interpretations: partialInterpretations.sort(function(first,second){return first.remainder.length - second.remainder.length})}
		}
		else
		{
			return { success: false}
		}
	}
}

// #endregion
// #region Rule
ishml.Rule=function Rule() 
{
	if (this instanceof ishml.Rule)
	{
		
		Object.defineProperty(this, "caseSensitive", {value:false, writable: true})
		Object.defineProperty(this, "entire", {value:false, writable: true})
		Object.defineProperty(this, "full", {value:false, writable: true})
		Object.defineProperty(this, "filter", {value:(definition)=>true, writable: true})
		Object.defineProperty(this, "greedy", {value:false, writable: true})
		Object.defineProperty(this, "keep", {value:true, writable: true})
		Object.defineProperty(this, "longest", {value:false, writable: true})
		Object.defineProperty(this, "minimum", {value:1, writable: true})
		Object.defineProperty(this, "maximum", {value:1, writable: true})
		Object.defineProperty(this, "mode", {value:ishml.Rule.all, writable: true})
		Object.defineProperty(this, "semantics", {value:(interpretation)=>true, writable: true})
		Object.defineProperty(this, "mismatch", {value:(interpretation)=>false, writable: true})
		Object.defineProperty(this, "separator", {value:/^\s/, writable: true})
		Object.defineProperty(this, "regex", {value:false, writable: true})
		//for composing
		Object.defineProperty(this, "phrases", {value:[], writable: true})
		return this
	}
	else
	{
		return new Rule()
	}
}
ishml.Rule.all=Symbol('all')
ishml.Rule.any=Symbol('any')
ishml.Rule.apt= Symbol('apt')
ishml.Rule.prototype.clone =function()
{
	var circularReferences=new Set()

	function _clone(rule)
	{
		var clonedRule= new ishml.Rule().configure({caseSensitive:rule.caseSensitive, entire:rule.entire, filter:rule.filter, full:rule.full, greedy:rule.greedy, keep:rule.keep,longest:rule.longest, minimum:rule.minimum, maximum:rule.maximum, mode:rule.mode, mismatch:rule.mismatch, regex:rule.regex, semantics:rule.semantics, separator:rule.separator,phrases:rule.phrases})
		var entries=Object.entries(rule)
		entries.forEach(([key,value])=>
		{
			if (circularReferences.has(value))
			{
				clonedRule[key]=value
			}
			else
			{
				circularReferences.add(value)
				clonedRule[key]=_clone(value)
			}
			
		})
		return clonedRule
	}	
	return _clone(this)
}	
ishml.Rule.prototype.configure =function({caseSensitive, entire,filter, full, greedy, keep, longest, minimum,maximum, mode,mismatch, regex, semantics, separator, shuffle, phrases}={})
{

	if(caseSensitive !== undefined){this.caseSensitive=caseSensitive}
	if(entire !== undefined){this.entire=entire}
	if(filter !== undefined){this.filter=filter}
	if(full !== undefined){this.full=full}
	if(greedy !== undefined){this.greedy=greedy}
	if(keep !== undefined){this.keep=keep}
	if(longest !== undefined){this.longest=longest}
	if(minimum !== undefined){this.minimum=minimum}
	if(maximum !== undefined){this.maximum=maximum}
	if(mode !== undefined){this.mode=mode}
	if(mismatch !== undefined){this.mismatch=mismatch}
	if(regex !== undefined){this.regex=regex}
	if(semantics !== undefined){this.semantics=semantics}
	if(separator !== undefined){this.separator=separator}
	if(phrases !== undefined){this.phrases=phrases}
	return this
}
ishml.Rule.prototype.parse =function(text,lexicon)
{
	var someText=text.slice(0)
	var results=[]
	var keys=Object.keys(this)
	if (keys.length>0)
	//non-terminal
	{
		switch (this.mode) 
		{
			case ishml.Rule.all:
				if (this.maximum ===1 ){var candidates=[new ishml.Interpretation({},someText)]}
				else {var candidates=[new ishml.Interpretation([],someText)]}
				var counter = 0
				var phrases=[]
				var revisedCandidates=candidates.slice(0)
				while (counter<this.maximum)
				{
					for (let key of keys)
					{
						revisedCandidates.forEach(candidate=>
						{	
							var {gist,remainder,valid}=candidate
							//SNIP
							if (remainder.length>0)
							{
								var {snippets}=this[key].parse(remainder.slice(0),lexicon) 
								snippets.forEach((snippet)=>
								{
									var phrase=new ishml.Interpretation(gist,snippet.remainder,snippet.valid && valid,candidate.lexeme+remainder.slice(0,remainder.length-snippet.remainder.length))

									if (this.maximum ===1 )
									{
										if(this[key].keep || !phrase.valid){phrase.gist[key]=snippet.gist}
									}
									else 
									{
										if(phrase.gist.length===counter){phrase.gist.push({})}
										if(this[key].keep  || !phrase.valid){phrase.gist[counter][key]=snippet.gist}
									}
									phrases.push(phrase)
								
								})
							}  
						})
						if (this[key].minimum===0)
						{
							revisedCandidates=revisedCandidates.concat(phrases.slice(0))
						}
						else
						{
							revisedCandidates=phrases.slice(0)
						}
						
						phrases=[]
					}
					counter++
					if (revisedCandidates.length===0)
					{
						break
					}
					else
					{
						if (counter >= this.minimum)
						{
							if (this.greedy){results=revisedCandidates.slice(0)}
							else {results=results.concat(revisedCandidates)}
						}
					}
				}
				break
			case ishml.Rule.any:
					if (this.maximum ===1 ){var candidates=[new ishml.Interpretation({},someText)]}
					else {var candidates=[new ishml.Interpretation([],someText)]}
					var revisedCandidates=candidates.slice(0)
					for (let key of keys)
					{
						var counter = 0
						var phrases=[]
						
						while (counter<this.maximum)
						{
							revisedCandidates.forEach(candidate=>
							{
								var {gist,remainder,valid}=candidate
							//SNIP
								if (remainder.length>0)
								{
									var {snippets}=this[key].parse(remainder.slice(0),lexicon) 
									snippets.forEach((snippet)=>
									{
										var phrase=new ishml.Interpretation(gist,snippet.remainder,snippet.valid && valid,candidate.lexeme+remainder.slice(0,remainder.length-snippet.remainder.length))
										if (this.maximum ===1 )
										{
											if(this[key].keep || !phrase.valid){phrase.gist=snippet.gist}
										}
										else 
										{
											if(phrase.gist.length===counter){phrase.gist.push({})}
											if(this[key].keep || !phrase.valid){phrase.gist[counter]=snippet.gist}
										}
										phrases.push(phrase)
										
									})
								}

							})
							if (this[key].minimum===0)
							{
								revisedCandidates=phrases.slice(0)
							}
							else
							{
								revisedCandidates=phrases.slice(0) 
							}
							phrases=[]
							counter++
							if (revisedCandidates.length===0){break}
							else
							{
								if (this.greedy){results=revisedCandidates.slice(0)}
								else {results=results.concat(revisedCandidates)}
							}
						}
						revisedCandidates=candidates.slice(0)  //go see if there are more alternatives that work.	
					}
					break
			case ishml.Rule.apt:
				if (this.maximum ===1 ){var candidates=[new ishml.Interpretation({},someText)]}
				else {var candidates=[new ishml.Interpretation([],someText)]}
				var revisedCandidates=candidates.slice(0)
				for (let key of keys)
				{
					var counter = 0
					var phrases=[]
					
					while (counter<this.maximum)
					{
						revisedCandidates.forEach(candidate=>
						{
							var {gist,remainder,valid}=candidate
							//SNIP
							if (remainder.length>0)
							{
								var {snippets}=this[key].parse(remainder.slice(0),lexicon) 
								snippets.forEach((snippet)=>
								{
									var phrase=new ishml.Interpretation(gist,snippet.remainder,snippet.valid && valid,candidate.lexeme+remainder.slice(0,remainder.length-snippet.remainder.length))
									if (this.maximum ===1 )
									{
										if(this[key].keep || !phrase.valid){phrase.gist=snippet.gist}
									}
									else 
									{
										if(phrase.gist.length===counter){phrase.gist.push({})}
										if(this[key].keep || !phrase.valid){phrase.gist[counter]=snippet.gist}
									}
									phrases.push(phrase)
									
								})
							}

						})
						
						if (this[key].minimum===0)
						{
							
							revisedCandidates=phrases.slice(0)
						}
						else
						{
							revisedCandidates=phrases.slice(0) 
						}
						phrases=[]
						counter++
						if (revisedCandidates.length===0){break}
						else
						{
							if (this.greedy){results=revisedCandidates.slice(0)}
							else {results=results.concat(revisedCandidates)}
						}
					}
					if (results.length>0){break} //found something that works, stop looking.
					revisedCandidates=candidates.slice(0)//try again with next key.	
				}
				break
		}
	}
	else
	{
	//terminal

		if (this.maximum ===1 ){var candidates=[new ishml.Interpretation({},someText)]}
		else {var candidates=[new ishml.Interpretation([],someText)]}
		var revisedCandidates=candidates.slice(0)
		
		var counter = 0
		var phrases=[]
		var rule = this
		while (counter<this.maximum)
		{
			revisedCandidates.forEach((candidate)=>
			{

				var {gist,remainder,valid}=candidate
				//SNIP
				if (remainder.length>0)
				{
					var snippets=lexicon.search(remainder, {regex:rule.regex,separator:rule.separator, caseSensitive:rule.caseSensitive, longest:rule.longest, full:rule.full})

					snippets.forEach((snippet)=>
					{
						if (this.filter(snippet.token.definition))
						{
							var phrase=new ishml.Interpretation(gist,snippet.remainder,snippet.valid && valid,candidate.lexeme+remainder.slice(0,remainder.length-snippet.remainder.length))
							if (this.maximum ===1 )
							{
								if(this.keep || !phrase.valid){phrase.gist=snippet.token}
							}
							else 
							{
								if(phrase.gist.length===counter){phrase.gist.push({})}
								if(this.keep || !phrase.valid){phrase.gist[counter]=snippet.token}
							}
							phrases.push(phrase)
						}	
						
					})
				}
			})
			
			revisedCandidates=phrases.slice(0) //}
			phrases=[]
			counter++
			if (revisedCandidates.length===0)
			{
				
				break
			}
			else
			{
				if (this.greedy){results=revisedCandidates.slice(0)}
				else {results=results.concat(revisedCandidates)}
			}
		}
		
	}	
	results=results.map(interpretation=>
	{
		if(interpretation.remainder.length>0 && this.entire)
		{
			interpretation.valid=false
		}
		return interpretation
	})
	
	if (!results.some(interpretation=>interpretation.valid))
	{
		if (results.length===0){results=candidates}
		results=results.reduce((revisedResults, interpretation) =>
		{
			var revisedInterpretation=this.mismatch(interpretation)
			if (revisedInterpretation)
			{
				if (revisedInterpretation)
				{
					revisedResults.push(revisedInterpretation)
				}
			}
			return revisedResults

		},[])

	}

	results=results.reduce((revisedResults, interpretation) =>
	{
		if (interpretation.valid)
		{
			var revisedInterpretation=this.semantics(interpretation)
			if (revisedInterpretation)
			{
				if (revisedInterpretation === true)
				{
					revisedResults.push(interpretation)
				}
				else
				{
					revisedResults.push(revisedInterpretation)
				}
			}
		}
		else
		{
			revisedResults.push(interpretation)
		}
		return revisedResults

	},[])
	if (results.length>0)
	{
		return {snippets:results}	
	}
	else
	{
		return {snippets:[]}
	}	
}
ishml.Rule.prototype.snip =function(key,rule)
{
	
	if (rule instanceof ishml.Rule)
	{
		this[key]=rule
	}
	else
	{
		this[key]=new ishml.Rule(key)

		this[key].caseSensitive=this.caseSensitive
		this[key].full=this.full
		this[key].longest=this.longest
		this[key].separator=this.separator
		
	}	
	return this		
}
// #endregion
// #region Phrase

ishml.Phrase =class Phrase
{
	constructor(...precursor) 
	{
		Object.defineProperty(this,"id",{value:"",writable:true})
		Object.defineProperty(this,"echo",{value:false,writable:true})
		Object.defineProperty(this,"ended",{value:false,writable:true})
		Object.defineProperty(this,"_locked",{value:false,writable:true})
		Object.defineProperty(this,"_erasable",{value:false,writable:true})
		Object.defineProperty(this,"phrases",{value:[],writable:true})
		Object.defineProperty(this,"re",{value:false,writable:true})
		Object.defineProperty(this,"_property",{value:"",writable:true})
		Object.defineProperty(this,"_results",{value:[],writable:true})
		Object.defineProperty(this,"_seed",{value:ishml.util.random().seed,writable:true})
		Object.defineProperty(this,"_tag",{value:"",writable:true})
		Object.defineProperty(this,"tags",{value:{},writable:true})
		//Object.defineProperty(this,"tally",{value:0,writable:true})
		Object.defineProperty(this,"text",{value:"",writable:true})
		this.fill(...precursor)
		this.catalog()
		return new Proxy(this, ishml.Phrase.__handler)
	}
	get also()  //Joins second phrase if first phrase generates non empty string
	{
		var primaryPhrase=this
		return new Proxy((...precursor) => new class alsoPhrase extends ishml.Phrase
		{
			constructor()
			{
				super()
				this.phrases[0]=primaryPhrase
				this.phrases[1]=new ishml.Phrase(...precursor)
				this.catalog()
			}
			generate()
			{
				var results=this.phrases[0].generate()
				if (results.length>1 || (results.length===1 && results[0].value!==""))
				{
					this.results=results.concat(this.phrases[1].generate())
					this.text=this.toString()
				}
				else
				{
					this.results=results
					this.text=""
				}
				return this.results
			}
		},ishml.template.__handler)
	}
	get when()
	{
		var primaryPhrase=this
		return new Proxy((...precursor) => new class whenPhrase extends ishml.Phrase
		{
			constructor()
			{
				super()
				this.phrases[0]=primaryPhrase
				this.phrases[1]=new ishml.Phrase(...precursor)
				this.catalog()
			}
			generate()
			{
				this.phrases[1].generate()
				if (this.phrases[1].text)
				{
					this.phrases[0].generate()
					this.text=this.phrases[0].text + this.phrases[1].text
					this.results=[{value:this.text}]
				}
				else
				{
					this.results=[{value:""}]
					this.text=""
				}

				return this.results
			}
		},ishml.template.__handler)
	}
	get _() //joins two phrases without space
	{
		var primaryPhrase=this
		return new Proxy((...precursor) => new class spacePhrase extends ishml.Phrase
		{
			constructor()
			{
				super()
				this.phrases[0]=primaryPhrase
				this.phrases[1]=new ishml.Phrase(...precursor)
				this.catalog()
			}
			generate()
			{
				super.generate()
				this.text=this.toString()
				return this.results
			}
		},ishml.template.__handler)
	}
	get spc()  //joins two phrases with space
	{
		var primaryPhrase=this
		return new Proxy((...precursor) => new class spcPhrase extends ishml.Phrase
		{
			constructor()
			{
				super()
				this.phrases[0]=primaryPhrase
				this.phrases[1]=new ishml.Phrase(...precursor)
				this.catalog()
			}
			generate()
			{
				var results1=this.phrases[0].generate()
				var results2=this.phrases[1].generate()
				if (
					(results1.length>1 || (results1.length===1 && results1[0].value!=="")) &&
					(results2.length>1 || (results2.length===1 && results2[0].value!==""))
				){var space=" "}
				else{var space=""}
				
				this.results=results1.concat([{value:space}],results2)
				this.text=this.toString()
				return this.results
			}
		},ishml.template.__handler)
	}
	get spc1()  //joins 2 phrases with space  if first phrase generates non-empty string. 
	{
		var primaryPhrase=this
		return new Proxy((...precursor) => new class spc1Phrase extends ishml.Phrase
		{
			constructor()
			{
				super()
				this.phrases[0]=primaryPhrase
				this.phrases[1]=new ishml.Phrase(...precursor)
				this.catalog()
			}
			generate()
			{
				var results1=this.phrases[0].generate()
				var results2=this.phrases[1].generate()
				if (
					(results1.length>1 || (results1.length===1 && results1[0].value!=="")) &&
					(results2.length>1 || (results2.length===1 && results2[0].value!==""))
				) {this.results=results1.concat([{value:" "}],results2)}
				else {this.results=results1}
				this.text=this.toString()
				return this.results
			}
		},ishml.template.__handler)
	}
	get spc2()  //joins 2 phrases with space  if and only if both phrases genenerate non-empty strings. 
	{
		var primaryPhrase=this
		return new Proxy((...precursor) => new class spc2Phrase extends ishml.Phrase
		{
			constructor()
			{
				super()
				this.phrases[0]=primaryPhrase
				this.phrases[1]=new ishml.Phrase(...precursor)
				this.catalog()
			}
			generate()
			{
				var results1=this.phrases[0].generate()
				var results2=this.phrases[1].generate()
				if (
					(results1.length>1 || (results1.length===1 && results1[0].value!=="")) &&
					(results2.length>1 || (results2.length===1 && results2[0].value!==""))
				) {this.results=results1.concat([{value:" "}],results2)}
				else {this.results=[{value:""}]}
				this.text=this.toString()
				return this.results
			}
		},ishml.template.__handler)
	}
	get comma()  //joins two phrases with , or space
	{
		var primaryPhrase=this
		return new Proxy((...precursor) => new class spacePhrase extends ishml.Phrase
		{
			constructor()
			{
				super()
				this.phrases[0]=primaryPhrase
				this.phrases[1]=new ishml.Phrase(...precursor)
				this.catalog()
			}
			generate()
			{
				var results1=this.phrases[0].generate()
				var results2=this.phrases[1].generate()
				if (
					(results1.length>1 || (results1.length===1 && results1[0].value!=="")) &&
					(results2.length>1 || (results2.length===1 && results2[0].value!==""))
				){var space=", "}
				else{var space=" "}
				
				this.results=results1.concat([{value:space}],results2)
				this.text=this.toString()
				return this.results
			}
		},ishml.template.__handler)
	}

	get comma2()  //joins two phrases with , or period
	{
		var primaryPhrase=this
		return new Proxy((...precursor) => new class spacePhrase extends ishml.Phrase
		{
			constructor()
			{
				super()
				this.phrases[0]=primaryPhrase
				this.phrases[1]=new ishml.Phrase(...precursor)
				this.catalog()
			}
			generate()
			{
				var results1=this.phrases[0].generate()
				var results2=this.phrases[1].generate()
				if (
					(results1.length>1 || (results1.length===1 && results1[0].value!=="")) &&
					(results2.length>1 || (results2.length===1 && results2[0].value!==""))
				){var space=", "}
				else{var space=". "}
				
				this.results=results1.concat([{value:space}],results2)
				this.text=this.toString()
				return this.results
			}
		},ishml.template.__handler)
	}

	append(documentSelector="#story")
	{
		var targetNodes = document.querySelectorAll(documentSelector)
		targetNodes.forEach(node=>node.append(this.htmlTemplate().content))
		return this
	}
	catalog()
	{
		this._catalogUp()
		this._catalogDown()
		return this
	}
	_catalogUp() //add child tags and this tag to this's tags 
	{
		if (this.id)
		{
			this.tags[this.id]=this  //Add this to its own tags
		}
		this.phrases.forEach(phrase=> 
		{
			if (phrase instanceof ishml.Phrase )
			{
				var tags= phrase._catalogUp()  // recursive catalog for sub phrases
				Object.keys(tags).forEach(key=>
				{
					if(!this.tags[key])
					{
						this.tags[key]=tags[key] //add sub phrases to this's tags
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
			if (phrase instanceof ishml.Phrase)
			{
				Object.keys(this.tags).forEach(key=>
				{
					if (!phrase.tags[key])
					{
						phrase.tags[key]=this.tags[key]  //add selfs tags to sub phrses
					}	
					phrase._catalogDown()  //recursively
				})
			}	
		})
	}

//There are three different ways to specify a condition.
//Concur should work like then  _.hobby.concur.person.interest
	concur(tag,condition)
	{
		if (typeof condition ==="function"){var rule=condition}
		else 
		{
			if (condition){var rule = (a,b)=>b.map(item=>item[condition]).includes(a[condition])}
			else {var rule = (a,b)=>b.map(item=>item.value).includes(a.value)}
		}
		return new class concurPhrase extends ishml.Phrase
		{
			generate()
			{
				super.generate()
				this.results=this.results.filter(item=>rule(item,this.tags[tag].results))
				this.text=this.toString()
				return this.results
			}
		}(this)
	}
	/*get data()
	{
		if (this.results.length>0){return this.results[0]}
		else{return {}}
	}*/
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
					result.rank=index+1
					result.subtotal=subtotal
					result.total=total
				})
				this.text=this.toString
				return this.results
			}
		}(this)
	}
	erase(...tags)
	{
		var erasures=tags.flat()
		if (erasures.length===0){erasures=Object.keys(this.tags)}
		erasures.forEach(erasure=>{if (this.tags[erasure]._eraseable){this.tags[erasure].phrases=[]}})
		return this
	}
	generate(phrases=this.phrases)
	{
		this.results=[]
		phrases.forEach((phrase)=>
		{
			if (phrase.generate) 
			{
				this.results=this.results.concat(phrase.generate())
			}
			else
			{
				if(Object.getPrototypeOf(phrase)===Object.prototype)
				{
					if(phrase.hasOwnProperty("value"))
					{
						if (phrase.value.generate){this.results=this.results.concat(phrase.value.generate())}
						else{this.results=this.results.concat(phrase)}
					}
					else
					{
						var values=Object.values(phrase)
						if (values.length>0)
						{
							if (values[0].generate){this.results=this.results.concat(values[0].generate())}
							else{this.results.push(Object.assign({value:values[0]},phrase))}
						}
						else 
						{
							this.results.push({value:""})
						}
					}
				}
				else
				{
					this.results.push({value:phrase})
				}
			}
		})
		this.text=this.toString()
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
		if (this.phrases.length>0 && this.phrases[0] instanceof ishml.Phrase)
		{
			return this.phrases[0]
		}
		else
		{
			return this
		}
	}
	join({separator=" ", trim=true}={})
	{
		return new class joinPhrase extends ishml.Phrase
		{
			generate()
			{
				super.generate()
				var last=this.results.length-1
				this.text=this.results.map(item=>item.value).reduce((result,phrase,index,)=>result+phrase+((index===last && trim)?"":separator),"")	
				if (this.text){this.results=[{value:this.text}]}
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
					result.rank=index+1
					result.subtotal=subtotal
					result.total=total
				})
				return this.results
			}
		}(this)
	}
	get match()
	{
		var thisPhrase=this
		return new Proxy((precursor) => new class matchPhrase extends ishml.Phrase
		{
			constructor()
			{
				super()
				this.phrases[0]=thisPhrase  //hobbies
				this.phrases[1]=precursor  //person
				this.catalog()
			}
			generate()
			{
				var a=this.phrases[0].generate()
				var b= this.phrases[1].generate()
				this.results=a.filter(a=>b.map(item=>item.value).includes(a.value))
				this.text=this.toString()
				return this.results
			}
		},ishml.template.__handler)
	}
	//Unlike expand, modify takes a function to be applied to each of this phrases results.
	modify(modifier,...data)
	{
		if(data.length>0)
		{
			if(data.length===1 && data[0] instanceof ishml.Phrase){var target=data[0]}
		}
		else {var target=this}
		return new class modifyPhrase extends ishml.Phrase
		{
			constructor()
			{
				if (target){super(target)}
				else{super(...data)}
			}
			generate()
			{
				super.generate()
				this.results=this.results.map(item=>
				{
					var modifiedPhrase=Object.assign({},item)
					return Object.assign(modifiedPhrase,{value:modifier(item)})
				})	
				this.text=this.toString()
				return this.results
			}
		}()
	}
	slot(rank)
	{
		return new class slotPhrase extends ishml.Phrase
		{
			constructor(primaryPhrase)
			{
				super(primaryPhrase,rank)
				this.catalog()
			}
			generate()
			{
				super.generate()
				var rank=parseInt(this.phrases[1])
				this.results=[Object.assign({index:rank-1 ,rank:rank ,total:this.results[0].length},this.results[rank-1])]
				this.text=this.toString()
				return this.results
			}
		}(this)
	}
	transform(transformer,...data)
	{
		if(data.length>0)
		{
			if(data.length===1 && data[0] instanceof ishml.Phrase){var target=data[0]}
		}
		else {var target=this}
	
		return new class transformPhrase extends ishml.Phrase
		{
		constructor()
			{
				if (target){super(target)}
				else{super(...data)}
		
			}

			generate()
			{
				this.results=transformer(super.generate().slice(0).map(item=>Object.assign({},item)))
				this.text=this.toString()
				return this.results
			}
		}()
	}
	//_`${_.pick.animal()} `.per.ANIMAL("cat","dog","frog")
	get per()
	{
		var primaryPhrase=this
		return new Proxy((...precursor) => new class perPhrase extends ishml.Phrase
		{
			constructor()
			{
				super()
				this.phrases[0]=primaryPhrase
				if (precursor.length === 1 && precursor[0] instanceof ishml.Phrase){this.phrases[1]=precursor[0]}
				else(this.phrases[1]= new ishml.Phrase(...precursor))
				this.catalog()
				
			}
			generate()
			{
				this.results=[]
				for (let index = 0; index < this.phrases[1].generate().length; index++) {
					this.results=this.results.concat(this.phrases[0].generate())
				}
				this.text=this.toString()
				return this.results	
			}
		},ishml.template.__handler)
	}
	//fill figures out the core phrase to fill
	//_fill formats data and assigns to phrases array.
	//DEFECT: Do we need to catalog after filling?
	fill(...items)
	{
		if (items.length===1 && Object.getPrototypeOf(items[0])===Object.prototype)  //Might be POJO destined for tagged phrases.
		{
			if (!items[0]._tagPhrase)
			{
				this.erase()
				Object.keys(items[0]).forEach(key=>
				{
					if (this.tags.hasOwnProperty(key))
					{
						this.tags[key].erasable=true
						this.tags[key].fill({_tagPhrase:true,_data:items[0][key]}) 
					}
				})
				//this.catalog()
				return this	
			}

		}
		if (this.phrases.length===1 && this.phrases[0] instanceof ishml.Phrase)  //send items down to the core phrase
		{
			this.phrases[0].fill(...items)
			//this.catalog()
			return this	

		}
		//We're at the core so update phrase array with items.

		//this.erase()  //get rid of leftovers from last fill
		if(!(items[0]===undefined) && (Object.getPrototypeOf(items[0])===Object.prototype && items[0]?._tagPhrase))
		{
			this._fill(items[0]._data)
		}
		else {this._fill(...items)}
		//this.catalog()
		return this 
	}
	_fill(literals, ...expressions)
	{
		var data=[]
		if (literals !== undefined)
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
							interleaving.push(expression)
							if (literals[index].length>0)
							{
								interleaving.push(literals[index])
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
						data=literals //avoid wrapping array in array because (a,b,c) is equivalent notation to [a,b,c]
					}
					else //_fill("blah") or _fill(), _fill({properties}) _fill(x=>blah)
					{
						if(literals)
						{	
							data=[literals]
						//	if (literals instanceof ishml.Cord){data=literals.data()} //convert cord to array
						//	else
						//	{
								//if (literals instanceof Object && !(literals instanceof ishml.Phrase) && !(literals //instanceof Function) ){data = literals} // leave object as object Why?
								//else {
								//	if (literals.data){data=literals.data()}
								//	else{data=[literals]}
								//} //convert argument to array
						//	}
						}
						//else {data=[]}
					}
				}
			}
		}				
//		if (data instanceof Array) //normalize array and replace phrases
//		{
		if (data.length===0){this.phrases=data}
		else
		{
			this.phrases=data.map(phrase=> //normalize phrases
			{
				//if (phrase===undefined || phrase === null){return ""}
				var phraseType=typeof phrase
				if(phraseType==="string" ||Object.getPrototypeOf(phrase)===Object.prototype || phrase.generate || phraseType==="function" )
				{return phrase}

				return phrase.toString()
				
				/*
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
				}*/
			})
		}	
	//	}
		/*else  //POJO
		{
			if (data instanceof ishml.Cord){this.phrases[0]={value:data.data()}}
			else {
				this.phrases[0]={value:data}
			}
		}*/
		return this
	}
	prepend(documentSelector="#story")
	{
		var targetNodes = document.querySelectorAll(documentSelector)
		targetNodes.forEach(node=>node.prepend(this.htmlTemplate().content))
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
	reset()
	{ 
		this.phrases.forEach(phrase=>
		{
			if(phrase instanceof ishml.Phrase){phrase.reset()}	
		})
		return this
	}
	get results(){return this._results}
	set results(value){this._results=value}
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
			if(phrase instanceof ishml.Phrase)
			{
				phrase.seed(ishml.util.random(this._seed).seed)
			}	
		})
		return this
	}
	tag(id)
	{
		this.id=id
		this.catalog()
		return this
	}
	lock(id)
	{
		this._locked=true
		return this
	}
	get then()
	{
		var primaryPhrase=this
		return new Proxy((...precursor) => new class thenPhrase extends ishml.Phrase
		{
			constructor()
			{
				super()
				this.phrases[0]=primaryPhrase
				this.phrases[1]=new ishml.Phrase(...precursor)
				this.catalog()
			}
			generate()
			{
				var results=this.phrases[0].generate()
				if (results.length>1 || (results.length===1 && results[0].value!==""))
				{
					this.results=results
					this.text=this.phrases[0].text
				}
				else
				{
					this.results=this.phrases[1].generate()
					this.text=this.phrases[1].text
				}
				return this.results
			}
		},ishml.template.__handler)
	}
	

	//Unlike modify, expand takes a phrase factory and applies the results of this phrase to it.
	expand(phraseFactory)
	{
		var thisPhrase=this
		return new class expandPhrase extends ishml.Phrase
		{
			generate()
			{
				this.results=thisPhrase.generate()
				this.text=this.toString()
				if (this.text)
				{
					if(this.results.length===1 && this.results[0].value instanceof Array)
					{
						this.results=phraseFactory(this.results[0].value).generate().map(item=>Object.assign({},item))	
					}
					else
					{
						this.results=phraseFactory(this.results).generate().map(item=>Object.assign({},item))
					}
					this.text=this.toString()
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
	toString()
	{
		return this.results.map(result=>
		{	
			if (result===undefined){return ""}
			if (Object.getPrototypeOf(result)===Object.prototype)
			{
				if ( result.hasOwnProperty("value"))
				{
					return result.value.toString()
				}
				var value =Object.values(result)[0]
				if (value===undefined){return ""}
				return value.toString()
			}
		}).join("")	
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
ishml.Phrase.__handler=
{
	get: function(target, property, receiver) 
	{
		if (Reflect.has(target,property,receiver)) 
		{
			return Reflect.get(target,property,receiver)
		}
		else 
		{
			if (property.toUpperCase()===property) 
			{
				return new ishml.Phrase(target).tag(property.toLowerCase())
			}
			else
			{
				if(target.constructor.name==="siblingPhrase"){return ishml.template.child(target,property)}
				else{return ishml.template.sibling(target,property)}
			}
		}
	}	
}

// #endregion
// #region Template
ishml.template={}
ishml.template.__handler=
{
	 //_.a.b.c() becomes _.a(b(c()))
	 //_.a.b.c.TAG() becomes _.a(b(c())) c() is tagged
	 //_.a.TAG.b.c() becomes _.a(b(c())) b(c()) is tagged
	 //_.a.b.tag becomes _.a(b(echo(tag)))
	 //_.a.b.tag.data1 becomes _.a(b(data1(echo(tag)))))
	 //_.a.b.tag.data1.data2 becomes _.a(b(datadata1(echo(tag)))))
	 //_.a.tags.b becomes 
	 //_.a.cap.pick("cat","dog","frog")
	 //t=>_.a.cap(t.noun.description.z)

	//if template[asfunction] is undefined, property refers to a tagged phrase.
	get:function(template, property,receiver)
	{
		//template is function that returns a prhase
		if (property==="asFunction")
		{
			return template	 
		}
		//_.a.b.c() becomes _.a(b(c()))
		if (ishml.template.hasOwnProperty(property)) //property is a template
		{
			return new Proxy
			(
				function(...precursor)
				{
					return template(ishml.template[property].asFunction(...precursor))
				},		
				ishml.template.__handler
			)
		}
		//_.a.b.c.TAG() becomes _.a(b(c())) c() is tagged
	 	//_.a.TAG.b.c() becomes _.a(b(c())) b(c()) is tagged
		if (property.toUpperCase()===property)  //property is request to create a tagged phrase
		{
			var finalPhraseFactory=(...precursor)=>template(new ishml.Phrase(...precursor).tag(property.toLowerCase()))
			var priorPhraseFactory=(...precursor)=> new ishml.Phrase(...precursor).tag(property.toLowerCase())
			var handler=Object.assign(
				{
					wrapper:template,
					prior:priorPhraseFactory,
					sibling:true //next property request for sibling
				},
				ishml.template.__handler	
			)
			return new Proxy(finalPhraseFactory,handler)
		}
		if (this.sibling)  //property is request for sibling phrase
		{
			var finalPhraseFactory=()=>this.wrapper(ishml.template.sibling(this.prior(),property))
			var priorPhraseFactory=()=>ishml.template.sibling(this.prior(),property)
			var handler=Object.assign(
				{
					wrapper:this.wrapper,
					prior:priorPhraseFactory,
					child:true  //next property request is for child
				},
				ishml.template.__handler	
			)
			return new Proxy(finalPhraseFactory,handler)			

		}
		if (this.child)
		{
			var finalPhraseFactory=()=>this.wrapper(ishml.template.child(this.prior(),property))
			var priorPhraseFactory=()=>ishml.template.child(this.prior(),property)
			var handler=Object.assign(
				{
					wrapper:this.wrapper,
					prior:priorPhraseFactory,
					child:true  //all future property request are for children
				},
				ishml.template.__handler	
			)
			return new Proxy(finalPhraseFactory,handler)	
		}
		//property is neither request for child nor sibling; must be echo phrase
		var finalPhraseFactory=()=>template(ishml.template.echo(property))
		var priorPhraseFactory=()=>ishml.template.echo(property)
		var handler=Object.assign(
			{
				wrapper:template,
				prior:priorPhraseFactory,
				sibling:true //next property request for sibling
			},
			ishml.template.__handler	
		)
		return new Proxy(finalPhraseFactory,handler)
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
ishml.template._=new Proxy
(
	function _(...data)
	{
		if (data.length===1 && data[0] instanceof ishml.Phrase) return data[0]
		else return new ishml.Phrase(...data)
	}
	,ishml.template.__handler
)
ishml.template.define("cycle").as((...data)=>
{
	var counter=0
	return new class cyclePhrase extends ishml.Phrase
	{
		fill(literals, ...expressions)
		{
			super.fill(literals, ...expressions)
			counter=0
			return this
		}
		generate()
		{
			var results=[]	
			if (this.phrases.length===1 && this.phrases[0] instanceof ishml.Phrase)
			{
				results=super.generate()
				var total=this.results.length
				results=results.slice(counter,counter+1)
			}
			else
			{
				var results=super.generate(this.phrases.slice(counter,counter+1))
				var total=this.phrases.length
			}
			if (this.results.length===0)
			{
				this.results=[{value:"",index:0, rank:0, total:0,  reset:true}]
				this.text=""
				var total=0
			}
			else
			{
				Object.assign(results[0],{index:counter, rank:counter+1,total:total, reset:counter===total-1})
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
ishml.template.echo=function echo(tag)
{
	return new class echoPhrase extends ishml.Phrase
	{
		constructor()
		{
			super()
			if (tag instanceof ishml.Phrase){this.phrases[0]=tag}
			this.echo=true
		}
		generate()
		{
			if (this.phrases.length===0){this.phrases[0]=this.tags[tag]}

			if (this.echo){this.results=this.phrases[0].results}
			else{this.results=this.phrases[0].generate()}
			this.text=this.toString()
		//	this.tally=this.phrases[0].value.tally
			return this.results
		}
		get inner()
		{
			if (this.phrases.length===0){var innerPhrase= echo(this.tags[tag].inner)}
			else {var innerPhrase= echo(this.phrases[0].inner)}
			innerPhrase.echo=this.echo
			return innerPhrase
		}
		get results()
		{
			if (this.phrases.length===0){tag.results}
			else {return super.results}
		}
		set results(value){this._results=value}
	}()		
}
//_.blah.echo.data.data
//_blah.data.data

ishml.template.sibling=function sibling(phrase, property)
{
	return new class siblingPhrase extends ishml.Phrase
	{
		constructor()
		{
			super()
			this.phrases[0]=phrase
		}
		generate()
		{
			this.results=this.phrases[0].generate()
			if (this.results.length===1 && this.results[0][property].generate)
			{
				this.results= this.results[0][property].generate()
			}
			else
			{	
				this.results=this.results.map(result=>({value:result[property]}))
			}	
			/*Object.assign
			(
				{},
				(result[property].data?{value:result[property].data()}:{value:result[property]})
			))*/
			this.text=this.toString()
			//this.tally=this.phrases[0].value.tally
			return this.results
		}
	}()		
}
ishml.template.define("child").as(function child(parent,property)
{
	return new class childPhrase extends ishml.Phrase
	{
		constructor()
		{
			super()
			this.phrases[0]=parent
		}
		generate()
		{
			this.results=this.phrases[0].generate()
			if (this.results.length===1 && this.result[0].value[property].generate)
			{
				this.results= this.results[0].value[property].generate()
			}
			else
			{	
				this.results=this.results.map(result=>({value:result.value[property]}))
			}
			
			/*Object.assign
			(
				{},
				(result.value[property].data?{value:result.value[property].data()}:{value:result.value[property]})
			))*/
			this.text=this.toString()
			//this.tally=this.phrases[0].value.tally
			return this.results
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
		}
		generate()
		{
			var target=this.inner
			this.results=target.generate()
			this.text=target.text
		//	this.tally=target.tally
			return this.results
		}

		get inner()
		{
			var counter=0
			var target=this
			while (target.constructor.name === "antePhrase")
			{
				counter++
				target=target.phrases[0] //.value
			}
			for (let i = 0; i <counter; i++)
			{
				target=target.inner
			}	
			return target
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
			//this.tally++
			return this.results
		}
		else
		{
			var {value:random,seed}=ishml.util.random(this._seed)
			this._seed=seed
			
			if (this.phrases.length===1 && this.phrases[0] instanceof ishml.Phrase)
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
				phrase.rank=counter+1
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
				//this.tally++
				return this.results
			}
			else
			{
				var {value:random,seed}=ishml.util.random(this._seed)
				this._seed=seed
				if (this.phrases.length===1 && this.phrases[0] instanceof ishml.Phrase)
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
					phrase.rank=counter+1
					phrase.total=total
				})
				this.results=results
				return this.results
			}
		}
	}(...data)
})
ishml.template.define("re").as((phrase)=>
{
	phrase.re=true
	return phrase
})

ishml.template.define("cull").as((...precursor)=>
{
	return new class cullPhrase extends ishml.Phrase
	{
		generate()
		{
			super.generate()
			this.results=this.results.reduce((results,item)=>
			{
				if (item.value){ results.push(item)}
				return results
			},[])
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
			//this.tally++
			return this.results
		}
		else
		{
			var {value:random,seed}=ishml.util.random(this._seed)
			this._seed=seed
			if (this.phrases.length===1 && this.phrases[0] instanceof ishml.Phrase)
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
				phrase.rank=counter+1
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
	return new class seriesPhrase extends ishml.Phrase
	{
		fill(literals, ...expressions)
		{
			super.fill(literals, ...expressions)
			this.ended=false
			counter=0
			return this
		}
		generate()
		{
			var results=[]	
			if (this.phrases.length===1 && this.phrases[0] instanceof ishml.Phrase)
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
			if (this.ended || this.results.length===0 )
			{
				this.results=[{value:"",index:0, rank:0, total:0,  reset:true}]
				this.text=""
				var total=0
			}
			else
			{
				Object.assign(results[0],{index:counter, rank:counter+1,total:total})
				this.results=results
				this.text=results[0].value.toString()
			}

			counter++
			if (counter===total)
			{
				this.ended=true
				counter=0
			}
			return this.results
		}
		reset()
		{
			super.reset()
			this.ended=false
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
			this.text=this.toString()
			return this.results
		}
		
		fill(literals, ...expressions)
		{
			super.fill(literals, ...expressions)
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
		fill(literals, ...expressions)
		{
			super.fill(literals, ...expressions)
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
ishml.template.define("spc").as((...precursor)=>
{
	return new class spacePhrase extends ishml.Phrase
	{
		generate()
		{
			super.generate()
			
			this.text=this.toString()
			
			if (this.text!==""){var space=" "}
			else{var space=""}
			this.results.unshift({value:space})
			this.text=space+this.text
			
			return this.results
		}
	}(...precursor)
})

ishml.template.define("next").as(function next(precursor)
{
	precursor.echo=false
	return precursor
})



// #endregion
// #region Token
ishml.Token=function Token(lexeme="",definition)
{
	if (this instanceof ishml.Token)
	{
		this.lexeme=lexeme.slice(0)
		this.definition=definition
		return this
	}
	else
	{
		return new Token(lexeme,definition)
	}
}
ishml.Token.prototype.clone=function() 
{
	return new ishml.Token(this.lexeme,this.definition)
}
// #endregion
// #endregion
ishml.storyline={}  //Episode queue
ishml.history=[] //list of executed commands
ishml.clock=new Date()
ishml.interval= 60000  //1 minute
ishml.turn=1
ishml.plot=new ishml.Plotpoint()
ishml.lexicon=new ishml.Lexicon()
ishml.grammar=new ishml.Rule()
ishml.parser=null
ishml.net=new ishml.Knot("$")

ishml.undoLength=10
ishml.lang={}
ishml.phrasebook_handler=
{
	get: function(target, property,receiver) 
	{ 
		if (Reflect.has(target,property)){return Reflect.get(target,property,receiver)}
		else 
		{
			//magic properties
			target[property]=new Proxy({},ishml.phrasebook_handler)
			return target[property]
		}
	}
}
ishml.phrasebook=new Proxy({},ishml.phrasebook_handler)

ishml.configure=function(options)
{
	//DEFECT TO DO seed, name, author, etc.
}
// #region Interactivity
ishml.harken=function()
{
	var state={dragging:false}
	document.addEventListener('click', (e)=>this.click(e))
	document.addEventListener('keyup', (e)=> this.keyup(e))
	document.addEventListener('mousedown', (e)=> this.mousedown(e,state))
	document.addEventListener('mouseup', (e)=> this.mouseup(e,state))
	document.addEventListener('mousemove', (e)=> this.mousemove(e,state))
	document.addEventListener('transitionend', (e)=> this.transitionend(e,state))

}
ishml.click=function(e)
{
	if (e.target.matches('.ishml-choice'))
	{
		//var episode =ishml.Episode(e.target.dataset,this)()
		//episode.input=e.target.value
		//episode.narrate()
		var twist=Object.assign(
			{
				input:e.target.value,
				moment:ishml.clock
			},e.target.dataset)

		this.history.push(twist)
		
		var plotpoint=twist.plotpiont??ishml.plot.points[twist.plot]??ishml.plot[twist.plot]	
		plotpoint.unfold(twist)
	}
}
ishml.keyup=function(e)
{

	if (e.target.matches('.ishml-input'))
	{
		if (e.keyCode===13)
		{
			//var episode =ishml.Episode(e.target.dataset,this)
			//episode.input=e.target.value
			//episode.narrate()
			var twist=Object.assign(
				{
					input:e.target.value,
					moment:ishml.clock
				},e.target.dataset)
	
			this.history.push(twist)
			
			var plotpoint=twist.plotpiont??ishml.plot.points[twist.plot]??ishml.plot[twist.plot]	
			plotpoint.unfold(twist)

		}
	}
}
ishml.mousedown=function(e,state)
{
	if (e.target.matches('.ishml-draggable'))
	{
		e.preventDefault()
		if(!state.dragging)
		{
			var {top,left}=e.target.getBoundingClientRect()
			state.dragging={}
			state.dragging.clone=e.target.cloneNode(true)
			state.dragging.offset={left:e.clientX-left,top:e.clientY-top}
			state.dragging.originalPosition={left:`${left}px`,top:`${top}px`}
			state.dragging.clone.style.position="fixed"
			state.dragging.clone.style.left=`${e.clientX - state.dragging.offset.left}px`
			state.dragging.clone.style.top=`${e.clientY -state.dragging.offset.top}px`
			state.dragging.original=e.target
			e.target.classList.add("ishml-disappear")
			state.dragging.clone.classList.add("ishml-draggable-dragging")
			document.body.appendChild(state.dragging.clone)
		}
	}
}
ishml.mouseup=function(e,state)
{
	if (state.dragging && !state.dragging.transitioning)
	{

		e.preventDefault()
		if(state.dragging.dropbox)
		{
			this.dropHoverStop({draggable:state.dragging.clone,dropbox:state.dragging.dropbox})
		}
		state.dragging.clone.classList.remove("ishml-draggable-dragging")
		state.dragging.clone.classList.add("ishml-draggable-rejected")
		state.dragging.clone.style.left=state.dragging.originalPosition.left
		state.dragging.clone.style.top=state.dragging.originalPosition.top
		state.dragging.transitions=0
		state.dragging.transitioning=true
	}
}
ishml.mousemove=function(e,state)
{
	if (state.dragging && !state.dragging.clone.matches(".ishml-draggable-rejected"))
	{
		e.preventDefault()
		var left=`${e.clientX - state.dragging.offset.left}px`
		var right=`${e.clientY - state.dragging.offset.top}px`
		state.dragging.clone.style.left="-10000px"
		state.dragging.clone.style.top="-10000px"
		let dropbox = document.elementFromPoint(e.clientX, e.clientY)
		if(dropbox){dropbox=dropbox.closest(".ishml-dropbox")}
		if (state.dragging.dropbox != dropbox) 
		{
			if (state.dragging.dropbox)
			{
				this.dropHoverStop({draggable:state.dragging.clone,dropbox:state.dragging.dropbox })
			}
 			state.dragging.dropbox = dropbox;
			if (state.dragging.dropbox) 
			{ 
				this.dropHoverStart({draggable:state.dragging.clone,dropbox:state.dragging.dropbox})
			}
		}
		state.dragging.clone.style.left=left
		state.dragging.clone.style.top=right
	}
}
ishml.transitionend=function(e,state)
{
	if(e.target===state.dragging.clone && state.dragging.transitioning )
	{
		state.dragging.transitions++

		if (state.dragging.transitions==getComputedStyle(state.dragging.clone).getPropertyValue('--transitions'))
		{
			state.dragging.original.classList.remove("ishml-disappear")
			
			document.body.removeChild(state.dragging.clone)
			state.dragging=false
		}
		//DEFECT missing plotpoint.unfold etc ...
	}
}

ishml.dropHoverStart=function({draggable,dropbox})
{
	draggable.dataset.originalText=draggable.innerText
	draggable.innerText=draggable.innerText + " " +dropbox.innerText
	draggable.classList.add("ishml-draggable-hover")
	dropbox.classList.add("ishml-dropbox-hover")
}
ishml.dropHoverStop=function({draggable,dropbox})
{
	draggable.classList.remove("ishml-draggable-hover")
	draggable.innerText=draggable.dataset.originalText
	dropbox.classList.remove("ishml-dropbox-hover")
}
ishml.dropCheck=function({draggable,dropbox})
{
	var plot=this.plot.points[draggable.dataset.plot]
	if (plot)
	{
		var subplot=this.plot.points[dropbox.dataset.plot]||this.plot[dropbox.dataset.plot]
		var plotpoints=Object.values(plot)
		return plotpoints.includes(subplot)
	}
	return false
}
		
ishml.say=function(aText)
{	
	if (typeof aText === 'string' || aText instanceof String)
	{
		var fragment = document.createElement('template')
    	fragment.innerHTML = aText
    	fragment= fragment.content
	}
	else if(aText instanceof ishml.Passage)
	{
		var fragment=aText.documentFragment()
	}
	else
	{
		var fragment=aText
	}
	var _first = (aDocumentSelector)=>
	{
		var targetNodes=document.querySelectorAll(aDocumentSelector)
		targetNodes.forEach((aNode)=>{aNode.prepend(fragment)})
		return this
	}
	var _last = (aDocumentSelector)=>
	{
		var targetNodes=document.querySelectorAll(aDocumentSelector)
		targetNodes.forEach((aNode)=>{aNode.append(fragment)})
		return this
	}
	var _instead = (aDocumentSelector)=>
	{
		document.querySelectorAll(aDocumentSelector).forEach((aNode) =>
		{
			while(aNode.firstChild){aNode.removeChild(aNode.firstChild)}
			aNode.append(fragment)
		})
		return this
	}
	return {first:_first,last:_last,instead:_instead}
}


ishml.recite=function(literals, ...expressions)
{

		
		let string = ``
		for (const [i, val] of expressions.entries()) {
			string += literals[i] + val
		}
		string += literals[literals.length - 1]
		console.log(string)
		return string+ "test"

}

ishml.restore=function(key)
{
	var yarn = this
	return new Promise(function(resolve, reject)
	{
		
		var db = indexedDB.open("ishml", 1)
		db.onupgradeneeded = function(e)
		{
			this.result.createObjectStore("games", { keyPath: "key" });
			
		}
		db.onerror = function(e)
		{
			console.log("indexedDB: Could not open ishml save game database.")
			reject(e)
		}
		db.onsuccess = function(e)
		{
			var request=this.result.transaction("games").objectStore("games").get(key)
			request.onsuccess= function(e) 
			{
				var game=e.target.result
				if (game)
				{
					yarn.yarnify(game.yarn)
					resolve(game)
				}
				else
				{
					reject(e)
				}
			}

			request.onerror = function(e)
			{
				console.log("indexedDB: Could not retrieve ishml saved game from database.")
				reject(e)
			}
			this.result.close()		
		}	
	})
}	

ishml.save=function(key)
{
	var yarn =this
	
	return new Promise(function(resolve,reject)
	{
		var db = indexedDB.open("ishml", 1)
		db.onupgradeneeded = function(e)
		{
			this.result.createObjectStore("games", { keyPath: "key" });
		}
		db.onerror = function(e)
		{
			console.log(`indexedDB: Could not save ${key} to the database.`)
			failure(e)
		}
		db.onsuccess = function(e)
		{
			var request = this.result.transaction(["games"], "readwrite")
				.objectStore("games")
				.put({key:key,yarn:yarn.stringify()})
				
			request.onsuccess = function(e)
			{
				resolve(e)
			} 
			request.onerror = function(e)
			{
				reject(e)
			}

			this.result.close()
		}	 
	})	
}
// #endregion
// #region storytelling
ishml.tell=function(timeline="player") 
{
	while(this.storyline[timeline].length>0)
	{
		Object.keys(this.storyline).forEach(timeline=>
		{
			this.storyline[timeline].forEach((episode,index)=>
			{
				if (!episode.start() || episode.start() <= this.clock)
				{
					if (episode.resolve(this.clock).told){episode.narrate()}
				}
			})
			this.storyline[timeline]=this.storyline[timeline].filter(episode=>!episode.told)
		})
		this.tick()
	}	
	this.turn++
	return this
}

ishml.introduce=function(episode) 
{
	var timeline=episode.timeline()
	if (!this.storyline.hasOwnProperty(timeline))
	{
		this.storyline[timeline]=[]
	}

	this.storyline[timeline].push(episode)
	return this
}	
// #endregion

/* A turn is a processing of all the episodes on the the storyline.  An episode is a plotpoint.narrate with bound arguments.*/ 

ishml.stringify=function()
{
	var plies=new Map()
	var plyPlies=new Map()
	var knots=new Map()
	var episodes=new Map()	//DEFECT not implemented.
	var index=0
	
	var mapPly=(ply)=>
	{
		if(ply)
		{
			if (!plies.has(ply))
			{
				plies.set(ply, index++)
				plyPlies.set(ply.ply,index++)
				mapKnot(ply.knot)
				mapPly(ply.advance)
				mapPly(ply.retreat)
				mapPly(ply.converse)
				mapKnot(ply.from)	
			}
		}
	}

	var mapKnot=(knot)=>
	{
		if(knot)
		{
			if (!knots.has(knot))
			{
			
				knots.set(knot, index++)
				knot.cords.forEach((cord)=>
				{
					cord.forEach((ply)=>mapPly(ply))
				})
			}
		}
	}

	mapPly(this.net)
	var plyArray=[]
	plies.forEach((uid,ply)=>
	{	
		var safePly={uid:uid}
		safePly.id=ply.id?ply.id:null
		safePly.knot=ply.knot?knots.get(ply.knot):null
		safePly.ply={uid:plyPlies.get(ply.ply), properties:ply.ply}
		safePly.hop=ply.hop
		safePly.cost=ply.cost
		safePly.advance=ply.advance?plies.get(ply.advance):null
		safePly.retreat=ply.retreat?plies.get(ply.retreat):null
		safePly.converse=ply.converse?plies.get(ply.converse):null
		safePly.cord=ply.cord
		safePly.from=ply.from?knots.get(ply.from):null
		plyArray.push(safePly)
	})
	var knotArray=[]
	knots.forEach((uid,knot)=>
	{
		var safeKnot={uid:uid, id:knot.id, cords:{}, properties:{}}
		Object.keys(knot).forEach((key)=>
		{
			if (knot[key] instanceof ishml.Cord)
			{
				safeKnot.cords[key]={}
				Object.keys(knot[key]).forEach((plyKey)=>
				{
					safeKnot.cords[key][plyKey]=plies.get(knot[key][plyKey])
				})
			}
			else
			{
				safeKnot.properties[key]=knot[key]
			}
		})
		knotArray.push(safeKnot)
	})
	return JSON.stringify({knots:knotArray,plies:plyArray,seed:ishml.util._seed})
}
ishml.tick=function(ticks=1)
{
	this.clock.setTime(this.clock.getTime() + (this.interval*ticks))
}
ishml.yarnify=function(savedGame)
{
	var plies={}
	var plyPlies={}
	var knots={}
	var game=JSON.parse(savedGame)
	game.knots.forEach(savedKnot=>
	{
		var knot=new ishml.Knot(savedKnot.id)
		Object.assign(knot,savedKnot.properties)
		knot.id=savedKnot.id
		knots[savedKnot.uid]=knot
		
	})
	game.plies.forEach(savedPly=>
	{
		var ply=new ishml.Ply(savedPly.id,knots[savedPly.knot])
		ply.from=savedPly.from?knots[savedPly.from]:null
		if (!plyPlies.hasOwnProperty(ply.ply.uid))
		{
			ply.ply=savedPly.ply.properties
			plyPlies[savedPly.ply.uid]=ply.ply
		}
		else
		{
			ply.ply=plyPlies[savedPly.ply.uid]
		}

		ply.hop=savedPly.hop
		ply.cost=savedPly.cost
		ply.cord=savedPly.cord
		plies[savedPly.uid]=ply

	})
	game.plies.forEach(savedPly=>
	{
		var ply=plies[savedPly.uid]
		ply.advance=savedPly.advance?plies[savedPly.advance]:null
		ply.retreat=savedPly.retreat?plies[savedPly.retreat]:null
		ply.converse=savedPly.converse?plies[savedPly.converse]:null

	})
	game.knots.forEach(savedKnot=>
	{
		var knot=knots[savedKnot.uid]
		Object.keys(savedKnot.cords).forEach(cordKey=>
		{
			knot[cordKey]={}
			Object.keys(savedKnot.cords[cordKey]).forEach(plyKey=>
			{
				ply=plies[savedKnot.cords[cordKey][plyKey]]
				knot[cordKey][plyKey]=ply
			})
		})

	})
	ishml.util._seed=game.seed
	this.net=plies[0]
	
	return true
}
ishml.retraction=function({seed,undo=()=>true,episode})
{
	var retraction={seed:seed||ishml.util._seed,undo:undo,redo:episode}
	if (!this.undo[this.turn])
	{
		this.undo[this.turn]=new Set()	
	}
	this.undo[this.turn].add(retraction)
	if(undo.length>this.undoLength)
	{
		this.undo.shift()
	}

}
ishml.recant=function()
{
	[...Object.values(this.undo).shift()].reverse.forEach(retraction=>
	{
		ishml.util._seed=retraction.seed
		retraction.undo()

	})
	
		
}
ishml.reintroduce=function()
{
	//redo the undo
	
}
ishml.reify=function(source)
{
	console.log("This function will eventually convert a sub-set of Inform 7 source code into declarations to populate ishml.net")
	return this
}
ishml.reify.lexicon=new ishml.Lexicon()

/*
The garden is east of the gazebo  -- subject copula complement (relation ojbect)
East of the Garden is the Gazebo. -- complement (relation object) subject
Above is the Treehouse.  -- relation copula subject
A billiards table is in the Gazebo. -- subject copula complement (relation ojbect)
On it is a trophy cup. 	-- 
A starting pistol is in the trophy cup.

statment =>	subject copula complement | 
			complement copula subject 

subject => nounPhrase

complement =>	prepositionalPhrase | 
				nounPhrase 

nounPhrase => adjective* noun

noun in subject's nounPhrase indicates an instance of something.
noun in complement's nounPhrase indicate a class.  boat is a vehicle => new ishml.Knot.Vehicle()


 it may be a noun or noun phrase, an adjective or adjective phrase, a prepositional phrase (as above) 

*/
ishml.reify.statements=new ishml.Rule()
	.configure({maximum:Infinity,mode:ishml.Rule.any })
    	.snip("relation").snip("nounPhrase",ishml.grammar.nounPhrase)
ishml.reify.parser=ishml.parser=ishml.Parser({ lexicon: ishml.reify.lexicon, grammar: ishml.reify})