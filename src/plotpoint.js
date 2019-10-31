ishml.Plotpoint = function Plotpoint(yarn, id,summary)
{
	if (this instanceof ishml.Plotpoint)
	{
		Object.defineProperty(this, "id", {value:ishml.util.formatId(id),writable: true})
		Object.defineProperty(this, "yarn", {value:yarn,writable: true})
		Object.defineProperty(this, "summary", {value:summary,writable: true})
		Object.defineProperty(this, "narrate", {value:ishml.Plotpoint.prototype.narrateSubplot ,writable: true})
		Object.defineProperty(this, "uid", {value:ishml.util.formatId(),writable: true})
		
		this.points[this.uid]=this

		return this
	}
	else 
	{
		return new Plotpoint(yarn, id,summary)
	}
}
Object.defineProperty(ishml.Plotpoint.prototype, "points", {value:{},writable: true})
Object.defineProperty(ishml.Plotpoint.prototype, "subplot", { get: function() { return Object.values(this)}})

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
//DOCUMENTATION:  Narrate should return false if twist not handled to allow siblings to have a chance at resolving. Return true if plotpoint resolves twist.
//
ishml.Plotpoint.prototype.narrateSubplot = function (twist) 
{
	return Object.values(this).some(plotpoint => plotpoint.narrate(twist))
}
