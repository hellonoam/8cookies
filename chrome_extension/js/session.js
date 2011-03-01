//this represents a browsing session
session = function(cookies, windows){
	if (!(this instanceof session)) //in case this was called as a function rather than a cons
		return new session(cookies, windows);

	this.info = new Object();
	this.info.cookies = cookies;
	if (!windows || windows == "")
		windows == [""];
	this.info.windows = windows;
	var s = this;

	//returns a JSON representation of session
	this.serialize = function() {
		return JSON.stringify(this.info);
	}

	//updates the cookies variable to hold the up-to-date values
	this.updateCookies = function(callback) {
		chrome.cookies.getAll({}, function(cks) {
			s.info.cookies = cks;
			console.log("cookies length: " + cks.length);
			if (callback)
				callback();
		});
	}

	//updates the windows[0] variable to hold the up-to-date values
	//the rest of the windows array stays the same
	this.updateWindows = function(callback, doNotInclude) {
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
	this.updateAll = function(callback, doNotInclude) {
		this.updateCookies(function() {
			s.updateWindows(callback, doNotInclude)
		});
	}

	this.saveNewWindowsSet = function() {
		this.updateWindows(function() {
			var length = s.info.windows.length;
			s.info.windows[length] = s.info.windows[0];
			s.info.windows[length][0].savedSetDate = new Date().toDateString();
			localStorage.setItem("windows", JSON.stringify(s.info.windows));
		});
	}
	
	this.nameSet = function(index, name) {
		this.info.windows[index][0].setName = name;
		localStorage.setItem("windows", JSON.stringify(this.info.windows));
	}

	this.deleteWindowsSet = function(index) {
		this.info.windows.splice(index,1);
		localStorage.setItem("windows", JSON.stringify(this.info.windows));
	}

	this.applyWindowsSet = function(index) {
		if (index >= this.info.windows.length)
			return;
		this.info.windows[0] = this.info.windows[index];
		this.applyWindows(undefined, undefined, true);
	}

	this.getWindowsSets = function() {
		return JSON.stringify(this.info.windows);
	}

	//sets the cookies of this session to be the cookies of the browser
	this.applyCookies = function(callback) {
		tools.deleteCookies(function() {
			if (s.info.cookies)
				tools.setCookies(s.info.cookies);
			if (callback)
				callback();
		});
	}

	//sets the windows of this session to be the windows of the browser
	this.applyWindows = function(callback, doNotInclude, merge) {
		tools.setWindows(this.info.windows[0], callback, merge, doNotInclude);
	}

	//sets both windows and cookies of this session to be those of the browser
	this.applyAll = function(callback, doNotInclude, merge) {
		this.applyCookies(function() {
			s.applyWindows(callback, doNotInclude, merge);
		});
	}

	//updates the data of this session to json after de serializing it
	this.deSerialize = function(json) {
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

	this.deSerializeAndApply = function(data, doNotInclude, merge) {
		try {
			this.deSerialize(data);
			this.applyAll(null, doNotInclude, merge);
		} catch (err) {
			console.log("failed to deSerialize data");
		}
	}
}