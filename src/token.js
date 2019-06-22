ISHML.Token=function Token(lexeme="",definitions=[])
{
	if (this instanceof ISHML.Token)
	{
		this.lexeme=lexeme
		this.definitions=definitions.slice(0)
		return this
	}
	else
	{
		return new Token(lexeme,definitions)
	}
}