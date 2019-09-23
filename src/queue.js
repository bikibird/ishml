ISHML.Queue= function Queue({compare=(a,b)=>a.weight<b.weight, mode=1}={})
{
	if (this instanceof ISHML.Queue)
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
ISHML.Queue.protortype.enum={fifo:1,lifo:2,priority:3}
ISHML.Queue.prototype.push=function(...items)
{
	switch (this.mode) 
	{
		case 1,2:
			this._queue.push(...items)
			break

		case 3:
			function siftUp(index)
			{
				if(index===0){return}
				else
				{
					var parentIndex=Math.floor(index/2)
					if (compare(this._queue[index],this._queue[parentIndex]))
					{
						var parent=this._queue[parentIndex] 
						this._queue[parentIndex]=this._queue[index]
						siftUp(parentIndex)
					}
					return
				}
			}
			items.forEach(item)
			{
				this._queue.push(item)
				siftUp(this._queue.length-1)
			}
			
			
	}
	
	return this._queue.length
}
ISHML.Queue.prototype.pull=function()
{
	switch (this.mode) 
	{
		case 1:  
			return this._queue.shift()
			
		case 2: 
			return this._queue.pop()
			
		case 3:
			function siftUp(index)
			{
				if(index===0){return}
				else
				{
					var parentIndex=Math.floor(index/2)
					if (compare(this._queue[index],this._queue[parentIndex]))
					{
						var parent=this._queue[parentIndex] 
						this._queue[parentIndex]=this._queue[index]
						siftUp(parentIndex)
					}
					return
				}
			}
			/*	guard !isEmpty // 1
				else { return nil }
			  swapElement(at: 0, with: count - 1) // 2
			  let element = elements.removeLast() // 3
			  if !isEmpty { // 4
				siftDown(elementAtIndex: 0) // 5
			  }
			  return element // 6
			 */ 
	}
}
ISHML.Queue.prototype.peek=function()
{
	switch (this.mode) 
	{
		case 1,3:
			return this._queue[0]
		case 2:
			return this._queue[_queue.length-1]
	}
}
mutating func swapElement(at firstIndex: Int, with secondIndex: Int) {
	guard firstIndex != secondIndex
	  else { return }
	swap(&elements[firstIndex], &elements[secondIndex])
  }
  

  func highestPriorityIndex(of parentIndex: Int, and childIndex: Int) -> Int {
	guard childIndex < count && isHigherPriority(at: childIndex, than: parentIndex)
	  else { return parentIndex }
	return childIndex
  }
	  
  func highestPriorityIndex(for parent: Int) -> Int {
	return highestPriorityIndex(of: highestPriorityIndex(of: parent, and: leftChildIndex(of: parent)), and: rightChildIndex(of: parent))
  }

  func isHigherPriority(at firstIndex: Int, than secondIndex: Int) -> Bool {
	return priorityFunction(elements[firstIndex], elements[secondIndex])
  }

  func isRoot(_ index: Int) -> Bool {
	return (index == 0)
  }
  
  func leftChildIndex(of index: Int) -> Int {
	return (2 * index) + 1
  }
  
  func rightChildIndex(of index: Int) -> Int {
	return (2 * index) + 2
  }
  
  func parentIndex(of index: Int) -> Int {
	return (index - 1) / 2
  }