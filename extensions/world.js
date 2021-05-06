var story =ishml.Yarn
var $ = story.net

var cords=ishml.Cord.cordage
/*cords*/
cords.action=["action@"]
cords.actor=["actor@"]
cords.carries=["carries-carried_by"]
cords.closed=["openable@is:openable","closed@is:closed"]
cords.commandable=["commandable@is:commandable"]
cords.container=["container@is:container"]
cords.contains=["contains=in"]
cords.in=["in=contains"]


cords.door=["door@is:door"]
cords.down=["exit:down=exit:up"]
cords.east=["exit:east=exit:west"]
cords.edible=["edible@is:edible"]
cords.fixture=["fixture@is:fixture"]

cords.locked=["lockable@is:lockable","locked@is:locked"]

cords.north=["exit:north=exit:south"]
cords.northeast=["exit:northeast=exit:southwest"]
cords.northwest=["exit:northwest=exit:southeast"]
cords.open=["openable@is:openable","open@is:open"]
cords.place=["place@is:place","container@is:container"]
cords.portable=["portable@is:portable"]
cords.has_skill=["has_skill-skill_of"]

cords.south=["exit:south=exit:north"]
cords.southeast=["exit:southeast=exit:northwest"]
cords.southwest=["exit:southwest=exit:northeast"]
cords.supporter=["supporter@is:supporter"]
cords.on=["on=supports"]

cords.touchable=["touchable@is:touchable"]
cords.unlocked=["lockable@is:lockable","unlocked@is:unlocked"]
cords.up=["exit:up=exit:down"]
cords.wearable=["wearable@is:wearable"]
cords.wears=["wears-worn_by"]
cords.west=["exit:west=exit:east"]

cords.closedDoor=[...cords.door, ...cords.closed]
cords.openDoor=[...cords.door, ...cords.open]
cords.lockedDoor=[...cords.closedDoor, ...cords.locked]
cords.thing=["thing@is:thing",...cords.portable,...cords.touchable]

var templates={}
templates.pronouns=
{
  epicene:{subjective:"they",objective:"them",reflexive:"themself",possessive:"theirs"},
  female:{subjective:"she",objective:"her",reflexive:"herself",possessive:"hers"},
  male:{subjective:"he",objective:"him",reflexive:"himself",possessive:"his"},
  neuter:{subjective:"it",objective:"it",reflexive:"itself",possessive:"its"}
}

//$.thing.ring  --forward ply
//is.ring back ply
//ring.is.thing --back ply
//thing.ring --converse back ply
/*places*/



/*Foyer of the Opera House is a room.  "You are standing in a spacious hall,
splendidly decorated in red and gold, with glittering chandeliers overhead.
The entrance from the street is to the north, and there are doorways south and west."

Instead of going north in the Foyer, say "You've only just arrived, and besides,
the weather outside seems to be getting worse."


The Cloakroom is west of the Foyer.
"The walls of this small room were clearly once lined with hooks, though now only one remains.
The exit is a door to the east."

In the Cloakroom is a supporter called the small brass hook.
The hook is scenery. Understand "peg" as the hook.

[Inform will automatically understand any words in the object definition
("small", "brass", and "hook", in this case), but we can add extra synonyms
with this sort of Understand command.]

The description of the hook is "It's just a small brass hook,
[if something is on the hook]with [a list of things on the hook]
hanging on it[otherwise]screwed to the wall[end if]."

[This description is general enough that, if we were to add other hangable items
to the game, they would automatically be described correctly as well.]

The Bar is south of the Foyer. The printed name of the bar is "Foyer Bar".
The Bar is dark.  "The bar, much rougher than you'd have guessed
after the opulence of the foyer to the north, is completely empty.
There seems to be some sort of message scrawled in the sawdust on the floor." */

/*system*/


/*places*/

/*actors*/
//$
 //   .tie(...cords.actor).to("player")


/*things*/


/*$
    .tie(...cords.thing,...cords.container,...cords.touchable,...cords.portable)
        .to("cup","box")
    .tie(...cords.thing,...cords.container,...cords.touchable,...cords.portable,"green@is").to("plate")

    .tie("green@is").to($.thing.cup,$.thing.plate)    
  .tie("big@is").to($.thing.cup)*/
//   .tie("small@is:tiny").to($.thing.plate)    
//$.thing.cup  -- ply of cup as cup relates to thing
//$.thing.cup.is.thing -- also  same ply
//.tie("thing@is:")



//$thing.cup.tie("cord:alias").to(otherKnot) --one-way relation
//$thing.cup.tie("cord:alias=otherCord:otherAlias").to(otherKnot) --converse relation
//$thing.cup.tie("cord:alias-otherCord:otherAlias").to(otherKnot) --mutual relation
//$thing.cup.tie("cord:alias@otherCord:otherAlias").to(otherKnot) --reflexive relation


//jane.may.run 
//running allowed jane
//jane.has_skill.running
//running.skill_of.jane
    
/*$.thing.cup.tie("on<under").to($.thing.plate)   
console.log($.green.describes)
console.log($.green.describes.cup)
console.log(things.cup.is.green)
console.log(things.cup.on.plate)
console.log(things.plate.under.cup)*/

//things.cup.is.green.is.big

//$.select.green.is.cup
//$.cup.is.green