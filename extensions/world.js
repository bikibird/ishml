
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

ishml.Knot.Actor= function(id)
{
	var knot=(id instanceof ishml.Knot)?id:new ishml.Knot(id)
	ishml.net.tie("actor@is:actor").to(knot)
	knot.configure({person:ishml.lang.person.third,gender:"epicene",proper:true})
	knot.singular("they","them","themself")
	return knot
}
ishml.Knot.Man= function(id)
{
	var knot=(id instanceof ishml.Knot)?id:new ishml.Knot(id)
	ishml.net.tie("actor@is:actor","man@is:man").to(knot)
	knot.configure({gender:"male"})
	knot.singular("he","him","himself")
	return knot
}
ishml.Knot.Woman= function(id)
{
	var knot=(id instanceof ishml.Knot)?id:new ishml.Knot(id)
	ishml.net.tie("actor@is:actor","woman@is:woman").to(knot)
	knot.configure({gender:"female"})
	knot.singular("she","her","herself")
	return knot
}
ishml.Knot.Neuter= function(id)
{
	var knot=(id instanceof ishml.Knot)?id:new ishml.Knot(id)
	ishml.net.tie("actor@is:actor","neuter@is:neuter").to(knot)
	knot.configure({gender:"neuter"})
	knot.singular("it","itself")
	return knot
}
ishml.Knot.Player=function(id)
{
	var knot=(id instanceof ishml.Knot)?id:new ishml.Knot(id)
	knot.name=id
	knot.description=id
	knot.tie("has_skill").to($.action.dropping,$.action.inventorying,$.action.taking, $.action.asking)
	ishml.net.tie("actor@is:actor","player@is:player").to(knot)
	knot.configure({person:ishml.lang.person.second, proper:false})
	knot.singular("me","self","myself","I")
	return knot
}

ishml.Knot.Place= function(id)
{
	var knot=(id instanceof ishml.Knot)?id:new ishml.Knot(id)
	ishml.net.tie("place@is:place","container@is:container").to(knot)
	return knot
}

ishml.Knot.Thing= function(id)
{
	var knot=(id instanceof ishml.Knot)?id:new ishml.Knot(id)
	ishml.net.tie("thing@is:thing","portable@is:portable","touchable@is:touchable").to(knot)
	return knot
}

ishml.reify.lexicon
	//gazebo is place  //gazebo is place north of garden  //north_of(is_place(subject),object)
	//always return subject
	.register(".").as({part:"end"})
	.register("is place","are places").as((operations,subjects)=>
	{
		subjects.forEach(subject=>ishml.net.tie("place@is:place","container@is:container").to(subject))
		var operator=operations.next()
		if (operator.done) return subjects
		else return operator.value(subjects)
		
	})
	.register("is north of", "are north of").as((operations,subjects)=> //garden is north of house -- item===house
	{
		var directObjects=operations.next().value(operations)
		subjects.forEach(subject=>ishml.net.tie("place@is:place","container@is:container").to(subject))
		directObjects.forEach(directObject=>ishml.net.tie("place@is:place","container@is:container").to(directObject))
		subjects.forEach(subject=>
		{
			directObjects.forEach(directObject=>
			{
				directObject.tie("exit:north=exit:south").to(subject)	
			})
		})
		var operator=operations.next()
		if (operator.done) return subjects
		else return operator.value(operations,subjects)
	})
	




ishml.reify.space=new ishml.Rule().configure({regex:ishml.regex.whitespace,minimum:0,maximum:1,separator:false,greedy:true, keep:false})	

ishml.reify.noun=new ishml.Rule().configure({mode:ishml.Rule.apt})
	.snip(1)
	.snip(2)
ishml.reify.noun[1].filter=(definition)=>definition?.part==="noun"
ishml.reify.noun[2].configure({regex:/^.+?(?=\s+is\s+|\s+are\s+)/})

ishml.reify.statements=new ishml.Rule().configure({maximum:Infinity})

ishml.reify.statements
	.snip("space1", ishml.reify.space.clone()).snip("statement").snip("end").snip("space2", ishml.reify.space.clone())
ishml.reify.statements.end.configure({lax:true,filter:(definition)=>definition?.part==="end",keep:false})

ishml.reify.statements.statement.snip("operations")	
ishml.reify.statements.statement.operations.configure({maximum:Infinity,minimum:1})
	.snip("operation")
ishml.reify.statements.statement.operations.operation.configure({mode:ishml.Rule.apt})	
	.snip(1)
	.snip(2)
ishml.reify.statements.statement.operations.operation[1].configure({longest:true, greedy:true,lax:true,maximum:1,minimum:0}) 
ishml.reify.statements.statement.operations.operation[2].configure({maximum:1,minimum:0, lax:true, regex:/^[^.]+?(?=\s+is\s+|\s+are\s+|\s*[.]\s*)/})

