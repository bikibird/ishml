"use strict"
//ishml.phrasebook.player.asked=_`<p>${_.PRONOUN.They.SUBJECT()} ${_`ask`.inflect(_.pronoun())} ${_.the.DIRECT()} to ${_.INDIRECT.command.verb()} ${_.the.indirect.command.direct()}.</p>`
//ishml.phrasebook.player.asked=_`<p>${_`ask`.inflect(_.They.SUBJECT())} ${_.the.DIRECT()} to ${_.INDIRECT.command.verb()} ${_.the.indirect.command.direct()}.</p>`
ishml.phrasebook.player.asked=_`<p>${_.They.SUBJECT().inflect`ask`} ${_.the.DIRECT()} to ${_.INDIRECT.command.verb()} ${_.the.indirect.command.direct()}.</p>`

ishml.phrasebook.npc.asked=_``

//ishml.phrasebook.player.asked=_`<p>${_.They.SUBJECT()} ${_`ask`.ed(_.subject)} ${_.the.DIRECT()} to ${_.INDIRECT.command.verb()} ${_.the.indirect.command.direct()}.</p>`