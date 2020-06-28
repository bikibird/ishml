var plot = story.plot

/*plot outline*/
plot
    .add("action","actions")
    .add("scenes","scenes")
	.add("main","input processing")
	.add("scope","check whether subjects and objects are in scope.")

plot.main
    .add("prolog","before turn actions")
    .add("dialog","input processing and response")
    .add("epilog","after turn actions")

plot.main.dialog
    .add("input", "process input")

plot.scope
    .add("subjectInRoom")
    .add("directObjectInRoom")
    .add("indirectObjectInRoom")
    .add("subjectCarriesDirectObject")
    .add("subjectCarriesDirectObjectImplied")
    .add("subjectWearsDirectObject")
    .add("subjectWearsDirectObjectImplied")
    .add("subjectHasDirectObject")

plot.scope.subjectHasDirectObject
    .add(plot.scope.subjectCarriesDirectObject)
    .add(plot.scope.subjectWearsDirectObject)

    
plot.action
    .add("dropping","dropping action")
    .add("equivocating","multiple interpretations of input")
    .add("going","going action")
    .add("gibbering","unsuccessful parse action")
    .add("taking","taking  action")
    .add("taking_from","taking  action")
    .add("taking_to","taking  action")

plot.action.dropping
    .add(plot.scope.subjectHasDirectObject)
    .add("perform")
   
/*narration*/   

plot.main.dialog.input.narrate=function(twist)
{
    var results=this.yarn.parser.analyze(twist.input)
    if(results.success)
    {
        var interpretations=results.interpretations
        twist.interpretations=interpretations.forEach(interpretation=>
        {
            interpretation.gist.forEach(command=>
            {
                command.verb.slice(0).forEach(plotpoint=>
                    {
                       plotpoint.narrate(command)
                       if (command.success)
                       {
                           interpretation.valid=true
                       }
                       else {interpretation.valid=false}
    
                    })

            })
        })
        if (interpretations.length===1)
        {
            var commands=interpretations[0].gist
            commands.forEach(command=>
            {
                command.perform()
            })
        }
    }    
    return {continue:true}
   
}
/*scopes*/
plot.scope.subjectHasDirectObject.narrate=function(command)
{
    if (command.directObject)
    {
        if (command.directObject.isEmpty)
        { 
            command.salience=2
            command.perform=()=>
            {
                this.yarn.say(`<p>You think about dropping something, but what?</p>`).last("#story")
                
            }
            return this
        }

       var  droppable=command.directObject
            .worn_by(command.subject)
            .add(command.directObject.carried_by(command.subject))

        if(droppable.isEmpty)
        {
            command.salience=2
            command.perform=()=>
            {
                
                this.yarn.say(`<p>You want to drop it, but you don't even have it.</p>`).last("#story")
                
            }
            return this
        }
        
        command.directObject=droppable
        command.indirectObject=command.subject.map(subject=>subject.in)
        command.salience=5
       
      
    }
    else 
    {
        command.salience=2
            command.perform=()=>
            {
                this.yarn.say(`<p>You think about dropping something, but what?</p>`).last("#story")
                
            }
        return this
    } 
}
/*actions*/
plot.action.dropping.narrate=function(command)
{
    //is object being carried or worn by subject?

   this.narrateSubplot(command)
   
   if (command.salience>=5)
   {
       console.log(command)
        command.perform=()=>
        {
            console.log(command)
            command.directObject=command.directObject
                .cross(command.indirectObject).per((thing,place)=>thing.untie().tie(...cords.in).to(place).in(place))
          /* this.yarn.say(`<p>You drop ${command.directObject.first(1).name}.</p>`).last("#story")

            this.yarn
                .say`blah blah ${command.directObject.ul(thing=>thing.a(thing.name).addClass("ishml-choice").data()).addClass("ishml=comman-list")}`
                .last("#story")*/

            this.yarn
            .say(`You drop the 
                <ol class="ishml-comma-list">
                    ${command.directObject.recite(thing=>`<li><a class="ishml-choice">${thing.name}</a></li>
                </ol>`)}`)
            .last("#story")

            yarn.say `You drop the <ol class="ishml-comma-list">`

                command.directObject.say(thing=>`<li><a class="ishml-choice">${thing.name}</a></li>
                </ol>`)
            .last("#story")

            `You drop the <ol class="ishml-comma-list">[<li><a class="ishml-choice">{name}</a></li>]</ol>`


        }




            


            

            
        }
   }    
   return this 
    

    //is subject willing or the player?

    
}




/*plot.action.taking.ponder=function(command)
{
    var subplot=this.subplot.ponder(command)
    if (subplot.salience>0)
    {
        command.verb=subplot.plotpoints
    }

}    
plot.action.taking.stock.ponder=function(command)
{
    console.log("pondering taking")
    if (command.directObject)
    {
        if (command.directObject.isEmpty){ return {salience:1}}

        var location=command.subject.map(subject=>subject.in)
        var takeable=command.directObject
            .where(thing=>thing.is.portable)
            .cross(location) 
            .per((thing,place)=>thing.in(place))
            

        if(takeable.isEmpty){return {salience:1}}

        command.directObject=takeable
        command.indirectObject=location

        return {salience:5,plotpoints:[this]}
    }
    else {return {salience:0}} 

}
plot.action.taking.stock.perform=function(command)
{
    command.directObject=command.directObject
    .cross(command.subject)
    .per((thing,actor)=>thing.untie().tie(...cords.carries).from(actor).carried_by(actor))
    
        
}

plot.action.taking.stock.narrate=function(command)
{

    this.yarn.say(`<p>You took it.</p>`).last("#story")
}
*/
