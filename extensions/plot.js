

/*input*/   
plot.main.dialog.input.narration=_`<p>${_.favor(
    _`You thoughts are fuzzy.  How does <q>${cache=>cache.remainder.data}</q> apply here?`,
    _`Confusedly, you think <q>${cache=>cache.remainder.data}</q> to yourself.`,
    _`You realize <q>${cache=>cache.remainder.data}</q> doesn't make any sense here once you say it out loud.`
)}</p>`.cache("remainder")

plot.main.dialog.input.unfold=function(twist)
{
    var episodes=[]
    var results=story.parser.analyze(twist.input)
    if(results.success)
    {
        var interpretations=results.interpretations
        interpretations.forEach(interpretation=>
        {
            //console.log(interpretation)
            interpretation.gist.actor=$.actor[twist.viewpoint].cord
            interpretation.gist.viewpoint=twist.viewpoint
            episodes=episodes.concat(interpretation.gist.verb.plot.unfold(interpretation.gist))
        })
        if (episodes.length>0)
        {

            story.introduce(episodes[0])
            story.tell(twist.viewpoint)
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
plot.action.asking_to.narration=_`You ask them to do something.`
plot.action.asking_to.unfold=function(command)
{
    command.indirectObject.viewpoint=command.viewpoint
    var episodes=this.unfoldSubplot(command)
    if (episodes.length===0 )
    {
        
        var episode=ishml.Episode()
            .resolution(()=>
            {
                if (!command.silently) this.narration.populate(command.indirectObject).say().append("#story")
                var actionEpisode=command.indirectObject.verb.plot.unfold(command.indirectObject)
                actionEpisode.viewpoint(command.viewpoint)
                story.introduce(actionEpisode)
                
            })
            .salience(5)
            .viewpoint(command.viewpoint)  
    }
    else
    {
        var stockEpisode=ishml.Episode()

            .narration(()=>
            {
                if (!command.silently) this.narration.populate(command.indirectObject).say().append("#story")
            })
            .resolution(()=>
            {
                if (!command.silently) this.narration.populate(command.indirectObject).say().append("#story")
                var actionEpisode=command.indirectObject.verb.plot.unfold(command.indirectObject)
                actionEpisode.viewpoint(command.viewpoint)
                story.introduce(actionEpisode)
                story.tell(command.viewpoint)
            })
            .salience(5)
            .viewpoint(command.viewpoint) 
        var episode=episodes[0].stock({episode:stockEpisode,plot:plot.action.asking_to})
    }
    return episode 

}    

plot.action.dropping.narration=_`<p>You dropped the ${cache=>_.list(cache.droppable.data.map(thing=>thing.knot.name))}.</p>`.cache("droppable")
plot.action.dropping.unfold=function(command)
{

        command.droppable=command.directObject?.select().worn_by(command.subject.select())
            .add(command.directObject?.select().carried_by(command.subject.select()))
        command.notDroppable=command.directObject?.select().subtract(command.droppable)
        command.actionable=command.subject.select().has_skill($.action.dropping)
        command.notActionable=command.subject.select().subtract(command.actionable)
    
    var episodes=this.unfoldSubplot(command)
    if (episodes.length===0 )
    {
        var episode=ishml.Episode()
            .resolution(()=>
            {
                if (!command.silently) this.narration.populate(command.droppable).say().append("#story")
                command.droppable.retie(cords.in).to(command.subject.select().in)
            })
            .salience(5)
            .viewpoint(command.viewpoint)  
    }
    else
    {
        var stockEpisode=ishml.Episode()
            .narration(()=>
            {
                if (!command.silently) this.narration.populate(command.droppable).say().append("#story")
            })
            .resolution(()=>command.droppable.retie(cords.in).to(command.subject.select().in))
            .salience(5)
            .viewpoint(command.viewpoint) 
        var episode=episodes[0].stock({episode:stockEpisode,plot:plot.action.dropping})
    }
    return episode 
   
}
plot.action.dropping.revise.unfold=function(command)
{
    return this.unfoldSubplot(command)
}
plot.action.dropping.revise.nothing.narration=_`<p>You think about dropping something, but what?</p>`
plot.action.dropping.revise.nothing.unfold=function(command)
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

plot.action.dropping.revise.notDroppable.narration= _`<p>You ${_.pick("think about dropping","want to drop", "would drop")} the ${cache=>_.list(cache.notDroppable.data.map(thing=>thing.knot.name))}, but ${_.pick(_`you don't even have ${cache=>cache.notDroppable.data.them}`,_`${cache=>cache.notDroppable.data.they} ${cache=>cache.notDroppable.data.are}n't in your possession`)}.</p>`.cache("notDroppable")
plot.action.dropping.revise.notDroppable.unfold=function(command)
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

plot.action.dropping.revise.notActionable.narration= _`Not actionable`.cache("notActionable")
plot.action.dropping.revise.notActionable.unfold=function(command)
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

/*
plot.action.dropping.revisions.persuasion.jane.narration.accept=_`Jane gave a sour look, but aquiesced.`
plot.action.dropping.revisions.persuasion.jane.narration.reject=_`"How can you ask me to do such a stupid thing," replied Jane.`
plot.action.dropping.revisions.persuasion.jane.unfold=function(command)
{
    if (command.subject?.select().equivalentKnots($.actor.jane))
    {
        if (!command.droppable.isEmpty)
        {
            var episode=()=>
            {
                this.narration.accept.say().append("#story")
                command.silently=true
                plot.action.dropping.unfold(command)
            }  
            episode.salience=5   
            episode.viewpoint=command.viewpoint
            return [episode]
        }
        else
        {
            var episodes=()=>
            {
                this.narration.reject.say().append("#story")
            }  
            episode.salience=5   
            episode.viewpoint=command.viewpoint 
        }    
        return [episode]
    }
    return []
}*/
