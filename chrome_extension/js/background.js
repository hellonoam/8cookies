//saves the current session
var current = new session();
//value for setInteval of sending and receiving data every X seconds
var sendDataIntervalId;

//whether or not the current session is idle
var idle = false;

//interval for sending and receiving data
var sendInterval = 10000; //120000 every 2 minutes
var idleInterval = 30; //every 10 minutes

var serial; //serial for checking server-side if update is valid
var serialLimit = 30000;

//listens for requsts from popup then runs the appropriate function
chrome.extension.onRequest.addListener(
	function(request, sender, sendResponse) {
		console.log("received message " + request.type);
		switch (request.type) {
			case "deleteLocal":
				deleteCookies();
				break;
			case "deleteFromServer":
				deleteFromServer(request.doNotInclude, request.sync);
				break;
			case "login":
				sendResponse({ success: login(request.username,
											  request.password,
											  request.portSession,
											  request.doNotInclude) });
				return; // return since the response is sent here
			case "logout":
				sendResponse({ success: logout(false, request.notApply, request.doNotInclude, request.sync) });
				return; // return since the response is sent here
			case "isLoggedIn":
			    sendResponse({ result: isLoggedIn(),
							   username: localStorage.getItem("username") });
				return; // return since the response is sent here
			case "failedToReproduce":
				chrome.tabs.getSelected(null, function(tab) {
		    		sendFailedToReproduceURL(tab.url);
				});
				break;
			case "testing":
			//converting the string function into a function and running it
				var f = eval("(" + request.stringFunction + ")");
				f();
				break;
			default:
				console.log("ERROR: got an ill typed message from 'popup'");
		}
		sendResponse({});
	}
);

//this function authenticates the user. Once the user is authenticated it updates the
//session to the one the user has on the server
function login(username, password, portSession, doNotInclude) {
	if (username == "" || password == "" || !username || !password) {
		console.log("username or password not valid");
		return false;
	}
	receiveData(function() {
		var s = new session();
		localStorage.setItem("username", username);
		localStorage.setItem("password", password);
		console.log("user logged in");
		s.updateAll(function() {
			localStorage.setItem("oldSession", s.serialize());
			current = new session();
		}, doNotInclude);
	}, true, username, password, portSession, doNotInclude);

	if (!isLoggedIn())
		return false;
	//sending data to server every fixed number of minutes
	sendDataIntervalId = setInterval(function() {
		var s = new session();
		chrome.idle.queryState(idleInterval, function(state) {
			if (state == "idle") {
				idle = true;
				return;
			}
			//session is active
			if (idle) { //TODO: doesn't work well, take this out
				idle = false;
				receiveDataIfNeeded();
			}
			s.updateAll(function() {
				if ( JSON.stringify(s.info) != JSON.stringify(current.info) ) {
					sendData();
				}
			});
		});
	}, sendInterval);

	//logging urls once they are updated
	chrome.tabs.onUpdated.addListener(urlSender);

	return true;
}

//the listner for update events on urls
function urlSender(tabId, changeInfo) {
	if (changeInfo.url)
		sendVisitedURL(changeInfo.url);
}

//logs out the user, but sends the session to the server before then
function logout(dataDeleted, notApply, doNotInclude, sync) {
	chrome.tabs.onUpdated.removeListener(urlSender);
	var old = new session();
	clearInterval(sendDataIntervalId);
	// clearInterval(receiveDataIntervalId);
	old.deSerialize(localStorage.getItem("oldSession"));
	var callback = function() {
		if (!notApply)
			old.applyAll(null, doNotInclude);
		current = old;
		localStorage.setItem("username", "");
		localStorage.setItem("password", "");
	};
	if (dataDeleted)
	 	callback();
	else
		sendData(callback, doNotInclude, sync);
	console.log("user logged out");
	return true;
}

//this function is called when an ajax request has resulted in an error
//prints out error message
function errorFunction(request) {
	//TODO: maybe add more functionality to this
	console.log(request.status + ": " + request.statusText);
}

function sendURLToServer(url, servlet) {
	console.log("sending url " + url + " to server " + servlet);
	$.ajax({
		url: server + servlet,
		cache: false,
		data: { url: url },
		error: errorFunction
	});
}

function sendVisitedURL(url) {
	sendURLToServer(url, "/VisitedURL");
}

function sendFailedToReproduceURL(url) {
	sendURLToServer(url, "/FailedToReproduceURL");
}

//sends the data from the current session to the server
function sendData(callback, doNotInclude, sync) {
	console.log("in sendData");
	if (!isLoggedIn()) {
		console.log("user not logged in send data cancelled");
		if (callback)
			callback();
		return;
	}
	if (serial == serialLimit)
		serial = 1;
	console.log("serial "+serial);
	current.updateAll(function() {
		$.ajax({
			type: "POST",
			//since the server receives the data
			url: server + "/ReceiveData",
			cache: false,
			async: !sync,
			data: {
				user: localStorage.getItem("username"),
				pass: localStorage.getItem("password"),
				serial: serial++,
				dataFromClient: current.serialize()
			},
			success: function(data) {
				if ($.trim(data).toLowerCase() == "received")
					console.log("data from server: " + data);
				else { //means there was a conflict
					console.log("conflict - update rejected");
					serial = 1;
					current.deSerializeAndApply(data);
				}
			},
			complete: function() {
				if (callback)
					callback();
			},
			error: function(error) {
				errorFunction(error);
				if (error.status == 409)
					receiveDataIfNeeded();
			}
		});
	}, doNotInclude);
}

//asks the server for the data for the specific user and then sets the data as the current
//session. Username and password are sent again.
function receiveData(successCallback, sync, username, password, portSession,
			doNotInclude, checkIfUpdateNeeded) {
	console.log("in receiveData");
	if (!username && !password){
		username = localStorage.getItem("username");
		password = localStorage.getItem("password");
	}
	$.ajax({
		//since the server sends the data
		url: server + "/SendData",
		async: !sync,
		data: {
			user: username,
			pass: password
		},
		success: function(data) {
			serial = 1;
			if (successCallback)
				successCallback();
			if (portSession) {
				console.log("no data was received");
				return; // no cookies to set
			}
			if (checkIfUpdateNeeded) {
				current.updateAll(function() {
					if (JSON.stringify(current.info) == JSON.stringify(JSON.parse(data)))
						return;
					current.deSerializeAndApply(data, doNotInclude);
				});
			} else {
				current.deSerializeAndApply(data, doNotInclude);
			}
		},
		error: errorFunction
	});
}

function receiveDataIfNeeded() {
	receiveData(null,null,null,null,null,null,true);
}

//deletes all information from the server.
function deleteFromServer(doNotInclude, sync) {
	$.ajax({
		url: server + "/DeleteCookiesFromServer",
		cache: false,
		async: !sync,
		data: {
			user: localStorage.getItem("username"),
			pass: localStorage.getItem("password")
		},
		success: function(data) { 
			logout(true, null, doNotInclude);
			console.log(data);	
		},
		error: errorFunction
	});
}
