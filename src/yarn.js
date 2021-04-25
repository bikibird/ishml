ishml.Yarn=
{
	storyline:{},  //Episode queue
	history:[],
	clock:new Date(),
	interval: 60000,
	turn:1,
	plot:new ishml.Plotpoint(),
	lexicon:null,
	grammar:null,
	parser:null,
	//translator= null not Needed?
	viewpoint:ishml.enum.viewpoint.second.singular,
	tense:ishml.enum.tense.present,
	//ishml.util.reseed(seed)  --DEFECT
	net:new ishml.Knot("$"),
	undoLength:10
}

ishml.Yarn.configure=function(options)
{
	//DEFECT TO DO seed, name, author, etc.
}
ishml.Yarn.harken=function()
{
	var state={dragging:false}
	document.addEventListener('click', (e)=>this.click(e))
	document.addEventListener('keyup', (e)=> this.keyup(e))
	document.addEventListener('mousedown', (e)=> this.mousedown(e,state))
	document.addEventListener('mouseup', (e)=> this.mouseup(e,state))
	document.addEventListener('mousemove', (e)=> this.mousemove(e,state))
	document.addEventListener('transitionend', (e)=> this.transitionend(e,state))

}
ishml.Yarn.click=function(e)
{
	if (e.target.matches('.ishml-choice'))
	{
		//var episode =ishml.Episode(e.target.dataset,this)()
		//episode.input=e.target.value
		//episode.narrate()
		var twist=Object.assign(
			{
				input:e.target.value,
				viewpoint:"player",
				moment:ishml.Yarn.clock
			},e.target.dataset)

		this.history.push(twist)
		
		var plotpoint=twist.plotpiont??ishml.Yarn.plot.points[twist.plot]??ishml.Yarn.plot[twist.plot]	
		plotpoint.unfold(twist)
	}
}
ishml.Yarn.keyup=function(e)
{

	if (e.target.matches('.ishml-input'))
	{
		if (e.keyCode===13)
		{
			//var episode =ishml.Episode(e.target.dataset,this)
			//episode.input=e.target.value
			//episode.narrate()
			var twist=Object.assign(
				{
					input:e.target.value,
					viewpoint:"player",
					moment:ishml.Yarn.clock
				},e.target.dataset)
	
			this.history.push(twist)
			
			var plotpoint=twist.plotpiont??ishml.Yarn.plot.points[twist.plot]??ishml.Yarn.plot[twist.plot]	
			plotpoint.unfold(twist)

		}
	}
}
ishml.Yarn.mousedown=function(e,state)
{
	if (e.target.matches('.ishml-draggable'))
	{
		e.preventDefault()
		if(!state.dragging)
		{
			var {top,left}=e.target.getBoundingClientRect()
			state.dragging={}
			state.dragging.clone=e.target.cloneNode(true)
			state.dragging.offset={left:e.clientX-left,top:e.clientY-top}
			state.dragging.originalPosition={left:`${left}px`,top:`${top}px`}
			state.dragging.clone.style.position="fixed"
			state.dragging.clone.style.left=`${e.clientX - state.dragging.offset.left}px`
			state.dragging.clone.style.top=`${e.clientY -state.dragging.offset.top}px`
			state.dragging.original=e.target
			e.target.classList.add("ishml-disappear")
			state.dragging.clone.classList.add("ishml-draggable-dragging")
			document.body.appendChild(state.dragging.clone)
		}
	}
}
ishml.Yarn.mouseup=function(e,state)
{
	
	if (state.dragging && !state.dragging.transitioning)
	{

		e.preventDefault()
		if(state.dragging.dropbox)
		{
			this.dropHoverStop({draggable:state.dragging.clone,dropbox:state.dragging.dropbox})
		}
		state.dragging.clone.classList.remove("ishml-draggable-dragging")
		state.dragging.clone.classList.add("ishml-draggable-rejected")
		state.dragging.clone.style.left=state.dragging.originalPosition.left
		state.dragging.clone.style.top=state.dragging.originalPosition.top
		state.dragging.transitions=0
		state.dragging.transitioning=true
	}
}
ishml.Yarn.mousemove=function(e,state)
{
	if (state.dragging && !state.dragging.clone.matches(".ishml-draggable-rejected"))
	{
		e.preventDefault()
		var left=`${e.clientX - state.dragging.offset.left}px`
		var right=`${e.clientY - state.dragging.offset.top}px`
		state.dragging.clone.style.left="-10000px"
		state.dragging.clone.style.top="-10000px"
		let dropbox = document.elementFromPoint(e.clientX, e.clientY)
		if(dropbox){dropbox=dropbox.closest(".ishml-dropbox")}
		if (state.dragging.dropbox != dropbox) 
		{
			if (state.dragging.dropbox)
			{
				this.dropHoverStop({draggable:state.dragging.clone,dropbox:state.dragging.dropbox })
			}
 			state.dragging.dropbox = dropbox;
			if (state.dragging.dropbox) 
			{ 
				this.dropHoverStart({draggable:state.dragging.clone,dropbox:state.dragging.dropbox})
			}
		}
		state.dragging.clone.style.left=left
		state.dragging.clone.style.top=right
	}
}
ishml.Yarn.transitionend=function(e,state)
{
	if(e.target===state.dragging.clone && state.dragging.transitioning )
	{
		state.dragging.transitions++

		if (state.dragging.transitions==getComputedStyle(state.dragging.clone).getPropertyValue('--transitions'))
		{
			state.dragging.original.classList.remove("ishml-disappear")
			
			document.body.removeChild(state.dragging.clone)
			state.dragging=false
		}
		//DEFECT missing plotpoint.unfold etc ...
	}
}

