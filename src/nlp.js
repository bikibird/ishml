ISHML.NLP=function NLP({lexicon=new ISHML.Lexicon(),grammar=new ISHML.Grammar()}={}) 
{
	if (this instanceof ISHML.Rule)
	{
        this.lexicon=lexicon
        this.grammar=grammar
		return this
	}
	else
	{
		return new NLP(key)
	}
}