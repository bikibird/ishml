ISHML.Ply= function Ply(id,{toKnot,fromPly,cord,conversePly}={})
{
	if (this instanceof ISHML.Ply)
	
	{
		Object.defineProperty(this,"id",{writable:true, value:id})
		Object.defineProperty(this,"weight",{writable:true, value:()=>1})
		Object.defineProperty(this,"knot",{writable:true, value:toKnot})
		Object.defineProperty(this,"cord",{writable:true, value:cord})
		Object.defineProperty(this,"from",{writable:true, value:fromPly})
		Object.defineProperty(this,"converse",{writable:true, value:conversePly})
		Object.defineProperty(this,"_path",{writable:true, value:[]})

		return new Proxy(this, 
		{
			
			get: function(target, property) 
			{

				if (Reflect.has(target,property))
				{
					return Reflect.get(target,property)
				}
				else
				{
					return Reflect.get(target,"knot")[property]	
				}
			},
			set: function(target, property, value)
			{
				if (Reflect.has(target,property))
				{
					return Reflect.set(target,property,value)
				}
				else
				{
					var knot=Reflect.get(target,"knot")
					if (knot)
					{
						return Reflect.set(knot,property,value)
					}
					else return false
				}
			}
				
		})	
	}
	else
	{
		return new Ply(id)
	}	
}
ISHML.Ply.prototype.path=function()
{
	return this._path
}
