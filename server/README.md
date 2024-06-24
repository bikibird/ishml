# Server Demo

Simple demo script showing the library running from node

to run:

    node server/story.js

expect to see input and parsed output:

```js
input:	 take the ruby slipper
verb 	 take / take
adj 	 ruby / ring
noun 	 slipper / slipper
=> {
  "success": true,
  "interpretations": [
    {
      "gist": {
        "verb": {
          "lexeme": "take",
          "definitions": [
            {
              "key": "take",
              "part": "verb",
              "prepositions": [
                "to",
                "from"
              ]
            }
          ]
        },
        "nounPhrase": {
          "article": {
            "lexeme": "the",
            "definitions": [
              {
                "part": "article"
              }
            ]
          },
          "adjectives": [
            {
              "lexeme": "ruby",
              "definitions": [
                {
                  "key": "ring",
                  "part": "adjective",
                  "role": "thing"
                },
                {
                  "key": "slipper",
                  "part": "adjective",
                  "role": "thing"
                }
              ]
            }
          ],
          "noun": {
            "lexeme": "slipper",
            "definitions": [
              {
                "key": "slipper",
                "part": "noun",
                "role": "thing"
              }
            ]
          }
        }
      },
      "remainder": "",
      "valid": true
    }
  ]
}
```
