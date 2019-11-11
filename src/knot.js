/*
A knot has
non-enumerable properties
id
uid

enumerable cords
	each cord has a ply:

user defined enumerable properties.
*/ 
ishml.Knot= class IshmlKnot
{
	constructor({id,uid=null})
	{
		Object.defineProperty(this, "uid", {value:uid || ishml.util.formatId(),writable: true})
		Object.defineProperty(this, "id", {value:id,writable: true})
		Object.defineProperty(this, "weight", {value:1,writable: true})
		Object.defineProperty(this, "cord", {value:null,writable: true})
		Object.defineProperty(this, "from", {value:null,writable: true})
		Object.defineProperty(this, "to", {value:null,writable: true})
		Object.defineProperty(this, "converse", {value:null,writable: true})
		Object.defineProperty(this, "hop", {value:0,writable: true})
		if (!uid)
		{
			//Object.assign(ishml.Knot.values[this.uid],value)
			ishml.Knot.knots[this.uid]=this 
		}
		return new Proxy(this, ishml.Knot.handler)
	}
	ply({id=null,weight=1,cord=null,from=null,to=null,converse=null,hop=0}={})
	{
		var alias=id||this.id
		var knot=new ishml.Knot()

		this.uid=this.uid
		this.id=alias
		this.weight=weight || this.weight
		this.cord=cord || this.cord
		this.from=from || this.from
		this.to=to || this.to
		this.converse=converse || this.converse
		this.hop=hop || this.hop
		return knot
	}	
	configure(value)
	{
		Object.assign(ishml.Knot.values[this.uid],value)
	}
	cordage()
	{
		return [this.cord.id, this.ply.id, (this.converse && this.converse.cord.id), (this.converse && this.converse.ply.id)]
	}
	forget(aTerm,aDefinition)
	{
		var definition=Object.assign({kind:"knot",id:this.id},aDefinition)
		this.yarn.lexicon.unregister(aTerm,definition)
		return this
	}
	has(aId)
	{
		if (this.hasOwnProperty(ishml.util.formatId(aId)))
		{
			return true
		}
		else {return false}
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
		this.retreat=undefined
		var queue=[this]
		var visited = new Set()
		var path= []
		while (queue.length>0)
		{
			var knot=queue.shift()
			console.log(knot)
			if (knot.ply.hop<=maximum)
			{
				if (knot.ply.knot===destintation.ply.knot && knot.ply.hop>=minimum)
				{
					//found!
					
					var advanceKnot
					while (knot)
					{
						knot.ply.advance=advanceKnot
						path.unshift(knot)
						advanceKnot=knot
						knot=knot.ply.retreat
					}	
					return {success:true,start:path[0],end:path[path.length-1],path:path}
				}
				else
				{
					if (!visited.has(knot.ply.knot) && filter(knot))
					{
						visited.add(knot.ply.knot)
						Object.values(knot).forEach(cord => 
						{
							if (cord instanceof ishml.Cord && (anyway || way.has(cord.id)) )
							{
								Object.values(cord).forEach((child)=>
								{
									if (!visited.has(child.ply.knot))
									{
										var newKnot=child.alias
										newKnot.ply.retreat=knot
										newKnot.ply.hop=knot.ply.hop+1
										queue.push(newKnot)
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
	retie(cordage)
	{
		//$.place.kitchen.contains.knife.retie("in<contains").to($.place.foyer)
		this.untie()
		return this.tie(cordage)
	}
	tie(cordage)
	{
		//$.place.kitchen.tie("exit:north<entrance:south").to($.place.foyer)
		//$.person.Lizzy.tie("friendship<friendship").to($.person.Charlotte)

		var fromKnot=this

		var [forward,backward]=cordage.split(/[<>]/)
		var [cordId,plyId]=forward.split(":").map(id=>ishml.util.formatId(id.trim()))
		if(!fromKnot.hasOwnProperty(cordId)){fromKnot[cordId]=new ishml.Cord(cordId)}
		if (backward)
		{
			var [converseCordId,conversePlyId]=backward.split(":").map(id=>ishml.util.formatId(id.trim()))	
		}
		
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
			if (!cordId){cordId=ishml.util.formatId()}
			if (!plyId){plyId=toKnot.id||ishml.util.formatId(toKnot.name)}
			
			if (fromKnot.hasOwnProperty(cordId))
			{
				var cord=fromKnot[cordId]
				
			}	
			else
			{
				var cord = new ishml.Cord(cordId)
				fromKnot[cordId]=cord
			}
			var aliasToKnot=toKnot.alias
			aliasToKnot.ply.id=plyId
			aliasToKnot.ply.cord=cord
			if(backward)
			{
				if (toKnot.hasOwnProperty(converseCordId))
				{
					var converseCord=toKnot[converseCordId]
				}
				else
				{
					var converseCord=new ishml.Cord(converseCordId)
					toKnot[converseCordId]=converseCord
					
				}
				if (!conversePlyId){conversePlyId=fromKnot.id||ishml.util.formatId(fromKnot.name)}
				var aliasFromKnot=fromKnot.alias
				aliasFromKnot.ply.id=conversePlyId
				aliasFromKnot.ply.cord=converseCord
				//aliasFromKnot.ply.from=toKnot
				aliasFromKnot.ply.converse=aliasToKnot

				aliasToKnot.ply.converse=aliasFromKnot
				
				toKnot[converseCordId][conversePlyId]=aliasFromKnot	
			}

			fromKnot[cordId][plyId]=aliasToKnot
			return fromKnot
		}
		return {to:to, tie:fromKnot.tie.bind(fromKnot)}
	}
	untie()
	{
/*Knot must have been reached by traveling along a tie.
$.room.kitchen.untie() removes the room tie for kitchen and returns kitchen.knot.
$.room.kitchen.exit.north removes the exit north tie to foyer and returns north.knot, the bare foyer knot.

$.room.kitchen.exit.north.untie()
*/
		var cord=this.ply.cord
		delete cord[this.ply.id]
		var converse=this.ply.converse
		if (this.converse)
		{
			delete converse.ply.cord[converse.ply.id]
		}
		return this
	}
}

Object.defineProperty(ishml.knot, "knots", {value:{},writable: true})
Object.defineProperty(ishml.knot, "values", {value:{},writable: true})
Object.defineProperty(ishml.knot, "cords", {value:{},writable: true})
ishml.Knot.prototype.handler=
{
	get: function(target, property, receiver) 
	{
		var uid=Reflect.get(target,"uid")
		var values= Reflect.get(target,"values")
		if (values[uid].hasOwnProperty(property))
		{
			return values[uid][property]
		}
		var cords= Reflect.get(target,"cords")
		if (cords[uid].hasOwnProperty(property))
		{
			return cords[uid][property]
		}
		else
		{
			return Reflect.get(target,property)
		}
	},
	set: function(target, property, value, receiver)
	{
		var uid=Reflect.get(target,"uid")
		var values= Reflect.get(target,"values")
		if (values[uid].hasOwnProperty(property))
		{
			values[uid][property]=value
		}
		var cords= Reflect.get(target,"cords")
		if (cords[uid].hasOwnProperty(property))
		{
			cords[uid][property]=value
		}
		else
		{
			return Reflect.set(target,property,value)
		}
	}	
}


//knot.twist1=storyline.twist(subject,{twist}) returns proxied subject.
//knot.twist1.prop=7  creates a proxied property see on change libary.