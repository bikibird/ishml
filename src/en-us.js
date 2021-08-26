//var grammar = ishml.yarn.grammar || new ishml.Rule()
//var lexicon = ishml.yarn.lexicon || new ishml.Lexicon()
//var _ =ishml.template 
/*ishml.yarn.lexicon*/
ishml.yarn.lexicon
    //adjectives
    .register("all").as({part:"adjective",select:()=>$.thing})

    //articles
    .register("the", "a", "an").as({ part: "article" })

    //conjunctions
    .register("and",",").as({ part: "conjunction" })

    //particles
    .register("up").as({ key: "up", part: "particle" })

    //prepositions
    .register("from").as({ key: "from", part: "preposition" })
    .register("in").as({ key: "in", part: "preposition" })
    .register("to").as({ key: "to", part: "preposition" })
    
    //relations
    .register("in", "inside","inside of").as({cord: "in", part:"relation"})
    .register("under", "underneath","below").as({cord: "under", part:"relation"})
    .register("on", "on top of").as({cord: "on", part:"relation"})
    .register("next to", "beside").as({cord: "beside", part:"relation"})

	//directions
	.register("north","n").as({part: "noun",  select:new ishml.Cord(subject=>subject.in.exit.north)})
    .register("south","s").as({part: "noun",  select:new ishml.Cord(subject=>subject.in.exit.south)})
    .register("east","e").as({part: "noun",  select:new ishml.Cord(subject=>subject.in.exit.east)})
    .register("west","w").as({part: "noun",  select:new ishml.Cord(subject=>subject.in.exit.west)})
    .register("northeast","ne").as({part: "noun",  select:new ishml.Cord(subject=>subject.in.exit.northeast)})
    .register("northwest","nw").as({part: "noun",  select:new ishml.Cord(subject=>subject.in.exit.northwest)})
    .register("southeast","se").as({part: "noun",  select:new ishml.Cord(subject=>subject.in.exit.southeast)})
    .register("west","w").as({part: "noun",  select:new ishml.Cord(subject=>subject.in.exit.southwest)})
	.register("up","u").as({part: "noun",  select:new ishml.Cord(subject=>subject.in.exit.up)})
	.register("down","d").as({part: "noun",  select:new ishml.Cord(subject=>subject.in.exit.down)})
/*grammar*/

ishml.yarn.grammar.command=ishml.Rule()

ishml.yarn.grammar.nounPhrase=ishml.Rule()
    .snip("article").snip("adjectives").snip("noun").snip("adjunct").snip("conjunct")

ishml.yarn.grammar.nounPhrase.article.configure({minimum:0, filter:(definition)=>definition?.part==="article"})

ishml.yarn.grammar.nounPhrase.adjectives.configure({minimum:0, maximum:Infinity, separator:/^\s*,?and\s+|^\s*,\s*|^\s+/, 
    filter:(definition)=>definition?.part==="adjective"})
ishml.yarn.grammar.nounPhrase.noun.filter=(definition)=>definition?.part==="noun"

ishml.yarn.grammar.nounPhrase.adjunct
    .configure({minimum:0})
    .snip("relation").snip("nounPhrase",ishml.yarn.grammar.nounPhrase)
    
ishml.yarn.grammar.nounPhrase.adjunct.relation.configure({filter:(definition)=>definition?.part==="relation"})

ishml.yarn.grammar.nounPhrase.conjunct
    .configure({minimum:0})    
    .snip("conjunction").snip("nounPhrase",ishml.yarn.grammar.nounPhrase)
ishml.yarn.grammar.nounPhrase.conjunct.conjunction.configure({filter:(definition)=>definition?.part==="conjunction"})

ishml.yarn.grammar.preposition=ishml.Rule().configure({filter:(definition)=>definition?.part==="preposition"})
ishml.yarn.grammar.command.snip("subject",ishml.yarn.grammar.nounPhrase.clone()).snip("verb").snip("object")
ishml.yarn.grammar.ioPhrase=ishml.Rule().configure({mode:ishml.enum.mode.any})
    .snip(1)
    .snip(2)
ishml.yarn.grammar.ioPhrase[1].snip("recipient",ishml.yarn.grammar.nounPhrase)    
ishml.yarn.grammar.ioPhrase[2].snip("command",ishml.yarn.grammar.command)

ishml.yarn.grammar.indirectObject=ishml.Rule().configure({minimum:0})
    .snip("preposition",ishml.yarn.grammar.preposition).snip("phrase",ishml.yarn.grammar.ioPhrase)

ishml.yarn.grammar.command.subject.configure({minimum:0 })


ishml.yarn.grammar.command.subject.noun.configure({separator:/^\s*,\s*|^\s+/})

ishml.yarn.grammar.command.verb.configure({filter: (definition)=>definition.part==="verb"})

ishml.yarn.grammar.command.object=ishml.Rule()
.configure({minimum:0, mode:ishml.enum.mode.any})
.snip(1)  //verbalParticle(required)/directObject/indirectObject
.snip(2)  //directObject/verbal particle(optional)/indirectObject
.snip(3)  //indirectObject/directObject

ishml.yarn.grammar.command.object[1].snip("verbalParticle").snip("directObject",ishml.yarn.grammar.nounPhrase).snip("indirectObject",ishml.yarn.grammar.indirectObject)
ishml.yarn.grammar.command.object[2].snip("directObject",ishml.yarn.grammar.nounPhrase).snip("verbalParticle").snip("indirectObject",ishml.yarn.grammar.indirectObject)
ishml.yarn.grammar.command.object[3].snip("indirectObject",ishml.yarn.grammar.nounPhrase).snip("directObject",ishml.yarn.grammar.nounPhrase)

ishml.yarn.grammar.command.object[1].verbalParticle.configure({filter:(definition)=>definition.part==="particle"})
ishml.yarn.grammar.command.object[2].verbalParticle.configure({minimum:0,filter:(definition)=>definition.part==="particle"})

