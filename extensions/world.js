
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
//ishml.Cord.cordage.place=["place@is:place","container@is:container"]
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
		ishml.net.tie("actor@is:actor").to(this)
		this.configure({person:ishml.lang.person.third,gender:"epicene",proper:true})
		this.singular("they","them","themself")
	}
}
ishml.Knot.Man= class Man extends ishml.Knot.Actor
{
	constructor (id)
	{
		super(id)
		ishml.net.tie("man@is:man").to(this)
		this.configure({gender:"male"})
		this.singular("he","him","himself")
	}
}
ishml.Knot.Woman= class Woman extends ishml.Knot.Actor
{
	constructor (id)
	{
		super(id)
		ishml.net.tie("woman@is:woman").to(this)
		this.configure({gender:"female"})
		this.singular("she","her","herself")
	}
}
ishml.Knot.Neuter= class Neuter extends ishml.Knot.Actor
{
	constructor (id)
	{
		super(id)
		ishml.net.tie("neuter@is:neuter").to(this)
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
		ishml.net.tie("player@is:player").to(this)
		this.configure({person:ishml.lang.person.second, proper:false})
		this.singular("me","self","myself","I")
	}
}

ishml.Knot.Place= class Place extends ishml.Knot
{
	constructor (id)
	{
		super(id)
		ishml.net.tie("place@is:place","container@is:container").to(this)
	}
}

ishml.Knot.Thing= class Thing extends ishml.Knot
{
	constructor (id)
	{
		super(id)
		ishml.net.tie("thing@is:thing","portable@is:portable","touchable@is:touchable").to(this)
	}
}
ishml.reify.createFromKind=(subject,definition)=>
{
	if(subject.fuzzy)
	{
		var id=ishml.util.formatId(subject.match)
		if (ishml.Knot.isPrototypeOf(definition.kind) || ishml.Knot===definition.kind)
		{
			var instance=new definition.kind(id)
			ishml.reify.lexicon.register(subject.match).as({part:"noun",id:id,instance:instance})

			return instance
		}
	}
}
ishml.reify.relate=(a,b,...cordage)=>
{
	return a.tie(...cordage).to(b)
}
ishml.reify.direction=(a,b,forward,back)=>  //exit:north=exit:south
{
	if (a.fuzzy)
	{
		var id=ishml.util.formatId(a.match)
		var fromKnot=new ishml.Knot.place(id)
		ishml.reify.lexicon.register(a.match.toLowerCase()).as({part:"noun",instance:fromKnot})
	}
	else {var fromKnot = a.instance}
	if (b.fuzzy)
	{
		var id=ishml.util.formatId(b.match)
		var toKnot=new ishml.Knot.place(id)
		ishml.reify.lexicon.register(a.match.toLowerCase()).as({part:"noun",instance:toKnot})
	}
	else {var toKnot = b.instance}

	if(back){return fromKnot.tie(`exit:${forward}=exit:${back}`).to(toKnot)}
	else {return fromKnot.tie(`exit:${forward}`).to(toKnot)}
}
ishml.reify.lexicon
	.register("is").as({part:"verb", operation:item=>item})
	.register("are").as({part:"",operation:item=>item})
	.register("it").as({operation:()=>ishml.reify.cache.it})
	.register("here").as({operation:()=>ishml.reify.cache.here})
	.register("he").as({operation:()=>ishml.reify.cache.here})
	.register("she").as({operation:()=>ishml.reify.cache.here})
	.register("they").as({operation:()=>ishml.reify.cache.here})
	.register("knot").as({operation:()=>ishml.Knot})
	.register("place","room").as({part:"operator",operation:()=>ishml.Knot.Place})
	.register("actor").as({part:"operator",operation:()=> ishml.Knot.Actor})
	.register("man").as({part:"operator",operation:()=> ishml.Knot.Man})
	.register("woman").as({part:"operator",operation:()=> ishml.Knot.Woman})
	.register("epicene").as({part:"operator",operation:()=> ishml.Knot.Epicene})
	.register("neuter").as({part:"operator",operation:()=> ishml.Knot.Neuter})
	.register("kind of").as({part:"operator",operation:(definition,c)=>
	{
		if (definition.fuzzy)
		{
			var id=ishml.util.formatId(definition.match)
			if (ishml.Knot.isPrototypeOf(c.kind) || ishml.Knot===c.kind)
			{
				ishml.Knot[id]=class extends c.kind
				{
					constructor(_id)
					{
						super (_id)
						ishml.net.tie(`${ishml.Knot[id].id}@is:${ishml.Knot[id].id}`).to(this)
					}
				}
				ishml.Knot[id].id=id
				ishml.reify.lexicon.register(definition.match.toLowerCase()).as({part:"noun",kind:ishml.Knot[id]})
				return ishml.Knot[id]
			}
		}
	}})
