ISHML.Passage = function Passage(aTemplate = "", aComposer) {
    /*
    aTemplate=`I took the _thing_ to the _place_.`
    */
	if (this instanceof ISHML.Passage) {
		Object.defineProperty(this, "template", { value: [], writable: true });
		Object.defineProperty(this, "data", { value: {}, writable: true });
		if (aComposer) {
			var composer = aComposer.bind(this);
		}
		Object.defineProperty(this, "composer", { value: composer || ISHML.Passage.prototype.compose.bind(this), writable: true });
		if (aTemplate.length > 0) {
			this.data = {};
			this.template = aTemplate.split(/(_[^_^\s]*_)/);
			this.template.forEach((phrase) => {
				this[phrase] = new ISHML.Passage();
				this.data[phrase] = phrase;
			});
		}
		return this;
	}
	else {
		return new Passage(aTemplate);
	}
};
ISHML.Passage.prototype.text = function (aData) {
	var text = "";
	if (aData) {
		this.data = Object.assign(this.data, aData);
	}
	this.template.forEach((phrase) => {
		if (this.data[phrase] instanceof Array) {
			var items = this.data[phrase];
		}
		else {
			var items = [];
			items.push(this.data[phrase]);
		}
		items.forEach((item, index, list) => {
			text = text + this.composer(phrase, item, index, list);
		});
	});
	return text;
};
ISHML.Passage.prototype.compose = function (aPhrase, anItem, anIndex, aList) {
	if (this[aPhrase].template.length > 0) {
		var data = {};
		data[aPhrase] = anItem;
		return this[aPhrase].text(data);
	}
	else {
		return this.data[aPhrase].toLocaleString();
	}
};
