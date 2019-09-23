ISHML.Knot= function Knot(id,value)
{
	if (this instanceof ISHML.Knot)
	{
		if (id instanceof ISHML.Knot)
		{
			var knot=id.ply.knot
			
		}
		else
		{
			var knot=this
			Object.assign(knot,value)
			Object.defineProperty(knot, "id", {value:ISHML.util.formatId(id),writable: true})
			Object.defineProperty(knot, "plies", {value:new WeakMap(),writable: true})
			
		}
		
		var ply={id:undefined,weight:()=>1,knot:knot,cord:undefined,from:undefined,to:undefined,converse:undefined, hop:0}
		var proxiedKnot= new Proxy(knot, ISHML.Knot.prototype.handler)
		knot.plies.set(proxiedKnot,ply)
		return proxiedKnot
	}
	else
	{
		return new Knot(id,value)
	}	
}

ISHML.Knot.prototype.handler=
{
	get: function(target, property, receiver) 
	{
		if (property==="ply")
		{	
			var plies=Reflect.get(target,"plies")
			return (plies.get(receiver))
		}
		if (property==="from")
		{	
			var plies=Reflect.get(target,"plies")
			return (plies.get(receiver))["from"]
		}
		if (property==="to")
		{	
			var plies=Reflect.get(target,"plies")
			return (plies.get(receiver))["to"]
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
		if (property==="from")
		{	
			var plies=Reflect.get(target,"plies")
			plies.get(receiver)["from"]=value
			return true
		}
		if (property==="to")
		{	
			var plies=Reflect.get(target,"plies")
			plies.get(receiver)["to"]=value
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

ISHML.Knot.prototype.configure=function(knot)
{
	var id=this.id
	Object.assign(this,knot)
	this.id=id

}	
ISHML.Knot.prototype.forget=function(aTerm,aDefinition)
{
	var definition=Object.assign({kind:"knot",id:this.id},aDefinition)
	this.yarn.lexicon.unregister(aTerm,definition)
	return this
}

ISHML.Knot.prototype.has=function(aId)
{
	if (this.hasOwnProperty(ISHML.util.formatId(aId)))
	{
		return true
	}
	else {return false}
}
	
ISHML.Knot.prototype.tie = function(cordage)
{
	var fromKnot=this

	var [forward,backward]=cordage.split(/[<>]/)
	var [cordId,plyId]=forward.split(":").map(id=>ISHML.util.formatId(id.trim()))
	if(!fromKnot.hasOwnProperty(cordId)){fromKnot[cordId]=new ISHML.Cord(cordId)}
	if (backward)
	{
		var [converseCordId,conversePlyId]=backward.split(":").map(id=>ISHML.util.formatId(id.trim()))	
	}
	
	var to = (knot)=>
	{
		if (knot instanceof ISHML.Knot)
		{
			var toKnot=knot
		}
		else
		{
			var toKnot=new ISHML.Knot(knot)
		}
		if (!cordId){cordId=ISHML.util.formatId()}
		if (!plyId){plyId=toKnot.id||ISHML.util.formatId(toKnot.name)}
		
		if (fromKnot.hasOwnProperty(cordId))
		{
			var cord=fromKnot[cordId]
			
		}	
		else
		{
			var cord = new ISHML.Cord(cordId)
			fromKnot[cordId]=cord
		}
		var aliasToKnot=new ISHML.Knot(toKnot)
		aliasToKnot.ply.id=plyId
		aliasToKnot.ply.cord=cord
		//aliasToKnot.ply.from=fromKnot
		if(backward)
		{
			if (toKnot.hasOwnProperty(converseCordId))
			{
				var converseCord=toKnot[converseCordId]
			}
			else
			{
				var converseCord=new ISHML.Cord(converseCordId)
				toKnot[converseCordId]=converseCord
				
			}
			if (!conversePlyId){conversePlyId=fromKnot.id||ISHML.util.formatId(fromKnot.name)}
			var aliasFromKnot=new ISHML.Knot(fromKnot)
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
ISHML.Knot.prototype.track=function(journal)
{
	if (journal instanceof Set)
	{
		journal.add(this)
	}
	else
	{
		journal.push(this)
	}
	return this
}

ISHML.Knot.prototype.cordage=function()
{
	return [this.cord.id, this.ply.id, (this.converse && this.converse.cord.id), (this.converse && this.converse.ply.id)]
}

ISHML.Knot.prototype.untie = function()
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
ISHML.Knot.prototype.retie = function(cordage)
{
	//$.place.kitchen.contains.knife.retie("in<contains").to($.place.foyer)
	this.untie()
	return this.tie(cordage)
}
ISHML.Knot.prototype.path=function(destintation,{filter=(knot)=>true,minimum=1,maximum=Infinity,via,cost}={})
{
	if (via)
	{
		var way=new Set(Object.values(via))
		var anyway=false
	}
	{
		var anyway=true
	}	
	this.from=undefined
	var queue=[this]
	var visited = new Set()
	var path= []
	while (queue.length>0)
	{
		var knot=queue.shift()
		if (knot.ply.hop<=maximum)
		{
			if (knot.ply.knot===destintation.ply.knot && knot.ply.hop>=minimum)
			{
				//found!
				
				var toKnot
				while (knot)
				{
					knot.ply.to=toKnot
					path.unshift(knot)
					toKnot=knot
					knot=knot.ply.from
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
						if (cord instanceof ISHML.Cord && (anyway || way.has(cord.id)) )
						{
							Object.values(cord).forEach((child)=>
							{
								if (!visited.has(child.ply.knot))
								{
									queue.push(child.trail(knot))
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
ISHML.Knot.prototype.trail=function(knot)
{
	var newKnot=new ISHML.Knot(this)
	newKnot.ply.from=knot
	newKnot.ply.hop=knot.ply.hop+1
	return newKnot
}

//knot.twist1=storyline.twist(subject,{twist}) returns proxied subject.
//knot.twist1.prop=7  creates a proxied property see on change libary.