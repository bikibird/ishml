plot.main.dialog.input.narration=_`<p>${_.favor(
    _`You thoughts are fuzzy.  How does <q>${cache=>cache.remainder.data}</q> apply here?`,
    _`Confusedly, you think <q>${cache=>cache.remainder.data}</q> to yourself.`,
    _`You realize <q>${cache=>cache.remainder.data}</q> doesn't make any sense here once you say it out loud.`)}</p>`
        .cache("remainder")
		
plot.action.asking_to.narration=_`You ask them to do something.`

plot.action.dropping.narration=_`<p>You dropped the ${cache=>_.list(cache.droppable.data.map(thing=>thing.knot.name))}.</p>`.cache("droppable")

plot.action.dropping.nothing.narration=_`<p>You think about dropping something, but what?</p>`

plot.action.dropping.notDroppable.narration=_`<p>You ${_.pick("think about dropping","want to drop", "would drop")} the ${cache=>_.list(cache.notDroppable.data.map(thing=>thing.knot.name))}, but ${_.pick(_`you don't even have ${cache=>cache.notDroppable.data.them}`,_`${cache=>cache.notDroppable.data.they} ${cache=>cache.notDroppable.data.are}n't in your possession`)}.</p>`.cache("notDroppable")

plot.action.dropping.notActionable.narration=_`Not actionable`.cache("notActionable")		 	
