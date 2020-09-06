var trie={}
//var words=[{word:"honest",sound:"V"},{word:"honey",sound:"C"},{word:"honor",sound:"V"},{word:"hot",sound:"C"},{word:"honestly",sound:"V"},{word:"hotel",sound:"C"}] 
//var words=[{word:"honey",sound:"C"},{word:"honor",sound:"V"}] 
//var words=[{word:"honest",sound:"V"},{word:"honestok",sound:"C"}] 

var done=false
var counter =0
while (!done && counter < 100) 
{
	done=true	
	words.forEach(entry=>
	{
		var _trie = trie
		var candidate=false
		for (let letter of entry.word+"$") // honey,honor,hotel
		{
			if(_trie.hasOwnProperty(letter))
			{
				if( typeof _trie[letter]==="number")
				{
					if(_trie[letter]===entry.sound)//trie is correct. Jump to next word. else continue with next letter to add to trie.
					{
						candidate=true
						
					}
					else //jumped the gun
					{
						_trie[letter]={} 
						done =false //altered trie
					} 

					
				}	
				
			}
			else
			{
				if(candidate){break}
				else
				{
					_trie[letter]=entry.sound
					done=false  //Altered trie, must reprocess word list
					break
				}	

			}
			_trie=_trie[letter]
		}
	})
	counter++
}	
console.log(counter)

var prune =function(trie)
{
	var $ =trie.$ 
	if ($===undefined)
	{
		var one=0
		var zero=0
		Object.keys(trie).forEach(key=>
		{
			if (key!=="$") //skip objects and $
			{
				if (trie[key]===0){zero++}
				if (trie[key]===1){one++}
			}
		})
		if (zero > one){trie.$=0}else{trie.$=1}
	}
	Object.keys(trie).forEach(key=>
	{
		if (key!=="$")
		{
			if (trie[key]===trie.$)
			{
				delete trie[key]
			}
			else
			{
				if (typeof trie[key]==="object")
				{
					prune(trie[key])
				}

			}
		}
	})
	return trie

}
var flatten =function(trie)
{
	var list=[]
	Object.keys(trie).forEach(value=>
	{
		var chars=""
		if (typeof trie[key]==="object")
		{
			var result=flatten(trie[key])
			chars=chars+trie[key]+result
		}
		else{chars=chars+trie[key]}
	})	

}	

//comma separated list of strings stored in trie
//var data=JSON.stringify(prune(trie)).split('"').join('');



((content, fileName, contentType) =>
{
    var a = document.createElement("a")
    var file = new Blob([content], {type: contentType})
    a.href = URL.createObjectURL(file)
    a.download = fileName
    a.click()
})(data,"trie.txt","text/plain")


/*var data=JSON.stringify(words.filter(entry=>
{
	return !(entry.word.endsWith("(1)") ||entry.word.endsWith("(2)") ||entry.word.endsWith("(3)"))
}).sort((a,b)=>a.word.localeCompare(b.word)).map(entry=>
	{
		entry.word=entry.word.replace(/[^\w]/gi, '').split("_").join("")
		return entry
	}));
var data=JSON.stringify(words.filter((entry,index,words)=>
{
	if(entry.word.length===1){return false}
	if (index===0){return true}
	else
	{
		if (entry.word===words[index-1].word){return false}
		return true
	}
}));
*/
