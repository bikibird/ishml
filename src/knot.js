ISHML.Knot= function Knot(aYarn,aKey,aValue)
{
	if (this instanceof ISHML.Knot)
	{
		Object.assign(this,aValue)
		Object.defineProperty(this, "key", {value:ISHML.util.formatKey(aKey),writable: true})
		//Object.defineProperty(this, "$", {value:aValue,writable: true})
		Object.defineProperty(this, "yarn", {value:aYarn})
		return this
	}
	else
	{
		return new Knot(aYarn,key,aValue)
	}	
}
ISHML.Knot.prototype.fold=function(aKnot)
{
	//merges proprties from aKnot to this knot
	Object.assign(this,aKnot)
	Object.entries(aKnot).forEach(([key,value])=>
	{
		if (value instanceof ISHML.Tie)
		{
			if(!this.hasOwnProperty(key))
			{
				this[key]=value
			}
			else
			{
				Object.assign(this[key],value)
			}
		}
		else
		{
			if(!this.hasOwnProperty(key))
			{
				this[key]=value
			}
		}
	})

}	
ISHML.Knot.prototype.forget=function(aTerm,aDefinition)
{
	var definition=Object.assign({kind:"knot",key:this.key},aDefinition)
	this.yarn.lexicon.unregister(aTerm,definition)
	return this
}

ISHML.Knot.prototype.has=function(aKey)
{
	if (this.hasOwnProperty(ISHML.util.formatKey(aKey)))
	{
		return true
	}
	else {return false}
}
ISHML.Knot.prototype.label=function(...someLabels)
{
	someLabels.forEach((label)=>
	{
		this.yarn.catalog.register(label,this)
		if (!this.hasOwnProperty(label))
		{
			this.yarn.catalog.register(label,this)
			this[label]=true
			//Object.defineProperty(this, label, {value:true,writable: true})
		}
	})
	return this
}
/*ISHML.Knot.prototype.path=function(aDestinationKnot)
{
	//shortest according to ply value?
	//longest?
	//random walk? 
	var _via =function(...someTies)
	{

	}
	yield plies
}*/


ISHML.Knot.prototype.tie = function(aKey,aPlyValue)
{
	//Create Tie property if it does not already exist
	//Knot.tie(aKey,aValue).to(anotherKnot).mutually(anotherValue)
	//story.net.player.tie("friendship",8).to(story.net.Lizzy).mutually(6)

	var thisKnot=this
	var otherKnot
	var otherTieKey
	var tieKey=ISHML.util.formatKey(aKey)
	
	if (!thisKnot.hasOwnProperty(tieKey))
	{
		thisKnot.yarn.catalog.register(tieKey,thisKnot)
		thisKnot[tieKey]=new ISHML.Tie() 
	}
	//var thisKnot=this  //player
	var _to = (anotherKnot, aValue={})=>
	{
		if (anotherKnot instanceof ISHML.Knot)
		{
			
			otherKnot=anotherKnot
		}
		else
		{
			var otherKnotKey=ISHML.util.formatKey(anotherKnot)
			if (thisKnot.yarn.net.hasOwnProperty(otherKnotKey))
			{
				otherKnot=thisKnot.yarn.net[otherKnotKey]
			}
			else
			{
				otherKnot=thisKnot.yarn.net.knot(otherKnotKey,aValue)
			}
		}

		var ply=ISHML.Ply(otherKnot,aPlyValue)
		thisKnot[tieKey][`${otherKnot.key}_`]=ply

		return {mutually:_mutually,conversely:_conversely,to:_to}
	}

	var _mutually =(otherTieValue)=>
		{
			if (!otherKnot.hasOwnProperty(tieKey))
			{
				thisKnot.yarn.catalog.register(tieKey,otherKnot)
				otherKnot[tieKey]=new ISHML.Tie()
			}
		
			var ply=ISHML.Ply(thisKnot)
			if(otherTieValue===undefined)
			{
				ply.weight=aPlyValue
			}
			else
			{
				ply.weight=anotherPlyValue
			}
			ply.converse=tieKey
			
			otherKnot[tieKey][`${thisKnot.key}_`]=ply
			thisKnot[tieKey][`${otherKnot.key}_`].converse=tieKey
			return {to:_to,tie:thisKnot.tie.bind(thisKnot)}
		}
		var _conversely = (anotherTieKey,anotherPlyValue)=>
		{

			otherTieKey=ISHML.util.formatKey(anotherTieKey)
			
			if (!otherKnot.hasOwnProperty(otherTieKey))
			{
				
				thisKnot.yarn.catalog.register(otherTieKey,otherKnot)
				otherKnot[otherTieKey]=new ISHML.Tie()
			}
			//var thisPlyKey=thisKnot.key
			var ply=ISHML.Ply(thisKnot)
			if(anotherPlyValue===undefined)
			{
				ply.weight=aPlyValue
			}
			else
			{
				ply.weight=anotherPlyValue
			}
			ply.converse=tieKey
			otherKnot[otherTieKey][`${thisKnot.key}_`]=ply
			thisKnot[tieKey][`${otherKnot.key}_`].converse=otherTieKey
			return {to:_to,tie:thisKnot.tie.bind(thisKnot)}
		}

	return {to:_to}
}
ISHML.Knot.prototype.ties=function(...someTieKeys)
{
	var result=new ISHML.Tie()
	someTieKeys.forEach((tie)=>
	{
		var tieKey=ISHML.util.formatKey(tie)
		if (this.hasOwnProperty(tieKey))
		{
			Object.assign(result,this[tieKey])
		}
	})

	return result
}
ISHML.Knot.prototype.toMesh=function(){return new ISHML.Mesh(this)}



