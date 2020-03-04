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
		Object.defineProperty(this, "id", {value:id,writable: true}) //local name
		
		return new Proxy(this,ishml.Knot.handler)
	}
	get cord()
	{
		//Returns cord with ply representing this knot.
		return new ishml.Cord(this.toPly(this.id))
	}
	get ply()
	{
		//Turns bare knot into a ply.
		return new ishml.Ply(this.id,this)
		
	}
	get tangle()
	{
		return new ishml.Tangle(this)
	}
	get knots()
	{
		return new ishml.Tangle(this)
	}
	get plies()
	{
		return new ishml.Tangle(this.ply)
	}
	get cords()
	{
		
		return Object.values(this).filter(cord=>cord instanceof ishml.Cord) 	
	}
	configure(value)
	{
		Object.assign(this,value)
	}

}
ishml.Knot.handler=
{
	get: function(target, property,receiver) 
	{
		if (Reflect.has(target,property)){return Reflect.get(target,property,receiver)}
		else {return new ishml.Cord()}
	}
}




