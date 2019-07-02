ISHML.Plot = function Plot(aYarn) {
	if (this instanceof ISHML.Plot) {
		//  initialization section
		Object.defineProperty(this, "yarn", { value: aYarn, writable: true });
		return this;
	}
	else
		return new Plot(aYarn);
};
ISHML.Plot.prototype.add = function (...somePlotpoints) {
	var plotpoint;
	var key;
	somePlotpoints.forEach((p) => {
		if (p instanceof ISHML.Plotpoint) {
			plotpoint = p;
			key = p.key;
		}
		else {
			key = p;
			plotpoint = new ISHML.Plotpoint(this.yarn, key);
		}
		this[plotpoint.key] = plotpoint;
		this.yarn.plot[key] = plotpoint;
	});
	return plotpoint;
};
ISHML.Plot.prototype.hasPlotpoint = function (aKey) {
	if (this.hasOwnProperty(aKey)) {
		return true;
	}
	else
		return (false);
};
ISHML.Plot.prototype.narrate = function (aTwist) {
	return Object.values(this).some(plotpoint => plotpoint.narrate(aTwist));
};
ISHML.Plot.prototype.disjoin = function (aPlot) {
	var result = new ISHML.Plot();
	if (aPlot instanceof ISHML.Plot) {
		var plot = aPlot;
	}
	else {
		var plot = new ISHML.Plot(aPlot);
	}
	Object.entries(this).forEach(([key, value]) => {
		if (!plot.hasOwnProperty(key)) {
			result[key] = value;
		}
	});
	Object.entries(plot).forEach(([key, value]) => {
		if (!this.hasOwnProperty([key])) {
			result[key] = value;
		}
	});
	return result;
};
ISHML.Plot.prototype.join = function (aPlot) {
	var result = new ISHML.Plot();
	if (aPlot instanceof ISHML.Plot) {
		var plot = aPlot;
	}
	else {
		var plot = new ISHML.Plot(aPlot);
	}
	if (plot.size < this.size) {
		Object.entries(plot).forEach(([key, value]) => {
			if (this.hasOwnProperty(key)) {
				result[key] = value;
			}
		});
	}
	else {
		Object.entries(this).forEach(([key, value]) => {
			if (plot.hasOwnProperty(key)) {
				result[key] = value;
			}
		});
	}
	return result;
};
ISHML.Plot.prototype.omit = function (aPlot) {
	var result = new ISHML.Plot();
	if (aPlot instanceof ISHML.Plot) {
		var plot = aPlot;
	}
	else {
		var plot = new ISHML.Plot(aPlot);
	}
	Object.entries(this).forEach(([key, value]) => {
		if (!plot.hasOwnProperty(key)) {
			result[key] = value;
		}
	});
	return result;
};
ISHML.Plot.prototype.toArray = function () {
	return Object.values(this);
};
ISHML.Plot.prototype.union = function (aPlot) {
	if (aPlot instanceof ISHML.Plot) {
		var plot = aPlot;
	}
	else {
		var plot = new ISHML.Plot(aPlot);
	}
	return Object.assign(this, plot);
};
ISHML.Plot.prototype.cut = function (aKey) {
	if (aKey instanceof ISHML.Knot) {
		var key = aKey.key;
	}
	else {
		var key = ISHML.util.formatKey(aKey);
	}
	var deletedPlotpoint = Object.assign({}, this[key]);
	delete this[key];
	return deletedPlotpoint;
};
ISHML.Plot.prototype.where = function (aFilter) {
	var result = new ISHML.Plot();
	var entries = Object.entries(aPlot).filter(aFilter);
	entries.forEach(([key, value]) => { result[key] = value; });
	return result;
};
