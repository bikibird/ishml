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
		this.hop=0
		this.cost=0
		/*this.adjunct=null //for adjunctive cording  What????*/
		this.advance=null //a ply created during entwining
		this.retreat=null //a ply created during entwining
		this.converse=null // a ply created during tying for reflexive, mutual and converse
		this.cordId="" // name of of from knot cord where this ply lives
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
	path(destination,{filter=(knot)=>true,minimum=1,maximum=Infinity,via,cost=(ply,leg)=>ply.cost+leg.ply.weight}={})
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
					if (heap[1] > heap[2])
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
			var way=new Set(Object.values(via))
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
	//get plies(){return new ishml.Tangle(this)}
	retie(cordage)
	{
		//$.place.kitchen.contains.knife.retie("in<contains").to($.place.foyer)
		this.untie()
		return this.knot.tie(cordage)
	}
/*	get tangle()
	{
		return new ishml.Tangle(this)
	}
*/	

	untie()
	{
/*Knot must have been reached by traveling along a tie.
$.room.kitchen.untie() removes the room tie for kitchen and returns kitchen.knot.
$.room.kitchen.exit.north removes the exit north tie to foyer and returns north.knot, the bare foyer knot.

$.room.kitchen.exit.north.untie()
*/
		this.from[this.cordId].plies.delete(this)
		delete this.from[this.cordId][this.id]
		var converse=this.converse
		if (converse)
		{
			converse.from[converse.cordId].plies.delete(converse)
			delete converse.from[converse.cordId][converse.id]
		}
		return this
	}
	where(condition)
	{
		try
		{
			if (condition(this)){return this}
			else {return null}
		}
		catch
		{
			return null
		}
	}
	get test(){return this}

}


//custom properties are returned from .ply.  if not found on .ply, then returned from .knot.  Example, description.
ishml.Ply.handler=
{

	get: function(target, property, receiver) 
	{
		//console.log("reciever",receiver)
		
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
				
				return knot[property]
			}
			else {return new ishml.Cord()}
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
