/*input*/   
var plot=ishml.plot
var lexicon=ishml.lexicon
var $ = ishml.net
var pb = ishml.phrasebook
var _ =ishml.template._ 
plot.main.dialog.input.unfold=function(twist)
{
    var episodes=[]
    var results=ishml.parser.analyze(this.twist.input)
    if(results.success)
    {
        results.interpretations.forEach(interpretation=>
        {
            var command=Object.assign(
            {
                actor:$.actor[this.twist.timeline].cord,
               // subject:$.actor[this.twist.timeline].cord,
                timeline:this.twist.timeline,
            },interpretation.gist.command)
            episodes=episodes.concat(plot.action.unfold(command))
        })   
        if (episodes.length>0)
        {
            ishml.introduce(episodes[0])
            ishml.tell(this.twist.timeline)
        } 
    }
    else
    {
        if (results.interpretations?.[0].remainder.length>0)
        {

            _`<p>${_.favor(
                _`Your thoughts are fuzzy.  How does <q>${results.interpretations[0].remainder}</q> apply here?`,
                _`Confusedly, you think <q>${results.interpretations[0].remainder}</q> to yourself.`,
                _`You realize <q>${results.interpretations[0].remainder}</q> doesn't make any sense here once you say it out loud.`)}</p>`.say().append("#story")
        }    
        else
        {
            _`<p>${_.favor(
                _`Your thoughts are fuzzy.  How does <q>${twist.input}</q> apply here?`,
                _`Confusedly, you think <q>${twist.input}</q> to yourself.`,
                _`You realize <q>${twist.input}</q> doesn't make any sense here once you say it out loud.`)}</p>`
                .say().append("#story")        
        }
    }    
    return {continue:true}
   
}

/*actions*/
plot.action.unfold=function(command)
{
    command.subject=command.subject ?? command.actor
    if (!command.actor.akin(command.subject) && !command.requestor )
    {
        var request=
        {
            actor:command.actor,
            timeline:command.timeline,
            direct:command.subject,
            subject:command.actor,
            indirect:{command:Object.assign({},command)}
        }
        return plot.action.asking_to.unfold(request)
    }
    command.subject= command.subject ?? command.actor
    return command.verb.unfold(command)
}
plot.action.asking_to.unfold=function(command)
{
    command.indirect.command.timeline=command.timeline
    command.indirect.command.subject=command.direct
    command.indirect.command.requestor=command.subject
    command.indirect.command.actor=command.actor
    return this.Episode()
        .narration(()=>(command.actor.akin(command.subject)?pb.player.asked:_`${_.cap.SUBJECT()} asked ${_.the.DIRECT()} to do something.`)
            .populate(command)
            .say().append("#story"))
        .resolution(()=>
        {
            //command.indirect.command.actor=command.actor
           
            var actionEpisode=plot.action.unfold(command.indirect.command)
            actionEpisode.timeline(command.timeline)
            ishml.introduce(actionEpisode)
        })
        .salience(5)
        .timeline(command.timeline)  
        .abridge(()=>this.check.unfold(command))
        .revise(()=>this.instead.unfold(command))
}
plot.action.asking_to.verbs("ask").preposition("to").register(2)
plot.action.asking_to.check
plot.action.asking_to.instead

plot.action.dropping.unfold=function(command)
{
    command.indirect=command.indirect ?? command.subject.in
    command.droppable=command.direct.worn_by(command.subject).converse
    .add(command.direct.carried_by(command.subject).converse)
    return this.Episode()
        .narration(()=> (command.actor.akin(command.subject)?_`<p>${_.They.SUBJECT()} dropped ${_.the.DROPPABLE()}.</p>`:_`${_.cap.SUBJECT()} put down ${_.the.DROPPABLE()}.`)
            .populate(command)
            .say().append("#story"))
        .resolution(()=>
        {
            command.droppable.untie("carried_by").tie("in").to(command.container)
            command.droppable.untie("worn_by").tie("in").to(command.container)

        })
        .salience(5)
        .timeline(command.timeline)
        .abridge(()=>this.check.unfold(command))
        .revise(()=>this.instead.unfold(command))
}
plot.action.dropping.verbs("drop","leave").preposition("in").register(2)
plot.action.dropping.verbs("drop","leave").register()

plot.action.dropping.check.nothing.unfold=function(command)
{
    
    command.undroppable=command.direct.subtract(command.droppable)
    if(!command.direct ||(command.droppable.isEmpty && command.undroppable.isEmpty))
    {
        return this.ishml.Episode()
            .narration(()=>_`<p>${_SUBJECT()} think about dropping something, but what?</p>`
                .populate(command)
                .say().append("#story"))
            .salience(3)   
            .timeline(command.timeline)
    }
    return      
}

plot.action.dropping.check.incapable.unfold=function(command)
{
    command.capable=command.subject.where(c=>c.has_skill($.action.dropping))
    command.incapable=command.subject.subtract(command.capable)
    if (!command.incapable.isEmpty)
    {
       return this.Episode()
        .narration(()=>_`${_.cap.SUBJECT()} are not capable of dropping ${_.INCAPABLE()}.`
            .populate(command)
            .say().append("#story"))
        .salience(3)   
        .timeline(command.timeline)
    }
    return 
}

