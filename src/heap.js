class heap {

	constructor (cost=(a)=>a.cost) 
	{
	   this.heap = [null]
	   return this
    }

	get minimum()
	{
        return this.heap[1]
    }
    
	insert (node)
	{

        this.heap.push(node)

        /* Bubble Up */

		if (this.heap.length > 1)
		{
            let current = this.heap.length - 1

            /* Traversing up the parent node until the current node (current) is greater than the parent (current/2)*/
			while (current > 1 && cost(this.heap[Math.floor(current/2)]) > cost(this.heap[current]))
			{

                /* Swapping the two nodes by using the ES6 destructuring syntax*/
                [this.heap[Math.floor(current/2)], this.heap[current]] = [this.heap[current], this.heap[Math.floor(current/2)]]
                current = Math.floor(current/2)
            }
		}
		return this
    }
    
	remove()
	{
        let smallest = this.heap[1]

        /* When there are more than two elements in the array, we put the right most element at the first position
            and start comparing nodes with the child nodes
        */
		if (this.heap.length > 2)
		{
            this.heap[1] = this.heap[this.heap.length-1]
            this.heap.splice(this.heap.length - 1)

			if (this.heap.length === 3)
			{
				if (this.heap[1] > this.heap[2])
				{
                    [this.heap[1], this.heap[2]] = [this.heap[2], this.heap[1]]
                }
                return smallest
            }

            let current = 1
            let leftChildIndex = current * 2
            let rightChildIndex = current * 2 + 1

			while (this.heap[leftChildIndex] && this.heap[rightChildIndex] && (cost(this.heap[current]) < cost(this.heap[leftChildIndex]) || cost(this.heap[current]) < cost(this.heap[rightChildIndex])))
			{
				if (cost(this.heap[leftChildIndex]) < cost(this.heap[rightChildIndex]))
				{
                    [this.heap[current], this.heap[leftChildIndex]] = [this.heap[leftChildIndex], this.heap[current]]
                    current = leftChildIndex
				}
				else
				{
                    [this.heap[current], this.heap[rightChildIndex]] = [this.heap[rightChildIndex], this.heap[current]]
                    current = rightChildIndex
                }

                leftChildIndex = current * 2
                rightChildIndex = current * 2 + 1
            }
        }

        /* If there are only two elements in the array, we directly splice out the first element */

		else if (this.heap.length === 2) 
		{
            this.heap.splice(1, 1)
		} 
		else
		{
            return null
        }

        return smallest
    }
}