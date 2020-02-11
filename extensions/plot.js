var plot = story.plot

/*plot outline*/
plot
    .add("action","actions")
    .add("scenes","scenes")
	.add("main","input processing")
	.add("system","common routines")

plot.main
    .add("prolog","before turn actions")
    .add("dialog","input processing and response")
    .add("epilog","after turn actions")

plot.main.dialog
    .add("before","before dialog")
    .add("stock", "Standard dialog")
    .add("after","after dialog actions")

plot.main.dialog.stock
    .add("input", "process input")
 //   .add("choice","process choice")

plot.main.dialog.stock.input
    .add("before","before interpreting input")
    .add("interpret","interpret input")
    .add("after", "after interpreting input")

plot.main.dialog.stock.input.interpret
    .add("parse","parse input")
    .add("reply","reply to input")

plot.main.dialog.stock.input.interpret.parse
    .add("before","before parsing input")    
    .add("stock","standard parsing")
    .add("after","after parsing input")

plot.main.dialog.stock.input.interpret.reply
    .add("before","before replying")    
    .add("stock","standard reply")
    .add("after","after reply")

/*plot.main.dialog.stock.choice
    .add("before","before selecting choice")    
    .add("stock","narrate chosen plotpoint")
    .add("after","after selection")
*/

plot.action
    .addAction("dropping","dropping action")
    .addAction("going","going action")
    .addAction("gibbering","unsuccessful parse action")
    .addAction("taking","taking  action")
    .addAction("taking_from","taking  action")
    .addAction("taking_to","taking  action")
    


    
/*narration*/    
plot.main.dialog.stock.input.interpret.narrate=function(twist)
{
    console.log("interpret")
    this.parse.narrate(twist)
    console.log(twist)
    
    this.reply.narrate(twist)
    return {continue:true}
   
   
}
plot.main.dialog.stock.input.interpret.parse.stock.narrate=function(twist)
{
    var {input}=twist
    console.log("parse")
    twist.interpretations=this.yarn.parser.analyze(input)
    return {continue:true} 
}
plot.main.dialog.stock.input.interpret.reply.stock.narrate=function(twist)
{
    var {interpretations}=twist
    console.log("reply")
    console.log(interpretations)
    return {continue:true}
}
plot.action.taking.frame.stock.narrate=function(gist)
{
    console.log(gist)
    return {continue:true}
}