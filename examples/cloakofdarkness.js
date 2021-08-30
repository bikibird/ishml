/*places*/	
$
	.tie("place").to("foyer")
	.tie("place").to("cloakroom")
	.tie("place").to("bar")

$.place.foyer
	.tie("west").to($.place.cloakroom)
	.tie("south").to($.place.bar)
	.configure({
		name:"Foyer of the Opera House",
		description:`You are standing in a spacious hall, splendidly decorated in red and gold, with glittering chandeliers overhead. The entrance from the street is to the north, and there are doorways south and west.`,
		
	})
	.singular("foyer", "foyer of the Opera House")
//lexicon.register("foyer").as({part:"noun", number:ishml.enum.number.singular, select:()=>$.place.foyer})

$.place.cloakroom.configure({
	name:"Cloakroom",
	description:`The walls of this small room were clearly once lined with hooks, though now only one remains.
		The exit is a door to the east.`
})
	.singular("cloakroom")
//lexicon.register("cloakroom").as({part:"noun", number:ishml.enum.number.singular, select:()=>$.place.cloakroom})

$.place.bar.configure({
	name:"Bar",
	description:`The bar, much rougher than you'd have guessed after the opulence of the foyer to the north, is completely empty. There seems to be some sort of message scrawled in the sawdust on the floor.`
}) 
//lexicon.register("bar").as({part:"noun", number:ishml.enum.number.singular, select:()=>$.place.bar})
.singular("bar")

/*things*/

$
	.tie("thing").to("hook","cloak","cup")
	.tie("fixture", "@is:brass").to($.thing.hook)  //Not easily searchable by brass
	.tie("wearable","black@is:black","velvet@is:velvet").to($.thing.cloak) //easily searchable by velvet: $.velvet


$.thing.cloak.configure({
	name:"cloak",
	description:"the blackest black velvet.",
	gender:"neuter"
})
.singular("cloak")


//.adjectives("black","velvet")

//DEFECT: adjectives are really the tie is.
//lexicon.register("cloak").as({part:"noun", number:ishml.enum.number.singular, select:()=>$.thing.cloak})




/*Actors*/
$
	.tie("actor").to("player","jane")

$.actor.player
	.configure({
		name:"player",
		role:"player",
		gender:"female"
	})
	lexicon.register("player").as({part:"noun", number:ishml.enum.number.singular, select:$.actor.player.cord, role:"player"})


	


/*Actions*/
$
	.tie("action").to("dropping","taking","inventorying")
	

/*staging*/

$.actor.player
	.tie("in").to($.place.foyer)
	.tie("has_skill").to($.action.dropping,$.action.inventorying,$.action.taking)
	.tie("wears").to($.thing.cloak)
//	.tie("wears").to($.thing.left_shoe)
//	.tie("wears").to($.thing.right_shoe)


$.actor.jane
	.tie("has skill").to($.action.dropping)

/*$.fixture.hook.tie("in").to($.place.cloakroom)
$.thing.saucer.tie("on").to($.thing.table)
$.thing.cup.tie("on").to($.thing.saucer)
*/
/* Adjectives */
lexicon
	.register("small").as({part:"adjective",select:subject=>subject.is.small})
	.register("brass").as({part:"adjective",select:subject=>subject.is.brass})
	.register("dark").as({part:"adjective",select:subject=>subject.is.dark})
	.register("velvet").as({part:"adjective",select:subject=>subject.is.velvet})
	.register("black").as({part:"adjective",select:subject=>subject.is.black})
	.register("left").as({part:"adjective",select:subject=>subject.is.left})
	.register("right").as({part:"adjective",select:subject=>subject.is.right})

	/*scenes-- like inform 7*/
	//tbd

/*language*/
/*lexicon
	.register("hook","peg").as({part:"noun", number:ishml.enum.number.singular, select:()=>$.fixture.hook})
	.register("cloak").as({part:"noun", number:ishml.enum.number.singular, select:()=>$.thing.cloak})
	.register("shoe").as({part:"noun", number:ishml.enum.number.singular, select:()=>$.thing.left_shoe.cord.add($.thing.right_shoe)})
	.register("shoes").as({part:"noun", number:ishml.enum.number.plural, select:()=>$.thing.left_shoe.cord.add($.thing.right_shoe)})
	.register("jane").as({part:"noun", number:ishml.enum.number.singular, select:()=>$.actor.jane})


	.register("small").as({part:"adjective",select:()=>$.small})
	.register("brass").as({part:"adjective",select:()=>$.brass})
	.register("dark").as({part:"adjective",select:()=>$.dark})
	.register("velvet").as({part:"adjective",select:()=>$.velvet})
	.register("black").as({part:"adjective",select:()=>$.black})
	.register("left").as({part:"adjective",select:()=>$.left})
	.register("right").as({part:"adjective",select:()=>$.right})

	.register("hang")
		.as({plot:plot.action.hanging, part: "verb", preposition:"on" })   
	.register("hang")
		.as({plot:plot.action.hanging, part: "verb", particle:"up", preposition:"on"})	  	
*/

story.harken()

