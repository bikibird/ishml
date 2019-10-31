ishml.Storyline= function Storyline(yarn)
{
	if (this instanceof ishml.Storyline)
	{
		this.storyline=new Set()
		this.episodes=new WeakMap
		return this
	}
	else
	{
		return new Storyline(yarn)
	}	
}
ishml.Storyline.prototype.advance= function()
{
	var incident =this.storyline.values().next()
	if (!incident.done)
	{
		this.storyline.delete(incident.value)
		return incident.value
	}
	else return false	
	
}
ishml.Storyline.prototype.continues= function(){return this.storyline.size>0}
/*ishml.Storyline.prototype.current= function()
{
	var incident =this.storyline.values().next()
	return incident
}*/
ishml.Storyline.prototype.interrupt= function(episode)
{
	var {plotpoint, twist}=episode
	if (!plotpoint)
	{
		plotpoint=this.episodes.get(twist)
	}
	//story.storyline.introduce(story.net.player.score)  --adds object to plotline
	this.storyline=new Set([{plotpoint,twist}].concat([...this.storyline]))
	
	return this
}

ishml.Storyline.prototype.introduce= function(episode)
{
	var {plotpoint, twist}=episode
	if (!plotpoint)
	{
		plotpoint=this.episodes.get(twist)
	}
	this.storyline.add({plotpoint:plotpoint,twist:twist})
	return this
}

ishml.Storyline.prototype.twist=function(episode)
{
	var {plotpoint,twist}=episode
	var handler=
	{
		set: function(target, property, value)
		{
			{
				if (Reflect.set(target,property,value))
				{
					this.introduce(target)
					return true
				}
				else return false
				
			}
		}
	}
	var proxiedTwist= new Proxy(twist, handler)
	this.episodes.set(proxiedTwist,plotpoint)
	return proxiedTwist
}
