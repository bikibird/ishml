
var trie={}
//var words=[{word:"honest",sound:"V"},{word:"honey",sound:"C"},{word:"honor",sound:"V"},{word:"hot",sound:"C"},{word:"honestly",sound:"V"},{word:"hotel",sound:"C"}] 
//var words=[{word:"honey",sound:"C"},{word:"honor",sound:"V"}] 
//var words=[{word:"honest",sound:"V"},{word:"honestok",sound:"C"}] 

words=
[
	{singular:"box",plural:"boxes",pluralize:"es",singularize:""},
	{singular:"ox",plural:"oxen",pluralize:"en",singularize:""},
	{singular:"mouse",plural:"mice",pluralize:"ice",singularize:"ouse"},
	{singular:"ice",plural:"ices",pluralize:"s",singularize:""}
]
var endings ={"/s":0,"f/ves":1,"us/i":2,"is/es":3,"/":4,"/es":5,"y/ies":6,"o/i":7,"um/a":8,"/en":9,"/x":10,"an/en":11,"s/des":12,"/e":13,"x/ces":14,"on/a":15,"/ta":16,"fe/ves":17,"e/ae":18,"en/ina":19,"a/oth":20,"/ses":21,"rson/ople":22,"ouse/ice":23,"ex/ices":24,"x/ges":25,"e/i":26,"s/i":27,"ooth/eeth":28,"/i":29,"us/era":30,"/ren":31,"oot/eet":32,"ff/ves":33,"a/e":34,"/zes":35,"a/i":36,"oose/eese":37,"e/ia":38,"ey/ies":39,"/nes":40,"/a":41,"us/ora":42,"y/ries":43,"/n":44,"es/ites":45,"s/tia":46,"o/":47,"/im":48,"ah/oth":49,"a/ot":50,"ah/ot":51,"e/ai":52,"/r":53,"us/odes":54,"/er":55,"adame/esdames":56,"anservant/enservants":57,"o/ines":58,"rs/mes":59,"myself/ourselves":60,"q/t":61,"by/sby":62,"ful/sful":63,"n/":64,"x/kes":65,"s/ta":66,"o/a":67,"/y":68,"s/res":69,"u/i":70}

var irregular=nouns.filter(entry=>
	{
		if(entry.plural===ishml.lang.s(entry.singular)){return false}
		else {return true}
	})	
/*var done=false
var counter =0
while (!done && counter < 100) 
{
	done=true	
	nouns.forEach(entry=>
	{
		var _trie = trie
		var candidate=false
		//{singular:"box",plural:"boxes",pluralize:"es",singularize:""}
		const populate=(word)=>
		{
			for (let letter of word) 
			{
				if(_trie.hasOwnProperty(letter))
				{
					if(typeof _trie[letter]==="number")
					{
						if(_trie[letter]===endings[entry.ending])//trie is correct. Jump to next word. else continue with next letter to add to trie.
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
						_trie[letter]=endings[entry.ending]
						done=false  //Altered trie, must reprocess word list
						break
					}	

				}
				_trie=_trie[letter]
			}
		}	
		populate(("$"+entry.singular).split("").reverse().join(""))
		populate(("$"+entry.plural).split("").reverse().join(""))
	})
	counter++
}	
console.log(counter)

var prune =function(trie,top)
{
	if (trie.$===undefined)
	{
		var counts={}
		Object.keys(trie).forEach(key=>
		{
			if (key!=="$") //skip objects and $
			{
				if (typeof trie[key]==="number")
				{
					if (!counts.hasOwnProperty(trie[key])){counts[trie[key]]=0}
					counts[trie[key]]++
				}
				
			}
		})
		var winner=0
		Object.keys(counts).forEach(key=>
		{
			if(counts[key]>counts[winner]){winner=key}	
		})
		if (top!==winner){trie.$=winner}
		
	}

	Object.keys(trie).forEach(key=>
	{
		if (key!=="$")
		{
			if (typeof trie[key]==="number")
			{
				if (trie[key]===trie.$)
				{
					delete trie[key]
				}
			}	
			else
			{
				if (typeof trie[key]==="object")
				{
					prune(trie[key],trie.$)
					
				}

			}
		}
	})
	if(top===trie.$){delete trie.$}
	return trie

}
*/
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
//var data=JSON.stringify(prune(trie)).split('"').join('');

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
