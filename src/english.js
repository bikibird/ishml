ishml.lang=ishml.lang || {}
ishml.lang.a=function(word)
{
	_trie=ishml.lang.aTrie
	for (let letter of word+"$") // honey,honor,hotel
	{
		if(_trie.hasOwnProperty(letter))
		{
			if( typeof _trie[letter]==="number")
			{
				if(_trie[letter]===1){return "an"}
				if(_trie[letter]===0){return "a"}
			}
			else
			{
				_trie=_trie[letter]
			}	
			
		}
		else
		{
			if(_trie.$===1){return "an"}
			if(_trie.$===0){return "a"}
		}
	}
}
ishml.lang.aTrie={A:1,a:1,e:{u:{l:{e:1,$:0},r:{e:{c:0,k:0,s:0,$:1},i:1,$:0},$:0},w:0,$:1},F:1,H:{A:0,$:1},h:{b:1,e:{i:{r:1,$:0},r:{b:{a:{r:0,$:1},e:0,i:0,o:0,$:1},$:0},$:0},o:{m:{a:{g:1,$:0},$:0},n:{e:{$:0,s:{t:1,$:0}},o:{l:0,$:1},$:0},r:{s:{$:0,d:1},$:0},u:{r:1,$:0},$:0},$:0},I:1,i:1,L:{T:{D:0,$:1},$:1},M:{R:0,$:1},N:1,n:{d:{a:1,$:0},s:1,t:1,w:1,$:0},o:{n:{c:{e:0,$:1},e:{a:1,i:1,o:{k:1,$:0},r:1,y:{e:0,$:1},$:0},$:1},u:{a:0,i:0,$:1},$:1},R:1,r:{z:1,$:0},S:1,u:{b:{i:0,$:1},g:{a:{n:0,$:1},r:0,$:1},i:0,k:{m:1,$:0},l:{u:0,y:0,$:1},m:{a:0,e:0,$:1},n:{a:{n:{i:0,$:1},$:1},e:{o:0,s:0,$:1},i:{d:1,m:{e:0,$:1},n:1,s:{s:1,$:0},$:0},o:{s:{$:1,o:0},$:1},u:{m:0,$:1},$:1},r:{a:{n:{g:1,$:0},$:1},e:{n:1,s:1,$:0},i:0,o:0,u:0,y:0,$:1},s:{a:0,b:0,e:0,i:0,o:0,t:{i:1,$:0},u:0,$:1},t:{h:{e:{$:1,r:0},$:1},i:0,o:0,u:0,a:0,e:0,$:1},v:0,w:0,y:{s:0,$:1},$:1},x:{a:{c:1,$:0},e:{r:{s:1,$:0},$:0},m:1,s:1,t:1,r:1,$:0},X:1,y:{t:1,$:0},$:0}

var _=ishml.Phrase
ishml.Phrase.textModifier(word=>ishml.lang.a(word)+" "+word).prefix("a")
ishml.Phrase.textModifier(word=>ishml.lang.a(word)+" "+word).prefix("an")
ishml.Phrase.textModifier(word=>"un"+word).prefix("un")
ishml.Phrase.textModifier(word=>"dis"+word).prefix("dis")
ishml.Phrase.textModifier(word=>word+"ing").suffix("ing")
ishml.Phrase.phraseModifier((data)=>_`${{item:_().pick()}}${{separator:", ", if:x=>x.item.index < x.item.total-1 && x.item.total>2}}${{separator:" and ", if:x=>x.item.index===0 && x.item.total===2}}${{separator:"and ", if:x=>x.item.index===x.item.total-2 && x.item.total>2}}`.until(x=>x.item.reset).join()(data)).prefix("list")