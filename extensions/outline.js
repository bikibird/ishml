var plot = plot || story.plot
/*plot outline*/
plot.world  //Populate story.net with initial story world state
plot.scenes //Unfold every turn.  Intended to provide same functionality as Inform 7 scenes.
plot.main.dialog.input //Processes player input into commands
plot.action.dropping
plot.action.dropping.instead
plot.action.asking_to
