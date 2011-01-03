//this represents a browsing session
function session(cookies, windows){
	if (!(this instanceof session)) //in case this was called as a function rather than a cons
		return new session(cookies, windows);

	this.info = new Object();
	this.info.cookies = cookies;
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

	//updates the windows variable to hold the up-to-date values
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
			s.info.windows = windows;
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

	//sets the cookies of this session to be the cookies of the browser
	this.applyCookies = function(callback) {
		deleteCookies(function() {
			if (s.info.cookies)
				setCookies(s.info.cookies);
			if (callback)
				callback();
		});
	}

	//sets the windows of this session to be the windows of the browser
	this.applyWindows = function(callback, doNotInclude) {
		setWindows(this.info.windows, callback, null, doNotInclude);
	}

	//sets both windows and cookies of this session to be those of the browser
	this.applyAll = function(callback, doNotInclude) {
		this.applyCookies(function() {
			s.applyWindows(callback, doNotInclude);
		});
	}

	//updates the data of this session to json after de serializing it
	this.deSerialize = function(json) {
		console.log("deserialize was called");
		if (json)
			this.info = JSON.parse(json);
		else
			this.info = "";
	}
}