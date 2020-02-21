/*lexicon*/
var grammar = story.grammar || new ishml.Rule()
var lexicon = story.lexicon || new ishml.Lexicon()
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
    .register("take","grab","steal")
        .as({plot:plot.action.taking, part: "verb" })
    .register("take")
        .as({plot:plot.action.taking_to , part: "verb", preposition:"to" })    
    .register("take")
        .as({plot:plot.action.taking_from , part: "verb", preposition:"from" })    
    .register("pick")
        .as({plot:plot.action.taking, part: "verb", particle:"up"})    
    .register("drop", "leave").as({ plot: plot.action.dropping, part: "verb", prepositions: [] })
    
    
    .register("save").as({key:"save", part: "system"})
    .register("restore").as({key:"restore", part: "system"})
    .register("save").as({key:"save", part: "system"})
    .register("undo").as({key:"undo", part: "system"})
    .register("show").as({key:"show", part: "system"})
    .register("transcript").as({key:"transcript", part: "system"})

/*grammar*/
grammar.verb=ishml.Rule().configure(
{
    minimum:1,
    filter: (definition)=>definition.part==="verb" 
})

grammar.nounPhrase=ishml.Rule()
    .snip("article").snip("adjectives").snip("noun").snip("adjunct").snip("conjunct")

grammar.nounPhrase.semantics=(interpretation)=>
{
    var gist=interpretation.gist
    var knots=gist.noun.definition.select().knots
    if (gist.adjectives)
    {
        gist.adjectives.forEach(adjective=>
        {
            knots.join(adjective.definition.select().knots)
        })
    }
    if(gist.adjunct)
    {
        knots=knots.cross(gist.adjunct.nounPhrase.noun.definition.select().knots,(noun,adjunct)=>
        {
           return noun.ply.entwine({ply:adjunct.ply,via:gist.adjunct.relation.definition.cord})
        })
    } 
    if (gist.conjunct)
    {
        knots.union(gist.conjunct.nounPhrase.noun.definition.select().knots)
    }  

    gist.knots=knots

   return interpretation
}


grammar.nounPhrase.article.configure({minimum:0, filter:(definition)=>definition.part==="article"})

grammar.nounPhrase.adjectives.configure({minimum:0, maximum:Infinity, separator:/^\s*,?and\s+|\s*,\s*|\s+/, 
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

grammar.object=ishml.Rule()
    .configure({mode:ishml.enum.mode.any})
    .snip(1)
    .snip(2)

grammar.object[1]
    .snip("directObject",grammar.nounPhrase.clone()).snip("indirectObject")

grammar.object[1].indirectObject
    .configure({minimum:0})
    .snip("preposition").snip("nounPhrase",grammar.nounPhrase.clone())

grammar.object[1].indirectObject.preposition
    .configure({filter:(definition)=>definition.part==="preposition"})

grammar.object[2].snip("indirectObject",grammar.nounPhrase.clone()).snip("directObject",grammar.nounPhrase.clone())

grammar.sentences=ishml.Rule()
    .configure({maximum:Infinity, mode:ishml.enum.mode.any})
    .snip("command")
   // .snip("question")
   // .snip("remark")

grammar.sentences.command
    .snip("subject").snip("predicate")


grammar.sentences.command.subject
    .configure({minimum:0 })
    .snip("nounPhrase", grammar.nounPhrase.clone())
   
grammar.sentences.command.subject.nounPhrase.noun
.configure({separator:/^\s*,\s*|\s+/})

    
grammar.sentences.command.predicate
    .configure({mode:ishml.enum.mode.any})
    .snip(1)
    .snip(2)

grammar.sentences.command.predicate.semantics=(interpretation)=>
{
    var gist=interpretation.gist
    var vPreposition=gist.verb.definition.preposition
    var vParticle=gist.verb.definition.particle
    if (gist.hasOwnProperty("object"))
    {
        if (gist.object.hasOwnProperty("indirectObject"))
        {
            var ioPreposition=gist.object.indirectObject.preposition
            if (ioPreposition)
            {
                if (vPreposition)
                {
                    if (!(ioPreposition.definition.key===vPreposition))
                    {return false}
                }
                else {return false}
            }
            else //no indirect object preposition
            {
                if(vPreposition){return false}
            }
        }
        else //no indirect object
        {
            if(vPreposition){return false}
        }
    }
    else //no object.
    {
        if(vPreposition){return false}
    }
    if (gist.hasOwnProperty("particle"))
    {
        if (vParticle)
        {
            if (!(vParticle===gist.particle.definition.key)){return false}
        }
        else {return false}
    }
    else
    {
        if (vParticle){return false}
    }
    return true
}
grammar.sentences.command.predicate[1].snip("verb",grammar.verb.clone()).snip("verbalParticle").snip("object",grammar.object.clone())

grammar.sentences.command.predicate[1].verb.filter=(definition)=>definition.part==="verb"
grammar.sentences.command.predicate[1].verbalParticle
    .configure({minimum:0,filter:(definition)=>definition.part==="particle"})

grammar.sentences.command.predicate[1].object
    .configure({minimum:0})

grammar.sentences.command.predicate[2].snip("verb",grammar.verb.clone()).snip("object",grammar.object.clone()).snip("verbalParticle")

grammar.sentences.command.semantics=(interpretation)=>
{
    var command={}
    var gist=interpretation.gist
    var predicate=gist.predicate
    if (gist.hasOwnProperty("subject"))
    {
        command.subject=gist.subject.knots
    }
    else
    {
        command.subject=$.actor.player.tangle
    }
    if (predicate.hasOwnProperty("object"))
    {
        var object=predicate.object
        if (object.hasOwnProperty("directObject"))
        {
            command.directObject=object.directObject.knots
        }
        if (object.hasOwnProperty("indirectObject"))
        {
            command.directObject=object.indirectObject.knots
        }
    }

   result=predicate.verb.definition.plot.scope.narrate(command)
   interpretation.valid=result.valid
   interpretation.response=result.response
   interpretation.gist=command
   return true
}

story.parser=ishml.Parser({ lexicon: lexicon, grammar: grammar.sentences})
story.translater= ishml.Parser({ lexicon: lexicon, grammar: grammar.phrasing})
