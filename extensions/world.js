var story = story || new ishml.Yarn()
var $ = story.net
var cordage=story.cordage
/*cordage*/
cordage.actor=["actor@"]
cordage.thing=["thing@is:thing"]
cordage.fixture=["fixture@is:fixture"]
cordage.container=["container@is:container"]
cordage.supporter=["supporter@is:supporter"]
cordage.open=["openable@is:openable","open@is:open"]
cordage.closed=["openable@is:openable","closed@is:closed"]
cordage.locked=["lockable@is:lockable","locked@is:locked"]
cordage.unlocked=["lockable@is:lockable","lockable@is:lockable","unlocked@is:unlocked"]

/*system*/
$.tie("system").to("clock")

/*actors*/
$
    .tie("actor@").to("player","jane")



/*places*/

/*things*/

$
    .tie(...cordage.thing,...cordage.container).to("cup","box")
    .tie("thing@is:thing").to("plate")

    .tie("green@is").to($.thing.cup,$.thing.plate)    
  .tie("big@is").to($.thing.cup)
   .tie("small@is:tiny").to($.thing.plate)    
//$.thing.cup  -- ply of cup as cup relates to thing
//$.thing.cup.is.thing -- also  same ply
//.tie("thing@is:")



//$thing.cup.tie("cord:alias").to(otherKnot) --one-way relation
//$thing.cup.tie("cord:alias=otherCord:otherAlias").to(otherKnot) --converse relation
//$thing.cup.tie("cord:alias-otherCord:otherAlias").to(otherKnot) --mutual relation
//$thing.cup.tie("cord:alias@otherCord:otherAlias").to(otherKnot) --reflexive relation
    
    
/*$.thing.cup.tie("on<under").to($.thing.plate)   
console.log($.green.describes)
console.log($.green.describes.cup)
console.log(things.cup.is.green)
console.log(things.cup.on.plate)
console.log(things.plate.under.cup)*/

//things.cup.is.green.is.big

//$.select.green.is.cup
//$.cup.is.green