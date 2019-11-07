//queue
ishml.Queue= function Queue({compare=(a,b)=>a.weight<b.weight, mode=1}={})
{
	if (this instanceof ishml.Queue)
	{
		this.mode=mode
		this._queue
		return this
	}	
	else
	{
		return new Queue({compare:compare, mode:mode})
	}	
}
ishml.Queue.protortype.enum={fifo:1,lifo:2,priority:3}
ishml.Queue.prototype.push=function(...items)
{
	switch (this.mode) 
	{
		case 1,2:
			this._queue.push(...items)
			break

		case 3:
			items.forEach(item)
			{
				
				var i = this._queue.push(item)-1
				while (i > 0)
				{
					var parentIndex=Math.floor(i / 2)
					if (this._queue[i] < this._queue[parentIndex])
					{	
						var parent=this._queue[parentIndex]
						this._queue[parentIndex]= this._queue[i]
						this._queue[i]=parent
						i=parentIndex
					}		
				}
				
			}
	}
	
	return this._queue.length
}
ishml.Queue.prototype.pull=function()
{
	switch (this.mode) 
	{
		case 1:  
			return this._queue.shift()
			
		case 2: 
			return this._queue.pop()
			
		case 3:
			var result=this._queue.shift()
			this._queue.unshift( this._queue.pop())
			var i=0
			while (i*2<this._queue.length)
			{
				var leftChildIndex=i*2
				var child=this._queue[leftChildIndex]
				if (this._queue[i]<child)
				{
					this._queue[leftChildIndex]=this._queue[i]
					this._queue[i]=child
					i=leftChildIndex
				}
				else 
				{
					var rightChildIndex=leftChildIndex+1
					var child=this._queue[rightChildIndex]
					if (this._queue[i]<child)
					{
						this._queue[rightChildIndex]=this._queue[i]
						this._queue[i]=child
						i=rightChildIndex
					}
					else {break}

				}

			}
			return result
	}
}
ishml.Queue.prototype.peek=function()
{
	switch (this.mode) 
	{
		case 1,3:
			return this._queue[0]
		case 2:
			return this._queue[_queue.length-1]
	}
}