ishml.yarn.grammar.nounPhrase.semantics=(interpretation)=>
{
    var gist=interpretation.gist
    gist.select=new ishml.Cord((...args)=>
    {
        var cord=gist.noun.definition.select(...args).cord
        if (gist.adjectives)
        {
            gist.adjectives.forEach(adjective=>
            {
				cord=adjective.definition.select(cord).cord
                /*cord=cord.cross(adjective.definition.select(...args))
                .per((noun,adjective)=>noun.knot===adjective.knot)*/
            })
        }
        if(gist.adjunct)
        {
            cord=gist.adjunct.nounPhrase.select(...args).cross(cord)
                .per((adjunct,noun)=>noun.entwine({ply:adjunct.ply,via:gist.adjunct.relation.definition.cord}).aft)
        } 
        if (gist.conjunct)
        {
            cord=cord.add(gist.conjunct.nounPhrase.select(...args)).disjoint
        }
        return cord  
    })
    return interpretation
}
ishml.yarn.grammar.command.subject.semantics=ishml.yarn.grammar.nounPhrase.semantics
ishml.yarn.grammar.command.semantics=(interpretation)=>
{
    var valence=interpretation.gist.verb.definition.valence
    if (valence ===0 && interpretation.gist.hasOwnProperty("object")){return false}
    if (valence ===1 && (interpretation.gist.object?.hasOwnProperty("indirectObject") || !interpretation.gist.object?.hasOwnProperty("directObject"))){return false}
    if (valence ===2 && (!interpretation.gist.object?.hasOwnProperty("indirectObject") || !interpretation.gist.object?.hasOwnProperty("directObject"))){return false}
    interpretation.gist.verb.plot=interpretation.gist.verb.definition.plot
	if (interpretation.gist.verb.definition.select){interpretation.gist.verb.select=interpretation.gist.verb.definition.select}
    
    Object.assign(interpretation.gist,interpretation.gist.object)
    delete interpretation.gist.object

    if (interpretation.gist.hasOwnProperty("indirectObject"))
    {
        interpretation.gist.preposition=interpretation.gist.indirectObject.preposition
        delete interpretation.gist.indirectObject.preposition
        Object.assign(interpretation.gist.indirectObject,interpretation.gist.indirectObject.phrase?.recipient)
        Object.assign(interpretation.gist.indirectObject,interpretation.gist.indirectObject.phrase?.command)
        delete interpretation.gist.indirectObject.phrase
    }


    if (interpretation.gist.hasOwnProperty("subject"))  //Jane, drop ball => Ask Jane to drop ball
    {
        interpretation.gist=
        { 
            subject:{noun:ishml.yarn.lexicon.search("player", {longest:true, full:true}).filter(snippet=>snippet.token.definition.role==="player")[0].token},
            verb:ishml.yarn.lexicon.search("ask", {longest:true, full:true}).filter(snippet=>snippet.token.definition.part==="verb" && snippet.token.definition.preposition==="to")[0].token,
            directObject:interpretation.gist.subject,
            preposition:ishml.yarn.lexicon.search("to", {longest:true, full:true}).filter(snippet=>snippet.token.definition.part==="preposition")[0].token,
            indirectObject:interpretation.gist
        }
        interpretation.gist.verb.plot=interpretation.gist.verb.definition.plot
    }
    else
    {
        interpretation.gist.subject=
        {
            noun:ishml.yarn.lexicon.search("player", {longest:true, full:true}).filter(snippet=>snippet.token.definition.role==="player")[0].token
        }
    }
    //interpretation.gist.subject.select=(...args)=>interpretation.gist.subject.noun.definition.select(...args).cord
	interpretation.gist.subject.select=interpretation.gist.subject.noun.definition.select
    var vPreposition=interpretation.gist.verb.definition.preposition
    var vParticle=interpretation.gist.verb.definition.particle
    if(vPreposition)
    {
        if (!(interpretation.gist.preposition?.definition.key===vPreposition))
        {
            return false
        }
    }
    else
    {
        if (interpretation.gist.hasOwnProperty("preposition"))
        {
            return false
        }
    }
    if (vParticle)
    {
        if (!(interpretation.gist.verbalParticle?.definition.key===vParticle))
        {
            return false
        }
    }
    else
    {
        if (interpretation.gist.hasOwnProperty("verbalParticle"))
        {
            return false
        }
    }
    return true
}

ishml.yarn.parser=ishml.Parser({ lexicon: ishml.yarn.lexicon, grammar: ishml.yarn.grammar.command})

/* adaptive text-- cords*/
Object.defineProperty(ishml.Cord, "are", { get: function()
{
	var number=this.size
	if (number>1){return "are"}
	else
	{
		if (number===1)
		{
			var ply=[...this.plies][0]
			if (ply.ply.quantity>1|| ply.knot.plural || ply.knot.quantity>1){return "are"}
			else {return "is"}
		}	
	}
	return "is"
}})

Object.defineProperty(ishml.Cord, "them", { get: function()
{
	var number=this.size
	if (number>1){return "them"}
	else
	{
		if (number===1)
		{
			var ply=[...this.plies][0]
			if (ply.ply.quantity>1|| ply.knot.plural || ply.knot.quantity>1){return "them"}
			else {return ply.knot.objectivePronoun ?? "it"}
		}	
	}
	return "it"
}})

Object.defineProperty(ishml.Cord, "they", { get: function()
{
	var number=this.size
	if (number>1){return "they"}
	else
	{
		if (number===1)
		{
			var ply=[...this.plies][0]
			if (ply.ply.quantity>1|| ply.knot.plural || ply.knot.quantity>1){return "they"}
			else {return ply.knot.objectivePronoun ?? "it"}
		}	
	}
	return "it"
}})

/* Cordage */
var cords=ishml.Cord.cordage
cords.action=["action@"]
cords.actor=["actor@is:actor"]
cords.carries=["carries-carried_by"]
cords.carried_by=["carried_by-carries"]
cords.closed=["openable@is:openable","closed@is:closed"]
cords.commandable=["commandable@is:commandable"]
cords.container=["container@is:container"]
cords.contains=["contains=in"]
cords.in=["in=contains"]


cords.door=["door@is:door"]
cords.down=["exit:down=exit:up"]
cords.east=["exit:east=exit:west"]
cords.edible=["edible@is:edible"]
cords.fixture=["fixture@is:fixture"]
cords.has_skill=["has_skill-skill_of"]
cords.locked=["lockable@is:lockable","locked@is:locked"]

cords.north=["exit:north=exit:south"]
cords.northeast=["exit:northeast=exit:southwest"]
cords.northwest=["exit:northwest=exit:southeast"]
cords.open=["openable@is:openable","open@is:open"]
cords.place=["place@is:place","container@is:container"]
cords.portable=["portable@is:portable"]
cords.reachable=["reachable@is:reachable"]


cords.south=["exit:south=exit:north"]
cords.southeast=["exit:southeast=exit:northwest"]
cords.southwest=["exit:southwest=exit:northeast"]
cords.supporter=["supporter@is:supporter"]
cords.on=["on=supports"]

cords.touchable=["touchable@is:touchable"]
cords.unlocked=["lockable@is:lockable","unlocked@is:unlocked"]
cords.up=["exit:up=exit:down"]
cords.wearable=["wearable@is:wearable"]
cords.wears=["wears-worn_by"]
cords.west=["exit:west=exit:east"]

cords.closedDoor=[...cords.door, ...cords.closed]
cords.openDoor=[...cords.door, ...cords.open]
cords.lockedDoor=[...cords.closedDoor, ...cords.locked]
cords.thing=["thing@is:thing",...cords.portable,...cords.touchable]

/*knots*/

/* pronouns */

ishml.lang.pronouns=
{
  epicene:{subjective:"they",objective:"them",reflexive:"themself",possessive:"theirs"},
  female:{subjective:"she",objective:"her",reflexive:"herself",possessive:"hers"},
  male:{subjective:"he",objective:"him",reflexive:"himself",possessive:"his"},
  neuter:{subjective:"it",objective:"it",reflexive:"itself",possessive:"its"}
}
ishml.lang.preserveCase=function (text, pattern,initialism=true)
{
	var result = ""
	
	for (var i =0; i < text.length; i++)
	{
		var c = text.charAt(i)
		if (i<pattern.length)
		{
			var p=pattern.charAt(i)
		}
		else
		{	
			if (initialism){var p=c}
			else {var p=pattern.charAt(pattern.length-1)}
		}
		//var p = pattern.charAt(i)
		if(p === p.toUpperCase())
		{
			result += c.toUpperCase()
		}
		else
		{
			result += c.toLowerCase()
		}
	}

	return result
}

