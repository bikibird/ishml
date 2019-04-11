"use strict"
var ISHML=ISHML || {}
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

ISHML.Tie= function Tie()
{
	//what ties are made of
	if (this instanceof ISHML.Tie)
	{
		//Object.defineProperty(this, "knot", {value:aKnot,writable: true})
		//Object.defineProperty(this, "$", {value:{},writable: true})
		return this
	}
	else
	{
		return new Tie()
	}	
}
Object.defineProperty(ISHML.Tie.prototype, "knot", { get: function() { return Object.values(this)[0].knot} })
Object.defineProperty(ISHML.Tie.prototype, "plies", { get: function() { return Object.values(this)||[]} })
Object.defineProperty(ISHML.Tie.prototype, "ply", { get: function() { return Object.values(this)[0]} })
//ISHML.Tie.prototype.ascendingByKnots=function(aCount){}
//ISHML.Tie.prototype.ascendingByWeights=function(aCount){}
//ISHML.Tie.prototype.descendingByKnots=function(aCount){}
//ISHML.Tie.prototype.descendingByWeights=function(aCount){}
ISHML.Tie.prototype.filter=function(aFilter){return this.plies.filter(aFilter)}
ISHML.Tie.prototype.first=function(aCount=1){return this.plies.slice(0,aCount)}
ISHML.Tie.prototype.last=function(aCount=1){return this.plies.slice(-1,-aCount)}
ISHML.Tie.prototype.middle=function(aCount=1){return this.plies.slice(aCount,-aCount)}
ISHML.Tie.prototype.most=function(aCount=1){return this.plies.slice(aCount-1,-1)}
ISHML.Tie.prototype.shuffle=function(aCount)
{
	var count=aCount||this.size
	return ISHML.util.shuffle(this.plies,count)
}
ISHML.Tie.prototype.sort=function(aSort){return this.plies.sort(aSort)}
ISHML.Tie.prototype.toMesh=function(){return new ISHML.Mesh(this.plies)}



ISHML.Interpretation=function Interpretation(aGist=[],aRemainder=[])
{
	if (this instanceof ISHML.Interpretation)
	{
		this.gist=aGist.slice(0)
		this.remainder=aRemainder.slice(0)
		return this
	}
	else
	{
		return new Interpretation(aGist,aRemainder)
	}
}

ISHML.Knot= function Knot(aYarn,aKey,aValue)
{
	if (this instanceof ISHML.Knot)
	{
		Object.assign(this,aValue)
		Object.defineProperty(this, "key", {value:ISHML.util.formatKey(aKey),writable: true})
		//Object.defineProperty(this, "$", {value:aValue,writable: true})
		Object.defineProperty(this, "yarn", {value:aYarn})
		return this
	}
	else
	{
		return new Knot(aYarn,key,aValue)
	}	
}
ISHML.Knot.prototype.fold=function(aKnot)
{
	//merges proprties from aKnot to this knot
	Object.assign(this,aKnot)
	Object.entries(aKnot).forEach(([key,value])=>
	{
		if (value instanceof ISHML.Tie)
		{
			if(!this.hasOwnProperty(key))
			{
				this[key]=value
			}
			else
			{
				Object.assign(this[key],value)
			}
		}
		else
		{
			if(!this.hasOwnProperty(key))
			{
				this[key]=value
			}
		}
	})

}	
ISHML.Knot.prototype.forget=function(aTerm,aDefinition)
{
	var definition=Object.assign({kind:"knot",key:this.key},aDefinition)
	this.yarn.lexicon.unregister(aTerm,definition)
	return this
}

ISHML.Knot.prototype.has=function(aKey)
{
	if (this.hasOwnProperty(ISHML.util.formatKey(aKey)))
	{
		return true
	}
	else {return false}
}
ISHML.Knot.prototype.label=function(...someLabels)
{
	someLabels.forEach((label)=>
	{
		this.yarn.catalog.register(label,this)
		if (!this.hasOwnProperty(label))
		{
			this.yarn.catalog.register(label,this)
			this[label]=true
			//Object.defineProperty(this, label, {value:true,writable: true})
		}
	})
	return this
}
/*ISHML.Knot.prototype.path=function(aDestinationKnot)
{
	//shortest according to ply value?
	//longest?
	//random walk? 
	var _via =function(...someTies)
	{

	}
	yield plies
}*/


