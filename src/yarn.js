ISHML.Yarn=function Yarn(aSeed) 
{
	if (this instanceof Yarn)
	{
		this.plot= new ISHML.Plot(this)
		this.storyline = new ISHML.Storyline(this)  //Event queue
		this.net=new ISHML.Mesh(this)
		//this.net.knot=this.net.knot.bind(this.net,this)

		this.catalog=new ISHML.Catalog()
		this.lexicon=new ISHML.Lexicon()
		this.grammar =new ISHML.Rule()
		this.viewpoint="2nd person singular"
		this.setting="present"
		ISHML.util.reseed(aSeed)
	}
	else
	{
		return new Yarn(aSeed)
	}	
}
ISHML.Yarn.prototype.click=function(e)
{
	var input={text:e.target.dataset.input||"",
		agent:(e.target.dataset.agent||"player"),
		target:e.target, 
		grammar:this.grammar[e.target.dataset.grammar]||this.grammar.input}

	storyline.introduce((this.plot[e.target.dataset.plot]||this.plot.main),{input:input})
	this.tell()
}
ISHML.Yarn.prototype.input=function(e)
{
var yarn=this.yarn
	var element=document.querySelector(aDocumentSelector)
	var eventString="click"
	if (element)
	{	
		if (element.classList.contains("ISHML-input")){eventString="keyup"}

		return new Promise((resolve)=> 
		{
	   		element.addEventListener(eventString, function handler(e)
			{
				if (e.key === "Enter")
				{
					var input={text:e.target.value,
					agent:(e.target.dataset.agent||"player"),
					target:e.target, 
					grammar:yarn.grammar[e.target.dataset.grammar]||yarn.grammar.input}
					
					e.target.value=""
					
					e.target.removeEventListener(eventString,handler)
					resolve({input:input})
				}
	 		})
		})
	}	

}
ISHML.Yarn.prototype.drag=function(e)
{	console.log(e.target.dataset.input)
		e.dataTransfer.setData("input", (e.target.dataset.input||""))
	console.log(e.dataTransfer)
}
ISHML.Yarn.prototype.dragover=function(e)
{	
	e.preventDefault()
}
ISHML.Yarn.prototype.dragenter=function(e)
{	
	e.preventDefault()
}

ISHML.Yarn.prototype.drop=function(e)
{
	var dropInput = e.dataTransfer.getData("input")||""
	
	var input={text:`${dropInput} ${e.target.dataset.input}`,
		agent:(e.target.dataset.agent||"player"),
		target:e.target, 
		grammar:this.grammar[e.target.dataset.grammar]||this.grammar.input}
	
	storyline.introduce((this.plot[e.target.dataset.plot]||this.plot.main),{input:input})

	this.tell()
}