ishml.lang.a=function(word)
{
	var _trie=ishml.lang.a.trie
	for (let letter of word+"$") // honey,honor,hotel
	{
		if(_trie.hasOwnProperty(letter))
		{
			if( typeof _trie[letter]==="number")
			{
				if(_trie[letter]===1){return "an"}
				if(_trie[letter]===0){return "a"}
			}
			else
			{
				_trie=_trie[letter]
			}	
			
		}
		else
		{
			if(_trie.$===1){return "an"}
			if(_trie.$===0){return "a"}
		}
	}
}
ishml.lang.a.trie={A:1,a:1,e:{u:{l:{e:1,$:0},r:{e:{c:0,k:0,s:0,$:1},i:1,$:0},$:0},w:0,$:1},F:1,H:{A:0,$:1},h:{b:1,e:{i:{r:1,$:0},r:{b:{a:{r:0,$:1},e:0,i:0,o:0,$:1},$:0},$:0},o:{m:{a:{g:1,$:0},$:0},n:{e:{$:0,s:{t:1,$:0}},o:{l:0,$:1},$:0},r:{s:{$:0,d:1},$:0},u:{r:1,$:0},$:0},$:0},I:1,i:1,L:{T:{D:0,$:1},$:1},M:{R:0,$:1},N:1,n:{d:{a:1,$:0},s:1,t:1,w:1,$:0},o:{n:{c:{e:0,$:1},e:{a:1,i:1,o:{k:1,$:0},r:1,y:{e:0,$:1},$:0},$:1},u:{a:0,i:0,$:1},$:1},R:1,r:{z:1,$:0},S:1,u:{b:{i:0,$:1},g:{a:{n:0,$:1},r:0,$:1},i:0,k:{m:1,$:0},l:{u:0,y:0,$:1},m:{a:0,e:0,$:1},n:{a:{n:{i:0,$:1},$:1},e:{o:0,s:0,$:1},i:{d:1,m:{e:0,$:1},n:1,s:{s:1,$:0},$:0},o:{s:{$:1,o:0},$:1},u:{m:0,$:1},$:1},r:{a:{n:{g:1,$:0},$:1},e:{n:1,s:1,$:0},i:0,o:0,u:0,y:0,$:1},s:{a:0,b:0,e:0,i:0,o:0,t:{i:1,$:0},u:0,$:1},t:{h:{e:{$:1,r:0},$:1},i:0,o:0,u:0,a:0,e:0,$:1},v:0,w:0,y:{s:0,$:1},$:1},x:{a:{c:1,$:0},e:{r:{s:1,$:0},$:0},m:1,s:1,t:1,r:1,$:0},X:1,y:{t:1,$:0},$:0}

ishml.lang.capitalize=function(text)
{
	if(text){return `${text[0].toUpperCase()}${text.slice(1)}`}
	else {return text}
}
ishml.lang.es=function(word)
{
	var key=word.toLowerCase()
	if(ishml.lang.es.third.hasOwnProperty(key)){return ishml.lang.preserveCase(ishml.lang.es.third[key],word)}

	const rules=
	[
		v=>v+"s",
		v=>v+"es",
		v=>v.slice(0,-1)+"ies",
		v=>v+"zes",
		v=>v.slice(0,-2)+"ves",
		v=>v.slice(0,-1)+"ves",
		v=>v.slice(0,-2)+"es",
		v=>v+"ren",
		v=>v.slice(0,-2)+"en",
		v=>v+"ses",
	]
	var _trie=ishml.lang.es.trie
	var pattern=("$"+word).split("").reverse().join("")
	for (let letter of pattern) 
	{
		if(_trie.hasOwnProperty(letter))
		{
			if( typeof _trie[letter]==="number")
			{
				return rules[_trie[letter]](word)
				
			}
			else
			{
				_trie=_trie[letter]
			}	
			
		}
		else
		{
			if (_trie.hasOwnProperty("$")){return rules[_trie.$](word)}
			else {return rules[0](word)}
		}
	}
}
ishml.lang.es.trie={h:{p:{a:{r:{g:{o:{e:{m:1}},$:0}}}},c:{n:{u:1,y:{l:1},i:1,e:1,a:1},a:{m:0,$:1},y:0,$:1},s:1},s:{a:{g:{t:9,e:9,$:1},i:1},i:{c:1,l:1,w:1,o:1,d:9},u:{l:{l:1,p:9},c:1,o:1,b:1,r:1},o:9,m:0,$:1},y:{a:0,o:0,e:0,u:0,$:2},x:1,i:{p:1,x:1},o:{d:{a:{n:{i:1}},$:1},g:1,t:{e:1},h:{c:1},i:{d:1},a:1,y:{o:1},s:1,e:{d:1},r:1},f:{l:{a:5},a:{e:{h:5}}},z:{i:3,z:1,t:1},u:{f:1}}

ishml.lang.es.third={have:"has","be":"is"}
ishml.lang.ed=function(word)
{
	var key=word.toLowerCase()
	if(ishml.lang.ed.verbs.hasOwnProperty(key)){return ishml.lang.preserveCase(ishml.lang.ed.verbs[key],word)}

	const rules=[v=>v+"ed", v=>v+v.charAt(v.length-1)+"ed", v=>v+"d", v=>v.slice(0,-1)+"ied", v=>v.slice(0,-3)+"ed", v=>v.slice(0,-1)+"d", v=>v+"t", v=>v.slice(0,-1)+"t", v=>v.slice(0,-2)+"t", v=>v.slice(0,-3)+"t", v=>v.slice(0,-2)+"ade", v=>v.slice(0,-3)+"ade", v=>v.slice(0,-2)+"am", v=>v.slice(0,-3)+"ame", v=>v.slice(0,-2)+"an", v=>v.slice(0,-3)+"ang", v=>v.slice(0,-3)+"ank", v=>v.slice(0,-2)+"at", v=>v.slice(0,-3)+"ate", v=>v.slice(0,-4)+"aught", v=>v.slice(0,-3)+"ave", v=>v.slice(0,-2)+"aw", v=>v.slice(0,-2)+"ay", v=>v.slice(0,-2)+"did", v=>v.slice(0,-3)+"eld", v=>v.slice(0,-3)+"ell", v=>v.slice(0,-3)+"od", v=>v.slice(0,-2)+"ew", v=>v.slice(0,-1)+"ew", v=>v.slice(0,-3)+"ft", v=>v.slice(0,-1)+"id", v=>v.slice(0,-3)+"it", v=>v.slice(0,-2)+"lt", v=>v.slice(0,-2)+"pt", v=>v+"ked", v=>v+"n", v=>v.slice(0,-3)+"ode", v=>v.slice(0,-3)+"oke", v=>v.slice(0,-3)+"old", v=>v.slice(0,-3)+"ole", v=>v.slice(0,-2)+"on", v=>v.slice(0,-3)+"one", v=>v.slice(0,-3)+"ood", v=>v.slice(0,-3)+"ook", v=>v.slice(0,-3)+"ore", v=>v.slice(0,-3)+"se", v=>v.slice(0,-2)+"ot", v=>v.slice(0,-3)+"ote", v=>v.slice(0,-2)+"ought", v=>v.slice(0,-3)+"ought", v=>v.slice(0,-4)+"ought", v=>v.slice(0,-3)+"ound", v=>v.slice(0,-3)+"ove", v=>v.slice(0,-4)+"ove", v=>v.slice(0,-3)+"ose", v=>v.slice(0,-4)+"oze", v=>v.slice(0,-2)+"ug", v=>v.slice(0,-3)+"ught", v=>v.slice(0,-2)+"un", v=>v.slice(0,-3)+"ung", v=>v.slice(0,-3)+"uck", v=>v.slice(0,-4)+"uck", v=>v.slice(0,-3)+"unk", v=>v.slice(0,-2)+"went", v=>v.slice(0,-1), v=>v, v=>v.slice(0,-2)+"ied"]

	var _trie=ishml.lang.ed.trie
	var pattern=("$"+word).split("").reverse().join("")
	for (let letter of pattern) 
	{
		if(_trie.hasOwnProperty(letter))
		{
			if( typeof _trie[letter]==="number")
			{
				return rules[_trie[letter]](word)
				
			}
			else
			{
				_trie=_trie[letter]
			}	
			
		}
		else
		{
			if (_trie.hasOwnProperty("$")){return rules[_trie.$](word)}
			else {return rules[0](word)}
		}
	}
}	