ISHML.Knot.prototype.tie = function(aKey,aPlyValue)
{
	//Create Tie property if it does not already exist
	//Knot.tie(aKey,aValue).to(anotherKnot).mutually(anotherValue)
	//story.net.player.tie("friendship",8).to(story.net.Lizzy).mutually(6)

	var thisKnot=this
	var otherKnot
	var otherTieKey
	var tieKey=ISHML.util.formatKey(aKey)
	
	if (!thisKnot.hasOwnProperty(tieKey))
	{
		thisKnot.yarn.catalog.register(tieKey,thisKnot)
		thisKnot[tieKey]=new ISHML.Tie() 
	}
	//var thisKnot=this  //player
	var _to = (anotherKnot, aValue={})=>
	{
		if (anotherKnot instanceof ISHML.Knot)
		{
			
			otherKnot=anotherKnot
		}
		else
		{
			var otherKnotKey=ISHML.util.formatKey(anotherKnot)
			if (thisKnot.yarn.net.hasOwnProperty(otherKnotKey))
			{
				otherKnot=thisKnot.yarn.net[otherKnotKey]
			}
			else
			{
				otherKnot=thisKnot.yarn.net.knot(otherKnotKey,aValue)
			}
		}

		var ply=ISHML.Ply(otherKnot,aPlyValue)
		thisKnot[tieKey][`${otherKnot.key}_`]=ply

		return {mutually:_mutually,conversely:_conversely,to:_to}
	}

	var _mutually =(otherTieValue)=>
		{
			if (!otherKnot.hasOwnProperty(tieKey))
			{
				thisKnot.yarn.catalog.register(tieKey,otherKnot)
				otherKnot[tieKey]=new ISHML.Tie()
			}
		
			var ply=ISHML.Ply(thisKnot)
			if(otherTieValue===undefined)
			{
				ply.weight=aPlyValue
			}
			else
			{
				ply.weight=anotherPlyValue
			}
			ply.converse=tieKey
			
			otherKnot[tieKey][`${thisKnot.key}_`]=ply
			thisKnot[tieKey][`${otherKnot.key}_`].converse=tieKey
			return {to:_to,tie:thisKnot.tie.bind(thisKnot)}
		}
		var _conversely = (anotherTieKey,anotherPlyValue)=>
		{

			otherTieKey=ISHML.util.formatKey(anotherTieKey)
			
			if (!otherKnot.hasOwnProperty(otherTieKey))
			{
				
				thisKnot.yarn.catalog.register(otherTieKey,otherKnot)
				otherKnot[otherTieKey]=new ISHML.Tie()
			}
			//var thisPlyKey=thisKnot.key
			var ply=ISHML.Ply(thisKnot)
			if(anotherPlyValue===undefined)
			{
				ply.weight=aPlyValue
			}
			else
			{
				ply.weight=anotherPlyValue
			}
			ply.converse=tieKey
			otherKnot[otherTieKey][`${thisKnot.key}_`]=ply
			thisKnot[tieKey][`${otherKnot.key}_`].converse=otherTieKey
			return {to:_to,tie:thisKnot.tie.bind(thisKnot)}
		}

	return {to:_to}
}
ISHML.Knot.prototype.ties=function(...someTieKeys)
{
	var result=new ISHML.Tie()
	someTieKeys.forEach((tie)=>
	{
		var tieKey=ISHML.util.formatKey(tie)
		if (this.hasOwnProperty(tieKey))
		{
			Object.assign(result,this[tieKey])
		}
	})

	return result
}
ISHML.Knot.prototype.toMesh=function(){return new ISHML.Mesh(this)}



ISHML.Knot.prototype.understand=function(...someTerms)
{
	var definition={kind:"knot",key:this.key,knot:this,number:"singular",part:"noun"}
	var _as=(aDefinition={})=>
	{
		this.yarn.lexicon.register(...someTerms).as(Object.assign(definition,aDefinition))
		return this
	}
	return {as:_as}
}