ISHML.Knot.prototype.understand=function(...someTerms)
{
	var definition={kind:"knot",key:this.key,knot:this,number:"singular",part:"noun"}
	var _as=(aDefinition={})=>
	{
		this.yarn.lexicon.register(...someTerms).as(Object.assign(definition,aDefinition))
		return this
	}
	return {as:_as}
}

ISHML.Knot.prototype.unlabel=function(...someLabels)
{
	someLabels.forEach((label)=>
	{
		this.yarn.catalog.unregister(label,this)
		delete this[label]
	})
	return this
}
ISHML.Knot.prototype.untie = function(aKey)
{
	//deletes a ply from a tie.
	//Knot.untie(aKey,aValue).from(anotherKnot)
	//story.net.player.untie("friendship",8).from(story.net.Lizzy)
	//
	var thisKnot=this
	if (aKey instanceof ISHML.Tie)
	{
		var tieKey=aKey.key
	}
	else
	{
		var tieKey=ISHML.util.formatKey(aKey)
	}

	var _from =(anotherKnot)=>
	{

		if (anotherKnot instanceof ISHML.Knot)
		{
			
			var otherKnot=anotherKnot
		}
		else
		{
			var otherKnot=thisKnot.yarn.net[ISHML.util.formatKey(anotherKnot)]
		}
	
		var plyKey=`${otherKnot.key}_`
		var converseTieKey=thisKnot[tieKey].converse
		delete thisKnot[tieKey][plyKey]
	
		if (converseTieKey)
		{
			var conversePlyKey=`${thisKnot.key}_`
			delete otherKnot[converseTieKey][conversePlyKey]
		}		
		return thisKnot
	}
	var _all = (removeTie)=>
	{
		var converseTieKey=thisKnot[tieKey].converse
		
		var conversePlyKey=`${thisKnot.key}_`
		Object.keys(thisKnot[tieKey]).forEach((ply)=>
		{
			if (converseTieKey)
			{
				delete thisKnot[tieKey][ply].knot[converseTieKey][conversePlyKey]
				if (removeTie && Object.keys(thisKnot[tieKey][ply].knot[converseTieKey]).length >0)
				{
					delete thisKnot[tieKey][ply].knot[converseTieKey]
				}
			}	
			delete thisKnot[tieKey][ply]
		})

		
		if (removeTie)
		{
			delete thisKnot[tieKey]
		}	
		return thisKnot	
	}

	return {from:_from,all:_all}
}