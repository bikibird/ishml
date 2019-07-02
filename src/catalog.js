ISHML.Catalog= function Catalog()
{
	if (this instanceof ISHML.Catalog)
	{

		return this
	}
	else
	{
		return new Catalog()
	}
}
ISHML.Catalog.prototype.register = function (aLabel,anItem)
{
	if (anItem instanceof ISHML.Knot)
	{
		if (!this.hasOwnProperty(aLabel))
		{
			this[aLabel]=new ISHML.Mesh()
		}
		this[aLabel].add(anItem)
	}

	return this
} 
ISHML.Catalog.prototype.unregister = function (aLabel,anItem)
{
	if (anItem instanceof ISHML.Knot)
	{
		if (this.knots.hasOwnProperty(aLabel))
		{
			this[aLabel].cut(anItem)
		}
	}
	return this
} 