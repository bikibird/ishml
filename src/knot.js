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
		
		return this
	}
	toCord(id)
	{
		//Returns cord with ply representing this knot.
		return new ishml.Cord(this.toPly(id||this.id))
	}
	toPly(id)
	{
		//Turns bare knot into a ply.
		return new ishml.Ply(id||this.id,this)
		
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




