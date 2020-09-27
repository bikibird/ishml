
var trie={}

var rules=
[
	/*v=>v+"ing",
	v=>v+v.charAt(v.length-1)+"ing", //double last
	v=>v.slice(0,-1)+"ing", //silent e
	v=>v.slice(0,-2)+"ying",
	v=>v+"king",
	v=>v+"sing"*/
	p=>p+"s",
		p=>p+"es",
		p=>p.slice(0,-1)+"ies",
		p=>p+"zes",
		p=>p.slice(0,-2)+"ves",
		p=>p.slice(0,-1)+"ves",
		p=>p.slice(0,-2)+"es",
		p=>p+"ren",
		p=>p.slice(0,-2)+"en",
		p=>p+"ses",
]

/*var irregular=nouns.filter(entry=>
	{
		if(entry.plural===ishml.lang.s(entry.singular)){return false}
		else {return true}
	})*/

var done=false
var counter =0
while (!done && counter < 100) 
{
	done=true	
	verbs.forEach(entry=>
	{
		var _trie = trie
		var candidate=false
		//{singular:"box",plural:"boxes",pluralize:"es",singularize:""}
		const populate=(word)=>
		{
			for (let letter of word[0]) 
			{
				if(_trie.hasOwnProperty(letter))
				{
					if(typeof _trie[letter]==="number")
					{
						for (let index = 0; index <rules.length; index++) 
						{
							if(rules[index](word[1])===word[2])
							{
								if(_trie[letter]===index)//trie is correct. Jump to next word. else continue with next letter to add to trie.
								{
									candidate=true
								}
								else //jumped the gun
								{
									_trie[letter]={} 
									done =false //altered trie
								}
								break
							}
							else
							{
								if (index ===rules.length-1){console.log(word)}
							}
						}
						
					}	
				}
				else
				{
					if(candidate){break}
					else
					{
						for (let index = 0; index <rules.length; index++) 
						{
							if(rules[index](word[1])===word[2])
							{
								_trie[letter]=index
								break
							}
						}
						//_trie[letter]=endings[entry.ending]
						done=false  //Altered trie, must reprocess word list
						
						break
					}	
					
				}
				_trie=_trie[letter]
			}
		}	
		populate([("$"+entry[0]).split("").reverse().join(""),entry[0],entry[1]])
		//populate(("$"+entry.plural).split("").reverse().join(""))
	})
	counter++
}	
console.log(counter)

var prune =function(trie)
{
	if (trie.$===undefined)
	{
		var counts={}
		Object.keys(trie).forEach(key=>
		{
			
			if (typeof trie[key]==="number")
			{
				if (!counts.hasOwnProperty(trie[key])){counts[trie[key]]=0}
				counts[trie[key]]++
			}
			
		})
		var winner=0
		Object.keys(counts).forEach(key=>
		{
			if(counts[key]>counts[winner]){winner=Number(key)}	
		})
		if(winner>0)
		{
			trie.$=winner
		}	
		
	}

	Object.keys(trie).forEach(key=>
	{
		if (key!=="$")
		{
			if (typeof trie[key]==="number")
			{
				if (trie.hasOwnProperty("$"))
				{
					if (trie[key]===trie.$ )
					{
						delete trie[key]
					}
				}
				else
				{
					if (trie[key]===0 )
					{
						delete trie[key]
					}
				}	
				
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

//prune(trie)

/*var flatten =function(trie)
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
*/



//comma separated list of strings stored in trie
var data=JSON.stringify(prune(trie)).split('"').join('');

/*var data=JSON.stringify(trie)

((content, fileName, contentType) =>
{
    var a = document.createElement("a")
    var file = new Blob([content], {type: contentType})
    a.href = URL.createObjectURL(file)
    a.download = fileName
    a.click()
})(data,"trie.txt","text/plain")*/


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
