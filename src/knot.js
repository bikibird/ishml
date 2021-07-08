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
		Object.defineProperty(this, "id", {value:id,writable: true}) //
		Object.defineProperty(this, "name", {value:id.replace("_"," "),writable: true}) //local name
		Object.defineProperty(this, "description", {value:this.name,writable: true}) 
		return this 
	}
	get cord()
	{
		//Returns cord with ply representing this knot.
		return new ishml.Cord(this)
	}
	
	get ply()
	{
		//Turns bare knot into a ply.
		return new ishml.Ply(this.id,this)
		
	}

	get cords()
	{
		
		return Object.values(this).filter(cord=>cord instanceof ishml.Cord) 	
	}
	configure(configuration)
	{
		Object.keys(configuration).forEach(key=>
		{
			if (this.hasOwnProperty(key)){this[key]=configuration[key]}
			else{Object.defineProperty(this, key, {value:configuration[key],writable: true}) }
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
		ishml.yarn.lexicon.register(...nouns).as({part:"noun", number:ishml.enum.number.plural, select:new ishml.Cord(this)})
		return this
	}
	realm(hops)
	{
		return new ishml.Cord(this).realm(hops)
	}
	singular(...nouns)
	{
		ishml.yarn.lexicon.register(...nouns).as({part:"noun", number:ishml.enum.number.singular, select:new ishml.Cord(this)})
		return this
	}
	tie(...someCordage)
	{
/*$.thing.cup.tie("cord:ply").to(otherKnot/otherPly) --one-way relation converse===null
$.thing.cup.tie("cord:ply=otherCord:otherPly").to(otherKnot/otherPly) --converse relation converse === another ply
$.thing.cup.tie("cord:ply-otherCord:otherPly").to(otherKnot/otherPly) --mutual relation converse === another ply, but when ply properties updated, other ply is updated automatically because both share the same properties object.
$.thing.cup.tie("cord:ply@otherCord:otherPly").to(otherKnot/otherPly) --reflexive relation converse=== this ply.
DEFECT NOT Implemented: $.thing.cup.tie("cord:ply").back() --reflexive relation converse=== this ply.
*/
		var cordages=someCordage.flat(Infinity).map(cordage=>ishml.Cord.cordage[ishml.util.formatId(cordage)]??cordage).flat(Infinity)
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






