var story = story || new ishml.Yarn()
var $ = story.net
/*selectors*/



/*persons*/


/*places*/

/*things*/

$
    .tie("thing@is").to("cup")
    .tie("thing@is").to("plate")

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
    
    
$.thing.cup.tie("on<under").to($.thing.plate)   
console.log($.green.describes)
console.log($.green.describes.cup)
console.log(things.cup.is.green)
console.log(things.cup.on.plate)
console.log(things.plate.under.cup)

//things.cup.is.green.is.big

//$.select.green.is.cup
//$.cup.is.green