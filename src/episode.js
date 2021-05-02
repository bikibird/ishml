//Episodes are added to the yarn's storyline through introduce.  
//
/*
	configuration={salience,start,stop,etc}
*/
ishml.Episode=function Episode(plot) 
{
	
	if (this instanceof Episode)
	{
		Object.defineProperty(this, "abridged", {value:false,writable: true})
		Object.defineProperty(this, "epilog", {value:false, writable: true})
		Object.defineProperty(this, "prolog", {value:false, writable: true})
		Object.defineProperty(this, "retracted", {value:false, writable: true})
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
/* The abridge method returns the most salient episode generated from the subplot of the plotpoint.  The abridged property is set to true, which causes all future revise method calls on the evaluation chain to be ignored.  append method calls are NOT ignored.*/
ishml.Episode.prototype.abridge = function (createEpisode)
{
	if (this.abridged){return this}
	
	var episode=createEpisode()

 	if (!episode || episode.retracted)
	{
		this.abridged=false
		return this
	}
    else 
	{
		var rootEpisode=episode
		while (rootEpisode.stock){rootEpisode=rootEpisode.stock}
		rootEpisode.stock=this
		episode.abridged=true
		return episode.viewpoint(this._viewpoint).salience(this._salience)
	}
}
/* The append method returns generates the most salient episode generated from the subplot of the plotpoint or a new,empty, episode if no plotpoint.  The stock.prolog property is set to true, which causes narrate method to execute on the stock episode prior to executing the narration on the appended episode.  The stock.prolog property is set to true, which causes resolve method to execute on the stock episode prior to executing the resolution on the appended episode. */
ishml.Episode.prototype.append = function (createEpisode)
{
	if (createEpisode)
	{
		var episode=createEpisode()
		if (!episode || episode.retracted){return  this}
		else 
		{	
			episodes[0].stock=this
			episodes[0].stock.prolog=true
			return episodes[0].viewpoint(this._viewpoint).salience(this._salience)
		}
	}
	else
	{
		var episode=new ishml.Episode()
		episode.twist=this.twist
		var rootEpisode=episode
		while (rootEpisode.stock){rootEpisode=rootEpisode.stock}
		rootEpisode.stock=this
		rootEpisode.stock.prolog=true
		return episode.viewpoint(this._viewpoint).salience(this._salience)
	}
}

ishml.Episode.prototype.before = function (createEpisode)
{
	if (createEpisode)
	{
		var episode=createEpisode()
		if (!episode || episode.retracted)
		{
			this.retracted=true
			this.abridged=false
			return this
		}
		else 
		{	
			var rootEpisode=episode
			while (rootEpisode.stock){rootEpisode=rootEpisode.stock}
			rootEpisode.stock=this
			rootEpisode.stock.prolog=true
			return episode.viewpoint(this._viewpoint).salience(this._salience)
		}
	}
	this.retracted=true
	return this
}
ishml.Episode.prototype.after = function (createEpisode)
{
	if (createEpisode)
	{
		var episode=createEpisode()
		if (!episode || episode.retracted)
		{
			this.retracted=true
			this.abridged=false
			return
		}
		else 
		{	
			var rootEpisode=episode
			while (rootEpisode.stock){rootEpisode=rootEpisode.stock}
			rootEpisode.stock=this
			rootEpisode.stock.epilog=true
			return episode.viewpoint(this._viewpoint).salience(this._salience)
		}
	}
	this.retracted=true
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
	if (!this.retracted)
	{
		if (this.stock?.prolog){this.stock.narrate()}
		this._narration(this)
		if (this.stock?.epilog){this.stock.narrate()}
	}	
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
	if (!this.retracted)
	{
		if (this.stock?.prolog){this.stock.resolve(time)}
		this.told=this._resolution(this,time)??true
		if (this.stock?.epilog){this.stock.resolve(time)}
		return this
	}
	return this
}
/* The revise method returns the most salient episode generated from the subplot of the plotpoint or returns this if the current episode in the evaluation chain is an abridged episode or no episode is generated from the subplot.*/
ishml.Episode.prototype.revise = function (createEpisode)
{
	if (this.abridged){return this}
	if (createEpisode)
	{
		var episode=createEpisode()
		if (!episode || episode.retracted)
		{
			return this
		}
		else 
		{	episode.stock=this
			return episode.viewpoint(this._viewpoint).salience(this._salience)
		}
	}
	else { return this}
}

ishml.Episode.prototype.salience=function(salience)
{
	if(salience===undefined){return this._salience}
	{
		this._salience=salience
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
ishml.Episode.prototype.viewpoint=function(viewpoint)
{
	if(viewpoint===undefined){return this._viewpoint}
	{
		this._viewpoint=viewpoint
		return this
	}
}
