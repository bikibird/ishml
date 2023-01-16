
var $ =ishml.net
var _ =ishml.template._ 
/*Cordage*/
ishml.Cord.cordage.action=["action@"]
ishml.Cord.cordage.actor=["actor@is:actor"]

ishml.Cord.cordage.carries=["carries-carried_by"]
ishml.Cord.cordage.carried_by=["carried_by-carries"]
ishml.Cord.cordage.closed=["openable@is:openable","closed@is:closed"]
ishml.Cord.cordage.commandable=["commandable@is:commandable"]
ishml.Cord.cordage.container=["container@is:container"]
ishml.Cord.cordage.contains=["contains=in"]
ishml.Cord.cordage.in=["in=contains"]

ishml.Cord.cordage.door=["door@is:door"]
ishml.Cord.cordage.down=["exit:down=exit:up"]
ishml.Cord.cordage.east=["exit:east=exit:west"]
ishml.Cord.cordage.edible=["edible@is:edible"]
ishml.Cord.cordage.fixture=["fixture@is:fixture"]
ishml.Cord.cordage.has_skill=["has_skill-skill_of"]
ishml.Cord.cordage.locked=["lockable@is:lockable","locked@is:locked"]

ishml.Cord.cordage.north=["exit:north=exit:south"]
ishml.Cord.cordage.northeast=["exit:northeast=exit:southwest"]
ishml.Cord.cordage.northwest=["exit:northwest=exit:southeast"]
ishml.Cord.cordage.open=["openable@is:openable","open@is:open"]
ishml.Cord.cordage.place=["place@is:place","container@is:container"]

ishml.Cord.cordage.south=["exit:south=exit:north"]
ishml.Cord.cordage.southeast=["exit:southeast=exit:northwest"]
ishml.Cord.cordage.southwest=["exit:southwest=exit:northeast"]
ishml.Cord.cordage.supporter=["supporter@is:supporter"]
ishml.Cord.cordage.on=["on=supports"]

ishml.Cord.cordage.unlocked=["lockable@is:lockable","unlocked@is:unlocked"]
ishml.Cord.cordage.up=["exit:up=exit:down"]
ishml.Cord.cordage.wears=["wears-worn_by"]
ishml.Cord.cordage.west=["exit:west=exit:east"]

ishml.Cord.cordage.closedDoor=[...ishml.Cord.cordage.door, ...ishml.Cord.cordage.closed]
ishml.Cord.cordage.openDoor=[...ishml.Cord.cordage.door, ...ishml.Cord.cordage.open]
ishml.Cord.cordage.lockedDoor=[...ishml.Cord.cordage.closedDoor, ...ishml.Cord.cordage.locked]

ishml.Cord.cordage.thing=["thing@is:thing"]
ishml.Cord.cordage.portable=["portable@is:portable"]
ishml.Cord.cordage.wearable=["wearable@is:wearable"]
ishml.Cord.cordage.reachable=["reachable@is:reachable"]
ishml.Cord.cordage.touchable=["touchable@is:touchable"]
ishml.Cord.cordage.touchable=["edible@is:touchable"]




/*Actions*/
$.tie("action").to("dropping","taking","inventorying","asking")

/*Things*/

ishml.thing={person:ishml.lang.person.third,gender:"neuter"}


/*Actors*/

ishml.epicene={person:ishml.lang.person.third,gender:"epicene",proper:true}
ishml.female={person:ishml.lang.person.third,gender:"female",proper:true}
ishml.male={person:ishml.lang.person.third,gender:"male",proper:true}
ishml.neuter={person:ishml.lang.person.third,gender:"neuter"}
ishml.player={person:ishml.lang.person.second,gender:"epicene"}


/*Knots*/

ishml.Knot.Actor= function(id)
{
	var knot
	ids.forEach(id=>
	{
		knot=(id instanceof ishml.Knot)?id:new ishml.Knot(id)
		ishml.net.tie("actor@is:actor").to(knot)
		knot.configure({person:ishml.lang.person.third,gender:"epicene",proper:true})
		knot.singular("they","them","themself")
	})	
	return knot
}
ishml.Knot.Man= function(...ids)
{
	var knot
	ids.forEach(id=>
	{
		knot=(id instanceof ishml.Knot)?id:new ishml.Knot(id)
		ishml.net.tie("actor@is:actor","man@is:man").to(knot)
		knot.configure({gender:"male"})
		knot.singular("he","him","himself")
	})	
	return knot
}
ishml.Knot.Woman= function(...ids)
{
	var knot
	ids.forEach(id=>
	{
		knot=(id instanceof ishml.Knot)?id:new ishml.Knot(id)
		ishml.net.tie("actor@is:actor","woman@is:woman").to(knot)
		knot.configure({gender:"female"})
		knot.singular("she","her","herself")
	})	
	return knot
}
ishml.Knot.Neuter= function(...ids)
{
	var knot
	ids.forEach(id=>
	{
		knot=(id instanceof ishml.Knot)?id:new ishml.Knot(id)
		ishml.net.tie("actor@is:actor","neuter@is:neuter").to(knot)
		knot.configure({gender:"neuter"})
		knot.singular("it","itself")
	})	
	return knot
}
ishml.Knot.Player=function()
{
	var knot
	
		knot=new ishml.Knot("player")
		knot.name="Player"
		knot.description="You are you."
		knot.tie("has_skill").to($.action.dropping,$.action.inventorying,$.action.taking, $.action.asking)
		ishml.net.tie("actor@is:actor","player@is:player").to(knot)
		knot.configure({person:ishml.lang.person.second, proper:false})
		knot.singular("me","self","myself","I")
	return knot
}

/*ishml.Knot.Place= function(...ids)  //returns last created knot
{
	var knot
	ids.forEach(id=>
	{
		knot=(id instanceof ishml.Knot)?id:new ishml.Knot(id)
		ishml.net.tie("place@is:place","container@is:container").to(knot)
	})
	return knot 
}*/

ishml.Knot.Thing= function(...ids)
{
	var knot
	ids.forEach(id=>
	{
		knot=(id instanceof ishml.Knot)?id:new ishml.Knot(id)
		ishml.net.tie("thing@is:thing").to(knot)
	})	
	return knot
}

ishml.Knot.Clothing= function(...ids)
{
	var knot
	ids.forEach(id=>
	{
		knot=(id instanceof ishml.Knot)?id:new ishml.Knot(id)
		ishml.net.tie("thing@is:thing").to(knot)
	})	
	return knot
}


