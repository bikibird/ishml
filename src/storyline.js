ISHML.Storyline= function Storyline(aYarn)
{
	if (this instanceof ISHML.Storyline)
	{
		//  initialization section
		this._storyline=[]
		this._segue_=aYarn.plot
		return this
	}
	else
	{
		return new Storyline(aYarn)
	}	
}
ISHML.Storyline.prototype.advance= function()
{
	this._storyline.shift()
	return this
}
ISHML.Storyline.prototype.continues= function(){return this._storyline.length>0}
ISHML.Storyline.prototype.current= function()
{
	return {plot:this._storyline[0].plot||this._segue_,twist:this._storyline[0].twist}
}

ISHML.Storyline.prototype.introduce= function(aPlot,aTwist)
{
	//story.storyline.introduce(story.net.player.score)  --adds object to plotline

	this._storyline.push({plot:aPlot, twist:aTwist})
	return this
}
ISHML.Storyline.prototype.segue= function(aPlot)
{
	this._segue_=aPlot
	return this
}