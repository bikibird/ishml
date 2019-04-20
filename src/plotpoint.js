ISHML.Plotpoint = function Plotpoint(aYarn, aKey) {
	if (this instanceof ISHML.Plotpoint) {
		this.key = ISHML.util.formatKey(aKey);
		this.yarn = aYarn;
		this.plot = new ISHML.Plot(aYarn);
		//this.$=undefined
		aYarn.plot[this.key] = this;
		return this;
	}
	else {
		return new Plotpoint(aYarn, aKey);
	}
};
ISHML.Plotpoint.prototype.add = function (aPlotpoint) {
	if (aPlotpoint instanceof ISHML.Plotpoint) {
		var plotpoint = aPlotpoint;
		var key = aPlotpoint.key;
	}
	else {
		var key = ISHML.util.formatKey(aPlotpoint);
		plotpoint = new ISHML.Plotpoint(this.yarn, key);
	}
	this.plot[plotpoint.key] = plotpoint;
	this.yarn.plot[key] = plotpoint;
	return plotpoint;
};
ISHML.Plotpoint.prototype.heed = function (aDocumentSelector) {
	var yarn = this.yarn;
	var element = document.querySelector(aDocumentSelector);
	var eventString = "click";
	if (element) {
		if (element.classList.contains("ISHML-input")) {
			eventString = "keyup";
		}
		return new Promise((resolve) => {
			if (ISHML.util._harkenings[aDocumentSelector]) {
				var harkeningHandler = ISHML.util._harkenings[aDocumentSelector][eventString];
				if (harkeningHandler) {
					element.removeEventListener(eventString, harkeningHandler);
				}
			}
			element.addEventListener(eventString, function handler(e) {
				if (e.key === "Enter") {
					var input = {
						text: e.target.value,
						agent: (e.target.dataset.agent || "player"),
						target: e.target,
						grammar: yarn.grammar[e.target.dataset.grammar] || yarn.grammar.input
					};
					e.target.value = "";
					e.target.removeEventListener(eventString, handler);
					if (harkeningHandler) {
						e.target.addEventListener(eventString, harkeningHandler);
					}
					resolve(input);
				}
			});
		});
	}
};
ISHML.Plotpoint.prototype.narrate = function (aTwist) {
	this.plot.narrate(aTwist);
	return false;
};
ISHML.Plotpoint.prototype.situation = function (aSituation = () => true) {
	return aSituation();
};
ISHML.Plotpoint.prototype.resolution = function (aSituation = () => true) {
	return aSituation();
};
ISHML.Plotpoint.prototype.understand = function (...someTerms) {
	var definition = { key: this.key, kind: "plotpoint", part: "verb", plotpoint: this };
	var _as = (aDefinition = {}) => {
		this.yarn.lexicon.register(...someTerms).as(Object.assign(definition, aDefinition));
		return this;
	};
	return { as: _as };
};