/*converse: Proxy {id: 'south', knot: Place, ply: {…}, hop: 0, cost: 0, …}
cordId: "exit"
cost: 0
from: Place {id: 'garden', name: 'garden', description: 'garden', is: Proxy, exit: Proxy, …}
hop: 0
id: "north"
knot: Place {id: 'house', name: 'house', description: 'house', is: Proxy, exit: Proxy, …}

*/
	.register("is north of").as({part:"verb",subject:ishml.Knot.Place,object:ishml.Knot.Place,operation:(item)=> //garden is north of house -- item===house
	{
		if (item instanceof ishml.Knot)
		{
			if( !(item instanceof ishml.Knot.Place))  //Is knot provisional from fuzzy def?
			{
				var knot=Object.assign(new ishml.Knot.Place(item.id,item.name,item.description),item)
			}
			else {var knot=item}
			knot.tie("exit:north=exit:south").to(new ishml.Knot.Place())
			return knot.exit.north  //garden
			
		}
		if (item instanceof ishml.Ply)
		{

		}
		if (!item)
		{

		}
		if (item.fuzzy)
		{

		}
	}})
	.register("east of").as({part:"relation",forward:"east", back:"west",operation:ishml.reify.direction})
	.register("south of").as({part:"relation",forward:"south", back:"north",operation:ishml.reify.direction})
	.register("west of").as({part:"relation",forward:"west", back:"east",operation:ishml.reify.direction})
	.register(".").as({part:"end"})
	.register(",").as({part:"comma"})


ishml.reify.space=new ishml.Rule().configure({regex:ishml.regex.whitespace,minimum:0,maximum:1,separator:false,greedy:true, keep:false})	

ishml.reify.noun=new ishml.Rule().configure({mode:ishml.Rule.apt})
	.snip(1)
	.snip(2)
ishml.reify.noun[1].filter=(definition)=>definition?.part==="noun"
ishml.reify.noun[2].configure({regex:/^.+?(?=\s+is\s+|\s+are\s+)/})

ishml.reify.relation=new ishml.Rule().configure({minimum:0, greedy:true, filter:(definition)=>definition?.part==="relation"})

ishml.reify.statements=new ishml.Rule().configure({maximum:Infinity})

ishml.reify.statements
	.snip("space1", ishml.reify.space.clone()).snip("statement").snip("end").snip("space2", ishml.reify.space.clone())
ishml.reify.statements.end.configure({lax:true,filter:(definition)=>definition?.part==="end",keep:false})

ishml.reify.statements.statement
	.snip("subject").snip("verb").snip("object") //.snip("adverb") //Lizzy likes charlotte a lot.  
// .snip("subject").snip("adverb").snip("verb").snip("object") //Lizzy barely likes charlotte.
																//house is 500 ft north of garden.

ishml.reify.statements.statement.subject.snip("operations")	
ishml.reify.statements.statement.subject.operations.configure({maximum:Infinity,minimum:1})
	.snip("operation")
ishml.reify.statements.statement.subject.operations.operation.configure({mode:ishml.Rule.apt})	
	.snip(1)
	.snip(2)
