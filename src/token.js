ishml.Token=function Token(lexeme="",definitions=[])
{
	if (this instanceof ishml.Token)
	{
		this.lexeme=lexeme.slice(0)
		this.definitions=definitions.slice(0)
		return this
	}
	else
	{
		return new Token(lexeme,definitions)
	}
}
ishml.Token.prototype.clone=function() 
{
	return new ishml.Token(this.lexeme,this.definitions)
}