ishml.lang.ed.verbs={have:"had",be:"was"}
ishml.lang.ed.trie={n:{a:{e:{m:{e:0,$:6}},o:0,l:{p:1},p:{a:{j:1},$:1},m:{o:0,$:1},h:0,g:0,$:1},i:{g:{$:1,r:0,e:14},b:1,t:{$:1,e:0},r:{g:{a:0,$:1}},h:1,d:1,f:1,p:{s:58,$:1},s:{$:1,e:0,o:0},k:1,w:{$:40,t:1}},e:{d:{r:0,l:0,d:0,i:0,u:0,a:0,$:1},k:{$:1,i:0,c:0,a:0,o:0,r:0},g:{r:0,$:1},p:{$:1,o:0,i:0,r:0,e:0,a:0,m:0,p:0,l:0}},o:{l:{l:1},c:{a:0,$:1},d:{$:1,r:0,n:0}},u:{r:14,$:1}},e:{y:{b:48,$:2},d:{i:{r:{e:2,g:2,p:2,$:36},h:{$:64,c:2},l:{s:64,$:2},$:2},$:2},t:{i:{m:{s:47,$:2},b:8,r:47,$:2},$:2},s:{i:{r:{$:54,i:2,a:{$:54,l:2,t:2,i:2,m:2,g:2},p:{u:54,$:2},o:2,e:2,u:2},$:2},o:{o:{h:45,$:2},l:{$:7,c:2,y:2},$:2},$:2},z:{e:{e:{r:{f:55,$:2},$:2}},$:2},v:{i:{g:20,r:{$:2,h:{s:52,$:2},t:{s:52,$:2},d:52},$:2},a:{r:{g:{$:35,n:2},$:2},e:{w:53,l:{s:2,c:2,r:2,$:29},$:2},$:2},e:{e:{r:{n:53,$:2},$:2},$:2},$:2},e:{l:5,s:{s:2,$:21},$:2},n:{i:{h:{s:41,$:2},$:2},$:2},m:{o:{c:{l:2,$:13},$:2},$:2},k:{a:{t:{s:{i:43,$:2},$:43},s:43,m:11,h:43,w:37,$:2},i:{r:60,$:2},$:2},i:{l:{e:2,$:22},$:2},o:{h:{s:{$:5,w:2,t:2,m:2,e:2},$:2},$:2},$:2},h:{c:{t:{a:{c:19}},a:{e:{t:19}}}},t:{e:{u:{q:{o:{c:1}},$:1},s:{o:{t:7},r:{e:7},s:{o:{p:1}},m:0,n:{i:7,$:1},$:7,d:1},n:{$:1,g:0,n:0,o:0},g:{d:0,r:{o:46},$:46},b:{b:0,a:1,$:7},l:{f:0,$:7,l:0,a:0,e:0,m:0},k:{s:1},v:{o:0,i:0,$:1},r:{r:0,p:0,$:1},p:{$:1,m:0,r:0},e:{m:8},h:{w:1},j:1,t:1,w:7},r:{u:{h:7}},u:{o:0,c:7,b:{e:{r:1},$:1},p:{t:1,$:7},h:7,$:1},s:{a:{c:{b:0,$:7}},r:{u:7},u:{b:{$:7,m:0},r:{h:7,$:0}},o:{c:{c:0,$:7}}},i:{u:{q:{c:1,$:7}},b:{$:1,a:0,e:0,i:0,r:0,b:0},m:{i:0,o:{v:0,$:1},b:{u:{s:{$:1,e:0}}},$:1},s:{o:0,i:0,$:17,n:0},f:{e:{n:0,$:1},m:0,$:1,o:{r:{t:1}}},h:{$:7,s:{l:1,$:7}},r:{g:1},l:{f:1,$:7},k:1,n:{k:{$:7,n:1}},w:1,p:{s:7,$:1}},h:{g:{i:{f:50,l:{d:9,$:0,t:9,k:9}}}},o:{l:{$:1,i:0,l:{a:{$:1,b:0}}},o:{h:{$:0,s:8}},g:0,r:{$:1,r:0},v:0,i:0,c:0,$:1},a:{e:{l:0,b:7,h:0,f:0,$:18,r:{e:18},p:0,s:0,w:7},o:0,b:{$:1,m:0},g:0,$:1}},r:{e:{v:{a:{$:1,e:0,l:0,h:0,u:0,w:0}},t:{e:{d:1},n:{i:{w:0,s:{i:1,$:0},l:0,$:1}}},f:{n:1,e:1,s:1}},i:{a:0,$:1},o:{h:{b:1}},a:{e:{$:0,b:44,w:44,h:{s:{i:2,$:0},$:2},t:44},g:0,d:0,l:0,t:{r:0,$:1},o:0,$:1},u:{e:0,o:0,m:{e:1},g:0,$:1}},d:{e:{e:{f:4,r:{$:0,b:4},p:4,l:4},l:{p:5,$:1},h:5,p:0,$:1},n:{e:{l:{$:7,b:0},h:{s:7},p:{s:{u:0,i:0,$:7},$:0},$:0,r:{$:7,t:0,a:0},s:7,b:7},i:{w:51,f:51,r:51,b:51},a:{t:{s:{$:42,d:0}}}},r:{i:{g:{$:0,e:7}}},a:{l:{c:5},e:{r:{p:{s:{$:5,e:0},$:5},$:5,t:{h:5,$:26,e:0},d:{$:0,e:5},h:0,b:0},l:{p:{$:0,r:4},$:4,n:0}},o:0,b:0,$:1},l:{o:{h:24},i:{u:7}},i:{b:{r:{o:10,$:5},$:5},k:1,r:5},o:{o:0,$:1},u:{o:0,a:0,e:0,$:1}},s:{a:{g:1},i:{d:1},u:{c:{o:{p:1}},l:{p:1}},o:1},l:{u:{n:1},a:{e:{d:6,t:39},d:{e:{m:1}},b:1,n:1,r:{i:0,$:1},v:{i:{r:{$:1,r:0}}},u:1,h:1,t:{o:1},p:1},l:{a:{f:25},e:{t:38,w:{$:0,d:{n:7,$:0}},s:38},i:{p:{$:0,s:{r:7,$:0}}}},i:{v:{a:1},r:1},e:{r:{r:{a:{b:1}}},c:{x:1,r:{a:{m:1}}},e:{f:32,n:32},n:{a:{p:{m:{i:1},$:0}}},p:{u:0,$:1},b:{e:1},g:{$:1,d:0},u:{f:{e:0,$:1}}},o:{r:{a:0,$:1},t:{x:1},j:1}},b:{i:1,u:{a:0,$:1},a:1,o:{o:0,$:1},e:1},m:{i:{a:0,d:1,$:2,r:1,h:1,k:1,l:1,w:12},e:{e:0,d:0,t:{s:1},$:1},o:{l:{g:1},t:{m:1}},a:{r:{k:0,$:1},e:0,o:0,a:0,$:1},u:{u:0,$:1}},y:{a:{s:{y:0,$:30,s:0},l:{p:0,r:{e:30},e:{r:30},s:{i:30,$:27},l:0,c:0,f:0,$:30},p:{s:0,$:30}},o:0,l:{f:28,$:3},e:{n:{o:66}},u:{b:48},$:3},p:{e:{e:{l:{s:33},w:33,r:{c:33},k:33},k:0,$:1},a:{e:{l:{$:0,r:6}},o:0,h:{$:1,w:0},$:1},i:{l:{$:1,l:0},s:{$:1,s:0},$:1},o:{l:{e:0,l:{a:{g:1}},$:1},o:0,t:{s:{e:{l:0,$:1},$:1},$:1},$:1},u:{c:{c:0,$:1},o:0,k:0,a:0,r:0,$:1},y:1},w:{o:{r:{g:27,h:27,$:0},l:{b:27,$:0},n:{k:27}},e:{h:{$:0,h:35}},a:{r:{d:27}}},c:{a:34,i:{s:{y:34,$:1},$:34},o:34,e:1,l:34},k:{a:{e:{p:{$:0,s:37},r:{b:37}},y:1},n:{i:{s:16,l:{s:62,$:0},r:{p:0,$:16},$:0,h:{t:49},t:16}},c:{i:{t:{s:{h:0,g:0,$:60},$:0}}},o:{r:1},e:{e:{s:49},r:1}},g:{n:{i:{l:59,r:{$:0,p:{s:{$:15,p:59}},t:59,w:59,b:49},s:15,t:{$:0,s:59},w:{$:0,s:59}},a:{h:{w:0,$:59}}},i:{d:56,a:0,$:1},a:{m:0,$:1},g:0,$:1},o:{d:{e:{r:23},n:{u:23},a:0,$:23},g:{r:{a:0,$:63},$:63,n:0}},f:{i:1,e:{r:1}},z:{i:1},u:{a:2},v:1}

