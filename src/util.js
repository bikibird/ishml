ISHML.util={_seed:undefined}

ISHML.util.enumerator=function* (aStart =1)
{
  let i = aStart;
  while (true) yield i++
}

ISHML.util.formatId=function(id)
{
	if(id)
	{ 
		if (typeof(id)==="string"){return id.replace(/\s+/g, '_')}
		else{return id.id.replace(/\s+/g, '_')}
	}	
	else 
	{
		return "auto" + ISHML.util.autoid.next().value.toString()
	}
}
ISHML.util.autoid=ISHML.util.enumerator()
ISHML.util.random = function() 
{
	this._seed = this._seed * 16807 % 2147483647
	return (this._seed-1)/2147483646
}
ISHML.util.reseed = function(aSeed=Math.floor(Math.random() * 2147483648)) 
{
	var seed=aSeed % 2147483647
	if (seed <= 0){seed += 2147483646}
	this._seed=seed	
}
ISHML.util.shuffle=function(anArray,aCount=undefined)
{
	var array=anArray.slice(0)
	var m = array.length
	var count=aCount||array.length
	for (let i=0; i < count; i++)
	{
		let randomIndex = Math.floor(this.random() * m--)
		let item = array[m]
		array[m] = array[randomIndex]
		array[randomIndex] = item
	}
	return array.slice(-count)
}