ISHML.Knot.prototype.unlabel=function(...someLabels)
{
	someLabels.forEach((label)=>
	{
		this.yarn.catalog.unregister(label,this)
		delete this[label]
	})
	return this
}
ISHML.Knot.prototype.untie = function(aKey)
{
	//deletes a ply from a tie.
	//Knot.untie(aKey,aValue).from(anotherKnot)
	//story.net.player.untie("friendship",8).from(story.net.Lizzy)
	//
	var thisKnot=this
	if (aKey instanceof ISHML.Tie)
	{
		var tieKey=aKey.key
	}
	else
	{
		var tieKey=ISHML.util.formatKey(aKey)
	}

	var _from =(anotherKnot)=>
	{

		if (anotherKnot instanceof ISHML.Knot)
		{
			
			var otherKnot=anotherKnot
		}
		else
		{
			var otherKnot=thisKnot.yarn.net[ISHML.util.formatKey(anotherKnot)]
		}
	
		var plyKey=`${otherKnot.key}_`
		var converseTieKey=thisKnot[tieKey].converse
		delete thisKnot[tieKey][plyKey]
	
		if (converseTieKey)
		{
			var conversePlyKey=`${thisKnot.key}_`
			delete otherKnot[converseTieKey][conversePlyKey]
		}		
		return thisKnot
	}
	var _all = (removeTie)=>
	{
		var converseTieKey=thisKnot[tieKey].converse
		
		var conversePlyKey=`${thisKnot.key}_`
		Object.keys(thisKnot[tieKey]).forEach((ply)=>
		{
			if (converseTieKey)
			{
				delete thisKnot[tieKey][ply].knot[converseTieKey][conversePlyKey]
				if (removeTie && Object.keys(thisKnot[tieKey][ply].knot[converseTieKey]).length >0)
				{
					delete thisKnot[tieKey][ply].knot[converseTieKey]
				}
			}	
			delete thisKnot[tieKey][ply]
		})

		
		if (removeTie)
		{
			delete thisKnot[tieKey]
		}	
		return thisKnot	
	}

	return {from:_from,all:_all}
}


ISHML.Lexicon=function Lexicon() 
{
	if (this instanceof ISHML.Lexicon)
	{

		Object.defineProperty(this, "trie", {value:{},writable: true})
		return this
	}
	else
	{
		return new Lexicon()
	}
}

ISHML.Lexicon.prototype.unregister=function(aTerm,aDefinition)
{
	var term=aTerm.toLowerCase()
	var _trie = this.trie
	var j=0
	for (let i=0; i < term.length; i++)
	{
		var character=term.charAt(i)
		if ( ! _trie[character])
		{
			return []
		}
		else
		{	
			_trie = _trie[character]
		}
	}
	if (_trie.hasOwnProperty("definitions"))
	{
		_trie.definitions=_trie.definitions.filter((def)=>
		{
			var mismatch=Object.entries(aDefinition).some(([key,value])=>
			{
				if(def[key]!==value)
				{
					return true
				}
			})
			if (mismatch){return true}
			else {return false}	
		})
		if (_trie.definitions.length===0)
		{
			delete _trie.definitions
		}
	}	
}

