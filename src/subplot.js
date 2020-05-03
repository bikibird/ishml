ishml.Subplot = class  Subplot
{
	constructor(plotpoint)
	{
		this.plot=plotpoint

		return this
	}
	[Symbol.iterator](){return Object.values(this.plot)[Symbol.iterator]()}
	forEach(f)
	{

		Object.values(this.plot).forEach(f)

		return this
	}
	narrate(twist) 
	{
		for (plotpoint of this)
		{
			plotpoint.perform(twist)
			
		}
		return this	
	}
	ponder(twist) 
	{
		var situation=0
		var salientPlotpoints=[]
		for (plotpoint of this.plot)
		{
			var salience =plotpoint.ponder(twist)
			if (salience > 0)
			{
				if (salience>situation)
				{
					salientPlotpoints=[plotpoint]
				}
				else
				{
					salientPlotpoints.push(plotpoint)
				}
				
			}
		}
		return {salience:situation, plotpoints:salientPlotpoints}
	}
	resolve(twist) 
	{
		for (plotpoint of this.plot)
		{
			plotpoint.resolve(twist)
			
		}
		return twist
	}
}