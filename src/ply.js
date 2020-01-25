/*
A knot has
non-enumerable properties
id
uid

enumerable cords
	each cord has a ply:

Cords only no other user defined properties.  twists are a set of plotpoints that apply to the ply.
*/ 
ishml.Knot= class Knot
{
	constructor(id,uid)
	{
		Object.defineProperty(this, "uid", {value:uid || ishml.util.formatId(),writable: true})
		Object.defineProperty(this, "id", {value:id,writable: true})
		Object.defineProperty(this, "plyId", {value:id,writable: true})
		Object.defineProperty(this, "ply", {value:{
			plyId:id,
			knot1:this,
			knot2:null, 
			twists:{},
			weight:1,
			cord:null,
			advance:null,
			retreat:null,
		//converse:null,
			via:"",
			hop:0}
		,writable: true})

		if (!uid)
		{
//			ishml.Knot.knots[this.uid]=this 
			ishml.Knot.values[this.uid]={}
//			ishml.Knot.cords[this.uid]={}
		}

		return new Proxy(this, ishml.Knot.handler)
	}
	get mesh()
	{
		return new ishml.Mesh(this)
	}
	plait({plyId=null,weight=1,cord=null,advance=null,retreat=null,converse=null,hop=0,via="",twists={}}={})
	{
		//creates alias of 

		var knot=new ishml.Knot(this.id,this.uid)
		knot.plyId=plyId||this.id
		knot.weight=weight
		knot.cord=cord 
		knot.advance=advance 
		knot.retreat=retreat 
		knot.converse=converse 
		knot.hop=hop 
		knot.via=via
		return knot
	
	}

	get cords()
	{
		
		return Object.values(this).filter(cord=>cord instanceof ishml.Mesh) 	
	}
	configure(value)
	{
		Object.assign(ishml.Knot.values[this.uid],value)
	}

	entwine({knot,via=null,condition=()=>true})
	{
	
		if(knot.hasOwnProperty(via) && knot[via] instanceof ishml.Mesh)
		{
			if(knot[via].has(otherKnot))
			{
				if (condition(knot,otherKnot))
				{
					var head=knot.plait()
					var tail=otherKnot.plait()
					head.advance=tail
					head.via=via
					tail.retreat=head
				}
			}

		}
		else
		{
			var head=knot.plait()
			var tail=otherKnot.plait()
			head.advance=tail
			head.via=via
			tail.retreat=head
		}		
		return tail
	}	

	forget(aTerm,aDefinition)
	{
		var definition=Object.assign({kind:"knot",id:this.id},aDefinition)
		this.yarn.lexicon.unregister(aTerm,definition)
		return this
	}

	has(property)
	{

		if (this.hasOwnProperty(property))
		{
			return true
		}
		else
		{
			return false
		}
	}
	
	path(destintation,{filter=(knot)=>true,minimum=1,maximum=Infinity,via,cost}={})
	{
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
		var queue=[this]
		var visited = new Set()
		var path= []
		while (queue.length>0)
		{
			var knot=queue.shift()
			
			if (knot.hop<=maximum)
			{
				if (knot.uid===destintation.uid && knot.hop>=minimum)
				{
					//found!
					var advanceKnot
					while (knot)
					{
						knot.advance=advanceKnot
						path.unshift(knot)
						advanceKnot=knot
						knot=knot.retreat
					}	
					return {success:true,start:path[0],end:path[path.length-1],path:path}
				}
				else
				{
					if (!visited.has(knot) && filter(knot))
					{
						visited.add(knot)
						knot.cords.forEach(cord => 
						{
							if (anyway || way.has(cord.id) )
							{
								Object.values(cord).forEach((child)=>
								{
									if (!visited.has(child))
									{
										queue.push(child.plait({retreat:knot,via:cord.id,hop:knot.hop+1}))
									}
								})
							}	
						})
					}
				}
			}		
		}
		return {success:false,start:false,end:false,path:[]}  //not found
	}
	plait({plyId=null,weight=1,cord=null,advance=null,retreat=null,converse=null,hop=0,via="",twists={}}={})
	{
		//creates alias of 

		var knot=new ishml.Knot(this.id,this.uid)
		knot.plyId=plyId||this.id
		knot.weight=weight
		knot.cord=cord 
		knot.advance=advance 
		knot.retreat=retreat 
		knot.converse=converse 
		knot.hop=hop 
		knot.via=via
		return knot
	
	}
	retie(cordage)
	{
		//$.place.kitchen.contains.knife.retie("in<contains").to($.place.foyer)
		this.untie()
		return this.tie(cordage)
	}

	tie(...someCordage)
	{
		//$.place.kitchen.tie("exit:north<entrance:south").to($.place.foyer)
		//$.person.Lizzy.tie("friendship<friendship").to($.person.Charlotte)

		var fromKnot=this

		var to = (knot)=>
		{
			if (knot instanceof ishml.Knot)
			{
				var toKnot=knot
			}
			else
			{
				var toKnot=new ishml.Knot(knot)
			}
			someCordage.forEach((cordage)=>
			{
				
				var [forward,backward]=cordage.split(/[<>]/)
				var [cordId,plyId]=forward.split(":").map(id=>ishml.util.formatId(id.trim()))
				if(!fromKnot.has(cordId)){fromKnot[cordId]=new ishml.Mesh().cord(cordId)}
				if (backward)
				{
					var [converseCordId,conversePlyId]=backward.split(":").map(id=>ishml.util.formatId(id.trim()))	
				}

				
				if (!cordId){cordId=ishml.util.formatId()}
				if (!plyId){plyId=toKnot.id}
				
				if (fromKnot.has(cordId))
				{
					var cord=fromKnot[cordId]
					
				}	
				else
				{
					var cord = new ishml.Mesh().cord(cordId)
					fromKnot[cordId]=cord
				}
				var aliasToKnot=toKnot.plait({plyId:plyId,cord:cord})
				if(backward)
				{
					if (toKnot.has(converseCordId))
					{
						var converseCord=toKnot[converseCordId]
					}
					else
					{
						var converseCord=new ishml.Mesh().cord(converseCordId)
						toKnot[converseCordId]=converseCord
						
					}
					if (!conversePlyId){conversePlyId=fromKnot.id}
					var aliasFromKnot=fromKnot.plait({plyId:conversePlyId,cord:converseCord, converse:aliasToKnot})
					/*aliasFromKnot.ply.id=conversePlyId
					aliasFromKnot.ply.cord=converseCord
					//aliasFromKnot.ply.from=toKnot
					aliasFromKnot.ply.converse=aliasToKnot*/

					aliasToKnot.converse=aliasFromKnot
					
					toKnot[converseCordId][conversePlyId]=aliasFromKnot	
				}

				fromKnot[cordId][plyId]=aliasToKnot

			})
			
			return fromKnot
		}
		//return {to:to, tie:fromKnot.tie.bind(fromKnot)}
		return {to:to}
	}
	
	untie()
	{
/*Knot must have been reached by traveling along a tie.
$.room.kitchen.untie() removes the room tie for kitchen and returns kitchen.knot.
$.room.kitchen.exit.north removes the exit north tie to foyer and returns north.knot, the bare foyer knot.

$.room.kitchen.exit.north.untie()
*/
		var cord=this.cord
		delete cord[this.id]
		var converse=this.converse
		if (this.converse)
		{
			delete converse.cord[converse.id]
		}
		return this
	}
	get value()
	{
		return ishml.Knot.values[this.uid]
	}
}

