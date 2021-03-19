/*lexicon*/
var grammar = story.grammar || new ishml.Rule()
var lexicon = story.lexicon || new ishml.Lexicon()
var _ =ishml.Template  || {}
lexicon

    //adjectives
    .register("all").as({part:"adjective",select:()=>$.thing})
    .register("blue").as({part:"adjective",select:()=>$.blue})
    .register("green").as({part:"adjective",select:()=>$.green})
    .register("big").as({part:"adjective",select:()=>$.big})
    .register("small").as({part:"adjective",select:()=>$.small})

    //articles
    .register("the", "a", "an").as({ part: "article" })

    //conjunctions
    .register("and",",").as({ part: "conjunction" })

    //nouns
    .register("things").as({part:"noun", number:ishml.enum.number.singular, select:()=>$.thing})
    .register("cup").as({part:"noun", number:ishml.enum.number.singular, select:()=>$.thing.cup})   
    .register("saucer").as({part:"noun", number:ishml.enum.number.singular, select:()=>$.thing.saucer})
    .register("table").as({part:"noun", number:ishml.enum.number.singular, select:()=>$.thing.table})  
    .register("player").as({part:"noun", number:ishml.enum.number.singular, select:()=>$.actor.player,role:"player"})   

    //particles
    .register("up").as({ key: "up", part: "particle" })

    //prepositions
    .register("from").as({ key: "from", part: "preposition" })
    .register("to").as({ key: "to", part: "preposition" })

    //relations
    .register("in", "inside","inside of").as({cord: "in", part:"relation"})
    .register("under", "underneath","below").as({cord: "under", part:"relation"})
    .register("on", "on top of").as({cord: "on", part:"relation"})
    .register("next to", "beside").as({cord: "beside", part:"relation"})

    //verbs
    .register("ask")
        .as({plot:plot.action.asking_to, part: "verb", preposition:"to"} ) 
    .register("take","grab","steal")
        .as({plot:plot.action.taking, part: "verb" })
    .register("take")
        .as({plot:plot.action.taking_to , part: "verb", preposition:"to" })    
    .register("take")
        .as({plot:plot.action.taking_from , part: "verb", preposition:"from" })    
    .register("pick")
        .as({plot:plot.action.taking, part: "verb", particle:"up"})    
    .register("drop", "leave").as({ plot: plot.action.dropping, part: "verb", valence:1 })
    
    
    .register("save").as({key:"save", part: "system"})
    .register("restore").as({key:"restore", part: "system"})
    .register("save").as({key:"save", part: "system"})
    .register("undo").as({key:"undo", part: "system"})
    .register("show").as({key:"show", part: "system"})
    .register("transcript").as({key:"transcript", part: "system"})

/*grammar*/

grammar.command=ishml.Rule().snip("subject").snip("verb").snip("object")

grammar.nounPhrase=ishml.Rule()
    .snip("article").snip("adjectives").snip("noun").snip("adjunct").snip("conjunct")

grammar.nounPhrase.article.configure({minimum:0, filter:(definition)=>definition.part==="article"})

grammar.nounPhrase.adjectives.configure({minimum:0, maximum:Infinity, separator:/^\s*,?and\s+|^\s*,\s*|^\s+/, 
    filter:(definition)=>definition.part==="adjective"})
grammar.nounPhrase.noun.filter=(definition)=>definition.part==="noun"

grammar.nounPhrase.adjunct
    .configure({minimum:0})
    .snip("relation").snip("nounPhrase",grammar.nounPhrase)
    
grammar.nounPhrase.adjunct.relation.configure({filter:(definition)=>definition.part==="relation"})

grammar.nounPhrase.conjunct
    .configure({minimum:0})    
    .snip("conjunction").snip("nounPhrase",grammar.nounPhrase)
grammar.nounPhrase.conjunct.conjunction.configure({filter:(definition)=>definition.part==="conjunction"})

grammar.preposition=ishml.Rule().configure({filter:(definition)=>definition.part==="preposition"})

grammar.ioPhrase=ishml.Rule().configure({mode:ishml.enum.mode.any})
    .snip(1)
    .snip(2)