plot.action.dropping.check.undroppable.unfold=function(command)
{
    if (!command.undroppable.isEmpty)
    {
        return this.Episode()
            .narration(()=> _`<p>${_.SUBJECT()} ${_.pick("think about dropping","want to drop", "would drop")} the ${_.list.UNDROPPABLE()}, but ${_.pick(_`you don't even have ${_.them.undroppable}`,_`${_.they.undroppable} ${_.are.undroppable}n't in your possession`)}.</p>`
                .populate(command)
                .say().append("#story"))

            .salience(3)   
            .timeline(command.timeline)
    }
    return 
}
plot.action.dropping.check.notContainer.unfold=function(command)
{
    command.container=command.indirect.is("container")
    command.notContainer=command.indirect.subtract(command.container)
    if (command.container.isEmpty )
    {
        return this.Episode()
        .narration(()=>_`That's not a container.`.cache("selfContainer").populate(command.selfContainer).say().append("#story"))
        .salience(3)   
        .timeline(command.timeline)
    }
    return 
}
plot.action.dropping.check.whichContainer.unfold=function(command)
{
    if (command.container.size >1  )
    {
        return this.Episode()
        .narration(()=>_`Which container?`.cache("selfContainer").populate(command.selfContainer).say().append("#story"))
        .salience(3)   
        .timeline(command.timeline)
    }
    return 
}
plot.action.dropping.check.selfContainer.unfold=function(command)
{
    if (command.container.subtract(command.droppable).size!==command.container.size)
    {
        return this.Episode()
        .narration(()=>_`It cannot contain itself.`.cache("selfContainer").populate(command.selfContainer).say().append("#story"))
        .salience(3)   
        .timeline(command.timeline)
    }
    return 
}
plot.action.dropping.instead

plot.action.going.unfold=function(command)
{
    if (!command.direct){command.direct={select:command.verb.select}}
    command.destination=command.direct.select(command.subject.select())
    return this.Episode()
        .narration(()=>{if (!command.silently) _`You go. `.say().append("#story")})
        .resolution(()=>{command.subject.select().in.retie(command.destination)})
        .salience(5)
        .timeline(command.timeline)
        .abridge(()=>this.check.unfold(command))
        .revise(()=>this.instead.unfold(command))
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
    return this.Episode()
        .narration(()=>_`<p>You look around. ${command.places.knot.description}</p>
            <p></p>`
            .say().append("#story"))
        .salience(5)
        .timeline(command.timeline)
        .abridge(()=>this.check.unfold(command))
        .revise(()=>this.instead.unfold(command))
}
lexicon
    .register("look").as({plot:plot.action.looking , part: "verb",  valence:0 })    

plot.action.looking.check
plot.action.looking.instead
/*Taking*/
plot.action.taking.unfold=function(command)
{
    if (!command.indirect)
    {
        command.indirect=command.subject.in
    }
    command.portable=command.direct.is("portable")
    return this.Episode()
        .narration(()=> (command.actor.akin(command.subject)?_`<p>${_.They.SUBJECT()} took ${_.the.PORTABLE()}.</p>`:_`${_.cap.SUBJECT()} picked up ${_.the.PORTABLE()}.`).populate(command).say().append("#story"))
        //.resolution(()=>{command.portable.in.converse.untie().tie(cords.carries).from(command.capable)})
        .resolution(()=>{command.portable.untie("in").tie("carried_by").to(command.subject)})
        .salience(5)
        .timeline(command.timeline)
        .abridge(()=>this.check.unfold(command))
        .revise(()=>this.instead.unfold(command))
}
plot.action.taking.verbs("take","grab","steal").register()
plot.action.taking.verbs("pick").particle("up").register()
        