ishml.lang.en=function(word)
{
	var key=word.toLowerCase()
	if(ishml.lang.en.verbs.hasOwnProperty(key)){return ishml.lang.preserveCase(ishml.lang.en.verbs[key],word)}

	const rules=[v=>v+"ed",v=>v+v.charAt(v.length-1)+"ed",v=>v+"d",v=>v+"n",v=>v.slice(0,-1)+"t",v=>v.slice(0,-3)+"ung",v=>v.slice(0,-3)+"ed",v=>v.slice(0,-1)+"d",v=>v.slice(0,-1)+"ten",v=>v.slice(0,-3)+"old",v=>v.slice(0,-1)+"den",v=>v.slice(0,-3)+"eld",v=>v+"en",v=>v.slice(0,-2)+"ain",v=>v.slice(0,-3)+"ame",v=>v.slice(0,-4)+"aught",v=>v.slice(0,-2)+"at",v=>v.slice(0,-2)+"de",v=>v.slice(0,-3)+"ft",v=>v.slice(0,-2)+"pt",v=>v.slice(0,-1)+"id",v=>v.slice(0,-4)+"it",v=>v.slice(0,-2)+"lt",v=>v+"ne",v=>v.slice(0,-3)+"odden",v=>v.slice(0,-3)+"ode",v=>v.slice(0,-3)+"oken",v=>v.slice(0,-3)+"olen",v=>v.slice(0,-2)+"on",v=>v.slice(0,-3)+"one",v=>v.slice(0,-3)+"ood",v=>v.slice(0,-3)+"orn",v=>v.slice(0,-3)+"orne",v=>v.slice(0,-2)+"ot",v=>v.slice(0,-2)+"otten",v=>v.slice(0,-3)+"ound",v=>v.slice(0,-2)+"ought",v=>v.slice(0,-3)+"ought",v=>v.slice(0,-4)+"ought",v=>v.slice(0,-4)+"ove",v=>v.slice(0,-4)+"oven",v=>v.slice(0,-1)+"own",v=>v.slice(0,-4)+"ozen",v=>v.slice(0,-3)+"sen",v=>v+"t",v=>v.slice(0,-2)+"t",v=>v.slice(0,-3)+"uck",v=>v.slice(0,-2)+"ug",v=>v.slice(0,-2)+"um",v=>v.slice(0,-2)+"un",v=>v.slice(0,-3)+"unk",v=>v,v=>v.slice(0,-1),v=>v+"ked",v=>v.slice(0,-2)+"ied",v=>v.slice(0,-2)+"cken",v=>v.slice(0,-1)+"ken",v=>v+"den",v=>v.slice(0,-3)+"ught",v=>v.slice(0,-3)+"ollen",v=>v.slice(0,-3)+"olten",v=>v.slice(0,-1)+"ied"]

	var _trie=ishml.lang.en.trie
	var pattern=("$"+word).split("").reverse().join("")
	for (let letter of pattern) 
	{
		if(_trie.hasOwnProperty(letter))
		{
			if( typeof _trie[letter]==="number")
			{

				return rules[_trie[letter]](word)
				
			}
			else
			{
				_trie=_trie[letter]
			}	
			
		}
		else
		{
			if (_trie.hasOwnProperty("$")){return rules[_trie.$](word)}
			else {return rules[0](word)}
		}
	}
}	