ishml.reify.statements.statement.operations.operation[2].semantics=(interpretation)=>
{
	var definition=interpretation.gist.definition
	console.log(definition)
	var subjects=[new ishml.Knot(definition.match)]
	interpretation.gist.definition=(operations)=>
	{
		var operator=operations.next()
		if (operator.done) return subjects
		else return operator.value(operations,subjects)
	}	

	ishml.reify.lexicon.register(definition.match).as(interpretation.gist.definition.operation)
	
	return interpretation
}

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


function(statement list, operator, )





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

pretty garden is north of old house.
	is(pretty(garden),northof(old(house)) )

north of old house is pretty garden.
	is(northof(old(house)),pretty(garden)))


south of pretty garden is north of old house.
	is (south of (pretty (garden)), north of(old( house).


east of pretty garden is north of old house.


garden 


jane is actor => assign_actor(jane)

jane carries water  => carries(jane, water)

happy jane is actor => is_actor(happy(jane))

happy jane carries heavy water => carries(happy(jane),heavy(water))  returns jane.carries ply
happy jane awkwardly carries heavy water =>awkwardly carries(happy(jane),heavy(water)) returns jane.carries ply
happy jane carries heavy water awkwardly =>awkwardly carries(happy(jane),heavy(water)) returns jane.carries ply

statement => tie | property
tie => nounPhrase adverb* tie nounPhrase | nounPhrase tie nounPhrase adverb*
nounPhrase=> adjective* noun
noun => ply creates/retrieves knot and converts to ply
adjective =ply  -- takes one ply as parameter
adverb =>ply  takes ply as parameter
verb => ply takes two plies as parameters and

property => propertyName of knot | propertyName of ply is ${_()}.

Assignment: left side provides name/id.  No adjectives.  Articles applied after assignment

if defining a new knot adjectives are on the right side of the copula

the wheelbarrow is a red thing.  --correct right side creates a knot with tie to thing and red and assigns the name/id wheelbarrow to it.
the red wheelbarrow is a thing.  --incorret right side creates a knot with a tie to thing 

(the | some |a) name is adjective* (thing | place | actor | knot)

relation: relates left side to right side

Right side evaluated first.  ply is returned There may be an implicit assignment to a new knot. 

left side evaluated next. verb ties left to right.  ply returned. There may be an implicit assignment to a new knot.


adjective* (noun | new_noun) verb adjective* (noun, new_noun)

east of gazebo is north of garden
tie knot tie knot

east of gazebo is garden
tie knot knot

gazebo is north of garden
knot tie knot

gazebo is north of here
knot tie here

gazebo is north
knot tie here

north is gazebo
north of here is gazebo

jane carries watch

knot tie knot

gazebo is place

knot tie self

In all cases creating left and right knots (may refer to same knot) and tieing them

if there is both a left tie and right tie, apply ties to respective left and right knots to create left and right plies.  Then connect via converse.

Ties always pass in left and right knots, but on left side eval passed (l,r) and right side(r,l)

red wheelbarrow is east of gazebo

is east of(wheelbarrow.is.red.knot)

adjectives return knots, ties return plies.

lexicon.register("is east","is east of"").as({[cordage],valence:2, position:"predicate"})
lexicon.register("east of"").as({[cordage],valence:0, position:"prefix"})
lexicon.register("is east","is east of", "east of"").as({[cordage],valence:2})
lexicon.register("is north","is north of", "north of", "north is").as({[cordage],binary=true})
lexicon.register("red", "is red").as({[cordage], valence:1})
lexicon.register("place", "is place").as({[cordage], valence:1})

statement=> subject predicate
subject => tie* knot | tie[valence=0] 
object => tie* knot | tie[valence=0]


east of gazebo is north of garden
lexicon.register("east of").as({operator,valence:1, position:"subject"})
lexicon.register("is north of").as({operator,valence:1, position:"predicate"})

east of gazebo is garden
lexicon.register("east of").as({opertor,valence:1, position:"subject"})
lexicon.register("is").as({opertor,valence:1, position:"predicate"})

gazebo is north of garden
lexicon.register("is north of").as({operator,valence:2, position:"predicate"})
knot tie knot

gazebo is north of here
knot tie here
lexicon.register("is north of").as({operator,valence:2, position:"predicate"})

gazebo is north
knot tie here
lexicon.register("is north").as({operator,valence:2, position:"predicate"})

north is gazebo
lexicon.register("north is").as({operator,valence:2, position:"predicate"})

north of here is gazebo
lexicon.register("north of").as({operator,valence:1, position:"subject"})
lexicon.register("is").as({operator,valence:2, position:"subject"})

gazebo is place
lexicon.register("is place").as({operator,valence:2, position:"predicate"})


jane carries watch
lexicon.register("carries").as({operator,valence:2, position:"predicate"})

statement=> (subject predicate) | (predicate)
subject=> operator* fuzzy? | fuzzy
predicate=> opertor* fuzzy?

Evaluation begins with the first operation of the predicate. Thereafter, the order of operations are contorol by the operation










*/

