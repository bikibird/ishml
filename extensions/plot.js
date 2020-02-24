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

    .add("input", "process input")


plot.action
    .add("dropping","dropping action")
    .add("equivocating","multiple interpretations of input")
    .add("going","going action")
    .add("gibbering","unsuccessful parse action")
    .add("taking","taking  action")
    .add("taking_from","taking  action")
    .add("taking_to","taking  action")
    
plot.action.dropping.add("scope").add("do")
plot.action.equivocating.add("scope").add("do")
plot.action.going.add("scope").add("do")
plot.action.gibbering.add("scope").add("do")
plot.action.taking.add("scope").add("do")
plot.action.taking_from.add("scope").add("do")

/*narration*/    
plot.main.dialog.input.narrate=function(twist)
{
    twist.interpretations=this.yarn.parser.analyze(twist.input)
    
    console.log(twist.interpretations)
    return {continue:true}
   
   
}

plot.action.taking.scope.narrate=function(command)
{
    console.log(command)
    return {continue:true}
}
    plot.action.dropping.scope.narrate=function(command)
    {
    
    if (command.directObject)
    {
        var wearing=command.subject.map(ply=>ply.knot.wears.knots)
        var carrying=command.subject.map(ply=>ply.knot.carries.knots)
       var droppable=wearing.union(carrying).join(command.directObject)

        if(droppable.size===0)
        {
            
            //this.yarn.say(`<p>You are not carrying it.</p>`).last("#story")
            return {valid:false, response:`<p>You think about dropping your ${command.directObject.first().name}, but you don't have one.</p>`}
        }
        else
        {
            command.directObject=droppable
            return { valid:true}
                        //this.yarn.say(`you drop it.`).last("#story")
        }

    }
    else return {valid:false, response:`<p>You think about dropping something, but what?</p>`}
}
plot.action.equivocating.scope.narrate=function(interpretations)
{
    console.log(interpretations)
}