ishml.lang.en.verbs={have:"had",be:"been"}
ishml.lang.en.trie={n:{a:{e:{m:{e:0,$:44}},o:0,l:{p:1},p:{a:{j:1},$:1},m:{o:0,$:1},h:0,g:0,$:1},i:{g:{$:1,r:0,e:49},b:1,t:{$:1,e:0},r:{g:{a:0,$:1}},h:1,d:1,f:1,p:{s:49,$:1},s:{$:1,e:0,o:0},k:1,w:{$:28,t:1}},e:{d:{r:0,l:0,d:0,i:0,u:0,a:0,$:1},k:{$:1,i:0,c:0,a:0,o:0,r:0},g:{r:0,$:1},p:{$:1,o:0,i:0,r:0,e:0,a:0,m:0,p:0,l:0}},o:{l:{l:1},c:{a:0,$:1},d:{$:1,r:0,n:0}},u:{r:49,$:1}},e:{y:{b:36,$:2},d:{i:{r:{e:2,g:2,t:{s:{$:10,e:25},$:10},p:2,$:10},h:{$:10,c:2},l:{s:{k:10,$:52},$:2},$:2},a:{l:{b:2,n:2,i:2,a:2,l:2,$:3},$:2},$:2},t:{i:{m:{s:8,$:2},b:8,r:8,$:2},$:2},s:{i:{r:{$:3,i:2,a:{$:3,l:2,t:2,i:2,m:2,g:2},p:{u:3,$:2},o:2,e:2,u:2},$:2},o:{o:{h:43,$:2},l:{$:4,c:2,y:2},$:2},$:2},z:{e:{e:{r:{f:42,$:2},$:2}},$:2},v:{i:{g:3,r:{h:{s:3,$:2},r:2,t:{s:3,$:2},p:2,e:2,$:3},$:2},a:{r:{g:{$:3,n:2},$:2},e:{w:40,l:{s:2,c:2,r:2,$:18},$:2},$:2},e:{e:{r:{n:39,$:2},$:2},$:2},$:2},e:{l:7,s:{s:2,$:3},$:2},n:{i:{h:{s:29,$:2},$:2},$:2},m:{o:{c:{e:{b:{s:14,$:51}},l:2,$:51},$:2},$:2},k:{a:{t:{s:{i:3,$:2},$:3},s:3,m:17,h:3,w:26,$:2},i:{r:46,$:2},$:2},i:{l:{e:2,$:13},$:2},o:{h:{s:{$:7,w:2,t:2,m:2,e:2},$:2},$:2},$:2},h:{c:{t:{a:{c:15}},a:{e:{t:15}}}},t:{e:{u:{q:{o:{c:1}},$:1},s:{o:{t:4},r:{e:4},s:{o:{p:1}},m:0,n:{i:4,$:1},$:4,d:1},n:{$:1,g:0,n:0,o:0},g:{d:0,r:{o:34},$:33,e:34},b:{b:0,a:1,$:4},l:{f:0,$:4,l:0,a:0,e:0,m:0},k:{s:1},v:{o:0,i:0,$:1},r:{r:0,p:0,$:1},p:{$:1,m:0,r:0},e:{m:45},h:{w:1},j:1,t:1,w:4},r:{u:{h:4}},u:{o:0,c:4,b:{e:{r:1},$:1},p:{t:1,$:4},h:4,$:1},s:{a:{c:{b:0,$:4}},r:{u:4},u:{b:{$:4,m:0},r:{h:4,$:0}},o:{c:{c:0,$:4}}},i:{u:{q:{c:1,$:4}},b:{$:1,a:0,e:0,i:0,r:0,b:0},m:{i:0,o:{v:0,$:1},b:{u:{s:{$:1,e:0}}},$:1},s:{o:0,i:0,$:16,n:0},f:{e:{n:0,$:1},m:0,$:1,o:{r:{t:1}}},h:{$:4,s:{l:1,$:4}},r:{g:1},l:{f:1,$:4},k:1,n:{k:{$:4,n:1}},w:1,p:{s:4,$:1}},h:{g:{i:{f:38,l:{d:21,$:0,t:21,k:21}}}},o:{l:{$:1,i:0,l:{a:{$:1,b:0}}},o:{h:{$:0,s:45}},g:0,r:{$:1,r:0},v:0,i:0,c:0,$:1},a:{e:{l:0,h:0,f:0,$:8,r:{e:8},p:0,s:0,w:4},o:0,b:{$:1,m:0},g:0,$:1}},r:{e:{v:{a:{$:1,e:0,l:0,h:0,u:0,w:0}},t:{e:{d:1},n:{i:{w:0,s:{i:1,$:0},l:0,$:1}}},f:{n:1,e:1,s:1}},i:{a:0,$:1},o:{h:{b:1}},a:{e:{$:0,b:32,w:31,h:{s:{i:2,$:0},$:2},t:31},g:0,d:0,l:0,t:{r:0,$:1},o:0,$:1},u:{e:0,o:0,m:{e:1},g:0,$:1}},d:{e:{e:{f:6,r:{$:0,b:6},p:6,l:6},l:{p:7,$:1},h:7,p:0,$:1},n:{e:{l:{$:4,b:0},h:{s:4},p:{s:{u:0,i:0,$:4},$:0},$:0,r:{$:4,t:0,a:0},s:4,b:4},i:{w:35,f:35,r:35,b:35},a:{t:{s:{$:30,d:0}}}},r:{i:{g:{$:0,e:4}}},a:{l:{c:7},e:{r:{p:{s:{$:7,e:0},$:7},$:7,t:{h:7,$:24,e:0},d:{$:0,e:7},h:0,b:0},l:{p:{$:0,r:6},$:6,n:0}},o:0,b:0,$:1},l:{o:{h:11},i:{u:4}},i:{b:{r:{o:57,$:7},$:7},k:1,r:7},o:{o:0,$:1},u:{o:0,a:0,e:0,$:1}},s:{a:{g:1},i:{d:1},u:{c:{o:{p:1}},l:{p:1}},o:1},l:{u:{n:1},a:{e:{d:44,t:27},d:{e:{m:1}},b:1,n:1,r:{i:0,$:1},v:{i:{r:{$:1,r:0}}},u:1,h:1,t:{o:1},p:1},l:{a:{f:12},e:{t:9,w:{$:0,d:{n:4,$:0}},s:9},i:{p:{$:0,s:{r:4,$:0}}}},i:{r:1},e:{p:{u:0,$:1},b:{e:1},g:{$:1,d:0},c:{r:{a:{m:1}},x:1},e:{n:22,f:22}},o:{r:{a:0,$:1},t:{x:1},j:1}},b:{i:1,u:{a:0,$:1},a:1,o:{o:0,$:1},e:1},m:{i:{a:0,d:1,$:2,r:1,h:1,k:1,l:1,w:48},e:{e:0,d:0,t:{s:1},$:1},o:{l:{g:1},t:{m:1}},a:{r:{k:0,$:1},e:0,o:0,a:0,$:1},u:{u:0,$:1}},y:{a:{s:{y:0,$:20,s:0},l:{p:0,r:{e:20},e:{r:20},s:{i:20,$:13},l:0,c:0,f:0,$:20},p:{s:0,$:20}},o:0,l:{f:41,$:61},e:{n:{o:54}},u:{b:36},$:61},p:{e:{e:{l:{s:19},w:19,r:{c:19},k:19},k:0,$:1},a:{e:{l:{$:0,r:44}},o:0,h:{$:1,w:0},$:1},i:{l:{$:1,l:0},s:{$:1,s:0},$:1},o:{l:{e:0,l:{a:{g:1}},$:1},o:0,t:{s:{e:{l:0,$:1},$:1},$:1},$:1},u:{c:{c:0,$:1},o:0,k:0,a:0,r:0,$:1},y:1},w:{e:{r:{t:{s:{e:3,$:0}}},h:{h:3,s:3,$:0},s:3},o:{l:{b:3,$:0},r:{g:3,h:3,$:0},h:{s:3},n:{k:3},s:3},a:{r:{d:3},s:{$:0,k:3}}},c:{a:53,i:{s:{y:53,$:1},$:53},o:53,e:1,l:53},k:{a:{e:{p:{$:0,s:26},r:{b:26}},y:1},n:{i:{s:50,l:{s:50,$:0},r:{p:0,$:50},$:0,h:{t:37},t:50}},c:{i:{t:{s:{h:0,g:0,$:46},$:0}}},o:{r:1},e:{e:{s:37},r:1}},g:{n:{i:{l:5,r:{$:0,p:5,t:5,w:5,b:37},s:5,t:{$:0,s:5},w:{$:0,s:5}},a:{h:{w:0,$:5}}},i:{d:47,a:0,$:1},a:{m:0,$:1},g:0,$:1},o:{d:{e:{r:23},t:23,r:23,n:{u:23},a:0,$:20},g:{r:{a:0,$:23},$:23,n:0}},f:{i:1,e:{r:1}},z:{i:1},u:{a:2},v:1}


