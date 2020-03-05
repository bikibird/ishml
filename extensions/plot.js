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
    var command=twist.interpretations[0].gist[0].command
    command.predicate.verb.definition.plot.narrate(command)
    console.log(twist.interpretations)
    interpretations
    return {continue:true}
   
   
}

plot.action.taking.scope.narrate=function(command)
{
    if (command.directObject)
    {
        if (command.directObject.size>1)
        {
            return {valid:false, response:`<p>You think about who should take the ${command.directObject.first().name}. Only one may, afterall.</p>`}
        }

        var location=command.subject.in
        var takeable=command.directObject
            .cross(location) 
            .per((thing,place)=>thing.in(place) && thing.is.portable)
            

        if(takeable.size===0)
        {
            
            //this.yarn.say(`<p>You are not carrying it.</p>`).last("#story")
            return {valid:false, response:`<p>You think about taking the ${command.directObject.first().name}, but it's not here.</p>`}
        }

      
        command.directObject=takeable
        command.indirectObject=location
        return { valid:true}
      

    }
    else return {valid:false, response:`<p>You think about taking something, but what?</p>`}

}
plot.action.taking.narrate=function(command)
{
    var place = command.indirectObject.first
    command.directObject
        .cross(location) 
        .per((thing,place)=>
        {
            thing.knot.in(place).retie(...cords.in).from(thing)
        })
        this.yarn.say(`<p>You took it.</p>`).last("#story")
} 

    plot.action.dropping.scope.narrate=function(command)
    {
    
    if (command.directObject)
    {
        var droppable=command.directObject
            .cross(command.subject) 
            .per((thing,actor)=>actor.wears(thing)||actor.carries(thing))
            .map((thing)=>thing.in.first())
        

        if(droppable.size===0)
        {
            
            //this.yarn.say(`<p>You are not carrying it.</p>`).last("#story")
            return {valid:false, response:`<p>You think about dropping your ${command.directObject.first().name}, but you don't have one.</p>`}
        }
        else
        {
            command.directObject=droppable
            command.indirectObject=command.subject.map(subject=>subject.in)
            return { valid:true}
                        
        }

    }
    else return {valid:false, response:`<p>You think about dropping something, but what?</p>`}
}
/*plot.action.dropping.narrate=function(command)
{
 command.directObject.forEach((thing)=>{thing.in})
        .cross(command.subject) 
        .per((thing,actor)=>actor.wears(thing)||actor.carries(thing))*
    this.yarn.say(`you drop it.`).last("#story")
}
plot.action.equivocating.scope.narrate=function(interpretations)
{
    console.log(interpretations)
}

   
plot.action.taking.narrate=function(command)
{
    command.directObject
        .cross(command.subject) 
        .per((thing,actor)=>actor.wears(thing)||actor.carries(thing))
    this.yarn.say(`you drop it.`).last("#story")
} */ 