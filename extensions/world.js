
var $ =ishml.net
var _ =ishml.template._ 
/*Kinds*/
/*ishml.Knot.Kind=
{
	actor:{person:ishml.lang.person.third,gender:"epicene",proper:true},
	player:Object.assign({person:ishml.lang.person.second},ishml.actor),
	epicene:Ojbect.assign({},ishml.actor),
	female:Object.assign({gender:"female"},ishml.actor),
	male:Object.assign({gender:"male"},ishml.actor),	
	neuter:Object.assign({gender:"neuter"},ishml.actor)
}*/
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
ishml.Cord.cordage.portable=["portable@is:portable"]
ishml.Cord.cordage.reachable=["reachable@is:reachable"]

ishml.Cord.cordage.south=["exit:south=exit:north"]
ishml.Cord.cordage.southeast=["exit:southeast=exit:northwest"]
ishml.Cord.cordage.southwest=["exit:southwest=exit:northeast"]
ishml.Cord.cordage.supporter=["supporter@is:supporter"]
ishml.Cord.cordage.on=["on=supports"]

ishml.Cord.cordage.touchable=["touchable@is:touchable"]
ishml.Cord.cordage.unlocked=["lockable@is:lockable","unlocked@is:unlocked"]
ishml.Cord.cordage.up=["exit:up=exit:down"]
ishml.Cord.cordage.wearable=["wearable@is:wearable"]
ishml.Cord.cordage.wears=["wears-worn_by"]
ishml.Cord.cordage.west=["exit:west=exit:east"]

ishml.Cord.cordage.closedDoor=[...ishml.Cord.cordage.door, ...ishml.Cord.cordage.closed]
ishml.Cord.cordage.openDoor=[...ishml.Cord.cordage.door, ...ishml.Cord.cordage.open]
ishml.Cord.cordage.lockedDoor=[...ishml.Cord.cordage.closedDoor, ...ishml.Cord.cordage.locked]
ishml.Cord.cordage.thing=["thing@is:thing",...ishml.Cord.cordage.portable,...ishml.Cord.cordage.touchable]


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

ishml.Knot.Actor= class Actor extends ishml.Knot
{
	constructor (id)
	{
		super(id)
		ishml.net.tie("actor").to(this)
		this.configure({person:ishml.lang.person.third,gender:"epicene",proper:true})
		this.singular("they","them","themself")
	}
}
ishml.Knot.Man= class Man extends ishml.Knot.Actor
{
	constructor (id)
	{
		super(id)
		ishml.net.tie("man").to(this)
		this.configure({gender:"male"})
		this.singular("he","him","himself")
	}
}
ishml.Knot.Woman= class Woman extends ishml.Knot.Actor
{
	constructor (id)
	{
		super(id)
		ishml.net.tie("woman").to(this)
		this.configure({gender:"female"})
		this.singular("she","her","herself")
	}
}
ishml.Knot.Neuter= class Neuter extends ishml.Knot.Actor
{
	constructor (id)
	{
		super(id)
		ishml.net.tie("neuter").to(this)
		this.configure({gender:"neuter"})
		this.singular("it","itself")
	}
}
ishml.Knot.Player= class Actor extends ishml.Knot.Actor
{
	constructor (id)
	{
		super("player")
		this.name=id
		this.description=id
		this.tie("has_skill").to($.action.dropping,$.action.inventorying,$.action.taking, $.action.asking)
		this.configure({person:ishml.lang.person.second, proper:false})
		this.singular("me","self","myself","I")
	}
}

ishml.Knot.Place= class Place extends ishml.Knot
{
	constructor (id)
	{
		super(id)
		ishml.net.tie("place").to(this)
	}
}
/* 
Notes:

Cords:
		Mutually exclusive:
			containment  - The coin is in the purse
			support - The coin is on the table.
			incorporation  - The coin is part of the sculpture.
			carrying - The coin is carried by Peter.
			wearing - The jacket is worn by Peter.

		possession  - if Mr Darcy has a rapier...  carrying + wearing

		adjacency - The Study is east of the Hallway.
		visibility  - if Darcy can see Elizabeth...
		touchability - if Darcy can touch Elizabeth...
		conceals if Mr Darcy conceals a fob watch ...


cord_id/converse cord id ties cardinality kind to cardinality kind
To love/be loved by ties each person to many people.
To marry/be married to ties each person (called the husband, wife, or spouse) to the other person (called the husband, wife, or spouse) and vice versa.
To exit ties one place (called north, south, east, west ) to many places (called south, north, west, east).

Meeting relates people to each other.

Nationality relates people to each other in groups.  -- This really amounts to a kind and should not be used!

Verbs

to be - equality relation
to have - possession relation
to contain - containment relation
to support - support relation
to carry - carrying relation
to wear - wearing relation
to incorporate - incorporation relation

Conditional relationship:

Contact relates a thing (called X) to a thing (called Y) when X is part of Y or Y is part of X. The verb to be joined to means the contact relation.


Kinds are implemented as @ ties to $ + configuration definition for knot.

A room is a kind. [1]
A thing is a kind. [2]
A direction is a kind. [3]
A door is a kind of thing. [4]
A container is a kind of thing. [5]
A supporter is a kind of thing. [6]
A backdrop is a kind of thing. [7]
The plural of person is people. The plural of person is persons.
A person is a kind of thing. [8]
A region is a kind. [9]

An object has a text called specification.
An object has a text called indefinite appearance text.
An object has a value called variable initial value.
An object has a text called list grouping key.

An object has a text called printed name.
An object has a text called printed plural name.
An object has a text called an indefinite article.
An object can be plural-named or singular-named. An object is usually singular-named.
An object can be proper-named or improper-named. An object is usually improper-named.
An object can be ambiguously plural.

Directions:

	place1 is north of place2  
	north of place2 is place1

	place1 is above place2
	above place2 is place1

	place1, a stadium, is north of  place2
	north of place2 is place1 which is a stadium a stadium

	place1

	ties are bilateral, but subsequent statements may overwrite and non-involved items aren't checked.

	place1 is north of place2
	place2 is south of place3 

	place1 is above place2
	below place2 is nowhere/nothing.

	place1 is north of place2.  above is a bacony.  (implied subject!)

	The heavy iron grating is east of the Orchard and west of the Undertomb. The grating is a door.
	The property property thing is east of place1 and west of place2.  The thing is a door.
	The property property thing which is a door, is east of place1 and west of place2. 
	
East of the Garden is the Gazebo. Above is the Treehouse. A billiards table is in the Gazebo. On it is a trophy cup. A starting pistol is in the trophy cup.

In the Treehouse is a cardboard box which is a container.

Boolean properties:

The cardboard box is a closed container. The glass bottle is a transparent open container. The box is fixed in place and openable.

open/closed
transparent/not transparent

*/