ISHML.Lexicon.prototype.lookup = function (aTerm) 
{
	var _trie = this.trie
	var j=0
	for (let i=0; i < aTerm.length; i++)
	{
		var character=aTerm.charAt(i).toLowerCase()
		if ( ! _trie[character])
		{
			return []
		}
		else
		{	
			_trie = _trie[character]
		}
	}
	return _trie.definitions||[]
}
ISHML.Lexicon.prototype.register = function (...someTerms) 
{
	var terms=someTerms
	var _as =function(aDefinition)
	{
		terms.forEach((term)=>
		{
			var _trie = this.trie
			for (let i = 0, length =term.length; i < length; i++)
			{
				var character = term.charAt(i)
				_trie = (_trie[character] =_trie[character] || {})
			}
			if (!_trie.definitions)
			{
				_trie.definitions= []
			}
			_trie.definitions.push(aDefinition)
		})	
		return this
	}	
	return {as:_as.bind(this)}	
}
ISHML.Lexicon.prototype.search = function (aLexeme, aSeparator=/[\,|\.|;|\!|\?|\s]/) 
{
	var _trie = this.trie
	var _results = []
	var j=0
	//trim leading separators.
	while(aSeparator.test(aLexeme[j])){j++}
	for (let i=j; i < aLexeme.length; i++)
	{
	//	if (!aSeparator.test(aLexeme[i]))
	//	{	
			var character=aLexeme.charAt(i).toLowerCase()
			if ( ! _trie[character])
			{
				return _results
			}
			else
			{	
				if (_trie[character].definitions)
				{
					if (i<aLexeme.length-1 && aSeparator.test(aLexeme.substring(i+1)))
					{	
						var result={definitions:_trie[character].definitions.slice(0)}
						result.remainder=aLexeme.substring(i+1).slice(0)
						result.lexeme=aLexeme.substring(0,i+1).slice(0)
						_results.unshift(result)
					}
					else if (i===aLexeme.length-1)
					{
						var result={}
						result.definitions=_trie[character].definitions.slice(0)
						result.remainder=""
						result.lexeme=aLexeme.slice(0)
						_results.unshift(result)
					}
				}
				_trie = _trie[character]
			}
	}
	
	return _results
}
ISHML.Lexicon.prototype.tokenize  = function* (aText, aSeparator=/[\,|\.|;|\!|\?|\s]/)
{
	var candidates=[{tokens:[],remainder:aText}]
	//var finalCandidates=[]
	var revisedCandidates
	while(candidates.length>0)
	{
		revisedCandidates=[]
		for (var i =0; i < candidates.length; i++)
		{	
			if (candidates[i].remainder.length>0)
			{
				var entries=this.search(candidates[i].remainder)
				if (entries.length>0)
				{	
					for (var j =0; j < entries.length; j++)
					{	

						let result={}
						let token={definitions:entries[j].definitions,lexeme:entries[j].lexeme}

						result.tokens=candidates[i].tokens.slice(0)
						result.tokens.push(token)
						result.remainder=entries[j].remainder.replace(aSeparator,"")
						
						if (result.remainder.length>0)
						{
							revisedCandidates.push(result)
						}
						else
						{
							delete result.remainder
							yield result
						}	
					}	
				}//else candidate is thrown away.
			}
		/*	else
			{
				delete result.remainder
				yield result
			}
		*/	
		}
		candidates=revisedCandidates
		if (candidates.length>=10000)  //safeguard
		{
			break
		}
	}	
}

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
ISHML.Passage= function Passage(aTemplate="",aComposer)
{
	/*
	aTemplate=`I took the _thing_ to the _place_.`
	*/
	
	if (this instanceof ISHML.Passage)
	{
		Object.defineProperty(this, "template", {value:[], writable: true})
		Object.defineProperty(this, "data", {value:{}, writable: true})
		if (aComposer)
		{
			var composer=aComposer.bind(this)
		}
		Object.defineProperty(this, "composer", {value:composer||ISHML.Passage.prototype.compose.bind(this), writable: true})
		if(aTemplate.length>0)
		{
			this.data={}
			this.template=aTemplate.split(/(_[^_^\s]*_)/)
			this.template.forEach((phrase)=>
			{
				this[phrase]=new ISHML.Passage()
				this.data[phrase]=phrase
			}) 
		}
		return this
	}
	else
	{
		return new Passage(aTemplate)
	}
}
ISHML.Passage.prototype.text=function(aData)
{
	var text=""
	if(aData)
	{
		this.data=Object.assign(this.data,aData)
	}
	this.template.forEach((phrase)=>
	{
		if(this.data[phrase] instanceof Array)
		{
			var items=this.data[phrase]
		}
		else
		{
			var items=[]
			items.push(this.data[phrase])
		}
		items.forEach((item,index,list)=>
		{
			text=text+this.composer(phrase,item,index,list)	
		})
	})
	return text
}
ISHML.Passage.prototype.compose=function(aPhrase, anItem,anIndex,aList)
{
	if(this[aPhrase].template.length>0)
	{	
		var data={}
		data[aPhrase]=anItem
		return this[aPhrase].text(data)
	}	
	else
	{
		return this.data[aPhrase].toLocaleString() 
	}
}

