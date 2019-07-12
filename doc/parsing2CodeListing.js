//Code Listing 1 Phrase Structure Grammar
var nounPhrase = ISHML.Rule()

nounPhrase
    .snip("article").snip("adjectives").snip("noun")

nounPhrase.article
    .configure({ minimum: 0, filter: (definition) => definition.part === "article" })
nounPhrase.adjectives
    .configure(
        {
            minimum: 0, maximum: Infinity,
            filter: (definition) => definition.part === "adjective"
        })

nounPhrase.noun.configure({ filter: (definition) => definition.part === "noun" })

nounPhrase.semantics=(interpretation)=>
{
    var {gist, remainder}=interpretation
    if (gist.article)
    {
        gist.noun.definitions=gist.noun.definitions.filter((definition)=>
        {
            return !(definition.role==="npc")
        })
        if(gist.noun.definitions.length===0){return false}
    }
    return true
}

var command = ISHML.Rule()

command.snip("subject", nounPhrase).snip("verb").snip("object")
command.subject.configure({ minimum: 0 })
command.verb.configure({ filter: (definition) => definition.part === "verb" })
command.object.configure({ minimum: 0, mode: ISHML.enum.mode.any })
    .snip(1)
    .snip(2)

command.object[1].snip("directObject", nounPhrase).snip("indirectObject")
command.object[1].indirectObject.snip("preposition").snip("nounPhrase", nounPhrase)
command.object[1].indirectObject
    .configure({ minimum: 0 })
command.object[1].indirectObject.preposition
    .configure({ filter: (definition) => definition.part === "preposition" })

command.object[2].snip("indirectObject", nounPhrase).snip("directObject", nounPhrase)

//Code Listing 2-- Semantics

command.semantics=(interpretation)=>
{
    var {gist}=interpretation
    var prepositions=new Set(gist.verb.prepositions)
    if (gist.object)
    {
        if(gist.object.indirectObject)
        {
            if (gist.object.indirectObject.preposition)
            {
                if (!prepositions.has(gist.object.indirectObject.preposition))
                {
                    return false 
                }
                else
                {
                    gist.verb.prepositions=[gist.object.indirectObject.preposition]
                }
            }
            gist.indirectObject=gist.object.indirectObject
        }
        gist.directObject=gist.object.directObject
        delete gist.object
    }
    return true
}




//Lexicon    
var lexicon = ISHML.Lexicon()
lexicon
    .register("the", "a", "an").as({ part: "article" })
    .register("take", "steal", "grab")
        .as({ key: "take", part: "verb", prepositions:["to","from"]})
    .register("drop", "leave").as({ key: "drop", part: "verb" })
    .register("ring").as({ key: "ring", part: "noun", role: "thing" })
    .register("slipper").as({ key: "slipper", part: "noun", role: "thing" })
    .register("diamond").as({ key: "ring", part: "adjective", role: "thing" })
    .register("diamond jim").as({ key: "jim", part: "noun", role: "npc" })
    .register("jim").as({ key: "james", part: "noun", role: "npc" })
    .register("ruby").as({ key: "ring", part: "adjective", role: "thing" })
    .register("ruby").as({ key: "ruby", part: "noun", role: "thing" })
    .register("ruby").as({ key: "slipper", part: "adjective", role: "thing" })
    .register("glass").as({ key: "slipper", part: "adjective", role: "thing" })
    .register("glass").as({ key: "tumbler", part: "noun", role: "thing" })
    .register("looking glass").as({ key: "mirror", part: "noun", role: "thing" })
    .register("good looking").as({ key: "tumbler", part: "adjective", role: "thing" })
    .register("good").as({ key: "mirror", part: "adjective", role: "thing" })
    .register("tumbler").as({ key: "tumbler", part: "noun", role: "thing" })
    .register("ruby").as({ key: "miss_ruby", part: "noun", role: "npc" })
    .register("sam").as({ key: "sam", part: "noun", role: "npc" })
    .register("from").as({ key: "from", part: "preposition" })
    .register("to").as({ key: "to", part: "preposition" })


//Create Parser 
var parser = ISHML.Parser({ lexicon: lexicon, grammar: command })

//Code Listing 4

var example1 = parser.analyze("take the ruby slipper")

var example2 = parser.analyze("Take ruby slipper.", { separator: /[\.|\s]/ })

var example3 = parser.analyze("Take take ruby slipper.", { separator: /[\.|\s]/ })

var example4 = parser.analyze("Take ruby slipper take.", { separator: /[\.|\s]/ })

var example5 = parser.analyze("Take the really pretty ruby slipper.", { separator: /[\.|\s]/ })