ishml.Knot.knots={}
//ishml.Knot.cords={}
//ishml.Knot.values={}

ishml.Knot.handler=
{
	get: function(target, property, receiver) 
	{
		if(property==="from")
		{
			var ply=Reflect.get(target,"ply")
			if (Reflect.get(target,"uid")===ply[knot1][uid])
			{
				return ply[knot2]
			}
			else
			{
				return ply[knot1]
			}
		
		}
		if(property==="plyId" || property==="cord" || property==="converse" || property==="advance" ||property==="retreat" || property==="hop")
		{
			var ply=Reflect.get(target,"ply")
			return ply[property]
		}
		var uid=Reflect.get(target,"uid")
		var values=ishml.Knot.knots
		if (values[uid].hasOwnProperty(property))
		{
			return values[uid][property]
		}
		else
		{
			return Reflect.get(target,property)
		}
	},
	set: function(target, property, value, receiver)
	{
		

		if(property==="plyId" || property==="cord" || property==="converse" || property==="advance" ||property==="retreat" || property==="hop")
		{
			var ply=Reflect.get(target,"ply")
			ply[property]=value
			return true
		}
		
		var uid=Reflect.get(target,"uid")
		var values=ishml.Knot.knots
		if (values[uid].hasOwnProperty(property))
		{
			values[uid][property]=value
			return true
		}
		else
		{
			return Reflect.set(target,property,value)
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
