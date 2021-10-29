"use strict"
//ishml.phrasebook.player.asked=_`<p>${_.PRONOUN.They.SUBJECT()} ${_`ask`.inflect(_.pronoun())} ${_.the.DIRECT()} to ${_.INDIRECT.command.verb()} ${_.the.indirect.command.direct()}.</p>`
//ishml.phrasebook.player.asked=_`<p>${_`ask`.inflect(_.They.SUBJECT())} ${_.the.DIRECT()} to ${_.INDIRECT.command.verb()} ${_.the.indirect.command.direct()}.</p>`
ishml.phrasebook.player.asked=_`<p>${_.They.SUBJECT().inflect`ask`} ${_.the.DIRECT()} to ${_.INDIRECT.command.verb()} ${_.the.indirect.command.direct()}.</p>`
ishml.phrasebook.player.acted.intransitive=_`<p>${_.They.SUBJECT().inflect`${_.VERB()}`} ${_.the.DIRECT()}.</p>`
ishml.phrasebook.player.acted.transitive=_`<p>${_.They.SUBJECT().inflect`${_.VERB()}`} ${_.the.DIRECT()}.</p>`
//ishml.phrasebook.player.acted.ditransitive=_`<p>${_.They.SUBJECT().inflect`${_.VERB()}`} ${_.the.DIRECT()} to ${_.INDIRECT.command.verb()} ${_.the.indirect.command.direct()}.</p>`
ishml.phrasebook.npc.asked=_`<p>${_.cap.SUBJECT().inflect`ask`} ${_.the.DIRECT()} to ${_.INDIRECT.command.verb()} ${_.the.indirect.command.direct()}.</p>`
ishml.phrasebook.npc.acted.intransitive=_`<p>${_.They.SUBJECT().inflect`${_.VERB()}`} ${_.the.DIRECT()}.</p>`
ishml.phrasebook.npc.acted.transitive=_`<p>${_.They.SUBJECT().inflect`${_.VERB()}`} ${_.the.DIRECT()}.</p>`

//ishml.phrasebook.player.asked=_`<p>${_.They.SUBJECT()} ${_`ask`.ed(_.subject)} ${_.the.DIRECT()} to ${_.INDIRECT.command.verb()} ${_.the.indirect.command.direct()}.</p>`