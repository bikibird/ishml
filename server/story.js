const parser = require('./lib/ishml/parser')

const logit = (msg, obj) => {
  const key = obj.definitions ? obj.definitions[0].key : ''
  console.log(msg, '\t', obj.lexeme, '/', key)
}

const inputs = [
  // "take the ruby slipper",
  // "drop the ring in the tumbler",
  // "put on the ring",
  // "take the glass",
  // "take the tumbler",
  // "take the glass slipper",
  // "Take the really pretty ruby slipper",
  "take the slipper from the woman and give it to the man"
]

function main () {
  inputs.map(input => {
    const output = parser.analyze(input)
    const int = output.interpretations[0].gist
    console.log('---\ninput:\t\t', input)
    logit('verb/key', int.verb)
    logit('adj/key', int.nounPhrase.adjectives ? int.nounPhrase.adjectives[0] : '') // just first one
    logit('noun/key', int.nounPhrase.noun)
    console.log('=>', JSON.stringify(output, null, 2))
  })
}

main()

