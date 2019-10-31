ishml.Phrasebook=function Phrasebook()
{
	if (this instanceof ishml.Phrasebook)
	{
		this.phrase=[]
		return this
	}
	else
	{
		return new Phrasebook()
	}	
}
ISHML.Phrasebook.prototype.choice= function(someStrings,aKey, ...someExpressions)
{
	
	var result=`${someStrings[0]}<span class="ISHML-choice" id="${aKey}" onclick="story.narrate(story._storyline_['${aKey}'])">`

	for (let i = 0; i < someExpressions.length; ++i) 
	{
        result += someStrings[i+1] + someExpressions[i]
    }
    
    result =`${result}${someStrings[someStrings.length-1]}</span>`

    return result
}
ishml.Phraseboook.prototype.phrase= function(phrase)
{
	this.phrase=(phrase)
}	
ishml.Phraseboook.prototype.before= function()
{
}
ishml.Phraseboook.prototype.after= function()
{
}
ishml.Phraseboook.prototype.pluck= function()
{
}
ishml.Phraseboook.prototype.first= function()
{
}
ishml.Phraseboook.prototype.last= function()
{
}
ishml.Phraseboook.prototype.most= function()
{
}
ishml.Phraseboook.prototype.shuffle= function()
{
}

