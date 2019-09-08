ISHML.Knot= function Knot(id,value)
{
	if (this instanceof ISHML.Knot)
	{
		Object.assign(this,value)
		Object.defineProperty(this, "id", {value:ISHML.util.formatId(id),writable: true})
		
		return this
	}
	else
	{
		return new Knot(id,value)
	}	
}
//Object.defineProperty(ISHML.Knot.prototype, "path", { get: function() { return []}})
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

/*
$
	.tie("room").to("kitchen")
	.tie("room").to("foyer")

$.room.kitchen
	.tie("exit:north<entrance:south").to($.room.foyer)

$.room.kitchen 

.to(knot) creates a reference to knot with bonus properities

$.room.kitchen.exit.north //foyer knot
$.room.kitchen.exit.north.ply // the ply
$.room.kitchen.exit.north.tie //$.room.kitchen.exit
$.room.kitchen.exit.north.converse // $.room.foyer.entrance.south aka $.room.kitchen


*/			
ISHML.Knot.prototype.tie = function(cordage)
{
	var fromPly=this
	if (this instanceof ISHML.Ply)
	{
		
		var fromKnot=this.knot
	}
	else
	{
		var fromKnot=this
	}
//from is a ply.  Knot is a knot
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
			var toPly=knot
		}
		else
		{
			if (knot instanceof ISHML.Ply)
			{
				var toKnot=knot.knot
				var toPly=knot
			}
			else
			{
				var toKnot=new ISHML.Knot(knot)
				var toPly=toKnot
			}
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
		var ply=new ISHML.Ply(plyId,{toKnot:toKnot,fromPly:fromPly,cord:cord})
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
			var conversePly = new ISHML.Ply(conversePlyId,{toKnot:fromKnot,fromPly:toPly,cord:converseCord,converse:ply})
			ply.converse=conversePly
			conversePly.converse=ply
			toKnot[converseCordId][conversePlyId]=conversePly	
		}

		fromKnot[cordId][plyId]=ply
		return this
	}
	return {to:to, tie:fromKnot.tie.bind(fromKnot)}
}
ISHML.Knot.prototype.cordage=function()
{
	return [this.cord.id, this.ply.id, (this.converse && this.converse.cord.id), (this.converse && this.converse.ply.id)]
}


ISHML.Knot.prototype.understand=function(...someTerms)
{
	var definition={kind:"knot",id:this.id,knot:this,number:"singular",part:"noun"}
	var _as=(aDefinition={})=>
	{
		this.yarn.lexicon.register(...someTerms).as(Object.assign(definition,aDefinition))
		return this
	}
	return {as:_as}
}


ISHML.Knot.prototype.untie = function()
{
/*Knot must have been reached by traveling along a tie.
$.room.kitchen.untie() removes the room tie for kitchen and returns kitchen.knot.
$.room.kitchen.exit.north removes the exit north tie to foyer and returns north.knot, the bare foyer knot.

$.room.kitchen.exit.north.untie()
*/

	var [cordId,plyId,converseCordId,conversePlyId]=this.cordage()
	delete this.from[cordId][plyId]
	if (converseCordId)
	{
	delete this[converseCordId][conversePlyId]
	}
	return this.self
}
ISHML.Knot.prototype.retie = function(cordage)
{
	//$.place.kitchen.contains.knife.retie("in<contains").to($.place.foyer)
	this.untie()

	return this.tie(cordage)
}