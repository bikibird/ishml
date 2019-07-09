//Code Listing 1-- Definining a lexicon; registering tokens.    
var lexicon = ISHML.Lexicon()
lexicon
    .register("the", "a", "an").as({ part: "article" })
    .register("take", "steal", "grab").as({ key: "take", part: "verb" })
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

//Code Listing 2

//Create a set of nested rules which mirror the wanted syntax tree.
var command = ISHML.Rule()
command.snip("verb").snip("nounPhrase")
command.nounPhrase.snip("article").snip("adjectives").snip("noun")

//Configure behavior of some of the rules with .configure().

command.verb.configure({ filter: (definition) => definition.part === "verb" })

command.nounPhrase.article
    .configure({ minimum: 0, filter: (definition) => definition.part === "article" })

command.nounPhrase.adjectives
    .configure(
        {
            minimum: 0, maximum: Infinity,
            filter: (definition) => definition.part === "adjective"
        })

//alternatively the rule's options may be set directly.
command.nounPhrase.noun.filter = (definition) => definition.part === "noun"

//Code Listing 3

//Create a parser 
var parser = ISHML.Parser({ lexicon: lexicon, grammar: command })

//Code Listing 4

var example1 = parser.analyze("take the ruby slipper")

var example2 = parser.analyze("Take ruby slipper.", { separator: /[\.|\s]/ })

var example3 = parser.analyze("Take take ruby slipper.", { separator: /[\.|\s]/ })

var example4 = parser.analyze("Take the really pretty ruby slipper.", { separator: /[\.|\s]/ })