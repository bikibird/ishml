"use strict"
ishml.phrasebook.player.acted=_.They.SUBJECT().inflect(_.VERB())._(_.spc.the.DIRECT().spc1(_.PREPOSITION().spc2.the.INDIRECT()))._`. `
ishml.phrasebook.npc.acted=_`${_.cap.SUBJECT().inflect`${_.VERB()}`.spc.the.DIRECT().spc.PREPOSITION().spc.the.INDIRECT()}. `

ishml.phrasebook.direct.empty=_`${_.They.SUBJECT().inflect`thinks`} about ${_.VERB().ing} something, but what? `
ishml.phrasebook.indirect.empty=_`${_.They.SUBJECT().inflect`thinks`} about ${_.VERB().ing._.the.DIRECT()._.PREPOSITION()}... ${_.preposition()}... something or someone... `
ishml.phrasebook.unpossessed=_.They.SUBJECT().inflect`do not have`.spc.the.UNPOSSESSED()._`. `

ishml.phrasebook.npc.missing.direct=_`<p>${_.cap.SUBJECT().inflect`thinks`} about ${_.VERB().ing} something, but what? `


ishml.phrasebook.player.asked=_`<p>${_.They.SUBJECT().inflect`ask`} ${_.the.DIRECT()} to ${_.INDIRECT.command.verb()} ${_.the.indirect.command.direct()}. `
ishml.phrasebook.npc.asked=_`<p>${_.cap.SUBJECT().inflect`ask`} ${_.the.DIRECT()} to ${_.INDIRECT.command.verb()} ${_.the.indirect.command.direct()}. `


