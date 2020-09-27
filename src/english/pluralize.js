/*nouns.forEach((noun,count)=>
{ 
	noun.singular=noun.singular.toString()
	noun.plural=noun.plural.toString()
	var singular=[...noun.singular]
	var plural=[...noun.plural]
	var index=0
	var length=(singular.length<plural.length)?singular.length:plural.length
	while(index<length)
	{
		if(singular[index] !== plural[index]){break}
		else {index++}
	}

//ovum => ova, oven =>ovens  
	noun.toPlural={slice:index-singular.length ,add:plural.join("").slice(index) }
	noun.toSingular={slice:index-plural.length ,add:singular.join("").slice(index) }
})*/

//{"singular":"mouse","plural":"mice","toPlural":{"slice":-4,"add":"ice"},"toSingular":{"slice":-3,"add":"ouse"}}
/*nouns.forEach((noun,count)=>
{ 
	noun.singular=noun.singular.toString()
	noun.plural=noun.plural.toString()
	noun.pluralize=noun.toPlural.add
	noun.singularize=noun.toSingular.add
	delete noun.toPlural
	delete noun.toSingular

})*/
/*nouns =nouns.filter(entry=>
{
	return entry.singular.match(/^[A-Za-z0-9]+$/) && entry.plural.match(/^[A-Za-z0-9]+$/)
})*/
/*nouns.forEach(entry=>
{
	entry.ending=`${entry.singularize}/${entry.pluralize}`
	delete entry.singularize
	delete entry.pluralize
})*/

var uniqueEndings={}
var endingsIndex={}
nouns.forEach(entry=>
{
	if (uniqueEndings.hasOwnProperty(entry.ending))
	{
		uniqueEndings[entry.ending]++
	}
	else
	{
		uniqueEndings[entry.ending]=1
	}
	
})
var frequency=Object.entries(uniqueEndings).map(([key,value])=>
{
	var revised={}
	revised.ending=key
	revised.count=value
	return revised
}).sort((a,b)=>b.count-a.count)
Object.keys(uniqueEndings).forEach((ending,index)=>
{
	endingsIndex[ending]=index
})

data=JSON.stringify(endingsIndex);

((content, fileName, contentType) =>
{
    var a = document.createElement("a")
    var file = new Blob([content], {type: contentType})
    a.href = URL.createObjectURL(file)
    a.download = fileName
    a.click()
})(data,"trie.txt","text/plain")