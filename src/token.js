ISHML.Token=function Token(lexeme="",definitions=[])
{
	if (this instanceof ISHML.Token)
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
ISHML.Token.prototype.clone=function() 
{
	return new ISHML.Token(this.lexeme,this.definitions)
}