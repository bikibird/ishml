/*input*/   
plot.main.dialog.input.narration=_`<p>${_.favor(
    _`You thoughts are fuzzy.  How does <q>${cache=>cache.remainder.data}</q> apply here?`,
    _`Confusedly, you think <q>${cache=>cache.remainder.data}</q> to yourself.`,
    _`You realize <q>${cache=>cache.remainder.data}</q> doesn't make any sense here once you say it out loud.`)}</p>`
        .cache("remainder")

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
plot.action.asking_to.narration=_`You ask them to do something.`
plot.action.asking_to.unfold=function(command)
{
    command.indirectObject.viewpoint=command.viewpoint
    return ishml.Episode(this)
        .narration(()=>{if (!command.silently) this.narration.populate(command.indirectObject).say().append("#story")})
        .resolution(()=>
        {
            var actionEpisode=command.indirectObject.verb.plot.unfold(command.indirectObject)
            actionEpisode.viewpoint(command.viewpoint)
            story.introduce(actionEpisode)
        })
        .salience(5)
        .viewpoint(command.viewpoint)  
        .revise(this)
}

plot.action.dropping.narration=_`<p>You dropped the ${cache=>_.list(cache.droppable.data.map(thing=>thing.knot.name))}.</p>`.cache("droppable")
plot.action.dropping.unfold=function(command)
{
    command.droppable=command.directObject?.select().worn_by(command.subject.select())
        .add(command.directObject?.select().carried_by(command.subject.select()))
    command.notDroppable=command.directObject?.select().subtract(command.droppable)
    command.actionable=command.subject.select().has_skill($.action.dropping)
    command.notActionable=command.subject.select().subtract(command.actionable)

    return ishml.Episode(this)
        .narration(()=>{if (!command.silently) this.narration.populate(command.droppable).say().append("#story")})
        .resolution(()=>{command.droppable.retie(cords.in).to(command.subject.select().in)})
        .salience(5)
        .viewpoint(command.viewpoint)
        .abridge(this.check)
        .revise(this.instead)
}
plot.action.dropping.instead.klutz.narration=_`</p>Klutz<p>`
plot.action.driopping.instead.klutz.unfold=function(command)
{
    this.stock.resolution()
    this.narration.say().append("#story")
    this.stock.narration.say().append("#story")
}

plot.action.dropping.check.nothing.narration=_`<p>You think about dropping something, but what?</p>`
plot.action.dropping.check.nothing.unfold=function(command)
{
    if(!command.directObject ||(command.droppable.isEmpty && command.notDroppable.isEmpty))
    {
        var episode=ishml.Episode(this)
            .narration(()=>{if (!command.silently) this.narration.say().append("#story")})
            .salience(3)   
            .viewpoint(command.viewpoint)
        return episode
    }
    return      
}

plot.action.dropping.check.notDroppable.narration=_`<p>You ${_.pick("think about dropping","want to drop", "would drop")} the ${cache=>_.list(cache.notDroppable.data.map(thing=>thing.knot.name))}, but ${_.pick(_`you don't even have ${cache=>cache.notDroppable.data.them}`,_`${cache=>cache.notDroppable.data.they} ${cache=>cache.notDroppable.data.are}n't in your possession`)}.</p>`.cache("notDroppable")
plot.action.dropping.check.notDroppable.unfold=function(command)
{
    if (command.droppable.isEmpty && !command.notDroppable.isEmpty)
    {
        var episode=ishml.Episode(this)
        .narration(()=>{if (!command.silently) this.narration.populate(command.notDroppable).say().append("#story")})
        .salience(3)   
        .viewpoint(command.viewpoint)
        return episode
    }
    return 
}
plot.action.dropping.check.notActionable.narration=_`Not actionable`.cache("notActionable")	
plot.action.dropping.check.notActionable.unfold=function(command)
{
    if (command.actionable.isEmpty && !command.notActionable.isEmpty)
    {
        var episode=ishml.Episode(this)
        .narration(()=>{if (!command.sildently)this.narration.populate(command.notActionable).say().append("#story")})
        .salience(3)   
        .viewpoint(command.viewpoint)
       return episode
    }
    return 
}
