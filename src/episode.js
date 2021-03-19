//Episodes are added to the yarn's storyline through introduce.  
//
/*
	configuration={salience,start,stop,etc}
*/
ishml.Episode=function Episode(configuration) 
{
	
	if (this instanceof Episode)
	{
		Object.assign(this,configuration)
		return this
	}
	else
	{
		return new Episode(configuration)
	}	
}
ishml.Episode.prototype.resolve=function resolve()
{
	this._resolution()
	
}
/*
// add code here for narration that occurs before stock narration 
	this.stock()?.episode.narrate()  // comment out for instead of stock narration
	//add code here for behavior that occurs before or instead of stock episode.
	this.stock()?.episode.resolve()  //comment out for instead of stock behavior
	// add code here for behavior that occurs after stock behavior

	// add code here for narration that occurs 
	return this
*/
ishml.Episode.prototype.narrate=function narrate()
{
	this._narration()
	return this
}
ishml.Episode.prototype.narration=function(narration)
{
	if (narration)
	{
		this._narration=narration
		return this
	}
	else {return this._narration}

}
ishml.Episode.prototype.resolution=function(resolution)
{
	if (resolution)
	{
		this._resolution=resolution
		return this
	}
	else {return this._resolution}
}
ishml.Episode.prototype.salience=function(salience)
{
	if (salience)
	{
		this._salience=salience
		return this
	}
	else {return this._salience}
}
ishml.Episode.prototype.start=function(start)
{
	if (start)
	{
		this._start=start
		return this
	}
	else {return this._start}
}
ishml.Episode.prototype.stock=function(stock)
{
	if (stock)
	{
		this._stock=stock
		return this
	}
	else {return this._stock}
}
ishml.Episode.prototype.stop=function(stop)
{
	if (stop)
	{
		this._stop=stop
		return this
	}
	else {return this._stop}
}
ishml.Episode.prototype.viewpoint=function(viewpoint)
{
	if (viewpoint)
	{
		this._viewpoint=viewpoint
		return this
	}
	else {return this._viewpoint}
}