ishml.reify.statements.statement.subject.operations.operation[1].configure({longest:true, greedy:true,lax:true,maximum:1,minimum:0, filter:(definition)=>definition.operation}) 
ishml.reify.statements.statement.subject.operations.operation[2].configure({maximum:1,minimum:0, lax:true, regex:/^[^.]+?(?=\s+is\s+|\s+are\s+|\s*[.]\s*)/})
ishml.reify.statements.statement.verb.configure({maximum:1,minimum:1,filter:(definition)=>definition?.part==="verb"})
ishml.reify.statements.statement.object.snip("operations")	
ishml.reify.statements.statement.object.operations.configure({maximum:Infinity,minimum:1})
	.snip("operation")
ishml.reify.statements.statement.object.operations.operation.configure({mode:ishml.Rule.apt})	
	.snip(1)
	.snip(2)
ishml.reify.statements.statement.object.operations.operation[1].configure({longest:true, greedy:true,lax:true,maximum:1,minimum:0, filter:(definition)=>definition.operation}) 
ishml.reify.statements.statement.object.operations.operation[2].configure({maximum:1,minimum:0, lax:true, regex:/^.+?(?=\s+[.]\s+)/})

/*

ishml.reify.statements.statement.configure({regex:/^[^.]+/, lax:true})
	.snip("subject").snip("copula").snip("complement")

ishml.reify.statements.statement.subject
	.snip("relation",ishml.reify.relation.clone()).snip("noun")

ishml.reify.statements.statement.subject.noun=new ishml.Rule().configure({mode:ishml.Rule.apt})
	.snip(1)
	.snip(2)
ishml.reify.statements.statement.subject.noun[1].filter=(definition)=>definition?.part==="noun"
ishml.reify.statements.statement.subject.noun[2].configure({regex:/^.+?(?=\s+is\s+|\s+are\s+)/})



ishml.reify.statements.statement.copula.filter=(definition)=>definition?.part==="copula"	

ishml.reify.statements.statement.complement
	.snip("relation",ishml.reify.relation.clone()).snip("noun")

//ishml.reify.statements.statement.complement.noun=new ishml.Rule()
//ishml.reify.statements.statement.complement.noun.configure({lax:true,filter:(definition)=>definition?.part==="noun"})

ishml.reify.statements.statement.complement.noun.configure({mode:ishml.Rule.apt})
	.snip(1)
	.snip(2)
ishml.reify.statements.statement.complement.noun[1].configure({lax:true,filter:(definition)=>definition?.part==="noun"})
ishml.reify.statements.statement.complement.noun[2].configure({regex:/^.+?(?=\s+[.]\s+)/})


ishml.reify.statements.statement.subject.noun=ishml.reify.noun.clone().configure({lax:true})

ishml.reify.statements.end.configure({lax:true,filter:(definition)=>definition?.part==="end",keep:false})

ishml.reify.statements.statement.semantics=(interpretation)=>
{
		var operation=interpretation.gist.complement.relation?.definition.operation ?? interpretation.gist.copula.definition.operation

	if (interpretation.gist.complement?.relation && interpretation.gist.subject.relation)  //south of garden is east of house
	{
		interpretation.gist.complement.relation.definition.operation  
		(
			interpretation.gist.subject.noun.definition,
			interpretation.gist.complement.noun.definition,
			interpretation.gist.subject.relation.definition.forward,  //garden.exit.south=== house
			interpretation.gist.complement.relation.definition.back   //house.exit.east === garden

		)
	}
	else
	{
		if (interpretation.gist.complement.relation)  //garden is east of house
		{
			interpretation.gist.complement.relation.definition.operation
			(
				interpretation.gist.subject.noun.definition,	
				interpretation.gist.complement.noun.definition,
				interpretation.gist.complement.relation.definition.back,	//garden.exit.west === house
				interpretation.gist.complement.relation.definition.forward  //house.exit.east === garden

			)
		}
		else 
		{
			if(interpretation.gist.subject.relation)
			{
				interpretation.gist.complement.relation.definition.operation // west of garden ishouse
				(
					interpretation.gist.subject.noun.definition,	
					interpretation.gist.complement.noun.definition,
					interpretation.gist.subject.relation.definition.forward,	//garden.exit.west === house
					interpretation.gist.subject.relation.definition.back  //house.exit.east === garden

				)
			}
			else
			{
				interpretation.gist.copula.definition.operation(interpretation.gist.subject.noun.definition,interpretation.gist.complement.noun.definition)
			}
		}	
	}
	
	return interpretation
}
*/
ishml.reify.parser=ishml.Parser({ lexicon: ishml.reify.lexicon, grammar: ishml.reify.statements})



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

