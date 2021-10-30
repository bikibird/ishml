"use strict"
ishml.phrasebook.player.acted=_`<p>${_.They.SUBJECT().inflect`${_.VERB()}`._.the.DIRECT()._.PREPOSITION()._.the.INDIRECT()}.`
ishml.phrasebook.npc.acted=_`<p>${_.They.SUBJECT().inflect`${_.VERB()}`._.the.DIRECT()._.PREPOSITION()._.the.INDIRECT()}.`

ishml.phrasebook.player.asked=_`<p>${_.They.SUBJECT().inflect`ask`} ${_.the.DIRECT()} to ${_.INDIRECT.command.verb()} ${_.the.indirect.command.direct()}.`
ishml.phrasebook.npc.asked=_`<p>${_.cap.SUBJECT().inflect`ask`} ${_.the.DIRECT()} to ${_.INDIRECT.command.verb()} ${_.the.indirect.command.direct()}.`