ISHML.Plot=function Plot(aYarn)
{

	if (this instanceof ISHML.Plot)
	{
		//  initialization section

		Object.defineProperty(this, "yarn", {value:aYarn, writable: true})

		return this
	}
	else return new Plot(aYarn)
	
}
ISHML.Plot.prototype.add= function (...somePlotpoints)
{
	var plotpoint
	var key
	somePlotpoints.forEach((p)=>
	{
		if(p instanceof ISHML.Plotpoint)
		{
			plotpoint=p
			key=p.key
		}
		else
		{
			key=p
			plotpoint=new ISHML.Plotpoint(this.yarn,key)
		}
		this[plotpoint.key]=plotpoint
		this.yarn.plot[key]=plotpoint
	})
	return plotpoint
}
ISHML.Plot.prototype.hasPlotpoint=function(aKey)
{
	if (this.hasOwnProperty(aKey))
	{
		return true
	}
	else return (false)
}
ISHML.Plot.prototype.narrate=function(aTwist)
{

	return Object.values(this).some(plotpoint=>plotpoint.narrate(aTwist))
	
}
ISHML.Plot.prototype.disjoin = function(aPlot)
{
	var result=new ISHML.Plot()
	if (aPlot instanceof ISHML.Plot)
	{
		var plot=aPlot
	}
	else
	{
		var plot=new ISHML.Plot(aPlot)
	}	
	Object.entries(this).forEach(([key,value])=>
	{
		if (!plot.hasOwnProperty(key))
		{
			result[key]=value
		}
	})
	Object.entries(plot).forEach(([key,value])=>
	{
		if (!this.hasOwnProperty([key]))
		{
			result[key]=value
		}
	})
	
	return result
}


ISHML.Plot.prototype.join = function(aPlot)
{
	var result=new ISHML.Plot()
	if (aPlot instanceof ISHML.Plot)
	{
		var plot=aPlot
	}
	else
	{
		var plot=new ISHML.Plot(aPlot)
	}
	if (plot.size < this.size)
	{	
		Object.entries(plot).forEach(([key,value])=>
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
			if (plot.hasOwnProperty(key))
			{
				result[key]=value
			}
		})	
	}	

	return result
}


ISHML.Plot.prototype.omit = function(aPlot)
{
	var result=new ISHML.Plot()
	if (aPlot instanceof ISHML.Plot)
	{
		var plot=aPlot
	}
	else
	{
		var plot=new ISHML.Plot(aPlot)
	}
	Object.entries(this).forEach(([key,value])=>
	{
		if (!plot.hasOwnProperty(key))
		{
			result[key]=value
		}
	})
	
	return result
}

ISHML.Plot.prototype.toArray = function()
{
	return Object.values(this)
}
ISHML.Plot.prototype.union = function(aPlot)
{
	if (aPlot instanceof ISHML.Plot)
	{
		var plot=aPlot
	}
	else
	{
		var plot=new ISHML.Plot(aPlot)
	}
	return Object.assign(this,plot)
}
ISHML.Plot.prototype.cut=function(aKey)
{	
	if (aKey instanceof ISHML.Knot)
	{
		var key=aKey.key
	}
	else
	{
		var key=ISHML.util.formatKey(aKey)
	}	
	var deletedPlotpoint = Object.assign({}, this[key])
	delete this[key]
	return deletedPlotpoint
}
ISHML.Plot.prototype.where = function(aFilter)
{
	var result=new ISHML.Plot()
	var entries=Object.entries(aPlot).filter(aFilter)
	entries.forEach(([key,value])=>{result[key]=value})
	return result
}

