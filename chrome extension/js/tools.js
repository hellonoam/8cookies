//sets the local cookies to to cookies
function setCookies(cookies){
	for (var i=0; i<cookies.length; i++) {
		//maybe move this mambo jambo to another function
		var newCookie = new Object;
		var current = cookies[i];
		newCookie.url = ((current.secure) ? 
			"https://" : "http://") + current.domain;
		newCookie.name = current.name;
		newCookie.value = current.value;
		if (!current.hostOnly)
			newCookie.domain = current.domain;
		newCookie.path = current.path;
		newCookie.secure = current.secure;
		newCookie.httpOnly = current.httpOnly;
		if (!current.session)
			newCookie.expirationDate = current.expirationData;
		newCookie.storeId = current.storeId;
		chrome.cookies.set(newCookie);
	}
	console.log(cookies.length + " cookies were set");
}


//sets the current windows to be windows, and removes all open windows. Callback is called
//after windows have been set.
function setWindows(windows, callback) {
	//closing open windows
	chrome.windows.getAll({}, function(windows2Remove) {
		for (var i=0; i<windows2Remove.length; i++) {
			if (windows2Remove[i].type != "app")
				chrome.windows.remove(windows2Remove[i].id)
		}
	});

	var index = 0;//the index is used for the hack of getting two 

	//if there are no windows then a Google tab would be opened
	if (!windows) {
		windows = [];
		windows[0].left = 20;
		windows[0].top = 20;
		windows[0].width = 600;
		windows[0].height = 600;
		windows[0].type = "normal";
		windows[0].incognito = false;
		windows[0].url = "http://www.google.com";
	}

	//opening windows
	for (var i=0; i<windows.length; i++) {
		if (windows[i].type != "app") {
			var newWindow = new Object();
			newWindow.left = windows[i].left;
			newWindow.top = windows[i].top;
			newWindow.width = windows[i].width;
			newWindow.height = windows[i].height;
			newWindow.incognito = windows[i].incognito;
			newWindow.type = windows[i].type;
			newWindow.url = windows[i].tabs[0].url;
			chrome.windows.create(newWindow, function(createdWin) {
				while (windows[index].type == "app")
					index++;
				for (var j=1; j<windows[index].tabs.length; j++) {
					var options = new Object();
					options.windowId = createdWin.id;
					options.url = windows[index].tabs[j].url;
					options.index = j;
					options.selected = windows[index].tabs[j].selected;
					chrome.tabs.create(options);
				}
				index++;
			});
		}
	}
	if (callback) //TODO: make sure this is correct
		callback();
}

//deletes local cookies
function deleteCookies(callback) {
	console.log("deleting cookies...");
	chrome.cookies.getAll({}, function(cookies) {
		for(var i=0; i<cookies.length; i++) {
			var current = cookies[i];
			var cookies2Remove = new Object;
			cookies2Remove.url = ((current.secure) ? 
				"https://" : "http://") + current.domain;	
			cookies2Remove.name = current.name;
			cookies2Remove.storeId = current.storeId;
			chrome.cookies.remove(cookies2Remove);
		}
		console.log(cookies.length + " cookies have been deleted");
		if (callback)
			callback();
	});
}

//prints how many cookies exist on the local machine
function howManyCookiesDoIHave(){
	chrome.cookies.getAll({}, function(cookies) {
		console.log("you have " + cookies.length + " cookies");
	});
}

//returns whether or not the user is logged in
function isLoggedIn(){
	return localStorage.getItem("username") != null &&
		   localStorage.getItem("password") != null &&
		   localStorage.getItem("username") != "" &&
		   localStorage.getItem("password") != "";
}