ishml.Yarn.dropHoverStart=function({draggable,dropbox})
{
	draggable.dataset.originalText=draggable.innerText
	draggable.innerText=draggable.innerText + " " +dropbox.innerText
	draggable.classList.add("ishml-draggable-hover")
	dropbox.classList.add("ishml-dropbox-hover")
}
ishml.Yarn.dropHoverStop=function({draggable,dropbox})
{
	draggable.classList.remove("ishml-draggable-hover")
	draggable.innerText=draggable.dataset.originalText
	dropbox.classList.remove("ishml-dropbox-hover")
}
ishml.Yarn.dropCheck=function({draggable,dropbox})
{
	var plot=this.plot.points[draggable.dataset.plot]
	if (plot)
	{
		var subplot=this.plot.points[dropbox.dataset.plot]||this.plot[dropbox.dataset.plot]
		var plotpoints=Object.values(plot)
		return plotpoints.includes(subplot)
	}
	return false
}
		
ishml.Yarn.say=function(aText)
{	
	if (typeof aText === 'string' || aText instanceof String)
	{
		var fragment = document.createElement('template')
    	fragment.innerHTML = aText
    	fragment= fragment.content
	}
	else if(aText instanceof ishml.Passage)
	{
		var fragment=aText.documentFragment()
	}
	else
	{
		var fragment=aText
	}
	var _first = (aDocumentSelector)=>
	{
		var targetNodes=document.querySelectorAll(aDocumentSelector)
		targetNodes.forEach((aNode)=>
		{
			aNode.prepend(fragment)
			/*aNode.querySelectorAll(".ishml-input").forEach((descendant)=>descendant.onkeyup=this.input.bind(this))
			aNode.querySelectorAll(".ishml-choice").forEach((descendant)=>descendant.onclick=this.click.bind(this))
			aNode.querySelectorAll(".ishml-drag").forEach((descendant)=>
			{
				descendant.ondragstart=this.drag.bind(this)
				descendant.draggable=true
			})
			aNode.querySelectorAll(".ishml-drop").forEach((descendant)=>
			{
				descendant.ondrop=this.drop.bind(this)
				descendant.ondragenter=this.dragenter.bind(this)
				descendant.ondragover=this.dragover.bind(this)
			})*/
		})

		return this
	}
	var _last = (aDocumentSelector)=>
	{
		var targetNodes=document.querySelectorAll(aDocumentSelector)
		targetNodes.forEach((aNode)=>
		{
			aNode.append(fragment)
			/*aNode.querySelectorAll(".ishml-input").forEach((descendant)=>descendant.onkeyup=this.input.bind(this))
			aNode.querySelectorAll(".ishml-choice").forEach((descendant)=>descendant.onclick=this.click.bind(this))
			aNode.querySelectorAll(".ishml-drag").forEach((descendant)=>
			{
				descendant.ondragstart=this.drag.bind(this)
				descendant.draggable=true
			})
			aNode.querySelectorAll(".ishml-drop").forEach((descendant)=>descendant.ondrop=this.drop.bind(this))
		*/
		})
		return this
	}
	var _instead = (aDocumentSelector)=>
	{
		document.querySelectorAll(aDocumentSelector).forEach((aNode) =>
		{
			while(aNode.firstChild){aNode.removeChild(aNode.firstChild)}
			aNode.append(fragment)

			/*aNode.querySelectorAll(".ishml-input").forEach((descendant)=>descendant.onkeyup=this.input.bind(this))
			aNode.querySelectorAll(".ishml-choice").forEach((descendant)=>descendant.onclick=this.click.bind(this))
			aNode.querySelectorAll(".ishml-drag").forEach((descendant)=>
			{
				descendant.ondragstart=this.drag.bind(this)
				descendant.draggable=true
			})
			aNode.querySelectorAll(".ishml-drop").forEach((descendant)=>descendant.ondrop=this.drop.bind(this))
		*/
		})
		return this
	}
	return {first:_first,last:_last,instead:_instead}
}


