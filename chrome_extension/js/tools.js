
tools = {
	//sets the local cookies to to cookies
	setCookies: function(cookies) {
		if (!cookies)
			return;
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
	},


	//sets the current windows to be windows, and removes all open windows. Callback is called
	//after windows have been set.
	setWindows: function(windows, callback, leaveOpenWindows, doNotInclude) {
		//closing open windows
		if (!leaveOpenWindows) {
			chrome.windows.getAll({}, function(windows2Remove) {
				for (var i=0; i<windows2Remove.length; i++) {
					if (windows2Remove[i].type != "app" && windows2Remove[i].id != doNotInclude)
						chrome.windows.remove(windows2Remove[i].id)
				}
			});
		}

		var index = 0;//the index is used for the hack of getting the window id

		//if there are no windows then a Google tab would be opened
		if (!windows) {
			windows = [new Object()];
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
				if (windows[i].tabs && windows[i].tabs[0])
				//TODO: the second might do the same as the first - check this
					newWindow.url = windows[i].tabs[0].url;
				else
					newWindow.url = windows[i].url;
				chrome.windows.create(newWindow, function(createdWin) {
					while (windows[index].type == "app")
						index++;
					for (var j=1; windows[index].tabs && j<windows[index].tabs.length; j++) {
						var options = new Object();
						options.windowId = createdWin.id;
						options.url = windows[index].tabs[j].url;
						options.index = j;
						options.selected = windows[index].tabs[j].selected;
						chrome.tabs.create(options);
					}
					index++;
					// console.log("i=" + i + " windows.length=" + windows.length);
					if ( (i + 1) >= windows.length && callback) {
						console.log("callback was called");
						callback();
						callback = undefined; //TODO: check this 
					}
				});
			} else if ( (i+1) >= windows.length && callback) {
				callback();
				callback = undefined;
			}
		}
	},

	//deletes local cookies
	deleteCookies: function(callback) {
		console.log("deleting cookies...");
		chrome.cookies.getAll({}, function(cookies) {
			for(var i=0; i<cookies.length; i++) {
				var current = cookies[i];
				var cookies2Remove = new Object;
				cookies2Remove.url = ((current.secure) ? 
					"https://" : "http://") + current.domain + current.path;
				cookies2Remove.name = current.name;
				cookies2Remove.storeId = current.storeId;
				chrome.cookies.remove(cookies2Remove);
			}
			console.log(cookies.length + " cookies have been deleted");
			if (callback)
				callback();
		});
	},

	//prints how many cookies exist on the local machine
	howManyCookiesDoIHave: function(){
		chrome.cookies.getAll({}, function(cookies) {
			console.log("you have " + cookies.length + " cookies");
		});
	},

	//returns whether or not the user is logged in
	isLoggedIn: function(){
		return localStorage.getItem("username") != null &&
			   localStorage.getItem("password") != null &&
			   localStorage.getItem("username") != "" &&
			   localStorage.getItem("password") != "";
	},

	//app random id
	_appRandIdLoginToken: "BKX:I5//p",
	_appRandIdMDK: "BKX:I5//p",

	makePBKDF2: function(PBKDF2) {
		for (i=0; i<1000; i++) {
			PBKDF2 = sjcl.hash.sha256.hash(PBKDF2);
		}
		return PBKDF2
	},

	getLoginToken: function(nakedPass, username) {
		return tools.makePBKDF2(nakedPass + "login" + username
			+ tools._appRandIdLoginToken);
	},

	getMasterDataKey: function(password, userRandomSalt) {
		return tools.makePBKDF2(password + "encryption"
			+ userRandomSalt + tools._appRandIdMDK);
	},

	//ecrypts the plaintext with the master data key
	encrypt: function(plaintext, MDK) {
		// console.log("in encrypt");
		var p = new Object();
		p.adata = "";
		p.iter = 1000;
		p.ks = 128;
		p.mode = "ccm";
		p.ts = 64;
		// console.log("p");
		// console.log(p);
		var rp = new Object();
		var ciphertext = sjcl.encrypt(MDK, plaintext, p,rp);
		// console.log("rp");
		// console.log(rp);
		return ciphertext;
	},

	//decrypts the ciphertext with the master data key
	decrypt: function(ciphertext, MDK) {
		// console.log("in decrypt");
		if (ciphertext instanceof Array) ciphertext = ciphertext[0];
		if (!ciphertext || ciphertext == "") return "";
		var plaintext = sjcl.decrypt(MDK, ciphertext, {}, {})
		return plaintext;
	}
};