grammar.ioPhrase[1].snip("recipient",grammar.nounPhrase)    
grammar.ioPhrase[2].snip("command",grammar.command)

grammar.indirectObject=ishml.Rule().configure({minimum:0})
    .snip("preposition",grammar.preposition).snip("phrase",grammar.ioPhrase)

grammar.command.subject
.configure({minimum:0 })
.snip("nounPhrase", grammar.nounPhrase.clone())

grammar.command.subject.nounPhrase.noun
.configure({separator:/^\s*,\s*|^\s+/})

grammar.command.verb.configure({filter: (definition)=>definition.part==="verb"})

grammar.command.object=ishml.Rule()
.configure({minimum:0, mode:ishml.enum.mode.any})
.snip(1)  //verbalParticle(required)/directObject/indirectObject
.snip(2)  //directObject/verbal particle(optional)/indirectObject
.snip(3)  //indirectObject/directObject

grammar.command.object[1].snip("verbalParticle").snip("directObject",grammar.nounPhrase).snip("indirectObject",grammar.indirectObject)
grammar.command.object[2].snip("directObject",grammar.nounPhrase).snip("verbalParticle").snip("indirectObject",grammar.indirectObject)
grammar.command.object[3].snip("indirectObject",grammar.nounPhrase).snip("directObject",grammar.nounPhrase)

grammar.command.object[1].verbalParticle.configure({filter:(definition)=>definition.part==="particle"})
grammar.command.object[2].verbalParticle.configure({minimum:0,filter:(definition)=>definition.part==="particle"})

grammar.nounPhrase.semantics=(interpretation)=>
{
    var gist=interpretation.gist
    gist.select=()=>
    {
        var cord=gist.noun.definition.select().cord
        if (gist.adjectives)
        {
            gist.adjectives.forEach(adjective=>
            {
                cord=cord.cross(adjective.definition.select())
                .per((noun,adjective)=>noun.knot===adjective.knot)
            })
        }
        if(gist.adjunct)
        {
            cord=gist.adjunct.nounPhrase.select().cross(cord)
                .per((adjunct,noun)=>noun.entwine({ply:adjunct.ply,via:gist.adjunct.relation.definition.cord}).aft)
        } 
        if (gist.conjunct)
        {
            cord=cord.add(gist.conjunct.nounPhrase.select()).disjoint
        }
        return cord  
    }    
    return interpretation
}
grammar.command.subject.nounPhrase.semantics=grammar.nounPhrase.semantics
grammar.command.semantics=(interpretation)=>
{
    var valence=interpretation.gist.verb.definition.valence
    if (valence ===0 && interpretation.gist.hasOwnProperty("object")){return false}
    if (valence ===1 && (interpretation.gist.object?.hasOwnProperty("indirectObject") || !interpretation.gist.object?.hasOwnProperty("directObject"))){return false}
    if (valence ===2 && (!interpretation.gist.object?.hasOwnProperty("indirectObject") || !interpretation.gist.object?.hasOwnProperty("directObject"))){return false}
    interpretation.gist.verb.plot=interpretation.gist.verb.definition.plot
    
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


    if (interpretation.gist.hasOwnProperty("subject"))
    {
        interpretation.gist=
        { 
            subject:{noun:lexicon.search("player", {longest:true, full:true}).filter(snippet=>snippet.token.definition.role==="player")[0].token},
            verb:lexicon.search("ask", {longest:true, full:true}).filter(snippet=>snippet.token.definition.part==="verb" && snippet.token.definition.preposition==="to")[0].token,
            directObject:interpretation.gist.subject,
            preposition:lexicon.search("to", {longest:true, full:true}).filter(snippet=>snippet.token.definition.part==="preposition")[0].token,
            indirectObject:interpretation.gist
        }
    }
    else
    {
        interpretation.gist.subject=
        {
            noun:lexicon.search("player", {longest:true, full:true}).filter(snippet=>snippet.token.definition.role==="player")[0].token
        }
    }
    interpretation.gist.subject.select=()=>interpretation.gist.subject.noun.definition.select().cord

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

story.parser=ishml.Parser({ lexicon: lexicon, grammar: grammar.command})