ishml.Yarn.recite=function(literals, ...expressions)
{

		
		let string = ``
		for (const [i, val] of expressions.entries()) {
			string += literals[i] + val
		}
		string += literals[literals.length - 1]
		console.log(string)
		return string+ "test"

}

ishml.Yarn.restore=function(key)
{
	var yarn = this
	return new Promise(function(resolve, reject)
	{
		
		var db = indexedDB.open("ishml", 1)
		db.onupgradeneeded = function(e)
		{
			this.result.createObjectStore("games", { keyPath: "key" });
			
		}
		db.onerror = function(e)
		{
			console.log("indexedDB: Could not open ishml save game database.")
			reject(e)
		}
		db.onsuccess = function(e)
		{
			var request=this.result.transaction("games").objectStore("games").get(key)
			request.onsuccess= function(e) 
			{
				var game=e.target.result
				if (game)
				{
					yarn.yarnify(game.yarn)
					resolve(game)
				}
				else
				{
					reject(e)
				}
			}

			request.onerror = function(e)
			{
				console.log("indexedDB: Could not retrieve ishml saved game from database.")
				reject(e)
			}
			this.result.close()		
		}	
	})
}	

ishml.Yarn.save=function(key)
{
	var yarn =this
	
	return new Promise(function(resolve,reject)
	{
		var db = indexedDB.open("ishml", 1)
		db.onupgradeneeded = function(e)
		{
			this.result.createObjectStore("games", { keyPath: "key" });
		}
		db.onerror = function(e)
		{
			console.log(`indexedDB: Could not save ${key} to the database.`)
			failure(e)
		}
		db.onsuccess = function(e)
		{
			var request = this.result.transaction(["games"], "readwrite")
				.objectStore("games")
				.put({key:key,yarn:yarn.stringify()})
				
			request.onsuccess = function(e)
			{
				resolve(e)
			} 
			request.onerror = function(e)
			{
				reject(e)
			}

			this.result.close()
		}	 
	})	
}
ishml.Yarn.tell=function(viewpoint="player") 
{
	while(this.storyline[viewpoint].length>0)
	{
		Object.keys(this.storyline).forEach(viewpoint=>
		{
			this.storyline[viewpoint].forEach((episode,index)=>
			{
				if (!episode.start() || episode.start() <= this.clock)
				{
					episode.resolve(this.clock)
					episode.narrate()
					/*
					
					if(!episode.resolve())
					{
						this.storyline[viewpoint][index].concluded=true
					}*/
				}
			})
			this.storyline[viewpoint]=this.storyline[viewpoint].filter(episode=>!episode.told)
		})
		this.tick()
	}	
	this.turn++
	return this
}

ishml.Yarn.introduce=function(episode) 
{
	var viewpoint=episode.viewpoint()
	if (!this.storyline.hasOwnProperty(viewpoint))
	{
		this.storyline[viewpoint]=[]
	}

	this.storyline[viewpoint].push(episode)
	return this
}	

/* A turn is a processing of all the episodes on the the storyline.  An episode is a plotpoint.narrate with bound arguments.*/ 