plot.action.taking.check.notPortable.unfold=function(command)
{
    command.notPortable=command.direct.subtract(command.portable)
    if (!command.notPortable.isEmpty)
    {
        return this.Episode()
        .narration(()=> _`<p>You ${_.pick("think about taking","want to take", "would take")} the ${_.list(command.notPortable.knots.name)}, but ${_.pick(_` ${command.notPortable.them} isn't portable`,_`${command.notPortable.they} ${command.notPortable.are} too unwieldy`)}.</p>`.say().append("#story"))
            .salience(3)   
            .timeline(command.timeline)
    }
}
plot.action.taking.check.notCapable.unfold=function(command)
{
    command.capable=command.subject.where(c=>c.has_skill($.action.taking)) //test .has_skill("taking")
    command.notCapable=command.subject.subtract(command.capable)
   
    if (!command.notCapable.isEmpty)
    {
        return this.Episode()
            .narration(()=>_`You are not capable of taking.`.cache("notCapable").populate(command.notCapable).say().append("#story"))
            .salience(3)   
            .timeline(command.timeline)
    }
}
plot.action.taking.check.selfTaking.unfold=function(command)
{
    if (command.portable.subtract(command.subject).size!==command.portable.size)
    {
        return this.Episode()
            .narration(()=>_`Cannot self-take.`.say().append("#story"))
            .salience(3)   
            .timeline(command.timeline)
    }
}
plot.action.taking.check.reachable.unfold=function(command)
{
    command.reachable=command.portable.path(command.capable.in, {via:"in"}).aft.cord
    command.notReachable=command.portable.subtract(command.reachable)
    if (command.notReachable.size>0)
    {
        return this.Episode()
            .narration(()=>_`Not reachable.`.say().append("#story"))
            .salience(3)   
            .timeline(command.timeline)
    }
}
plot.action.taking.check.nothing.unfold=function(command)
{
    if(!command.direct ||(command.portable.isEmpty && command.notPortable.isEmpty))
    {
        return this.Episode()
            .narration(()=>_`<p>You think about taking something, but what?</p>`.say().append("#story"))
            .salience(3)   
            .timeline(command.timeline)
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

/*
Standard Rules:
      announce items from multiple object lists rule response (A): "[current item from the multiple object list]: [run paragraph on]"
    block vaguely going rule response (A): "You'll have to say which compass direction to go in."
    print the final prompt rule response (A): "> [run paragraph on]"
    print the final question rule response (A): "Would you like to "
    print the final question rule response (B): " or "
    standard respond to final question rule response (A): "Please give one of the answers above."
    you-can-also-see rule response (A): "[We] "
    you-can-also-see rule response (B): "On [the domain] [we] "
    you-can-also-see rule response (C): "In [the domain] [we] "
    you-can-also-see rule response (D): "[regarding the player][can] also see "
    you-can-also-see rule response (E): "[regarding the player][can] see "
    you-can-also-see rule response (F): " here"
    use initial appearance in room descriptions rule response (A): "On [the item] "
    describe what's on scenery supporters in room descriptions rule response (A): "On [the item] "
    describe what's on mentioned supporters in room descriptions rule response (A): "On [the item] "
    print empty inventory rule response (A): "[We] [are] carrying nothing."
    print standard inventory rule response (A): "[We] [are] carrying:[line break]"
    report other people taking inventory rule response (A): "[The actor] [look] through [their] possessions."
    can't take yourself rule response (A): "[We] [are] always self-possessed."
    can't take other people rule response (A): "I don't suppose [the noun] [would care] for that."
    can't take component parts rule response (A): "[regarding the noun][Those] [seem] to be a part of [the whole]."
    can't take people's possessions rule response (A): "[regarding the noun][Those] [seem] to belong to [the owner]."
    can't take items out of play rule response (A): "[regarding the noun][Those] [aren't] available."
    can't take what you're inside rule response (A): "[We] [would have] to get [if noun is a supporter]off[otherwise]out of[end if] [the noun] first."
    can't take what's already taken rule response (A): "[We] already [have] [regarding the noun][those]."
    can't take scenery rule response (A): "[regarding the noun][They're] hardly portable."
    can only take things rule response (A): "[We] [cannot] carry [the noun]."
    can't take what's fixed in place rule response (A): "[regarding the noun][They're] fixed in place."
    use player's holdall to avoid exceeding carrying capacity rule response (A): "(putting [the transferred item] into [the current working sack] to make room)[command clarification break]"
    can't exceed carrying capacity rule response (A): "[We]['re] carrying too many things already."
    standard report taking rule response (A): "Taken."
    standard report taking rule response (B): "[The actor] [pick] up [the noun]."
    can't remove what's not inside rule response (A): "But [regarding the noun][they] [aren't] there now."
    can't remove from people rule response (A): "[regarding the noun][Those] [seem] to belong to [the owner]."
    can't drop yourself rule response (A): "[We] [lack] the dexterity."
    can't drop body parts rule response (A): "[We] [can't drop] part of [ourselves]."
    can't drop what's already dropped rule response (A): "[The noun] [are] already here."
    can't drop what's not held rule response (A): "[We] [haven't] got [regarding the noun][those]."
    can't drop clothes being worn rule response (A): "(first taking [the noun] off)[command clarification break]"
    can't drop if this exceeds carrying capacity rule response (A): "[There] [are] no more room on [the receptacle]."
    can't drop if this exceeds carrying capacity rule response (B): "[There] [are] no more room in [the receptacle]."
    standard report dropping rule response (A): "Dropped."
    standard report dropping rule response (B): "[The actor] [put] down [the noun]."
    can't put something on itself rule response (A): "[We] [can't put] something on top of itself."
    can't put onto what's not a supporter rule response (A): "Putting things on [the second noun] [would achieve] nothing."
    can't put clothes being worn rule response (A): "(first taking [regarding the noun][them] off)[command clarification break]"
    can't put if this exceeds carrying capacity rule response (A): "[There] [are] no more room on [the second noun]."
    concise report putting rule response (A): "Done."
    standard report putting rule response (A): "[The actor] [put] [the noun] on [the second noun]."
    can't insert something into itself rule response (A): "[We] [can't put] something inside itself."
    can't insert into closed containers rule response (A): "[The second noun] [are] closed."
    can't insert into what's not a container rule response (A): "[regarding the second noun][Those] [can't contain] things."
    can't insert clothes being worn rule response (A): "(first taking [regarding the noun][them] off)[command clarification break]"
    can't insert if this exceeds carrying capacity rule response (A): "[There] [are] no more room in [the second noun]."
    concise report inserting rule response (A): "Done."
    standard report inserting rule response (A): "[The actor] [put] [the noun] into [the second noun]."
    can't eat unless edible rule response (A): "[regarding the noun][They're] plainly inedible."
    can't eat clothing without removing it first rule response (A): "(first taking [the noun] off)[command clarification break]"
    can't eat other people's food rule response (A): "[The owner] [might not appreciate] that."
    standard report eating rule response (A): "[We] [eat] [the noun]. Not bad."
    standard report eating rule response (B): "[The actor] [eat] [the noun]."
    stand up before going rule response (A): "(first getting off [the chaise])[command clarification break]"
    can't travel in what's not a vehicle rule response (A): "[We] [would have] to get off [the nonvehicle] first."
    can't travel in what's not a vehicle rule response (B): "[We] [would have] to get out of [the nonvehicle] first."
    can't go through undescribed doors rule response (A): "[We] [can't go] that way."
    can't go through closed doors rule response (A): "(first opening [the door gone through])[command clarification break]"
    can't go that way rule response (A): "[We] [can't go] that way."
    can't go that way rule response (B): "[We] [can't], since [the door gone through] [lead] nowhere."
    describe room gone into rule response (A): "[The actor] [go] up"
    describe room gone into rule response (B): "[The actor] [go] down"
    describe room gone into rule response (C): "[The actor] [go] [noun]"
    describe room gone into rule response (D): "[The actor] [arrive] from above"
    describe room gone into rule response (E): "[The actor] [arrive] from below"
    describe room gone into rule response (F): "[The actor] [arrive] from [the back way]"
    describe room gone into rule response (G): "[The actor] [arrive]"
    describe room gone into rule response (H): "[The actor] [arrive] at [the room gone to] from above"
    describe room gone into rule response (I): "[The actor] [arrive] at [the room gone to] from below"
    describe room gone into rule response (J): "[The actor] [arrive] at [the room gone to] from [the back way]"
    describe room gone into rule response (K): "[The actor] [go] through [the noun]"
    describe room gone into rule response (L): "[The actor] [arrive] from [the noun]"
    describe room gone into rule response (M): "on [the vehicle gone by]"
    describe room gone into rule response (N): "in [the vehicle gone by]"
    describe room gone into rule response (O): ", pushing [the thing gone with] in front, and [us] along too"
    describe room gone into rule response (P): ", pushing [the thing gone with] in front"
    describe room gone into rule response (Q): ", pushing [the thing gone with] away"
    describe room gone into rule response (R): ", pushing [the thing gone with] in"
    describe room gone into rule response (S): ", taking [us] along"
    can't enter what's already entered rule response (A): "But [we]['re] already on [the noun]."
    can't enter what's already entered rule response (B): "But [we]['re] already in [the noun]."
    can't enter what's not enterable rule response (A): "[regarding the noun][They're] not something [we] [can] stand on."
    can't enter what's not enterable rule response (B): "[regarding the noun][They're] not something [we] [can] sit down on."
    can't enter what's not enterable rule response (C): "[regarding the noun][They're] not something [we] [can] lie down on."
    can't enter what's not enterable rule response (D): "[regarding the noun][They're] not something [we] [can] enter."
    can't enter closed containers rule response (A): "[We] [can't get] into the closed [noun]."
    can't enter if this exceeds carrying capacity rule response (A): "[There] [are] no more room on [the noun]."
    can't enter if this exceeds carrying capacity rule response (B): "[There] [are] no more room in [the noun]."
    can't enter something carried rule response (A): "[We] [can] only get into something free-standing."
    implicitly pass through other barriers rule response (A): "(getting off [the current home])[command clarification break]"
    implicitly pass through other barriers rule response (B): "(getting out of [the current home])[command clarification break]"
    implicitly pass through other barriers rule response (C): "(getting onto [the target])[command clarification break]"
    implicitly pass through other barriers rule response (D): "(getting into [the target])[command clarification break]"
    implicitly pass through other barriers rule response (E): "(entering [the target])[command clarification break]"
    standard report entering rule response (A): "[We] [get] onto [the noun]."
    standard report entering rule response (B): "[We] [get] into [the noun]."
    standard report entering rule response (C): "[The actor] [get] into [the noun]."
    standard report entering rule response (D): "[The actor] [get] onto [the noun]."
    can't exit when not inside anything rule response (A): "But [we] [aren't] in anything at the [if story tense is present tense]moment[otherwise]time[end if]."
    can't exit closed containers rule response (A): "You can't get out of the closed [cage]."
    standard report exiting rule response (A): "[We] [get] off [the container exited from]."
    standard report exiting rule response (B): "[We] [get] out of [the container exited from]."
    standard report exiting rule response (C): "[The actor] [get] out of [the container exited from]."
    can't get off things rule response (A): "But [we] [aren't] on [the noun] at the [if story tense is present tense]moment[otherwise]time[end if]."
    standard report getting off rule response (A): "[The actor] [get] off [the noun]."
    room description heading rule response (A): "Darkness"
    room description heading rule response (B): " (on [the intermediate level])"
    room description heading rule response (C): " (in [the intermediate level])"
    room description body text rule response (A): "[It] [are] pitch dark, and [we] [can't see] a thing."
    other people looking rule response (A): "[The actor] [look] around."
    examine directions rule response (A): "[We] [see] nothing unexpected in that direction."
    examine containers rule response (A): "In [the noun] "
    examine containers rule response (B): "[The noun] [are] empty."
    examine supporters rule response (A): "On [the noun] "
    examine devices rule response (A): "[The noun] [are] [if story tense is present tense]currently [end if]switched [if the noun is switched on]on[otherwise]off[end if]."
    examine undescribed things rule response (A): "[We] [see] nothing special about [the noun]."
    report other people examining rule response (A): "[The actor] [look] closely at [the noun]."
    standard looking under rule response (A): "[We] [find] nothing of interest."
    report other people looking under rule response (A): "[The actor] [look] under [the noun]."
    can't search unless container or supporter rule response (A): "[We] [find] nothing of interest."
    can't search closed opaque containers rule response (A): "[We] [can't see] inside, since [the noun] [are] closed."
    standard search containers rule response (A): "In [the noun] "
    standard search containers rule response (B): "[The noun] [are] empty."
    standard search supporters rule response (A): "On [the noun] "
    standard search supporters rule response (B): "[There] [are] nothing on [the noun]."
    report other people searching rule response (A): "[The actor] [search] [the noun]."
    block consulting rule response (A): "[We] [discover] nothing of interest in [the noun]."
    block consulting rule response (B): "[The actor] [look] at [the noun]."
    can't lock without a lock rule response (A): "[regarding the noun][Those] [don't] seem to be something [we] [can] lock."
    can't lock what's already locked rule response (A): "[regarding the noun][They're] locked at the [if story tense is present tense]moment[otherwise]time[end if]."
    can't lock what's open rule response (A): "First [we] [would have] to close [the noun]."
    can't lock without the correct key rule response (A): "[regarding the second noun][Those] [don't] seem to fit the lock."
    standard report locking rule response (A): "[We] [lock] [the noun]."
    standard report locking rule response (B): "[The actor] [lock] [the noun]."
    can't unlock without a lock rule response (A): "[regarding the noun][Those] [don't] seem to be something [we] [can] unlock."
    can't unlock what's already unlocked rule response (A): "[regarding the noun][They're] unlocked at the [if story tense is present tense]moment[otherwise]time[end if]."
    can't unlock without the correct key rule response (A): "[regarding the second noun][Those] [don't] seem to fit the lock."
    standard report unlocking rule response (A): "[We] [unlock] [the noun]."
    standard report unlocking rule response (B): "[The actor] [unlock] [the noun]."
    can't switch on unless switchable rule response (A): "[regarding the noun][They] [aren't] something [we] [can] switch."
    can't switch on what's already on rule response (A): "[regarding the noun][They're] already on."
    standard report switching on rule response (A): "[The actor] [switch] [the noun] on."
    can't switch off unless switchable rule response (A): "[regarding the noun][They] [aren't] something [we] [can] switch."
    can't switch off what's already off rule response (A): "[regarding the noun][They're] already off."
    standard report switching off rule response (A): "[The actor] [switch] [the noun] off."
    can't open unless openable rule response (A): "[regarding the noun][They] [aren't] something [we] [can] open."
    can't open what's locked rule response (A): "[regarding the noun][They] [seem] to be locked."
    can't open what's already open rule response (A): "[regarding the noun][They're] already open."
    reveal any newly visible interior rule response (A): "[We] [open] [the noun], revealing "
    standard report opening rule response (A): "[We] [open] [the noun]."
    standard report opening rule response (B): "[The actor] [open] [the noun]."
    standard report opening rule response (C): "[The noun] [open]."
    can't close unless openable rule response (A): "[regarding the noun][They] [aren't] something [we] [can] close."
    can't close what's already closed rule response (A): "[regarding the noun][They're] already closed."
    standard report closing rule response (A): "[We] [close] [the noun]."
    standard report closing rule response (B): "[The actor] [close] [the noun]."
    standard report closing rule response (C): "[The noun] [close]."
    can't wear what's not clothing rule response (A): "[We] [can't wear] [regarding the noun][those]!"
    can't wear what's not held rule response (A): "[We] [aren't] holding [regarding the noun][those]!"
    can't wear what's already worn rule response (A): "[We]['re] already wearing [regarding the noun][those]!"
    standard report wearing rule response (A): "[We] [put] on [the noun]."
    standard report wearing rule response (B): "[The actor] [put] on [the noun]."
    can't take off what's not worn rule response (A): "[We] [aren't] wearing [the noun]."
    can't exceed carrying capacity when taking off rule response (A): "[We]['re] carrying too many things already."
    standard report taking off rule response (A): "[We] [take] off [the noun]."
    standard report taking off rule response (B): "[The actor] [take] off [the noun]."
    can't give what you haven't got rule response (A): "[We] [aren't] holding [the noun]."
    can't give to yourself rule response (A): "[We] [can't give] [the noun] to [ourselves]."
    can't give to a non-person rule response (A): "[The second noun] [aren't] able to receive things."
    can't give clothes being worn rule response (A): "(first taking [the noun] off)[command clarification break]"
    block giving rule response (A): "[The second noun] [don't] seem interested."
    can't exceed carrying capacity when giving rule response (A): "[The second noun] [are] carrying too many things already."
    standard report giving rule response (A): "[We] [give] [the noun] to [the second noun]."
    standard report giving rule response (B): "[The actor] [give] [the noun] to [us]."
    standard report giving rule response (C): "[The actor] [give] [the noun] to [the second noun]."
    can't show what you haven't got rule response (A): "[We] [aren't] holding [the noun]."
    block showing rule response (A): "[The second noun] [are] unimpressed."
    block waking rule response (A): "That [seem] unnecessary."
    implicitly remove thrown clothing rule response (A): "(first taking [the noun] off)[command clarification break]"
    futile to throw things at inanimate objects rule response (A): "Futile."
    block throwing at rule response (A): "[We] [lack] the nerve when it [if story tense is the past tense]came[otherwise]comes[end if] to the crucial moment."
    block attacking rule response (A): "Violence [aren't] the answer to this one."
    kissing yourself rule response (A): "[We] [don't] get much from that."
    block kissing rule response (A): "[The noun] [might not] like that."
    block answering rule response (A): "[There] [are] no reply."
    telling yourself rule response (A): "[We] [talk] to [ourselves] a while."
    block telling rule response (A): "This [provoke] no reaction."
    block asking rule response (A): "[There] [are] no reply."
    standard report waiting rule response (A): "Time [pass]."
    standard report waiting rule response (B): "[The actor] [wait]."
    report touching yourself rule response (A): "[We] [achieve] nothing by this."
    report touching yourself rule response (B): "[The actor] [touch] [themselves]."
    report touching other people rule response (A): "[The noun] [might not like] that."
    report touching other people rule response (B): "[The actor] [touch] [us]."
    report touching other people rule response (C): "[The actor] [touch] [the noun]."
    report touching things rule response (A): "[We] [feel] nothing unexpected."
    report touching things rule response (B): "[The actor] [touch] [the noun]."
    can't wave what's not held rule response (A): "But [we] [aren't] holding [regarding the noun][those]."
    report waving things rule response (A): "[We] [wave] [the noun]."
    report waving things rule response (B): "[The actor] [wave] [the noun]."
    can't pull what's fixed in place rule response (A): "[regarding the noun][They] [are] fixed in place."
    can't pull scenery rule response (A): "[We] [are] unable to."
    can't pull people rule response (A): "[The noun] [might not like] that."
    report pulling rule response (A): "Nothing obvious [happen]."
    report pulling rule response (B): "[The actor] [pull] [the noun]."
    can't push what's fixed in place rule response (A): "[regarding the noun][They] [are] fixed in place."
    can't push scenery rule response (A): "[We] [are] unable to."
    can't push people rule response (A): "[The noun] [might not like] that."
    report pushing rule response (A): "Nothing obvious [happen]."
    report pushing rule response (B): "[The actor] [push] [the noun]."
    can't turn what's fixed in place rule response (A): "[regarding the noun][They] [are] fixed in place."
    can't turn scenery rule response (A): "[We] [are] unable to."
    can't turn people rule response (A): "[The noun] [might not like] that."
    report turning rule response (A): "Nothing obvious [happen]."
    report turning rule response (B): "[The actor] [turn] [the noun]."
    can't push unpushable things rule response (A): "[The noun] [cannot] be pushed from place to place."
    can't push to non-directions rule response (A): "[regarding the noun][They] [aren't] a direction."
    can't push vertically rule response (A): "[The noun] [cannot] be pushed up or down."
    can't push from within rule response (A): "[The noun] [cannot] be pushed from here."
    block pushing in directions rule response (A): "[The noun] [cannot] be pushed from place to place."
    innuendo about squeezing people rule response (A): "[The noun] [might not like] that."
    report squeezing rule response (A): "[We] [achieve] nothing by this."
    report squeezing rule response (B): "[The actor] [squeeze] [the noun]."
    block saying yes rule response (A): "That was a rhetorical question."
    block saying no rule response (A): "That was a rhetorical question."
    block burning rule response (A): "This dangerous act [would achieve] little."
    block waking up rule response (A): "The dreadful truth [are], this [are not] a dream."
    block thinking rule response (A): "What a good idea."
    report smelling rule response (A): "[We] [smell] nothing unexpected."
    report smelling rule response (B): "[The actor] [sniff]."
    report listening rule response (A): "[We] [hear] nothing unexpected."
    report listening rule response (B): "[The actor] [listen]."
    report tasting rule response (A): "[We] [taste] nothing unexpected."
    report tasting rule response (B): "[The actor] [taste] [the noun]."
    block cutting rule response (A): "Cutting [regarding the noun][them] up [would achieve] little."
    report jumping rule response (A): "[We] [jump] on the spot."
    report jumping rule response (B): "[The actor] [jump] on the spot."
    block tying rule response (A): "[We] [would achieve] nothing by this."
    block drinking rule response (A): "[There's] nothing suitable to drink here."
    block saying sorry rule response (A): "Oh, don't [if American dialect option is active]apologize[otherwise]apologise[end if]."
    block swinging rule response (A): "[There's] nothing sensible to swing here."
    can't rub another person rule response (A): "[The noun] [might not like] that."
    report rubbing rule response (A): "[We] [rub] [the noun]."
    report rubbing rule response (B): "[The actor] [rub] [the noun]."
    block setting it to rule response (A): "No, [we] [can't set] [regarding the noun][those] to anything."
    report waving hands rule response (A): "[We] [wave]."
    report waving hands rule response (B): "[The actor] [wave]."
    block buying rule response (A): "Nothing [are] on sale."
    block climbing rule response (A): "Little [are] to be achieved by that."
    block sleeping rule response (A): "[We] [aren't] feeling especially drowsy."
    adjust light rule response (A): "[It] [are] [if story tense is present tense]now [end if]pitch dark in [if story tense is present tense]here[else]there[end if]!"
    generate action rule response (A): "(considering the first sixteen objects only)[command clarification break]"
    generate action rule response (B): "Nothing to do!"
    basic accessibility rule response (A): "You must name something more substantial."
    basic visibility rule response (A): "[It] [are] pitch dark, and [we] [can't see] a thing."
    requested actions require persuasion rule response (A): "[The noun] [have] better things to do."
    carry out requested actions rule response (A): "[The noun] [are] unable to do that."
    access through barriers rule response (A): "[regarding the noun][Those] [aren't] available."
    can't reach inside closed containers rule response (A): "[The noun] [aren't] open."
    can't reach inside rooms rule response (A): "[We] [can't] reach into [the noun]."
    can't reach outside closed containers rule response (A): "[The noun] [aren't] open."
    list writer internal rule response (A): " ("
    list writer internal rule response (B): ")"
    list writer internal rule response (C): " and "
    list writer internal rule response (D): "providing light"
    list writer internal rule response (E): "closed"
    list writer internal rule response (F): "empty"
    list writer internal rule response (G): "closed and empty"
    list writer internal rule response (H): "closed and providing light"
    list writer internal rule response (I): "empty and providing light"
    list writer internal rule response (J): "closed, empty[if serial comma option is active],[end if] and providing light"
    list writer internal rule response (K): "providing light and being worn"
    list writer internal rule response (L): "being worn"
    list writer internal rule response (M): "open"
    list writer internal rule response (N): "open but empty"
    list writer internal rule response (O): "closed"
    list writer internal rule response (P): "closed and locked"
    list writer internal rule response (Q): "containing"
    list writer internal rule response (R): "on [if the noun is a person]whom[otherwise]which[end if] "
    list writer internal rule response (S): ", on top of [if the noun is a person]whom[otherwise]which[end if] "
    list writer internal rule response (T): "in [if the noun is a person]whom[otherwise]which[end if] "
    list writer internal rule response (U): ", inside [if the noun is a person]whom[otherwise]which[end if] "
    list writer internal rule response (V): "[regarding list writer internals][are]"
    list writer internal rule response (W): "[regarding list writer internals][are] nothing"
    list writer internal rule response (X): "Nothing"
    list writer internal rule response (Y): "nothing"
    action processing internal rule response (A): "[bracket]That command asks to do something outside of play, so it can only make sense from you to me. [The noun] cannot be asked to do this.[close bracket]"
    action processing internal rule response (B): "You must name an object."
    action processing internal rule response (C): "You may not name an object."
    action processing internal rule response (D): "You must supply a noun."
    action processing internal rule response (E): "You may not supply a noun."
    action processing internal rule response (F): "You must name a second object."
    action processing internal rule response (G): "You may not name a second object."
    action processing internal rule response (H): "You must supply a second noun."
    action processing internal rule response (I): "You may not supply a second noun."
    action processing internal rule response (J): "(Since something dramatic has happened, your list of commands has been cut short.)"
    action processing internal rule response (K): "I didn't understand that instruction."
    parser error internal rule response (A): "I didn't understand that sentence."
    parser error internal rule response (B): "I only understood you as far as wanting to "
    parser error internal rule response (C): "I only understood you as far as wanting to (go) "
    parser error internal rule response (D): "I didn't understand that number."
    parser error internal rule response (E): "[We] [can't] see any such thing."
    parser error internal rule response (F): "You seem to have said too little!"
    parser error internal rule response (G): "[We] [aren't] holding that!"
    parser error internal rule response (H): "You can't use multiple objects with that verb."
    parser error internal rule response (I): "You can only use multiple objects once on a line."
    parser error internal rule response (J): "I'm not sure what ['][pronoun i6 dictionary word]['] refers to."
    parser error internal rule response (K): "[We] [can't] see ['][pronoun i6 dictionary word]['] ([the noun]) at the moment."
    parser error internal rule response (L): "You excepted something not included anyway!"
    parser error internal rule response (M): "You can only do that to something animate."
    parser error internal rule response (N): "That's not a verb I [if American dialect option is active]recognize[otherwise]recognise[end if]."
    parser error internal rule response (O): "That's not something you need to refer to in the course of this game."
    parser error internal rule response (P): "I didn't understand the way that finished."
    parser error internal rule response (Q): "[if number understood is 0]None[otherwise]Only [number understood in words][end if] of those [regarding the number understood][are] available."
    parser error internal rule response (R): "That noun did not make sense in this context."
    parser error internal rule response (S): "To repeat a command like 'frog, jump', just say 'again', not 'frog, again'."
    parser error internal rule response (T): "You can't begin with a comma."
    parser error internal rule response (U): "You seem to want to talk to someone, but I can't see whom."
    parser error internal rule response (V): "You can't talk to [the noun]."
    parser error internal rule response (W): "To talk to someone, try 'someone, hello' or some such."
    parser error internal rule response (X): "I beg your pardon?"
    parser nothing error internal rule response (A): "Nothing to do!"
    parser nothing error internal rule response (B): "[There] [adapt the verb are from the third person plural] none at all available!"
    parser nothing error internal rule response (C): "[regarding the noun][Those] [seem] to belong to [the noun]."
    parser nothing error internal rule response (D): "[regarding the noun][Those] [can't] contain things."
    parser nothing error internal rule response (E): "[The noun] [aren't] open."
    parser nothing error internal rule response (F): "[The noun] [are] empty."
    darkness name internal rule response (A): "Darkness"
    parser command internal rule response (A): "Sorry, that can't be corrected."
    parser command internal rule response (B): "Think nothing of it."
    parser command internal rule response (C): "'Oops' can only correct a single word."
    parser command internal rule response (D): "You can hardly repeat that."
    parser clarification internal rule response (A): "Who do you mean, "
    parser clarification internal rule response (B): "Which do you mean, "
    parser clarification internal rule response (C): "Sorry, you can only have one item here. Which exactly?"
    parser clarification internal rule response (D): "Whom do you want [if the noun is not the player][the noun] [end if]to [parser command so far]?"
    parser clarification internal rule response (E): "What do you want [if the noun is not the player][the noun] [end if]to [parser command so far]?"
    parser clarification internal rule response (F): "those things"
    parser clarification internal rule response (G): "that"
    parser clarification internal rule response (H): " or "
    yes or no question internal rule response (A): "Please answer yes or no."
    print protagonist internal rule response (A): "[We]"
    print protagonist internal rule response (B): "[ourselves]"
    print protagonist internal rule response (C): "[our] former self"
    standard implicit taking rule response (A): "(first taking [the noun])[command clarification break]"
    standard implicit taking rule response (B): "([the second noun] first taking [the noun])[command clarification break]"
    print obituary headline rule response (A): " You have died "
    print obituary headline rule response (B): " You have won "
    print obituary headline rule response (C): " The End "
    immediately undo rule response (A): "The use of 'undo' is forbidden in this story."
    immediately undo rule response (B): "You can't 'undo' what hasn't been done!"
    immediately undo rule response (C): "Your interpreter does not provide 'undo'. Sorry!"
    immediately undo rule response (D): "'Undo' failed. Sorry!"
    immediately undo rule response (E): "[bracket]Previous turn undone.[close bracket]"
    immediately undo rule response (F): "'Undo' capacity exhausted. Sorry!"
    quit the game rule response (A): "Are you sure you want to quit? "
    save the game rule response (A): "Save failed."
    save the game rule response (B): "Ok."
    restore the game rule response (A): "Restore failed."
    restore the game rule response (B): "Ok."
    restart the game rule response (A): "Are you sure you want to restart? "
    restart the game rule response (B): "Failed."
    verify the story file rule response (A): "The game file has verified as intact."
    verify the story file rule response (B): "The game file did not verify as intact, and may be corrupt."
    switch the story transcript on rule response (A): "Transcripting is already on."
    switch the story transcript on rule response (B): "Start of a transcript of"
    switch the story transcript on rule response (C): "Attempt to begin transcript failed."
    switch the story transcript off rule response (A): "Transcripting is already off."
    switch the story transcript off rule response (B): "[line break]End of transcript."
    switch the story transcript off rule response (C): "Attempt to end transcript failed."
    announce the score rule response (A): "[if the story has ended]In that game you scored[otherwise]You have so far scored[end if] [score] out of a possible [maximum score], in [turn count] turn[s]"
    announce the score rule response (B): ", earning you the rank of "
    announce the score rule response (C): "[There] [are] no score in this story."
    announce the score rule response (D): "[bracket]Your score has just gone up by [number understood in words] point[s].[close bracket]"
    announce the score rule response (E): "[bracket]Your score has just gone down by [number understood in words] point[s].[close bracket]"
    standard report preferring abbreviated room descriptions rule response (A): " is now in its 'superbrief' mode, which always gives short descriptions of locations (even if you haven't been there before)."
    standard report preferring unabbreviated room descriptions rule response (A): " is now in its 'verbose' mode, which always gives long descriptions of locations (even if you've been there before)."
    standard report preferring sometimes abbreviated room descriptions rule response (A): " is now in its 'brief' printing mode, which gives long descriptions of places never before visited and short descriptions otherwise."
    standard report switching score notification on rule response (A): "Score notification on."
    standard report switching score notification off rule response (A): "Score notification off."
    announce the pronoun meanings rule response (A): "At the moment, "
    announce the pronoun meanings rule response (B): "means "
    announce the pronoun meanings rule response (C): "is unset"

*/