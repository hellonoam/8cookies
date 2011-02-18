//saves the current session
var current = new session();
//value for setInteval of sending and receiving data every X seconds
var sendDataIntervalId;

//interval for sending and receiving data
var sendInterval = 10000; //120000 every 2 minutes
var idleInterval = 30; //600 every 10 minutes

var serial; //serial for checking server-side if update is valid
var serialLimit = 30000;

var MDK;
//for cases when the browser is re-opened and user is still logged in
if (tools.isLoggedIn()) {
	autoSendData();
	serial = 1;
	MDK = JSON.parse(localStorage.getItem("MDK"));
	current.updateAll();
}

if (!localStorage.restore){
	createRestorePoint();
}

//listens for requsts from popup then runs the appropriate function
chrome.extension.onRequest.addListener(
	function(request, sender, sendResponse) {
		console.log("received message " + request.type);
		switch (request.type) {
			case "saveNewWindowsSet":
				saveNewWindowsSet();
				break;
			case "deleteWindowsSet":
				deleteWindowsSet(request.index);
				break;
			case "applyWindowsSet":
				applyWindowsSet(request.index);
				break;
			case "getWindowsSets":
				sendResponse({ result: getWindowsSets() });
				return;
			case "deleteFromServer":
				sendResponse({ result:
					deleteFromServer(request.doNotInclude, request.sync) });
				return;
			case "createRestore":
				createRestorePoint();
				break;
			case "doRestore":
				doRestore();
				break;
			case "login":
				sendResponse({ success: login(request.username,
											  request.password,
											  request.portSession,
											  request.doNotInclude,
											  request.merge) });
				return; // return since the response is sent here
			case "logout":
				sendResponse({ success: logout(false, request.notApply,
											   request.doNotInclude, request.sync) });
				return; // return since the response is sent here
			case "isLoggedIn":
			    sendResponse({ result: tools.isLoggedIn(),
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
				console.log("ERROR: got an ill typed message");
		}
		sendResponse({});
	}
);

function createRestorePoint() {
	var restoreSession = new session();
	restoreSession.updateAll(function() {
		localStorage.setItem("restore", restoreSession.serialize());
		console.log("restore point was created");
	});
}

function doRestore(){
	var s = new session();
	s.deSerializeAndApply(localStorage.restore);
}

//this function authenticates the user. Once the user is authenticated it updates the
//session to the one the user has on the server
function login(username, nakedPass, portSession, doNotInclude, merge) {
	if (username == "" || nakedPass == "" || !username || !nakedPass) {
		console.log("username or password not valid");
		return false;
	}
	var password = tools.getLoginToken(nakedPass, username).toString();

	receiveData(function() {
		var s = new session();
		localStorage.setItem("username", username);
		localStorage.setItem("password", password);
		console.log("user logged in");
		s.updateAll(function() {
			localStorage.setItem("oldSession", s.serialize());
		}, doNotInclude);
	}, true, username, password, portSession, doNotInclude, undefined, merge);

	if (!tools.isLoggedIn())
		return false;

	autoSendData();
	return true;
}

//setting up automatic data sending
function autoSendData() {
	// sending data to server every fixed number of minutes
	sendDataIntervalId = setInterval(function() {
		console.log("send-data-interval was called");
		var s = new session();
		chrome.idle.queryState(idleInterval, function(state) {
			if (state == "idle") {
				return;
			}
			//session is active
			s.updateAll(function() {
				if ( JSON.stringify(s.info) != JSON.stringify(current.info) ) {
					sendData();
				}
			});
		});
	}, sendInterval);

	//logging urls once they are updated
	chrome.tabs.onUpdated.addListener(urlSender);
	//sending data when the browser is no longer in the idle state
	chrome.idle.onStateChanged.addListener(idleListener);
}

//used to add and remove listeners
function idleListener() {
	sendData();
}

//the listner for update events on urls
function urlSender(tabId, changeInfo) {
	if (changeInfo.url)
		sendVisitedURL(changeInfo.url);
}

//logs out the user, but sends the session to the server before then
function logout(dataDeleted, notApply, doNotInclude, sync) {
	chrome.tabs.onUpdated.removeListener(urlSender);
	chrome.idle.onStateChanged.removeListener(idleListener);
	clearInterval(sendDataIntervalId);
	var callback = function() {
		var old = new session();
		old.deSerialize(localStorage.getItem("oldSession"));
		current = old;
		if (!notApply)
			old.applyAll(null, doNotInclude);
		localStorage.setItem("username", "");
		localStorage.setItem("password", "");
		localStorage.setItem("MDK", "");
		localStorage.setItem("windows", "");
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

//sends the url to server as a visited url
function sendVisitedURL(url) {
	sendURLToServer(url, "/VisitedURL");
}

//sends the url to server as a failed to reproduce url
function sendFailedToReproduceURL(url) {
	sendURLToServer(url, "/FailedToReproduceURL");
}

//sends the data from the current session to the server
function sendData(callback, doNotInclude, sync) {
	console.log("in sendData");
	if (!tools.isLoggedIn()) {
		console.log("user not logged in send data cancelled");
		if (callback)
			callback();
		return;
	}
	if (serial == serialLimit)
		serial = 1;
	console.log("serial "+serial);
	current.updateAll(function() {
		console.log("sending sets #### " + current.info.windows.length);
		var dataToSend = current.serialize();
		console.log("encrypted data length = " + tools.encrypt(dataToSend, MDK).length);
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
				dataFromClient: tools.encrypt(dataToSend, MDK)
			},
			success: function(data) {
				if ($.trim(data).toLowerCase() == "received")
					console.log("data from server: " + data);
				else if (data != "" && data.charAt(0) == '{') { //means there was a conflict
					console.log("data:" + data + "|");
					console.log("conflict - update rejected");
					var answer = confirm("looks like the cloud has more up-to- date data." + 
					" would you like to load the windows from the cloud?");
					serial = 1;
					if (answer) {
						try {
							current.deSerializeAndApply(
								tools.decrypt(JSON.parse(data).info, MDK));
						} catch (err) {
							console.log("wasn't a JSON");
						}
					}
				} else {//probably means the network is down
					serial--;
					current.deSerialize();
					//so update will happen even if nothing has changed
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

//asks the server for the data for the specific user and then 
//sets the data as the current session. Username and password are sent again.
function receiveData(successCallback, sync, username, password, portSession,
	doNotInclude, checkIfUpdateNeeded, merge) {
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
			try {
				data = JSON.parse(data);
			} catch (err) {
				console.log("wasn't a JSON");
				return;
			}
			serial = 1;
			setMDK(password, data.salt)
			console.log("MASTER DATA KEY: " + MDK);
			data.info = tools.decrypt(data.info, MDK)
			if (successCallback)
				successCallback();
			if (portSession)
				return;
			if (checkIfUpdateNeeded) {
				current.updateAll(function() {
					if (JSON.stringify(current.info) == JSON.stringify(
								JSON.parse(data.info)))
						return;
					current.deSerializeAndApply(data.info, doNotInclude, merge);
				});
			} else {
				current.deSerializeAndApply(data.info, doNotInclude, merge);
				console.log("length in receivedata ****** " + current.info.windows.length);
			}
			localStorage.setItem("tooManyTries", "false");
		},
		error: function(error) {
			localStorage.setItem("tooManyTries", "false");
			errorFunction(error);
			if (error.status == 403) {
				time = error.statusText.substr(error.statusText.indexOf(':') + 1);
				localStorage.setItem("tooManyTries", "true");
				localStorage.setItem("waitTime", time)
			}
		}
	});
}

//generates the master data key and stores it in localstorage
function setMDK(password, salt){
	MDK = tools.getMasterDataKey(password, salt);
	localStorage.setItem("MDK", JSON.stringify(MDK));
}

//receives data from server only if it is needed, i.e., something was changed.
//In practice this fail because of network latency, by the time the response
//comes back, the state has almost certainly changed.
function receiveDataIfNeeded() {
	receiveData(null,null,null,null,null,null,true);
}

//deletes all information from the server.
function deleteFromServer(doNotInclude, sync) {
	if (localStorage.getItem("username") == "")
		return false;
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
	return true;
}

function saveNewWindowsSet() {
	current.saveNewWindowsSet();
	sendData();
	console.log("new state was saved!!!");
}

function applyWindowsSet(index) {
	current.applyWindowsSet(index);
}

function getWindowsSets() {
	return current.getWindowsSets();
}

function deleteWindowsSet(index) {
	current.deleteWindowsSet(index);
}