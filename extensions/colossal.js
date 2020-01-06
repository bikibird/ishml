var story = story || new ishml.Yarn()
var $ = story.net
var grammar = story.grammar 
var lexicon = story.lexicon 
var plot = story.plot

/*plot outline*/
plot
    .add("action","actions")
    .add("episodes","episodes")
    .add("main","input processing")

plot.main
    .add("prolog","before turn actions")
    .add("dialog","input processing and response")
    .add("epilog","after turn actions")

plot.main.dialog
    .add("before","before dialog actions")
    .add("input", "process input")
    .add("after","after dialog actions")

plot.main.dialog.input
    .add("parse","parse input")
    .add("choose","narrate chosen plotpoint")

plot.action
    .add("taking","taking  action")
    .add("dropping","dropping action")
    .add("going","going action")

plot.action.taking
    .add("before")
    .add("perform")
    .add("after")

plot.action.dropping
    .add("before")
    .add("perform")
    .add("after")    

plot.action.going
    .add("before")
    .add("perform")
    .add("after")

    

/*narration*/    


/*lexicon*/



lexicon
    
    //adjectives
    .register("all").as({part:"adjective",select:()=>$.thing.mesh})
    .register("blue").as({part:"adjective",select:()=>$.blue.mesh})
    .register("green").as({part:"adjective",select:()=>$.green.mesh})
    .register("big").as({part:"adjective",select:()=>$.big.mesh})
    .register("small").as({part:"adjective",select:()=>$.small.mesh})

    //articles
    .register("the", "a", "an").as({ part: "article" })

    //conjunctions
    .register("and",",").as({ part: "conjunction" })

    //nouns
    .register("things").as({part:"noun", number:ishml.enum.number.singular, select:()=>$.thing.mesh})
    .register("cup").as({part:"noun", number:ishml.enum.number.singular, select:()=>$.thing.cup.mesh})
    .register("plate").as({part:"noun", number:ishml.enum.number.singular, select:()=>$.thing.plate.mesh})
    .register("bowl").as({part:"noun", number:ishml.enum.number.singular, select:()=>$.thing.bowl.mesh})
    .register("dishes").as({part:"noun", number:ishml.enum.number.plural, select:()=>$.thing.dishes.mesh})

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
        .as({plot:plot.action.taking_to , part: "verb", preposition:"from" })    
    .register("take")
        .as({plot:plot.action.taking_from , part: "verb", preposition:"from" })    
    .register("pick")
        .as({plot:plot.action.taking, part: "verb", particles:"up"})    
    .register("drop", "leave").as({ plotpoint: plot.action.dropping, part: "verb", prepositions: [] })
    
    
    .register("save").as({key:"save", part: "system"})
    .register("restore").as({key:"restore", part: "system"})
    .register("save").as({key:"save", part: "system"})
    .register("undo").as({key:"undo", part: "system"})
    .register("show").as({key:"show", part: "system"})
    .register("transcript").as({key:"transcript", part: "system"})

/*grammar*/

grammar.nounPhrase=ishml.Rule()
    .snip("article").snip("adjectives").snip("noun").snip("adjunct").snip("conjunct")

grammar.nounPhrase.semantics=(interpretation)=>
{
    var gist=interpretation.gist
    var knots=new ishml.Mesh(gist.noun.definition.select())
    if (gist.adjectives)
    {
        gist.adjectives.forEach(adjective=>
        {
            knots.join(adjective.definition.select())
        })
    }
    if(gist.adjunct)
    {
       
    } 
    if (gist.conjunct)
    {
        knots.join(conjunct.nounPhrase.noun.definition.select())
    }  

    gist.knots=knots
   console.log(knots)
   return interpretation
}


grammar.nounPhrase.article.configure({minimum:0, filter:(definition)=>definition.part==="article"})

grammar.nounPhrase.adjectives.configure({minimum:0, maximum:Infinity, separator:/^\s*,?and\s+|\s*,\s*|\s+/, 
    filter:(definition)=>definition.part==="adjective"})
grammar.nounPhrase.noun.filter=(definition)=>definition.part==="noun"

grammar.nounPhrase.adjunct
    .configure({minimum:0, maximum:Infinity})
    .snip("relation").snip("nounPhrase",grammar.nounPhrase)
    
grammar.nounPhrase.adjunct.relation.configure({filter:(definition)=>definition.part==="relation"})

grammar.nounPhrase.conjunct
    .configure({minimum:0, maximum:Infinity})    
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
    .snip("question")
    .snip("remark")

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

grammar.sentences.command.predicate[1].snip("verb").snip("verbalParticle").snip("object",grammar.object.clone())

grammar.sentences.command.predicate[1].verb.filter=(definition)=>definition.part==="verb"
grammar.sentences.command.predicate[1].verbalParticle
    .configure({minimum:0,filter:(definition)=>definition.part==="particle"})

grammar.sentences.command.predicate[1].object
    .configure({minimum:0})

grammar.sentences.command.predicate[2].snip("verb").snip("object",grammar.object.clone()).snip("verbalParticle")

/*net*/

$
    .tie("thing","green","big").to("cup")
    .tie("thing","blue","small").to("plate")
    
$.thing.cup.tie("on<under").to("plate")    