ISHML.Yarn.prototype.harken=function(aDocumentSelector)
{
	var yarn=this
	var element=document.querySelector(aDocumentSelector)
	
	if (element)
	{	
		var eventString="click"
		var handler=function handler(e)
		{
			if (e.key === "Enter")
			{
				var input={text:e.target.value,
				agent:(e.target.dataset.agent||"player"),
				target:e.target, 
				grammar:yarn.grammar[e.target.dataset.grammar]||yarn.grammar.input}
				
				e.target.value=""
				
				yarn.storyline.introduce((yarn.plot[e.target.dataset.plot]||yarn.plot.main),{input:input})
				yarn.tell()
			}
		}
		if (element.classList.contains("ISHML-input")){eventString="keyup"}

   		element.addEventListener(eventString, handler)
   		ISHML.util._harkenings[aDocumentSelector]={}
   		ISHML.util._harkenings[aDocumentSelector][eventString]=handler
	}
	return this
}
ISHML.Yarn.prototype.ignore=function(aDocumentSelector)
{
	var eventString="click"
	var element=document.querySelector(aDocumentSelector)
	
	if (element)
	{
		if (element.classList.contains("ISHML-input")){eventString="keyup"}
		if(ISHML.util._harkenings[aDocumentSelector])
		{
			var harkeningHandler=ISHML.util._harkenings[aDocumentSelector][eventString]
			if (harkeningHandler)
			{
				element.removeEventListener(eventString,harkeningHandler)
			}
		}
	}	
}	
ISHML.Yarn.prototype.interpret=function(anInput={})
{
	//{text:"take ring",agent:"player",lexicon:story.lexicon,grammar:story.grammar}

	var lexicon=anInput.lexicon || this.lexicon
	var grammar=anInput.grammar || this.grammar
	var agent=anInput.agent || "player"
	var text=anInput.text || ""

	var interpretations=[]
	var goodInterpretations=[]
	var badInterpretations=[]

	var tokenizer = lexicon.tokenize(text)
	var sequence = tokenizer.next()
	while (!sequence.done)
	{
		interpretations.push(new ISHML.Interpretation([],sequence.value.tokens))
		var result=grammar.parse(sequence.value.tokens)
		if (result)
		{
			interpretations=interpretations.concat(result)
		}
		sequence = tokenizer.next()
	}
	interpretations.sort(function(first,second){return first.remainder.length - second.remainder.length})

	var success=false
	interpretations.some((interpretation)=>
	{
		if (interpretation.remainder.length>0)
		{
			if (success===true){return true}
			else
			{
				badInterpretations.push(interpretation)
			}	
		}
		else
		{
			goodInterpretations.push(interpretation)
			success=true
			return false
		}
	})
	if (goodInterpretations.length>0)
	{	
		return {interpretations:goodInterpretations,agent:agent}
	}
	else
	{
		return {interpretations:badInterpretations,agent:agent}
	}		
}	
ISHML.Yarn.prototype.say=function(aText)
{	
	if (typeof aText === 'string' || aText instanceof String)
	{
		var fragment = document.createElement('template')
    	fragment.innerHTML = aText
    	fragment= fragment.content
	}
	else if(aText instanceof ISHML.Passage)
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
			/*aNode.querySelectorAll(".ISHML-input").forEach((descendant)=>descendant.onkeyup=this.input.bind(this))
			aNode.querySelectorAll(".ISHML-choice").forEach((descendant)=>descendant.onclick=this.click.bind(this))
			aNode.querySelectorAll(".ISHML-drag").forEach((descendant)=>
			{
				descendant.ondragstart=this.drag.bind(this)
				descendant.draggable=true
			})
			aNode.querySelectorAll(".ISHML-drop").forEach((descendant)=>
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
			/*aNode.querySelectorAll(".ISHML-input").forEach((descendant)=>descendant.onkeyup=this.input.bind(this))
			aNode.querySelectorAll(".ISHML-choice").forEach((descendant)=>descendant.onclick=this.click.bind(this))
			aNode.querySelectorAll(".ISHML-drag").forEach((descendant)=>
			{
				descendant.ondragstart=this.drag.bind(this)
				descendant.draggable=true
			})
			aNode.querySelectorAll(".ISHML-drop").forEach((descendant)=>descendant.ondrop=this.drop.bind(this))
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
			/*aNode.querySelectorAll(".ISHML-input").forEach((descendant)=>descendant.onkeyup=this.input.bind(this))
			aNode.querySelectorAll(".ISHML-choice").forEach((descendant)=>descendant.onclick=this.click.bind(this))
			aNode.querySelectorAll(".ISHML-drag").forEach((descendant)=>
			{
				descendant.ondragstart=this.drag.bind(this)
				descendant.draggable=true
			})
			aNode.querySelectorAll(".ISHML-drop").forEach((descendant)=>descendant.ondrop=this.drop.bind(this))
		*/
		})
		return this
	}
	return {first:_first,last:_last,instead:_instead}
}

ISHML.Yarn.prototype.tell=function(aStoryline) 
{

	var storyline=aStoryline || this.storyline
	while(storyline.continues())
	{
		var {plot,twist}=storyline.current()
		plot.narrate(twist)
		storyline.advance()
	}

}