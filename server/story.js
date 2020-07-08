const parser = require('./lib/ishml/parser')

const logit = (msg, obj) => {
  const key = obj.definitions ? obj.definitions[0].key : ''
  console.log(msg, '\t', obj.lexeme, '/', key)
}

const inputs = [
  "take the ruby slipper",
  // "drop the ring in the tumbler",
  // "put on the ring",
  // "take the glass",
  // "take the tumbler",
  // "take the glass slipper",
]

function main () {
  inputs.map(input => {
    const output = parser.analyze(input)
    const int = output.interpretations[0].gist
    console.log('---\ninput:\t', input)
    logit('verb', int.verb)
    logit('adj', int.nounPhrase.adjectives ? int.nounPhrase.adjectives[0] : '') // just first one
    logit('noun', int.nounPhrase.noun)
    console.log('=>', JSON.stringify(output, null, 2))
  })
}

main()