ishml.lang.ing=function(word)
{
	var key=word.toLowerCase()
	if(ishml.lang.ing.gerunds.hasOwnProperty(key)){return ishml.lang.preserveCase(ishml.lang.ing.gerunds[key],word)}

	const rules=
	[
		v=>v+"ing",
		v=>v+v.charAt(v.length-1)+"ing", //double last
		v=>v.slice(0,-1)+"ing", //silent e
		v=>v.slice(0,-2)+"ying",
		v=>v+"king"
	]
	var _trie=ishml.lang.ing.trie
	var pattern=("$"+word).split("").reverse().join("")
	for (let letter of pattern) 
	{
		if(_trie.hasOwnProperty(letter))
		{
			if( typeof _trie[letter]==="number")
			{
				return rules[_trie[letter]](word)
				
			}
			else
			{
				_trie=_trie[letter]
			}	
			
		}
		else
		{
			if (_trie.hasOwnProperty("$")){return rules[_trie.$](word)}
			else {return rules[0](word)}
		}
	}
}
ishml.lang.ing.trie={n:{a:{e:0,o:0,l:{p:1},p:{a:{j:1},$:1},m:{o:0,$:1},h:0,g:0,$:1},i:{g:{r:0,$:1},a:0,t:{$:1,e:0},r:{g:{a:0,$:1}},o:0,v:0,e:0,s:{$:1,e:0,o:0},u:0,$:1},e:{d:{r:0,l:0,d:0,i:0,u:0,a:0,$:1},k:{$:1,i:0,c:0,a:0,o:0,r:0},g:{r:0,$:1},p:{$:1,o:0,i:0,r:0,e:0,a:0,m:0,p:0,l:0}},o:{l:{l:1},c:{a:0,$:1},d:{$:1,r:0,n:0}},u:1},e:{e:0,t:{n:0,$:2},g:{n:{u:{l:{p:2,b:2,$:0},$:2},i:{w:{t:2,$:0},r:2,h:{$:2,n:0,w:0},p:2},$:2},$:2},c:{a:{$:2,m:{$:0,i:2}},c:0,$:2},s:{s:{a:{v:2},$:2},$:2},l:{e:{n:2},$:2},u:{q:{i:{l:{b:2},$:2},$:2},g:{e:{n:2},$:2},c:{$:0,s:2,e:2},l:{c:0,$:2},r:{$:0,c:2,t:2,b:2},$:2},i:{d:{$:3,r:0},g:{o:{o:3},$:3},t:{r:0,$:3},m:0,$:3},o:0,y:{d:{$:0,r:2},b:2},a:0,$:2},t:{e:{u:{q:{o:{c:1}},$:1},s:{o:{t:1},r:{e:1},s:{o:{p:1}},m:0,$:1},n:{$:1,g:0,n:0,o:0},g:{d:0,r:{o:1},$:1},b:{b:0,$:1},l:{f:0,$:1,l:0,a:0,e:0,m:0},k:{s:1},v:{o:0,i:0,$:1},r:{r:0,p:0,$:1},p:{$:1,m:0,r:0},h:{w:1},j:1,t:1,w:1},u:{o:0,b:{e:{r:1},$:1},$:1},i:{u:{q:1},b:{$:1,a:0,e:0,i:0,r:0,b:0},m:{i:0,o:{v:0,$:1},b:{u:{s:{$:1,e:0}}},$:1},s:{o:0,i:0,$:1,n:0},f:{e:{n:0,$:1},m:0,$:1,o:{r:{t:1}}},h:1,r:{g:1},l:1,k:1,n:1,w:1,p:1},o:{l:{$:1,i:0,l:{a:{$:1,b:0}}},o:0,g:0,r:{$:1,r:0},v:0,i:0,c:0,$:1},a:{e:0,o:0,b:{$:1,m:0},g:0,$:1}},r:{e:{v:{a:{$:1,e:0,l:0,h:0,u:0,w:0}},t:{e:{d:1},n:{i:{w:0,s:{i:1,$:0},l:0,$:1}}},f:{n:1,e:1,s:1}},i:{a:0,$:1},o:{h:{b:1}},a:{e:0,g:0,d:0,l:0,t:{r:0,$:1},o:0,$:1},u:{e:0,o:0,m:{e:1},g:0,$:1}},d:{e:{e:0,l:{s:1},p:0,$:1},a:{l:{c:1},e:0,o:0,b:0,$:1},i:{b:1,k:1,r:1},o:{o:0,$:1},u:{o:0,a:0,e:0,$:1}},s:{a:{g:1},i:{d:1},u:{c:{o:{p:1}},l:{p:1}},o:1},l:{u:{n:1},a:{d:{e:{m:1}},b:1,n:1,r:{h:1,e:1},v:{i:{r:{$:1,r:0}}},u:1,h:1,t:{o:1},p:1},i:{v:{e:{d:{$:0,e:1}}},r:1},e:{p:{u:0,$:1},b:{e:1},g:{$:1,d:0},v:{i:{r:{d:1}}},n:{n:{a:{l:1}}},c:{r:{a:{m:1}},x:1}},o:{r:{a:0,$:1},t:{x:1},j:1}},b:{i:1,u:{a:0,$:1},a:1,o:{o:0,$:1},e:1},m:{i:{d:1,$:0,r:1,h:1,k:1,l:1,w:1},e:{e:0,d:0,t:{s:1},$:1},o:{l:{g:1},t:{m:1}},a:{r:{k:0,$:1},e:0,o:0,a:0,$:1},u:{u:0,$:1}},p:{e:{e:0,k:0,$:1},a:{e:0,o:0,h:{$:1,w:0},$:1},i:{l:{$:1,l:0},s:{$:1,s:0},$:1},o:{l:{e:0,l:{a:{g:1}},$:1},o:0,t:{s:{e:{l:0,$:1},$:1},$:1},$:1},u:{c:{c:0,$:1},o:0,k:0,a:0,r:0,$:1},y:1},c:{a:4,i:{s:{y:4,$:1},$:4},o:4,e:1,l:4},k:{o:{r:1},e:{r:1},a:{y:1}},g:{n:0,i:{a:0,$:1},a:{m:0,$:1},g:0,$:1},f:{i:1,e:{r:1}},z:{i:1},v:1}

ishml.lang.ing.gerunds={bcc:"bcc'ing",cc:"cc'ing",dj:"dj'ing",id:"id'ing",ko:"ko'ing",od:"od'ing",ok:"ok'ing"}

ishml.lang.s=function(word)
{
	var words = word.split(" ")
	var plural =words[0]
	var remainder =words.slice(1).join(" ")
	var key=plural.toLowerCase()
	if(ishml.lang.s.nouns.hasOwnProperty(key)){return ishml.lang.preserveCase(ishml.lang.s.nouns[key],plural)+ (remainder?" "+remainder:"") }

	const rules=
	[
		p=>p+"s",
		p=>p+"es",
		p=>p.slice(0,-1)+"ies",
		p=>p+"zes",
		p=>p.slice(0,-2)+"ves",
		p=>p.slice(0,-1)+"ves",
		p=>p.slice(0,-2)+"es",
		p=>p+"ren",
		p=>p.slice(0,-2)+"en",
	]
	var _trie=ishml.lang.s.trie
	var pattern=("$"+plural).split("").reverse().join("")
	for (let letter of pattern) 
	{
		if(_trie.hasOwnProperty(letter))
		{
			if( typeof _trie[letter]==="number")
			{
				return rules[_trie[letter]](word)+ (remainder?" "+remainder:"")
				
			}
			else
			{
				_trie=_trie[letter]
			}	
			
		}
		else
		{
			if (_trie.hasOwnProperty("$")){return rules[_trie.$](word)}
			else {return rules[0](word)+ (remainder?" "+remainder:"")}
		}
	}

}
ishml.lang.s.trie=
{
	$:0,
	d:{l:{i:{h:{c:7}}}},
	e:{f:{f:0,$:4}},
	s:{i:6,$:1},
	h:{c:1,s:1,t:1},
	n:{a:{m:8}},
	x:1,
	y:{a:0,e:0,i:0,a:0,o:0,u:0,$:2},
	z:{i:3,e:3,$:1},
}
ishml.lang.s.nouns=
{aircraft:"aircraft",bison:"bison",buffalo:"buffalo",cactus:"cacti",die:"dice",deer:"deer",domino:"dominoes",dwarf:"dwarves",echo:"echoes",fish:"fish",foot:"feet",goose:"geese",human:"humans",index:"indices",louse:"lice",mage:"magi",matrix:"matrices",manservant:"menservants",momento:"momentoes",monarch:"monarchs",moose:"moose",mouse:"mice",oaf:"oafs",oligarch:"oligarchs",ovum:"ova",ox:"oxen",passerby:"passersby",person:"people",phenomenon:"phenomena",potato:"potatoes",sawtooth:"sawteeth",sheep:"sheep",swine:"swine",talisman:"talisman",thief:"thieves",tooth:"teeth",tomato:"tomatoes",womanservant:"womenservants"}

ishml.lang.z=function(word)
{
	if(word.toLowerCase().charAt(word.length-1)==="s"){return word+"'"}
	else {return word+"'s"}

}

ishml.lang.er=function(word)
{
	var key=word.toLowerCase()
	if(ishml.lang.er.comparatives.hasOwnProperty(key)){return ishml.lang.preserveCase(ishml.lang.er.comparatives[key],word) }
	if(key.match(/(un)?[b-df-hj-np-tv-z]+[aeiou][b-df-hj-np-tvwxz]$/)){return ishml.lang.preserveCase(key+key.charAt(key.length-1)+"er",word)}
	if(key.match(/(un)?[b-df-hj-np-tv-z]+[aeiou][aeiou]+[b-df-hj-np-tvwxz]$/)){return ishml.lang.preserveCase(key+"er",word)}
	if(key.match(/(un)?[b-df-hj-np-tv-z]+[aeiou][b-df-hj-np-tv-z]e$/)){return ishml.lang.preserveCase(key+"r",word)}
	if(key.match(/(un)?[b-df-hj-np-tv-z]+[aeiou][b-df-hj-np-tvwxz]*y$/)){return ishml.lang.preserveCase(key.slice(0,-1)+"ier",word)}
	return ishml.lang.preserveCase("more "+key,word)
}
ishml.lang.er.comparatives={bad:"worse",far:"farther",good:"better"}

