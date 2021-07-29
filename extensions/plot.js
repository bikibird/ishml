/*input*/   
//plot.main.dialog.input.narration=_`<p>${_.favor(
 //   _`You thoughts are fuzzy.  How does <q>${cache=>cache.remainder.data}</q> apply here?`,
 //   _`Confusedly, you think <q>${cache=>cache.remainder.data}</q> to yourself.`,
//    _`You realize <q>${cache=>cache.remainder.data}</q> doesn't make any sense here once you say it out loud.`)}</p>`
 //       .cache("remainder")
var story=ishml.yarn
var plot=story.plot
var lexicon=story.lexicon
var $ = story.net
var _ =ishml.template._ 
plot.main.dialog.input.unfold=function(twist)
{
    var episodes=[]
    var results=story.parser.analyze(this.twist.input)
    if(results.success)
    {
        var interpretations=results.interpretations
        interpretations.forEach(interpretation=>
        {
            var command=
            {
                actor:$.actor[this.twist.viewpoint].cord,
                viewpoint:this.twist.viewpoint,
                gist:interpretation.gist,
            }
            Object.keys(interpretation.gist).forEach(key=>
            {
                command[key]=interpretation.gist[key].select
            })
            episodes=episodes.concat(interpretation.gist.verb.plot.unfold(command))
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

            _`<p>${_.favor(
                _`You thoughts are fuzzy.  How does <q>${results.interpretations[0].remainder}</q> apply here?`,
                _`Confusedly, you think <q>${results.interpretations[0].remainder}</q> to yourself.`,
                _`You realize <q>${results.interpretations[0].remainder}</q> doesn't make any sense here once you say it out loud.`)}</p>`.say().append("#story")
        }    
        else
        {
            _`<p>${_.favor(
                _`You thoughts are fuzzy.  How does <q>${twist.input}</q> apply here?`,
                _`Confusedly, you think <q>${twist.input}</q> to yourself.`,
                _`You realize <q>${twist.input}</q> doesn't make any sense here once you say it out loud.`)}</p>`
                .say().append("#story")        
        }
    }    
    return {continue:true}
   
}

/*actions*/

plot.action.asking_to.unfold=function(command)
{
    command.indirectObject.viewpoint=command.viewpoint
    return ishml.Episode(this)
        .narration(()=>{if (!command.silently) _`You ask ${_list(command.indirectObject.knots.name)} to do something.`.say().append("#story")})
        .resolution(()=>
        {
            var actionEpisode=command.indirectObject.verb.plot.unfold(command.indirectObject)
            actionEpisode.viewpoint(command.viewpoint)
            story.introduce(actionEpisode)
        })
        .salience(5)
        .viewpoint(command.viewpoint)  
        .abridge(()=>this.check.unfold(command))
        .revise(()=>this.instead.unfold(command))
}
plot.action.asking_to.verbs("ask").preposition("to").register(2)
plot.action.asking_to.check.unfold=function(command)
{

    return ishml.Episode(this)
        .narration(()=>{if (!command.silently) _`${_.cap.list(_(command.indirectObject.knots.name).tag("subject"))} ${_`refuse`.es}.`.populate(command).say().append("#story")})
        .resolution(()=>
        {
            var actionEpisode=command.indirectObject.verb.plot.unfold(command.indirectObject)
            actionEpisode.viewpoint(command.viewpoint)
            story.introduce(actionEpisode)
        })
        .salience(5)
        .viewpoint(command.viewpoint)  
        .revise(()=>this.unfoldSubplot(command))
}
plot.action.asking_to.instead



plot.action.dropping.unfold=function(command)
{
    command.indirectObject=command.indirectObject ?? command.subject.in
    command.droppable=command.directObject?.where(c=>c.worn_by(command.subject))
    .add(command.directObject?.where(c=>c.carried_by(command.subject)))
    var episode=ishml.Episode(this)
        .narration(()=>{if (!command.silently) _`<p>You dropped the ${_.list(command.droppable.knots.name)}.</p>`
            .say().append("#story")})
        .resolution(()=>
        {
            command.droppable.converse("carried_by").untie().tie("in").to(command.container)
            command.droppable.converse("worn_by").untie().tie("in").to(command.container)
        })
        .salience(5)
        .viewpoint(command.viewpoint)
        .abridge(()=>this.check.unfold(command))
        .revise(()=>this.instead.unfold(command))
    return episode                
}
plot.action.dropping.verbs("drop","leave").preposition("in").register(2)
plot.action.dropping.verbs("drop","leave").register()

plot.action.dropping.check.nothing.unfold=function(command)
{
    
    command.notDroppable=command.directObject?.subtract(command.droppable)
    if(!command.directObject ||(command.droppable.isEmpty && command.notDroppable.isEmpty))
    {
        var episode=ishml.Episode(this)
            .narration(()=>_`<p>You think about dropping something, but what?</p>`.say().append("#story"))
            .salience(3)   
            .viewpoint(command.viewpoint)
        return episode
    }
    return      
}
plot.action.dropping.check.notCapable.unfold=function(command)
{
    command.capable=command.subject.where(c=>c.has_skill($.action.dropping))
    command.notCapable=command.subject.subtract(command.capable)
    if (!command.notCapable.isEmpty)
    {
        var episode=ishml.Episode(this)
        .narration(()=>_`You are not capable of dropping.`.cache("notCapable").populate(command.notCapable).say().append("#story"))
        .salience(3)   
        .viewpoint(command.viewpoint)
       return episode
    }
    return 
}

plot.action.dropping.check.notDroppable.unfold=function(command)
{

    if (!command.notDroppable.isEmpty)
    {
        var episode=ishml.Episode(this)
        .narration(()=> _`<p>You ${_.pick("think about dropping","want to drop", "would drop")} the ${_list(command.notDroppable.knots.name)}, but ${_.pick(_`you don't even have ${command.notDroppable.them}`,_`${command.notDroppable.they} ${command.notDroppable.are}n't in your possession`)}.</p>`.say().append("#story"))
       /* .narration(()=> _`<p>You ${_.pick("think about dropping","want to drop", "would drop")} the ${cache=>_.list(cache.notDroppable.data.map(thing=>thing.knot.name))}, but ${_.pick(_`you don't even have ${cache=>cache.notDroppable.data.them}`,_`${cache=>cache.notDroppable.data.they} ${cache=>cache.notDroppable.data.are}n't in your possession`)}.</p>`.cache("notDroppable").populate(command.notDroppable).say().append("#story"))*/
        .salience(3)   
        .viewpoint(command.viewpoint)
        return episode
    }
    return 
}
plot.action.dropping.check.notContainer.unfold=function(command)
{
    command.container=command.indirectObject.is("container")
    command.notContainer=command.indirectObject.subtract(command.container)
    if (command.container.isEmpty )
    {
        var episode=ishml.Episode(this)
        .narration(()=>_`That's not a container.`.cache("selfContainer").populate(command.selfContainer).say().append("#story"))
        .salience(3)   
        .viewpoint(command.viewpoint)
        return episode
    }
    return 
}
plot.action.dropping.check.whichContainer.unfold=function(command)
{
    if (command.container.size >1  )
    {
        var episode=ishml.Episode(this)
        .narration(()=>_`Which container?`.cache("selfContainer").populate(command.selfContainer).say().append("#story"))
        .salience(3)   
        .viewpoint(command.viewpoint)
        return episode
    }
    return 
}
plot.action.dropping.check.selfContainer.unfold=function(command)
{
    if (command.container.subtract(command.droppable).size!==command.container.size)
    {
        var episode=ishml.Episode(this)
        .narration(()=>_`It cannot contain itself.`.cache("selfContainer").populate(command.selfContainer).say().append("#story"))
        .salience(3)   
        .viewpoint(command.viewpoint)
        return episode
    }
    return 
}
plot.action.dropping.instead



plot.action.going.unfold=function(command)
{
    if (!command.directObject){command.directObject={select:command.verb.select}}
    command.destination=command.directObject.select(command.subject.select())
    var episode=ishml.Episode(this)
        .narration(()=>{if (!command.silently) _`You go. `.say().append("#story")})
        .resolution(()=>{command.subject.select().in.retie(command.destination)})
        .salience(5)
        .viewpoint(command.viewpoint)
        .abridge(()=>this.check.unfold(command))
        .revise(()=>this.instead.unfold(command))
    return episode                
}
plot.action.going.verbs("go").register()
plot.action.going.verbs("north","n").register({valence:0,select:new ishml.Cord(subject=>subject.in.exit.north)})
plot.action.going.verbs("south","s").register({valence:0,select:new ishml.Cord(subject=>subject.in.exit.south)})
plot.action.going.verbs("east","e").register({valence:0,select:new ishml.Cord((subject)=>subject.in.exit.east)})
plot.action.going.verbs("west","w").register({valence:0,select:new ishml.Cord((subject)=>subject.in.exit.west)})
plot.action.going.verbs("northeast","ne").register({valence:0,select:new ishml.Cord(subject=>subject.in.exit.northeast)})
plot.action.going.verbs("northwest","nw").register({valence:0,select:new ishml.Cord(subject=>subject.in.exit.northwest)})
plot.action.going.verbs("southeast","se").register({valence:0,select:new ishml.Cord(subject=>subject.in.exit.southeast)})
plot.action.going.verbs("southwest","sw").register({valence:0,select:new ishml.Cord(subject=>subject.in.exit.southwest)})
plot.action.going.verbs("up","u").register({valence:0,select:new ishml.Cord(subject=>subject.in.exit.up)})
plot.action.going.verbs("down","d").register({valence:0,select:new ishml.Cord(subject=>subject.in.exit.down)})

plot.action.going.check
plot.action.going.instead

plot.action.looking.unfold=function(command)
{
    command.places=command.subject.in
    command.things=command.places.contains.is.thing //.add(command.places.contains.is.thing.supports) 
    command.people=command.places.contains.is.actor.subtract(command.subject)
    var episode=ishml.Episode(this)
        .narration(()=>{if (!command.silently) 
            _`<p>You look around. ${command.places.knot.description}</p>
            <p></p>`
            .say().append("#story")})
        .salience(5)
        .viewpoint(command.viewpoint)
        .abridge(()=>this.check.unfold(command))
        .revise(()=>this.instead.unfold(command))
    return episode    
               
}
lexicon
    .register("look").as({plot:plot.action.looking , part: "verb",  valence:0 })    

plot.action.looking.check
plot.action.looking.instead
/*Taking*/
plot.action.taking.unfold=function(command)
{
    if (!command.indirectObject)
    {
        command.indirectObject=command.subject.in
    }
    
    command.portable=command.directObject.is("portable")
    var episode=ishml.Episode(this)
        .narration(()=>{if (!command.silently) _`Taken. `.say().append("#story")})
        //.resolution(()=>{command.portable.in.converse.untie().tie(cords.carries).from(command.capable)})
        .resolution(()=>{command.portable.in.untie().from.tie("carried_by").to(command.capable)})
        .salience(5)
        .viewpoint(command.viewpoint)
        .abridge(()=>this.check.unfold(command))
        .revise(()=>this.instead.unfold(command))
    return episode                
}
plot.action.taking.verbs("take","grab","steal").register()
plot.action.taking.verbs("pick").particle("up").register()
        
plot.action.taking.check.notPortable.unfold=function(command)
{
    command.notPortable=command.directObject.subtract(command.portable)
    if (!command.notPortable.isEmpty)
    {
        
        return ishml.Episode(this)
        .narration(()=> _`<p>You ${_.pick("think about taking","want to take", "would take")} the ${_.list(command.notPortable.knots.name)}, but ${_.pick(_` ${command.notPortable.them} isn't portable`,_`${command.notPortable.they} ${command.notPortable.are} too unwieldy`)}.</p>`.say().append("#story"))
           /* .narration(()=> _`<p>You ${_.pick("think about taking","want to take", "would take")} the ${cache=>_.list(cache.notPortable.data.map(thing=>thing.knot.name))}, but ${_.pick(_` ${cache=>cache.notPortable.data.them} isn't portable`,_`${cache=>cache.notPortable.data.they} ${cache=>cache.notPortable.data.are} too unwieldy`)}.</p>`.cache("notPortable").populate(command.notPortable).say().append("#story"))*/
            .salience(3)   
            .viewpoint(command.viewpoint)
        
    }
    
}
plot.action.taking.check.notCapable.unfold=function(command)
{
    command.capable=command.subject.where(c=>c.has_skill($.action.taking)) //test .has_skill("taking")
    command.notCapable=command.subject.subtract(command.capable)
   
    if (!command.notCapable.isEmpty)
    {
        return ishml.Episode(this)
            .narration(()=>_`You are not capable of taking.`.cache("notCapable").populate(command.notCapable).say().append("#story"))
            .salience(3)   
            .viewpoint(command.viewpoint)
    }
}
plot.action.taking.check.selfTaking.unfold=function(command)
{
    if (command.portable.subtract(command.subject).size!==command.portable.size)
    {
        return ishml.Episode(this)
            .narration(()=>_`Cannot self-take.`.say().append("#story"))
            .salience(3)   
            .viewpoint(command.viewpoint)
     }
  
}
plot.action.taking.check.reachable.unfold=function(command)
{
    command.reachable=command.portable.path(command.capable.in, {via:"in"}).aft
    command.notReachable=command.portable.subtract(command.reachable)
    if (command.notReachable.size>0)
    {
        return ishml.Episode(this)
            .narration(()=>_`Not reachable.`.say().append("#story"))
            .salience(3)   
            .viewpoint(command.viewpoint)
     }
  
}
plot.action.taking.check.nothing.unfold=function(command)
{
    
    if(!command.directObject ||(command.portable.isEmpty && command.notPortable.isEmpty))
    {
        var episode=ishml.Episode(this)
            .narration(()=>_`<p>You think about taking something, but what?</p>`.say().append("#story"))
            .salience(3)   
            .viewpoint(command.viewpoint)
        return episode
    }
    return      
}
plot.action.taking.instead

/*

Check an actor taking (this is the can’t take component parts rule):
if the noun is part of something (called the whole), stop the action
with library message taking action number 7 for the whole.
Check an actor taking (this is the can’t take people’s possessions rule):
let the local ceiling be the common ancestor of the actor with the noun;
let H be the not-counting-parts holder of the noun;
while H is not nothing and H is not the local ceiling:
if H is a person, stop the action with library message taking action
number 6 for H;
let H be the not-counting-parts holder of H;

Check an actor taking (this is the can’t take items out of play rule):
let H be the noun;
while H is not nothing and H is not a room:
let H be the not-counting-parts holder of H;
if H is nothing, stop the action with library message taking action
number 8 for the noun.

Check an actor taking (this is the can’t take what you’re inside rule):
let the local ceiling be the common ancestor of the actor with the noun;
if the local ceiling is the noun, stop the action with library message
taking action number 4 for the noun.
Check an actor taking (this is the can’t take what’s already taken rule):
if the actor is carrying the noun, stop the action with library message
taking action number 5 for the noun;
if the actor is wearing the noun, stop the action with library message
taking action number 5 for the noun.
Check an actor taking (this is the can’t take scenery rule):
if the noun is scenery, stop the action with library message taking
action number 10 for the noun.
Check an actor taking (this is the can only take things rule):
if the noun is not a thing, stop the action with library message taking
action number 15 for the noun.
Check an actor taking (this is the can’t take what’s fixed in place rule):
A/sr4 - SR4 - Actions §8 4
if the noun is fixed in place, stop the action with library message taking
action number 11 for the noun.
Check an actor taking (this is the use player’s holdall to avoid exceeding
carrying capacity rule):
if the number of things carried by the actor is at least the
carrying capacity of the actor:
if the actor is holding a player’s holdall (called the current working sack):
let the transferred item be nothing;
repeat with the possible item running through things carried by
the actor:
if the possible item is not lit and the possible item is not
the current working sack, let the transferred item be the possible item;
if the transferred item is not nothing:
issue library message taking action number 13 for the
transferred item and the current working sack;
silently try the actor trying inserting the transferred item
into the current working sack;
if the transferred item is not in the current working sack, stop the action;
Check an actor taking (this is the can’t exceed carrying capacity rule):
if the number of things carried by the actor is at least the
carrying capacity of the actor, stop the action with library
message taking action number 12 for the actor.
*/