ishml.Yarn.stringify=function()
{
	var plies=new Map()
	var plyPlies=new Map()
	var knots=new Map()
	var episodes=new Map()	//DEFECT not implemented.
	var index=0
	
	var mapPly=(ply)=>
	{
		if(ply)
		{
			if (!plies.has(ply))
			{
				plies.set(ply, index++)
				plyPlies.set(ply.ply,index++)
				mapKnot(ply.knot)
				mapPly(ply.advance)
				mapPly(ply.retreat)
				mapPly(ply.converse)
				mapKnot(ply.from)	
			}
		}
	}

	var mapKnot=(knot)=>
	{
		if(knot)
		{
			if (!knots.has(knot))
			{
			
				knots.set(knot, index++)
				knot.cords.forEach((cord)=>
				{
					cord.forEach((ply)=>mapPly(ply))
				})
			}
		}
	}

	mapPly(this.net)
	var plyArray=[]
	plies.forEach((uid,ply)=>
	{	
		var safePly={uid:uid}
		safePly.id=ply.id?ply.id:null
		safePly.knot=ply.knot?knots.get(ply.knot):null
		safePly.ply={uid:plyPlies.get(ply.ply), properties:ply.ply}
		safePly.hop=ply.hop
		safePly.cost=ply.cost
		safePly.advance=ply.advance?plies.get(ply.advance):null
		safePly.retreat=ply.retreat?plies.get(ply.retreat):null
		safePly.converse=ply.converse?plies.get(ply.converse):null
		safePly.cord=ply.cord
		safePly.from=ply.from?knots.get(ply.from):null
		plyArray.push(safePly)
	})
	var knotArray=[]
	knots.forEach((uid,knot)=>
	{
		var safeKnot={uid:uid, id:knot.id, cords:{}, properties:{}}
		Object.keys(knot).forEach((key)=>
		{
			if (knot[key] instanceof ishml.Cord)
			{
				safeKnot.cords[key]={}
				Object.keys(knot[key]).forEach((plyKey)=>
				{
					safeKnot.cords[key][plyKey]=plies.get(knot[key][plyKey])
				})
			}
			else
			{
				safeKnot.properties[key]=knot[key]
			}
		})
		knotArray.push(safeKnot)
	})
	return JSON.stringify({knots:knotArray,plies:plyArray,seed:ishml.util._seed})
}
ishml.Yarn.tick=function(ticks=1)
{
	this.clock.setTime(this.clock.getTime() + (this.interval*ticks))
}
ishml.Yarn.yarnify=function(savedGame)
{
	var plies={}
	var plyPlies={}
	var knots={}
	var game=JSON.parse(savedGame)
	game.knots.forEach(savedKnot=>
	{
		var knot=new ishml.Knot(savedKnot.id)
		Object.assign(knot,savedKnot.properties)
		knot.id=savedKnot.id
		knots[savedKnot.uid]=knot
		
	})
	game.plies.forEach(savedPly=>
	{
		var ply=new ishml.Ply(savedPly.id,knots[savedPly.knot])
		ply.from=savedPly.from?knots[savedPly.from]:null
		if (!plyPlies.hasOwnProperty(ply.ply.uid))
		{
			ply.ply=savedPly.ply.properties
			plyPlies[savedPly.ply.uid]=ply.ply
		}
		else
		{
			ply.ply=plyPlies[savedPly.ply.uid]
		}

		ply.hop=savedPly.hop
		ply.cost=savedPly.cost
		ply.cord=savedPly.cord
		plies[savedPly.uid]=ply

	})
	game.plies.forEach(savedPly=>
	{
		var ply=plies[savedPly.uid]
		ply.advance=savedPly.advance?plies[savedPly.advance]:null
		ply.retreat=savedPly.retreat?plies[savedPly.retreat]:null
		ply.converse=savedPly.converse?plies[savedPly.converse]:null

	})
	game.knots.forEach(savedKnot=>
	{
		var knot=knots[savedKnot.uid]
		Object.keys(savedKnot.cords).forEach(cordKey=>
		{
			knot[cordKey]={}
			Object.keys(savedKnot.cords[cordKey]).forEach(plyKey=>
			{
				ply=plies[savedKnot.cords[cordKey][plyKey]]
				knot[cordKey][plyKey]=ply
			})
		})

	})
	ishml.util._seed=game.seed
	this.net=plies[0]
	
	return true
}
ishml.Yarn.retraction=function({seed,undo=()=>true,episode})
{
	var retraction={seed:seed||ishml.util._seed,undo:undo,redo:episode}
	if (!this.undo[this.turn])
	{
		this.undo[this.turn]=new Set()	
	}
	this.undo[this.turn].add(retraction)
	if(undo.length>this.undoLength)
	{
		this.undo.shift()
	}

}
ishml.Yarn.recant=function()
{
	[...Object.values(this.undo).shift()].reverse.forEach(retraction=>
	{
		ishml.util._seed=retraction.seed
		retraction.undo()

	})
	
		
}
ishml.Yarn.reintroduce=function()
{
	//redo the undo
	
}