The Debris Room is west of the Crawl.  --east/west
crawl.exit.west === debris_room
debris_room.exit.east === crawl

The Hidden Alcove is east of the Debris Room.  
debris_room.exit.east === hidden_alcove
hidden_alcove.exit.west === debris_room

West of the Garden is south of the Meadow.

garden.exit.west === meadow

meadow.exit.south === garden

	
East of the Garden is the Gazebo. Above is the Treehouse. A billiards table is in the Gazebo. On it is a trophy cup. A starting pistol is in the trophy cup.

In the Treehouse is a cardboard box which is a container.

Boolean properties:

The cardboard box is a closed container. The glass bottle is a transparent open container. The box is fixed in place and openable.

open/closed
transparent/not transparent

*/


/*
	adj(adj(adj(knot)))  the red wheelbarrow is a thing =>the(red(is(wheelbarrow,a(thing)))
	adj(adj(adj(knot)))tie(adj(adj(adj(knot))))
	
	the formal garden is east of the gazebo 
	the(formal(is_east_of(garden,the(gazebo))))
	
	the garden is a place. The gazebo is east.
	the (is(garden,(a(place)))) the (is(gazebo,east))

	east of garden is north of gazebo

	The wheelbarrow is a thing.  the wheelbarrow is red.
	the (is (wheelbarrow, a(thing))) the(is(wheelbarrow,red))

	the wheelbarrow is a red thing.
	the (is (wheelbarrow, a(red(thing))))

	instantiate, modify, assign, modify

	the wheelbarrow is a red thing
	the (wheelbarrow(red(a(thing))))
	the red wheelbarrow is a thing
	the(red(wheelbarrow(a(thing))))

	wheelbarrow definition {fuzzy:true, match:wheelbarrow, operation:define}

	east of garden is north of gazebo
	east_of(garden(north_of(gazebo())))

	Everything is an operation!
	statement.snip(operation)
	statement.operation.configure({maximum:infinity,apt})
		.snip(1)
		.snip(2)
	statement.operation[1]=	{longest: true, operation:act on prior returned thing}	
	statement.operation[2]=	{fuzzy:true, match:whatever, operation:instantiate thing}

	garden is north of gazebo

	garden(north_of(gazebo))

	garden({forward,back, knot:gazebo, operation})

statment =
{
	fromKnot : instance | class
	fromKnotName,
	toKnot,
	toKnotName,
	cords:[{tie:"a=b",weight,converseWeight}]
}
_.reify`house is north of garden.`
_.reify`house is north of ${_.pick("store","garden","post office").say().text})`
_.reify`house is north of garden. the desription of house is ${_pick("cozy","inviting","run down")})`
friendly Lizzy likes charlotte a lot.

likes(friendly(Lizzy()),charlotte(), a_lot())

description of house is cozy.

statement => relational statemnet | assignment statement

relational statement=>(adjective)* knot1 verb (adjective)* knot2 adverb
relation statements will do knot creation is knots don't exist
verb creates tie between knots
adverbs set weight of ply 


assignment statement

description of house is cozy.
property knot1 copula (value | class)
desciption of green house is "value"

lizzy does not like charlotte


property is a property of the knot like "description of"=> knot1.description

subject verb object adverb

subject => operation*
object => operation*
verb => verb
adverb ->adverb
complement => (unary_operations)* knot weight?

operation* 

{subject:{operations} object:{operations} verb:{operations}}

garden is north of house.
garden 

*/

