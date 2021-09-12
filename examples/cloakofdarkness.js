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
	.singular("foyer", "opera house foyer", "foyer of the opera house")

$.place.cloakroom.configure({
	name:"Cloakroom",
	description:`The walls of this small room were clearly once lined with hooks, though now only one remains.
		The exit is a door to the east.`
})
	.singular("cloakroom")

$.place.bar.configure({
	name:"Bar",
	description:`The bar, much rougher than you'd have guessed after the opulence of the foyer to the north, is completely empty. There seems to be some sort of message scrawled in the sawdust on the floor.`
}) 
.singular("bar")

/*things*/

$
	.tie("thing").to("cloak","hook")
	.tie("fixture", "@is:brass").to($.thing.hook)  //Not easily searchable by brass
	.tie("wearable","black@is:black","velvet@is:velvet").to($.thing.cloak) //easily searchable by velvet: $.velvet

$.thing.cloak.configure
(
	ishml.thing,
	{
		name:"cloak",
		description:"the blackest black velvet.",
	},
)
.singular("cloak")

$.thing.hook.configure
(
	ishml.thing,
	{
		name:"hook",
		description:"the blackest black velvet.",
	},
)
.singular("hook")

/*Actors*/
$
	.tie("actor").to("player","jane")

$.actor.player
	.configure(ishml.player)
	.singular("me","self","myself","I")

	$.actor.jane
	.configure(ishml.female)
	.singular("jane","she","her")

/*staging*/

$.actor.player
	.tie("in").to($.place.foyer)
	.tie("has_skill").to($.action.dropping,$.action.inventorying,$.action.taking)
	.tie("wears").to($.thing.cloak)

$.actor.jane
	.tie("has_skill").to($.action.dropping,$.action.taking)

$.fixture.hook.tie("in").to($.place.cloakroom)

/* Adjectives */
lexicon
	.register("small").as({part:"adjective",select:subject=>subject.is.small})
	.register("brass").as({part:"adjective",select:subject=>subject.is.brass})
	.register("dark").as({part:"adjective",select:subject=>subject.is.dark})
	.register("velvet").as({part:"adjective",select:subject=>subject.is.velvet})
	.register("black").as({part:"adjective",select:subject=>subject.is.black})

yarn.harken()