ISHML.Plotpoint= function Plotpoint(aYarn,aKey)
{
	if (this instanceof ISHML.Plotpoint)
	{
		this.key=ISHML.util.formatKey(aKey)
		this.yarn=aYarn
		this.plot=new ISHML.Plot(aYarn)
		//this.$=undefined
		
		aYarn.plot[this.key]=this
		return this
	}
	else
	{
		return new Plotpoint(aYarn,aKey)
	}	
}
ISHML.Plotpoint.prototype.add= function (aPlotpoint)
{
	if(aPlotpoint instanceof ISHML.Plotpoint)
	{
		var plotpoint=aPlotpoint
		var key=aPlotpoint.key
	}
	else
	{
		var key=ISHML.util.formatKey(aPlotpoint)
		plotpoint=new ISHML.Plotpoint(this.yarn,key)
	}
	this.plot[plotpoint.key]=plotpoint
	this.yarn.plot[key]=plotpoint
	
	return plotpoint
}
ISHML.Plotpoint.prototype.heed=function(aDocumentSelector)
{
	var yarn=this.yarn
	var element=document.querySelector(aDocumentSelector)
	var eventString="click"
	if (element)
	{	
		if (element.classList.contains("ISHML-input")){eventString="keyup"}

		return new Promise((resolve)=> 
		{
			if(ISHML.util._harkenings[aDocumentSelector])
			{
				var harkeningHandler=ISHML.util._harkenings[aDocumentSelector][eventString]
				if (harkeningHandler)
				{
					element.removeEventListener(eventString,harkeningHandler)
				}
			}
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

					if (harkeningHandler)
					{
						e.target.addEventListener(eventString,harkeningHandler)
					}
					
					resolve(input)
				}
	 		})
		})
	}	
}
ISHML.Plotpoint.prototype.narrate= function (aTwist)
{
	this.plot.narrate(aTwist)
	return false
}		
ISHML.Plotpoint.prototype.situation= function (aSituation=()=>true)
{
	
	return aSituation()
}
ISHML.Plotpoint.prototype.resolution= function (aSituation=()=>true)
{
	
	return aSituation()
}
ISHML.Plotpoint.prototype.understand=function(...someTerms)
{
	var definition={key:this.key,kind:"plotpoint",part:"verb",plotpoint:this}
	
	var _as=(aDefinition={})=>
	{
		this.yarn.lexicon.register(...someTerms).as(Object.assign(definition,aDefinition))
		return this
	}
	return {as:_as}
}

ISHML.Ply= function Ply(aKnot, aWeight=undefined, aConverseTieKey)
{
	if (this instanceof ISHML.Ply)
	{
		this.knot=aKnot
		this.weight=aWeight
		this.converse=aConverseTieKey
		return this
	}
	else
	{
		return new Ply(aKnot, aWeight, aConverseTieKey)
	}	
}

ISHML.Rule=function Rule(aConfiguration={}) 
{
	if (this instanceof ISHML.Rule)
	{
		Object.defineProperty(this, "parser", {value:aConfiguration.parser || this.snip,writable: true})
		
		if(aConfiguration.minimum !== undefined)
		{
			Object.defineProperty(this, "minimum", {value:aConfiguration.minimum,writable: true})
		}
		else
		{
			Object.defineProperty(this, "minimum", {value:1,writable: true})
		}
		if(aConfiguration.maximum !== undefined)
		{
			Object.defineProperty(this, "maximum", {value:aConfiguration.maximum,writable: true})
		}
		else
		{
			Object.defineProperty(this, "maximum", {value:1,writable: true})
		}
		if(aConfiguration.skip !== undefined)
		{
			Object.defineProperty(this, "skip", {value:aConfiguration.skip,writable: true})
		}
		else
		{
			Object.defineProperty(this, "skip", {value:false,writable: true})
		}
		Object.defineProperty(this, "filter", {value:aConfiguration.filter,writable: true})
		return this
	}
	else
	{
		return new Rule(aConfiguration)
	}
}