ishml.lang.est=function(word)
{
	var key=word.toLowerCase()
	if(ishml.lang.est.superlatives.hasOwnProperty(key)){return ishml.lang.preserveCase(ishml.lang.est.superlatives[key],word) }
	if(key.match(/(un)?[b-df-hj-np-tv-z]+[aeiou][b-df-hj-np-tv-z]$/)){return ishml.lang.preserveCase(key+key.charAt(key.length-1)+"est",word)}
	if(key.match(/(un)?[b-df-hj-np-tv-z]+[aeiou][aeiou]+[b-df-hj-np-tv-yz]$/)){return ishml.lang.preserveCase(key+"est",word)}
	if(key.match(/(un)?[b-df-hj-np-tv-z]+[aeiou][b-df-hj-np-tv-z]e$/)){return ishml.lang.preserveCase(key+"st",word)}
	if(key.match(/(un)?[b-df-hj-np-tv-z]+[aeiou][b-df-hj-np-tv-z]*y$/)){return ishml.lang.preserveCase(key.slice(0,-1)+"iest",word)}
	return ishml.lang.preserveCase("most "+key,word)
}
ishml.lang.est.superlatives={bad:"worst",far:"farthest",good:"best"}

/* Plotpoints */
ishml.Plotpoint.prototype.verbs=function(...verbs)
{
	var particle, preposition
	var thisPlotpoint=this
	result={
		particle:p=>
		{
			particle=p
			return result
		},
		preposition:p=>
		{
			preposition=p
			return result
		},
		register:(options)=>
		{
			if (options)
			{
				if (typeof options==="number")
				{
					var entry={plot:thisPlotpoint,part:"verb"}
				}
				else 
				{
					var entry = Object.assign({plot:thisPlotpoint,part:"verb"},options)
				}
			}
			else
			{
				var entry={plot:thisPlotpoint,part:"verb", valence:1}
			}
			if (particle){entry.particle=particle}
			if (preposition){entry.preposition=preposition}
			ishml.yarn.lexicon.register(...verbs).as(entry)
			return thisPlotpoint
		}
	}
	return result
}

/*** Templates Prefixes***/

//ishml.template.define("a").as((...data)=> ishml.template._(...data).modify(item=>`${ishml.lang.a(item.value)} ${item.value}`))
ishml.template.define("a").as((...data)=> ishml.Phrase.prototype.modify(item=>`${ishml.lang.a(item.value)} ${item.value}`,...data))
ishml.template.define("A").as((...data)=>ishml.Phrase.prototype.modify(item=>`${ishml.lang.capitalize(ishml.lang.a(item.value))} ${item.value}`,...data))
ishml.template.an=ishml.template.a
ishml.template.An=ishml.template.a

ishml.template.define("cap").as((...data)=> ishml.Phrase.prototype.modify(item=>ishml.lang.capitalize(item.value),...data))

/*** Phrases suffixes***/
ishml.Phrase.define("ed").as( precursor => precursor.modify(item=>ishml.lang.ed(item.value)))
ishml.Phrase.define("en").as( precursor => precursor.modify(item=>ishml.lang.en(item.value)))
ishml.Phrase.define("er").as (precursor => 
{
	return precursor.modify(item=>
	{
		if(item.degree)
		{
			if (item.degree===ishml.enum.degree.positive){return item}
			if (item.degree===ishml.enum.degree.comparative){return ishml.lang.er(item.value)}
			if (item.degree===ishml.enum.degree.superlative){return ishml.lang.est(item.value)}
		}
		else {return ishml.lang.er(item.value)}
	})
})

//DEFECT change back to suffix style
ishml.Phrase.prototype.es= function(subject)
{	
	return this.modify(item=>
	{
		console.log(this)
		
		if (subject)
		{
			if(subject.length>1){return item.value}
			if(subject.length===1)
			{
				var lowerCaseSubject=subject[0].value.toLowerCase()
				if (lowerCaseSubject==="i" || lowerCaseSubject==="you" ||lowerCaseSubject==="we" ||lowerCaseSubject==="they" ){return item.value}
			} 
		}
		return ishml.lang.es(item.value)
	})
}
ishml.Phrase.define("est").as (precursor => 
{
	return precursor.modify(item=>
	{
		if(item.degree)
		{
			if (item.degree===ishml.enum.degree.positive){return item}
			if (item.degree===ishml.enum.degree.comparative){return ishml.lang.er(item.value)}
			if (item.degree===ishml.enum.degree.superlative){return ishml.lang.est(item.value)}
		}
		else {return ishml.lang.est(item.value)}
	})
})
ishml.Phrase.define("ing").as( precursor => precursor.modify(item=>ishml.lang.ing(item.value)))

ishml.template.define("list").as((...data)=>
{
	return new class listPhrase extends ishml.Phrase
	{
		constructor(...data)
		{
			super(ishml.template._`${ishml.template.cycle().tag("items")}${tags=>tags.items.data.index < tags.items.data.total-1 && tags.items.data.total>2?", ":""}${tags=>tags.items.data.index===0 && tags.items.data.total===2?" and ":""}${tags=>tags.items.data.index===tags.items.data.total-2 && tags.items.data.total>2?"and ":""}`.per("items").join())
			this.populate(...data)
			return this
		}
		populate(...data)
		{
			this.tags.items.populate(...data)
			return this
		}
	}(...data)
})
ishml.template.define("norList").as((...data)=>
{
	return new class listPhrase extends ishml.Phrase
	{
		constructor(...data)
		{
			super(ishml.template._`${ishml.template.cycle().tag("items")}${tags=>tags.items.data.index < tags.items.data.total-1 && tags.items.data.total>2?", ":""}${tags=>tags.items.data.index===0 && tags.items.data.total===2?" nor ":""}${tags=>tags.items.data.index===tags.items.data.total-2 && tags.items.data.total>2?"nor ":""}`.per("items").join())
			this.populate(...data)
			return this
		}
		populate(...data)
		{
			this.tags.items.populate(...data)
			return this
		}
	}(...data)
})



ishml.template.define("orList").as((...data)=>
{
	return new class listPhrase extends ishml.Phrase
	{
		constructor(...data)
		{
			super(ishml.template._`${ishml.template.cycle().tag("items")}${tags=>tags.items.data.index < tags.items.data.total-1 && tags.items.data.total>2?", ":""}${tags=>tags.items.data.index===0 && tags.items.data.total===2?" or ":""}${tags=>tags.items.data.index===tags.items.data.total-2 && tags.items.data.total>2?"or ":""}`.per("items").join())
			this.populate(...data)
			return this
		}
		populate(...data)
		{
			this.tags.items.populate(...data)
			return this
		}
	}(...data)
})

ishml.Phrase.define("s").as (precursor => 
{
	return precursor.modify(item=>
	{
		if (item.number===ishml.enum.number.singular){return item.value}
		return ishml.lang.s(item.value)
	})
})
ishml.template.define("a").as((...data)=> ishml.Phrase.prototype.modify(item=>`${ishml.lang.a(item.value)} ${item.value}`,...data))
ishml.Phrase.define("z").as(precursor =>precursor.modify(item=>ishml.lang.z(item.value)))
ishml.template.define("_actor").as((...data)=> new ishml.Phrase(...data).tag("actor"))
/* Inflected Text */

/*ishml.template.define("noun").as((cord)=>
{
	//set command.noun and return list
	return new class cordPhrase extends ishml.Phrase
	{
		constructor()
		{
			super(cord.data())
			return this
		}
		populate()
		{
			super.populate(cord.data())
			return this
		}
		generate()
		{
			
			super.generate()
			this.results=this.results
			this.text=this.results.map(phrase=>phrase.value).join("")
			return this.results
		}
	}()*/
	/*,
	{
		get: function(target, property, receiver) 
		{
			if (Reflect.has(target,property,receiver))  
			{
				return Reflect.get(target,property,receiver)
			}
			target._knotProperty=property
			return receiver
		}
	})
})*/



/*
_.inflect`[The] fragile [droppable] [have] broken.`.populate(command)
_`${The(t=>t.command.data.droppable)} fragile ${t=>t.command.droppable.text()} ${_.have(t=>t.command.droppable)}`.tag("command").populate(command)

_`${The(t=>t.command.data.droppable)} fragile ${_.prior.text()} ${_.have(t=>t.command.data.droppable)}`.tag("command").populate(command)
*/

