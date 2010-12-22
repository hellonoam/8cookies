//this represents a browsing session
function session(cookies, windows){
	if (!(this instanceof session))
		return new session; //in case this was called as a function rather than a cons

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
	this.updateWindows = function(callback) {
		chrome.windows.getAll({populate: true}, function(windows) {
			s.info.windows = windows;
			if (callback)
				callback();
		});
	}

	//updates both windows and tabs
	this.updateAll = function(callback) {
		this.updateCookies(function() {
			s.updateWindows(callback)
		});
	}

	//sets the cookies of this session to be the cookies of the browser
	this.applyCookies = function(callback) {
		if (!this.info || !this.info.cookies) {
			console.log("cookies have not been set");
			return;
		}
		deleteCookies(function() {
			setCookies(s.info.cookies);
			callback();
		});
	}

	//sets the windows of this session to be the windows of the browser
	this.applyWindows = function(callback) {
		if (!this.info || !this.info.windows) {
			console.log("windows have not been set");
			return;
		}
			setWindows(this.info.windows, callback);
			console.log("windows have been set");
	}

	//sets both windows and cookies of this session to be those of the browser
	this.applyAll = function(callback) {
		this.applyCookies(function() {
			s.applyWindows(callback);
		});
	}

	//updates the data of this session to json after de serializing it
	this.deSerialize = function(json) {
		if (json)
			this.info = JSON.parse(json);
	}
}