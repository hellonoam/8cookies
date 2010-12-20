function session(cookies, windows){
	if (!(this instanceof session))
		return new session; //in case this was called as a function rather than a cons

	this.info = new Object();
	this.info.cookies = cookies;
	this.info.windows = windows;
	var s = this;

	this.serialize = function() {
		return JSON.stringify(this.info);
	}

	this.updateCookies = function(callback) {
		chrome.cookies.getAll({}, function(cks) {
			s.info.cookies = cks;
			console.log("cookies length: " + cks.length);
			if (callback)
				callback();
		});
	}

	this.updateWindows = function(callback) {
		chrome.windows.getAll({populate: true}, function(windows) {
			s.info.windows = windows;
			if (callback)
				callback();
		});
	}

	this.updateAll = function(callback) {
		this.updateCookies(function() {
			s.updateWindows(callback)
		});
	}

	this.applyCookies = function() {
		setCookies(this.info.cookies);
	}

	this.applyWindows = function(callback) {
		if (this.info.windows) {
			setWindows(this.info.windows, callback);
			console.log("windows have been set");
		} else
			console.log("windows have not been set");
	}

	this.applyAll = function(callback) {
		this.applyCookies();
		this.applyWindows(callback);
	}

	this.deSerialize = function(json) {
		this.info = JSON.parse(json);
	}
}