//this represents a browsing session
var session = function(cookies, windows){
	if (!(this instanceof session)) //in case this was called as a function rather than a cons
		return new session(cookies, windows);

	this.info = new Object();
	this.info.cookies = cookies;
	if (!windows || windows == "")
		windows == [""];
	this.info.windows = windows;
}

// //returns a JSON representation of session
session.prototype.serialize = function() {
	return JSON.stringify(this.info);
}

//updates the cookies variable to hold the up-to-date values
session.prototype.updateCookies = function(callback) {
	var s = this;
	chrome.cookies.getAll({}, function(cks) {
		s.info.cookies = cks;
		console.log("cookies length: " + cks.length);
		if (callback)
			callback();
	});
}

//updates the windows[0] variable to hold the up-to-date values
//the rest of the windows array stays the same
session.prototype.updateWindows = function(callback, doNotInclude) {
	var s = this;
	chrome.windows.getAll({populate: true}, function(windows) {
		if (doNotInclude){
			var arr = [];
			var i = 0;
			$.each(windows, function(index, value) {
				if (value.id != doNotInclude)
					arr[i++] = value;
			});
			windows = arr;
		}
		if (localStorage.windows && localStorage.windows != "undefined")
			s.info.windows = JSON.parse(localStorage.windows);
		else
			s.info.windows = [];
		s.info.windows[0] = windows;
		if (callback)
			callback();
	});
}

//updates both windows and tabs
session.prototype.updateAll = function(callback, doNotInclude) {
	var s = this;
	this.updateCookies(function() {
		s.updateWindows(callback, doNotInclude)
	});
}

session.prototype.saveNewWindowsSet = function() {
	var s = this;
	this.updateWindows(function() {
		var length = s.info.windows.length;
		s.info.windows[length] = s.info.windows[0];
		s.info.windows[length][0].savedSetDate = new Date().toDateString();
		localStorage.setItem("windows", JSON.stringify(s.info.windows));
	});
}

session.prototype.nameSet = function(index, name) {
	this.info.windows[index][0].setName = name;
	localStorage.setItem("windows", JSON.stringify(this.info.windows));
}

session.prototype.deleteWindowsSet = function(index) {
	this.info.windows.splice(index,1);
	localStorage.setItem("windows", JSON.stringify(this.info.windows));
}

session.prototype.applyWindowsSet = function(index) {
	if (index >= this.info.windows.length)
		return;
	this.info.windows[0] = this.info.windows[index];
	this.applyWindows(undefined, undefined, true);
}

session.prototype.getWindowsSets = function() {
	return JSON.stringify(this.info.windows);
}

//sets the cookies of this session to be the cookies of the browser
session.prototype.applyCookies = function(callback) {
	var s = this;
	tools.deleteCookies(function() {
		if (s.info.cookies)
			tools.setCookies(s.info.cookies);
		if (callback)
			callback();
	});
}

//sets the windows of this session to be the windows of the browser
session.prototype.applyWindows = function(callback, doNotInclude, merge) {
	tools.setWindows(this.info.windows[0], callback, merge, doNotInclude);
}

//sets both windows and cookies of this session to be those of the browser
session.prototype.applyAll = function(callback, doNotInclude, merge) {
	var s = this;
	this.applyCookies(function() {
		s.applyWindows(callback, doNotInclude, merge);
	});
}

//updates the data of this session to json after de serializing it
session.prototype.deSerialize = function(json) {
	var s = this;
	console.log("deserialize was called");
	if (json)
		this.info = JSON.parse(json);
	else
		this.info = new Object();
	if (!this.info.windows)
		this.info.windows = [];
	else
		localStorage.setItem("windows", JSON.stringify(s.info.windows));
}

session.prototype.deSerializeAndApply = function(data, doNotInclude, merge) {
	try {
		this.deSerialize(data);
		this.applyAll(null, doNotInclude, merge);
	} catch (err) {
		console.log("failed to deSerialize data");
	}
}