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
	constructor(id,value)
	{
		Object.assign(this,value)
		Object.defineProperty(this, "id", {value:ishml.util.formatId(id),writable: true})
		Object.defineProperty(this, "plies", {value:new WeakMap(),writable: true})
		Object.defineProperty(this, "uid", {value:ishml.util.formatId(),writable: true})
		var ply={id:undefined,weight:1,knot:this,cord:undefined,from:undefined,to:undefined,converse:undefined, hop:0}
		var proxiedKnot= new Proxy(this, ishml.Knot.prototype.handler)
		this.plies.set(proxiedKnot,ply)
		this.knots.set(this.uid,this)  //DEFECT: Needed?
		return proxiedKnot
	}
	get alias()
	{
		var ply={id:undefined,weight:1,knot:this.ply.knot,cord:undefined,from:undefined,to:undefined,converse:undefined, hop:0}
		var proxiedKnot= new Proxy(this.ply.knot, ishml.Knot.prototype.handler)
		this.ply.knot.plies.set(proxiedKnot,ply)
		return proxiedKnot
	}
	configure(knot)
	{
		var id=this.id
		Object.assign(this,knot)
		this.id=id

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
//DEFECT: Needed?
Object.defineProperty(ishml.knot.prototype, "knots", {value:new WeakMap(),writable: true})
ishml.Knot.prototype.handler=
{
	get: function(target, property, receiver) 
	{
		if (property==="ply")
		{	
			var plies=Reflect.get(target,"plies")
			return (plies.get(receiver))
		}
		if (property==="retreat")
		{	
			var plies=Reflect.get(target,"plies")
			return (plies.get(receiver))["retreat"]
		}
		if (property==="advance")
		{	
			var plies=Reflect.get(target,"plies")
			return (plies.get(receiver))["advance"]
		}
		if (property==="hop")
		{	
			var plies=Reflect.get(target,"plies")
			return (plies.get(receiver))["hop"]
		}
		if (property==="converse")
		{	
			var plies=Reflect.get(target,"plies")
			return (plies.get(receiver))["converse"]
		}
		if (property==="cord")
		{	
			var plies=Reflect.get(target,"plies")
			return (plies.get(receiver))["cord"]
		}
		if (property==="weight")
		{	
			var plies=Reflect.get(target,"plies")
			return (plies.get(receiver))["weight"]
		}
		else
		{
			return Reflect.get(target,property)
		}
	},
	set: function(target, property, value, receiver)
	{
		if (property==="ply")
		{
			var plies=Reflect.get(target,"plies")
			plies.get(receiver)=value
			return true
		}
		if (property==="retreat")
		{	
			var plies=Reflect.get(target,"plies")
			plies.get(receiver)["retreat"]=value
			return true
		}
		if (property==="advance")
		{	
			var plies=Reflect.get(target,"plies")
			plies.get(receiver)["advance"]=value
			return true
		}
		if (property==="hop")
		{	
			var plies=Reflect.get(target,"plies")
			plies.get(receiver)["hop"]=value
			return true
		}
		if (property==="converse")
		{	
			var plies=Reflect.get(target,"plies")
			plies.get(receiver)["converse"]=value
			return true
		}
		if (property==="cord")
		{	
			var plies=Reflect.get(target,"plies")
			plies.get(receiver)["cord"]=value
			return true
		}
		if (property==="weight")
		{	
			var plies=Reflect.get(target,"plies")
			plies.get(receiver)["weight"]=value
			return true
		}
		else
		{
			return Reflect.set(target,property,value)
		}
	}	
}

	



	








//knot.twist1=storyline.twist(subject,{twist}) returns proxied subject.
//knot.twist1.prop=7  creates a proxied property see on change libary.