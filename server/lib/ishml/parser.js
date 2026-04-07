const ishml = require('./ishml')

var lexicon = ishml.Lexicon()
lexicon
    .register("the", "a", "an").as({ part: "article" })
    .register("take", "steal", "grab")
        .as({ key: "take", part: "verb", prepositions: ["to", "from"] })
    .register("drop", "leave").as({ key: "drop", part: "verb", prepositions: [] })
    .register("wear", "put on").as({ key: "wear", part: "verb", prepositions: [] })
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


//Create a set of nested rules which mirror the wanted syntax tree.
var grammar = ishml.Rule()
grammar.snip("verb").snip("nounPhrase")
grammar.nounPhrase.snip("article").snip("adjectives").snip("noun")

//Configure behavior of some of the rules with .configure().

grammar.verb.configure({ filter: (definition) => definition.part === "verb" })

grammar.nounPhrase.article
    .configure({ minimum: 0, filter: (definition) => definition.part === "article" })

grammar.nounPhrase.adjectives
    .configure(
        {
            minimum: 0, maximum: Infinity,
            filter: (definition) => definition.part === "adjective"
        })

module.exports = { grammar, lexicon }

//Create a parser
var parser = ishml.Parser({ lexicon, grammar })

module.exports = parser

