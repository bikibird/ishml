ishml.Plotpoint = function Plotpoint(yarn, id,summary)
{
	if (this instanceof ishml.Plotpoint)
	{
		Object.defineProperty(this, "id", {value:ishml.util.formatId(id),writable: true})
		Object.defineProperty(this, "yarn", {value:yarn,writable: true})

		Object.defineProperty(this, "narrate", {value:ishml.Plotpoint.prototype.narrateSubplot ,writable: true})

		Object.defineProperty(this, "uid", {value:ishml.util.formatId(),writable: true})
		Object.defineProperty(this, "_", {value:{},writable: true})
		
		this.points[this.uid]=this

		return this
	}
	else 
	{
		return new Plotpoint(yarn, id,summary)
	}
}
Object.defineProperty(ishml.Plotpoint.prototype, "points", {value:{},writable: true})
//Object.defineProperty(ishml.Plotpoint.prototype, "subplot", { get: function() { return Object.values(this)}})
ishml.Plotpoint.prototype[Symbol.iterator]=function(){return Object.values(this)[Symbol.iterator]()}
ishml.Plotpoint.prototype.add = function (id,summary)
{
	if (id instanceof ishml.Plotpoint)
	{
		var plotpoint = id
	}
	else 
	{
		var plotpoint = new ishml.Plotpoint(this.yarn, id,summary)
	}
	this[id] = plotpoint
	return this
}

/*ishml.Plotpoint.prototype.addAction = function (id,summary)
{
	this.add(id,summary)
	var action=this[id]
	
	action.add("frame").add("do").add("report")
	action.frame.add("before").add("stock").add("after")
	action.do.add("before").add("stock").add("after")
	action.report.add("before").add("stock").add("after")

	return this
}*/	


ishml.Plotpoint.prototype.heed = function (aDocumentSelector)
{
	var yarn = this.yarn
	var element = document.querySelector(aDocumentSelector)
	var eventString = "click"
	if (element)
	{
		if (element.classList.contains("ishml-input"))
		{
			eventString = "keyup"
		}
		return new Promise((resolve) =>
		{
			if (ishml.util._harkenings[aDocumentSelector])
			{
				var harkeningHandler = ishml.util._harkenings[aDocumentSelector][eventString]
				if (harkeningHandler)
				{
					element.removeEventListener(eventString, harkeningHandler)
				}
			}
			element.addEventListener(eventString, function handler(e)
			{
				if (e.key === "Enter")
				{
					var input = 
					{
						text: e.target.value,
						agent: (e.target.dataset.agent || "player"),
						target: e.target,
						grammar: yarn.grammar[e.target.dataset.grammar] || yarn.grammar.input
					}
					e.target.value = ""
					e.target.removeEventListener(eventString, handler)
					if (harkeningHandler)
					{
						e.target.addEventListener(eventString, harkeningHandler)
					}
					resolve(input)
				}
			})
		})
	}
}
//DOCUMENTATION:  Narrate should return false if twist not handled to allow siblings to have a chance at resolving. Return truthy value if plotpoint resolves twist. Returne object may return information to parent plotpoint, which the parent can use to determine whether it is successful. Twist may be modified, which also conveys info back to the parent.
//
ishml.Plotpoint.prototype.narrateSubplot = function (twist) 
{
	for (plotpoint of Object.values(this))
	{
		if(plotpoint.narrate(twist)){break}
	}
	return null
}
/*ishml.Plotpoint.prototype.perform = function (twist) 
{
	this.subplot.perform(twist)
	return this
	
}
ishml.Plotpoint.prototype.ponder = function (twist) 
{
	this.subplot.ponder(twist)
	return this
	
}
ishml.Plotpoint.prototype.resolve = function (twist) 
{
	this.subplot.resolve(twist)
	return this
	
}*/



ishml.Plotpoint.prototype.episode = function (...args) 
{
	//Arguments must be serializable or cannot save episode (for repeating episodes) as part of game state.
	var episode={plotpoint:this,arguments:args} 
	return episode
}	
