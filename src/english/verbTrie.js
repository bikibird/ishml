
var trie={}
//var verbs=[["combat","combats","combated","combated","combating"],["bat","bats","batted","batted","batting"],]
/*var rules=[v=>v+"ed", v=>v+v.charAt(v.length-1)+"ed", v=>v+"d", v=>v.slice(0,-1)+"ied", v=>v.slice(0,-3)+"ed", v=>v.slice(0,-1)+"d", v=>v+"t",  
v=>v.slice(0,-1)+"t", v=>v.slice(0,-2)+"t", v=>v.slice(0,-3)+"t", v=>v.slice(0,-2)+"ade", v=>v.slice(0,-3)+"ade", v=>v.slice(0,-2)+"am", v=>v.slice(0,-3)+"ame", v=>v.slice(0,-2)+"an", v=>v.slice(0,-3)+"ang", v=>v.slice(0,-3)+"ank", v=>v.slice(0,-2)+"at", v=>v.slice(0,-3)+"ate", v=>v.slice(0,-4)+"aught", v=>v.slice(0,-3)+"ave", v=>v.slice(0,-2)+"aw", v=>v.slice(0,-2)+"ay", v=>v.slice(0,-2)+"did", v=>v.slice(0,-3)+"eld", v=>v.slice(0,-3)+"ell", v=>v.slice(0,-3)+"od", v=>v.slice(0,-2)+"ew", v=>v.slice(0,-1)+"ew", v=>v.slice(0,-3)+"ft", v=>v.slice(0,-1)+"id", v=>v.slice(0,-3)+"it", v=>v.slice(0,-2)+"lt", v=>v.slice(0,-2)+"pt", v=>v+"ked", v=>v+"n", v=>v.slice(0,-3)+"ode", v=>v.slice(0,-3)+"oke", v=>v.slice(0,-3)+"old", v=>v.slice(0,-3)+"ole", v=>v.slice(0,-2)+"on", v=>v.slice(0,-3)+"one", v=>v.slice(0,-3)+"ood", v=>v.slice(0,-3)+"ook", v=>v.slice(0,-3)+"ore", v=>v.slice(0,-3)+"se", v=>v.slice(0,-2)+"ot", v=>v.slice(0,-3)+"ote", v=>v.slice(0,-2)+"ought", v=>v.slice(0,-3)+"ought", v=>v.slice(0,-4)+"ought", v=>v.slice(0,-3)+"ound", v=>v.slice(0,-3)+"ove", v=>v.slice(0,-4)+"ove", v=>v.slice(0,-3)+"ose", v=>v.slice(0,-4)+"oze", v=>v.slice(0,-2)+"ug", v=>v.slice(0,-3)+"ught", v=>v.slice(0,-2)+"un", v=>v.slice(0,-3)+"ung", v=>v.slice(0,-3)+"uck", v=>v.slice(0,-4)+"uck", v=>v.slice(0,-3)+"unk", v=>v.slice(0,-2)+"went", v=>v.slice(0,-1), v=>v, v=>v.slice(0,-2)+"ied"]*/

const rules=
	[
		v=>v+"ed", //0
		v=>v+v.charAt(v.length-1)+"ed", //1
		v=>v+"d",  //2
		
		v=>v+"n", //3
		v=>v.slice(0,-1)+"t", //4
		
		v=>v.slice(0,-3)+"ung", //5
		v=>v.slice(0,-3)+"ed",  //6
		v=>v.slice(0,-1)+"d",  //7
		v=>v.slice(0,-1)+"ten", //8
		v=>v.slice(0,-3)+"old", //10
		v=>v.slice(0,-1)+"den", //9
		v=>v.slice(0,-3)+"eld", //11
		v=>v+"en", //12
		v=>v.slice(0,-2)+"ain",//13
		v=>v.slice(0,-3)+"ame",//14
		v=>v.slice(0,-4)+"aught",//15
		v=>v.slice(0,-2)+"at",//16
		
		v=>v.slice(0,-2)+"de", //18
		v=>v.slice(0,-3)+"ft", //19
		v=>v.slice(0,-2)+"pt", //20
		
		v=>v.slice(0,-1)+"id", //22
		
		v=>v.slice(0,-4)+"it", //23
		
		v=>v.slice(0,-2)+"lt", //24
		
		v=>v+"ne", //25
		v=>v.slice(0,-3)+"odden", //26
		v=>v.slice(0,-3)+"ode", //27

		v=>v.slice(0,-3)+"oken", //28
		
		v=>v.slice(0,-3)+"olen", //29
		
		v=>v.slice(0,-2)+"on", //32
		v=>v.slice(0,-3)+"one", //33
		v=>v.slice(0,-3)+"ood", //34
		v=>v.slice(0,-3)+"orn", //35
		v=>v.slice(0,-3)+"orne", //36
		
		v=>v.slice(0,-2)+"ot", //37
		v=>v.slice(0,-2)+"otten", //38
		v=>v.slice(0,-3)+"ound",  //39
		v=>v.slice(0,-2)+"ought", //40
		v=>v.slice(0,-3)+"ought", //41
		v=>v.slice(0,-4)+"ought", //42
		v=>v.slice(0,-4)+"ove",  //43
		v=>v.slice(0,-4)+"oven", //44
		v=>v.slice(0,-1)+"own",  //45
		v=>v.slice(0,-4)+"ozen", //46
		v=>v.slice(0,-3)+"sen", //47
		v=>v+"t", //48
		
		v=>v.slice(0,-2)+"t", //49
		v=>v.slice(0,-3)+"uck", //50
		v=>v.slice(0,-2)+"ug", //51
		
		v=>v.slice(0,-2)+"um",  //53
		v=>v.slice(0,-2)+"un", //54
		
		v=>v.slice(0,-3)+"unk", //55
		
		v=>v, //56 
		v=>v.slice(0,-1), //57
		v=>v+"ked",	//58
		
		v=>v.slice(0,-2)+"ied", //60,
		v=>v.slice(0,-2)+"cken",//17
		v=>v.slice(0,-1)+"ken", //21
		v=>v+"den", //62
		v=>v.slice(0,-3)+"ught", //52
		v=>v.slice(0,-3)+"ollen", //30
		v=>v.slice(0,-3)+"olten",  //31
		v=>v.slice(0,-1)+"ied", //59
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
									if (letter==="$"){console.log(word[1])}
									_trie[letter]={} 
									done =false //altered trie
								}
								break
							}
							else
							{
								if (index ===rules.length-1)
								{
									console.log(word)
								}
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
		populate([("$"+entry[0]).split("").reverse().join(""),entry[0],entry[3]])
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
		counts[0]=0
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
			if(counts[Number(key)]>counts[winner]){winner=Number(key)}	
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
