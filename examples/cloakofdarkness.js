/*places*/			
$
    .tie(...cords.place).to("foyer")
    .tie(...cords.place).to("cloakroom")
    .tie(...cords.place).to("bar")

$.place.foyer
    .tie(...cords.west).to($.place.cloakroom)
    .tie(...cords.south).to($.place.bar)
    .knot.configure({
        name:"Foyer of the Opera House",
        description:`You are standing in a spacious hall, splendidly decorated in red and gold, with glittering chandeliers overhead. The entrance from the street is to the north, and there are doorways south and west.`
    })

$.place.cloakroom.knot.configure({
    name:"Cloakroom",
    description:`The walls of this small room were clearly once lined with hooks, though now only one remains.
        The exit is a door to the east.`
}) 

$.place.bar.knot.configure({
    name:"Bar",
    description:`The bar, much rougher than you'd have guessed after the opulence of the foyer to the north, is completely empty. There seems to be some sort of message scrawled in the sawdust on the floor.`
}) 

/*things*/

$
    .tie(...cords.fixture,"small@is","brass@is").to("hook")
	.tie(...cords.thing,...cords.wearable,"dark@is","black@is","velvet@is").to("cloak")
	

/*Actors*/
$
	.tie(...cords.actor).to("player")

/*staging*/

$.actor.player
	.tie(...cords.in).to($.place.foyer)
	.tie(...cords.wears).to($.thing.cloak)
$.fixture.hook.tie(...cords.in).to($.place.cloakroom)

/*language*/
lexicon
	/*nouns*/
	.register("hook","peg").as({part:"noun", number:ishml.enum.number.singular, select:()=>$.fixture.hook})
	.register("cloak").as({part:"noun", number:ishml.enum.number.singular, select:()=>$.thing.cloak})

	/*adjectives*/
	.register("small").as({part:"adjective",select:()=>$.small})
	.register("brass").as({part:"adjective",select:()=>$.brass})
	.register("dark").as({part:"adjective",select:()=>$.dark})
	.register("velvet").as({part:"adjective",select:()=>$.velvet})

	/*verbs*/
	.register("hang")
		.as({plot:plot.action.hanging, part: "verb", preposition:"on" })   
	.register("hang")
		.as({plot:plot.action.hanging, part: "verb", particle:"up", preposition:"on"})	  	


/*plot*/

