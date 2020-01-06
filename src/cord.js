ishml.Cord= function Cord(id)
{
	//what cords are made of
	if (this instanceof ishml.Cord)
	{
		Object.defineProperty(this,"id",{writable:true, value:id})

		return this
	}	
	else
	{
		return new Cord(id)
	}	
}

Object.defineProperty(ishml.Cord.prototype, "mesh", { get: function() { return new ishml.Mesh(Object.values(this))} })


