/*input*/   

plot.main.dialog.input.unfold=function(twist)
{
    var episodes=[]
    var results=story.parser.analyze(this.twist.input)
    if(results.success)
    {
        var interpretations=results.interpretations
        interpretations.forEach(interpretation=>
        {
            interpretation.gist.actor=$.actor[this.twist.viewpoint].cord
            interpretation.gist.viewpoint=this.twist.viewpoint
            episodes=episodes.concat(interpretation.gist.verb.plot.unfold(interpretation.gist))
        })
        if (episodes.length>0)
        {

            story.introduce(episodes[0])
            story.tell(this.twist.viewpoint)
        }    
    }
    else
    {
        if (results.interpretations?.[0].remainder.length>0)
        {
            plot.main.dialog.input.narration.populate(results.interpretations[0].remainder).say().append("#story")
        }    
        else
        {
            plot.main.dialog.input.narration.populate(twist.input).say().append("#story")
        }
    }    
    return {continue:true}
   
}

/*actions*/

plot.action.asking_to.unfold=function(command)
{
    command.indirectObject.viewpoint=command.viewpoint
    return this.revise
    (
        ishml.Episode()
            .resolution(()=>
            {
                if (!command.silently) this.narration.populate(command.indirectObject).say().append("#story")
                var actionEpisode=command.indirectObject.verb.plot.unfold(command.indirectObject)
                actionEpisode.viewpoint(command.viewpoint)
                story.introduce(actionEpisode)
                
            })
            .salience(5)
            .viewpoint(command.viewpoint)  
    )
}    

plot.action.dropping.unfold=function(command)
{
    command.droppable=command.directObject?.select().worn_by(command.subject.select())
        .add(command.directObject?.select().carried_by(command.subject.select()))
    command.notDroppable=command.directObject?.select().subtract(command.droppable)
    command.actionable=command.subject.select().has_skill($.action.dropping)
    command.notActionable=command.subject.select().subtract(command.actionable)

    return this.revise
    (
        ishml.Episode()
        .resolution(()=>
        {
            if (!command.silently) this.narration.populate(command.droppable).say().append("#story")
            command.droppable.retie(cords.in).to(command.subject.select().in)
        })
        .salience(5)
        .viewpoint(command.viewpoint)
    )
}

plot.action.dropping.nothing.unfold=function(command)
{
    if(!command.directObject ||(command.droppable.isEmpty && command.notDroppable.isEmpty))
    {
        var episode=ishml.Episode()
            .resolution(()=> this.narration.say().append("#story"))
            .salience(3)   
            .viewpoint(command.viewpoint)
        return [episode]
    }
    return []     
}  
plot.action.dropping.notDroppable.unfold=function(command)
{
    if (command.droppable.isEmpty && !command.notDroppable.isEmpty)
    {
        var episode=ishml.Episode()
        .resolution(()=>this.narration.populate(command.notDroppable).say().append("#story"))
        .salience(3)   
        .viewpoint(command.viewpoint)
       return [episode]
    }
    return []
}
plot.action.dropping.notActionable.unfold=function(command)
{
    if (command.actionable.isEmpty && !command.notActionable.isEmpty)
    {
        var episode=ishml.Episode()
        .resolution(()=>this.narration.populate(command.notActionable).say().append("#story"))
        .salience(3)   
        .viewpoint(command.viewpoint)
       return [episode]
    }
    return []
}
