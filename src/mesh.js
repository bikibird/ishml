ISHML.Mesh= function Mesh(aYarn)
{
	if (this instanceof ISHML.Mesh)
	{
		Object.defineProperty(this, "yarn", {value:aYarn,writable: true})
		
		return this
	}
	else
	{
		return new Mesh(aYarn)
	}	
}

Object.defineProperty(ISHML.Mesh.prototype, "size", { get: function() { return Object.keys(this).length} })

ISHML.Mesh.prototype.add=function(...someKnots)
{
	someKnots.forEach((knot)=>
	{
		if (knot instanceof ISHML.Knot)
		{
			this[knot.key]=knot
		}
		else if (knot instanceof ISHML.Ply)
		{
			this[knot.knot.key]=knot.knot
		}
		else if (knot instanceof Array)
		{
			knot.forEach((item)=>
			{
				if (item instanceof ISHML.Knot)
				{
					this[item.key]=item
				}
				else if (item instanceof ISHML.Ply)
				{
					this[item.knot.key]=item.knot
				}
				else
				{
					var key=ISHML.util.formatKey(item.key)
					this[key]=new ISHML.Knot(this.yarn,key)
				}
			})
		}
		else if(knot instanceof ISHML.Mesh)
		{
			Object.entries(knot).forEach(([key,value])=>
			{
				this[key]=value
			})
		}
	})
	return this
}
ISHML.Mesh.prototype.cut=function(aKey)
{	
	if (aKey instanceof ISHML.Knot)
	{
		var key=aKey.key
	}
	else
	{
		var key=ISHML.util.formatKey(aKey)
	}	
	var deletedKnot = Object.assign({}, this[key])
	delete this[key]
	return deletedKnot
}
ISHML.Mesh.prototype.disjoin = function(aMesh)
{
	var result=new ISHML.Mesh(this.yarn)
	if (aMesh instanceof ISHML.Mesh)
	{
		var mesh=aMesh
	}
	else
	{
		var mesh=new ISHML.Mesh(this.yarn)
		mesh.add(aMesh)
	}	
	Object.entries(this).forEach(([key,value])=>
	{
		if (!mesh.hasOwnProperty(key))
		{
			result[key]=value
		}
	})
	Object.entries(mesh).forEach(([key,value])=>
	{
		if (!this.hasOwnProperty([key]))
		{
			result[key]=value
		}
	})
	
	return result
}
ISHML.Mesh.prototype.hasPlies = function(...someTieKeys)
{
	var result=new ISHML.Mesh(this.yarn)
	someTieKeys.forEach((tieKey)=>
	{
		var _tieKey=ISHML.util.formatKey(tieKey)
		Object.keys(this).forEach((key)=>
		{
			if (this[key].hasOwnProperty(_tieKey))
			{	
				if(this[key][_tieKey].plies.length>0)
				{
					result[key]=this.key
				}
			}
		})
	})
	return result
}


ISHML.Mesh.prototype.join = function(aMesh)
{
	var result=new ISHML.Mesh(this.yarn)
	if (aMesh instanceof ISHML.Mesh)
	{
		var mesh=aMesh
	}
	else
	{
		var mesh=new ISHML.Mesh(aMesh)
	}
	if (mesh.size < this.size)
	{	
		Object.entries(mesh).forEach(([key,value])=>
		{
			if (this.hasOwnProperty(key))
			{
				result[key]=value
			}
		})
	}
	else
	{
		Object.entries(this).forEach(([key,value])=>
		{
			if (mesh.hasOwnProperty(key))
			{
				result[key]=value
			}
		})	
	}	

	return result
}
ISHML.Mesh.prototype.knot=function(aKnot,aValue)
{	

	if (aKnot instanceof ISHML.Knot)
	{
		this[aKnot.key]=aKnot
		return aKnot
	}
	else
	{	
		let key=ISHML.util.formatKey(aKnot)
		if (!this.hasOwnProperty(key))
		{
			this[key]=new ISHML.Knot(this.yarn,key,aValue)
		}
		return this[key]
	}
	
}
ISHML.Mesh.prototype.labeled = function(...someLabels)
{
	var result=new ISHML.Mesh(this.yarn)
	someLabels.forEach((label)=>
	{
		var _label=ISHML.util.formatKey(label)
		Object.keys(this).forEach((key)=>
		{
			if (this[key][_label])
			{	
				result[key]=this[key]
			}
		})
	})
	return result
}
ISHML.Mesh.prototype.plies = function(...someTieKeys)
{
	var result=new ISHML.Mesh(this.yarn)

	someTieKeys.forEach((tie)=>
	{
		var tieKey=ISHML.util.formatKey(tie)

		Object.keys(this).forEach((key)=>
		{
			if (this[key].hasOwnProperty(tieKey))
			{	
				this[key][tieKey].plies.forEach((ply)=>
				{
					result[ply.knot.key]=ply.knot
				})
			}
		})
	})
	
	return result
}
ISHML.Mesh.prototype.omit = function(aMesh)
{
	var result=new ISHML.Mesh(this.yarn)
	if (aMesh instanceof ISHML.Mesh)
	{
		var mesh=aMesh
	}
	else
	{
		var mesh=new ISHML.Mesh(this.yarn)
		mesh.add(aMesh)
	}
	Object.entries(this).forEach(([key,value])=>
	{
		if (!mesh.hasOwnProperty(key))
		{
			result[key]=value
		}
	})
	
	return result
}

ISHML.Mesh.prototype.toArray = function()
{
	return Object.values(this)
}
ISHML.Mesh.prototype.union = function(aMesh)
{
	if (aMesh instanceof ISHML.Mesh)
	{
		var mesh=aMesh
	}
	else
	{
		var mesh=new ISHML.Mesh(this.yarn)
		mesh.add(aMesh)
	}
	return Object.assign(this,mesh)
}

ISHML.Mesh.prototype.where = function(aFilter)
{
	var result=new ISHML.Mesh(this.yarn)
	var entries=Object.entries(aMesh).filter(aFilter)
	entries.forEach(([key,value])=>{result[key]=value})
	return result
}