ISHML.Rule.prototype.parse =function(someTokens)
{
	var counter
	var candidates=[]
	var keys=Object.keys(this)
	if (keys.length===0)
	{
		var candidate=ISHML.Interpretation([],someTokens)
		if (this.minimum===0 && !this.skip)
		{
			candidates.push(ISHML.Interpretation(candidate.gist,candidate.remainder))
		}
		counter = 1

		while (counter <= this.maximum)
		{	
			var token =	{definitions:someTokens[0].definitions.filter(this.filter), lexeme:someTokens[0].lexeme.slice(0)}
			if (token.definitions.length>0)
			{
				if (!this.skip)
				{
					candidate.gist.push(token)
				}
				candidate.remainder=candidate.remainder.slice(1)
				if (counter >= this.minimum)
				{
					var revisedCandidate=ISHML.Interpretation(candidate.gist, candidate.remainder)
					if (this.maximum===1)
					{
						revisedCandidate.gist=revisedCandidate.gist[0]
					}
					
					candidates.push(revisedCandidate)
				}
				
			}
			else {return false}
			counter++	
		}
		if (candidates.length>0)
		{
			return candidates
		}
		else {return false}		
	}
	else
	{	
		var candidates=[ISHML.Interpretation([],someTokens)]
		var choices=[]
		keys.forEach((key)=>
		{
			//convert property into an array of subrules
			var ruleList=[].concat([],this[key]) //Each sub rule may have more than one option
			ruleList.forEach((rule)=>
			{
				//for each rule parse up to maximum times
				candidates.forEach((candidate)=>
				{
					var revisedCandidate=ISHML.Interpretation(candidate.gist,candidate.remainder)
					if (rule.minimum===0 && !rule.skip)
					{
						choices.push(ISHML.Interpretation(revisedCandidate.gist,revisedCandidate.remainder))
					}
					counter = 1
					while (counter<=rule.maximum)
					{
						if(revisedCandidate.remainder.length>0)
						{
							var snippets=rule.parse(revisedCandidate.remainder)
							//add snippets to revised candidates
							if (snippets)
							{
								snippets.forEach((snippet)=>
								{
									if (snippet)
									{
										revisedCandidate.remainder=snippet.remainder										
										if (!this[key].skip)
										{	
											if (!revisedCandidate.gist[counter-1]){revisedCandidate.gist[counter-1]={}}
											revisedCandidate.gist[counter-1][key]=snippet.gist	
											if (counter>=rule.minimum)
											{
												choices.push(ISHML.Interpretation(revisedCandidate.gist,revisedCandidate.remainder))
											}	
										}	
									}
								})
							}
						}
						counter++
					}
				})  // choice of rule list
			})
			candidates=choices
			choices=[]		
		})
		if (this.maximum===1)
		{
			candidates.forEach((candidate)=>
			{
				candidate.gist=candidate.gist[0]
			})
		}
		return candidates
	}
}	


ISHML.Storyline= function Storyline(aYarn)
{
	if (this instanceof ISHML.Storyline)
	{
		//  initialization section
		this._storyline=[]
		this._segue_=aYarn.plot
		return this
	}
	else
	{
		return new Storyline(aYarn)
	}	
}
ISHML.Storyline.prototype.advance= function()
{
	this._storyline.shift()
	return this
}
ISHML.Storyline.prototype.continues= function(){return this._storyline.length>0}
ISHML.Storyline.prototype.current= function()
{
	return {plot:this._storyline[0].plot||this._segue_,twist:this._storyline[0].twist}
}

ISHML.Storyline.prototype.introduce= function(aPlot,aTwist)
{
	//story.storyline.introduce(story.net.player.score)  --adds object to plotline

	this._storyline.push({plot:aPlot, twist:aTwist})
	return this
}
ISHML.Storyline.prototype.segue= function(aPlot)
{
	this._segue_=aPlot
	return this
}

ISHML.util={_seed:undefined, _harkenings:{}}

ISHML.util.enumerator=function* (aStart =1)
{
  let i = aStart;
  while (true) yield i++
}

ISHML.util.formatKey=function(aTieKey)
{
	/*var tieKey=aTieKey.replace(/\s+/g, '_')  //friendship
	if (!tieKey.startsWith("_"))
	{
		tieKey="_"+tieKey
	}
	if (!tieKey.endsWith("_"))
	{
		tieKey=tieKey+"_"
	}*/
	return aTieKey.replace(/\s+/g, '_')
}

ISHML.util.random = function() 
{
	this._seed = this._seed * 16807 % 2147483647
	return (this._seed-1)/2147483646
}
ISHML.util.reseed = function(aSeed=Math.floor(Math.random() * 2147483648)) 
{
	var seed=aSeed % 2147483647
	if (seed <= 0){seed += 2147483646}
	this._seed=seed	
}
ISHML.util.shuffle=function(anArray,aCount=undefined)
{
	var array=anArray.slice(0)
	var m = array.length
	var count=aCount||array.length
	for (let i=0; i < count; i++)
	{
		let randomIndex = Math.floor(this.random() * m--)
		let item = array[m]
		array[m] = array[randomIndex]
		array[randomIndex] = item
	}
	return array.slice(-count)
}

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
