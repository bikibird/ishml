//Episodes are added to the yarn's storyline through introduce.  
//
/*
	configuration={salience,start,stop,etc}
*/
ishml.Episode=function Episode(plot) 
{
	
	if (this instanceof Episode)
	{
		Object.defineProperty(this, "_abridged", {value:false,writable: true})
		Object.defineProperty(this, "epilog", {value:false, writable: true})
		Object.defineProperty(this, "prolog", {value:false, writable: true})
		Object.defineProperty(this, "_narration", {value:()=>_``.say().append("#story"),writable: true})
		Object.defineProperty(this, "_resolution", {value:()=>true,writable: true})
		Object.defineProperty(this, "_viewpoint", {value:null,writable: true})
		Object.defineProperty(this, "stock", {value:null,writable: true})

		Object.defineProperty(this, "told", {value:false,writable: true})
		Object.defineProperty(this, "twist", {value:plot?.twist,writable: true})
		return this
	}
	else
	{
		return new Episode(plot)
	}	
}

ishml.Episode.prototype.abridge = function (plotpoint)
{
	if (this.abridged()){return this}
	
	var episodes=plotpoint.unfoldSubplot(this.twist)

 	if (episodes.length===0 )
	{
		this.abridged(false)
		return this
	}
    else 
	{
		episodes[0].stock=this
		return episodes[0].abridged(true).viewpoint(this._viewpoint).salience(this._salience)
	}
}
ishml.Episode.prototype.abridged = function (abridgment)
{
	if (abridgment==undefined){return this._abridged}
	this._abridged=abridgment
	return this

}
ishml.Episode.prototype.after = function (hint=true)
{
	this.epilog=hint
	return this
}
ishml.Episode.prototype.append = function (plotpoint)
{
	if (plotpoint)
	{
		var episodes=plotpoint.unfoldSubplot(this.twist)
		if (episodes.length===0 ){return  this}
		else 
		{	
			episodes[0].stock=this
			return episodes[0].viewpoint(this._viewpoint).salience(this._salience)
		}
	}
	else
	{
		var episode=new ishml.Episode()
		episode.twist=this.twist
		episode.stock=this	
		return episode.viewpoint(this._viewpoint).salience(this._salience)
	}
}
ishml.Episode.prototype.before = function (hint=true)
{
	this.prolog=hint
	return this
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
	if (this.stock?.prolog){this.stock.narrate()}
	this._narration(this)
	if (this.stock?.epilog){this.stock.narrate()}
	return this
}
ishml.Episode.prototype.narration=function(narration)
{
	this._narration=narration
	return this
}
ishml.Episode.prototype.resolution=function(resolution)
{
	this._resolution=resolution
	return this
}
ishml.Episode.prototype.resolve=function resolve(time)
{
	if (this.stock?.prolog){this.stock.resolve()}
	this._resolution(this)
	if (this.stock?.epilog){this.stock.resolve()}
	this.told=this._resolution(this,time)??true
	return this
}

ishml.Episode.prototype.revise = function (plotpoint)
{
	if (this.abridged){return this}
	if (plotpoint)
	{
		var episodes=plotpoint.unfoldSubplot(this.twist)
		if (episodes.length===0){return this}
		else 
		{	episodes[0].stock=this
			return episodes[0].viewpoint(this._viewpoint).salience(this._salience)
		}
	}
	else
	{
		var episode=new ishml.Episode()
		episode.twist=this.twist
		episode.stock=this
		return episode.viewpoint(this._viewpoint).salience(this._salience)
	}	
}

ishml.Episode.prototype.salience=function(...salience)
{
	if(salience.length===0){return this._salience}
	{
		this._salience=salience[0]
		return this
	}
}
ishml.Episode.prototype.start=function(...start)
{
	if(start.length===0){return this._start}
	{
		this._start=start[0]
		return this
	}
}

ishml.Episode.prototype.stop=function(...stop)
{
	if(stop.length===0){return this._stop}
	{
		this._stop=stop[0]
		return this
	}
}
ishml.Episode.prototype.viewpoint=function(...viewpoint)
{
	if(viewpoint.length===0){return this._viewpoint}
	{
		this._viewpoint=viewpoint[0]
		return this
	}
}
