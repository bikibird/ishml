var plot = plot || story.plot
/*plot outline*/
plot.world  //Populate story.net with initial story world state
plot.scenes //Unfold every turn.  Intended to provide same functionality as Inform 7 scenes.
plot.main.dialog.input //Processes player input into commands
plot.action.asking_to
//plot.action.asking_to.check
//plot.action.asking_to.instead
plot.action.dropping
plot.action.dropping.check
plot.action.dropping.instead
plot.action.inventorying
plot.action.inventorying.check
plot.action.inventorying.instead
plot.action.taking
plot.action.taking.check
plot.action.taking.instead
