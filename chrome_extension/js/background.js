//saves the current session
var current = new session();
//value for setInteval of sending and receiving data every X seconds
var sendDataIntervalId;

//interval for sending data and when does the browser move to the idle state
var sendInterval = 300000; //300000 every 5 minutes
var idleInterval = 600; //600 every 10 minutes

// (function open(from) {
// 	if (from > 75000) return;
// 	chrome.tabs.create(
// 		{url: "http://www.8cookies.com/StrippedURLs?start=" + from + "&end=" + (from + 1000) },
// 		function() {
// 			open(from+1000);
// 		}
// 	);
// })(61000);


//for cases when the browser is re-opened and user is still logged in
var user = new User(localStorage);
user.createUserFromBackup();
if (user.loggedIn) {
	autoSendDataAndIdleListener();
	if (!localStorage.serial)
		localStorage.serial = getRandomSerial();
	current.updateAll();
}

localStorage.version = getVersion();

function getVersion() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', chrome.extension.getURL('manifest.json'), false);
    xhr.send(null);
    var manifest = JSON.parse(xhr.responseText);
    return manifest.version;
}

if (!localStorage.restore){
	createRestorePoint();
}

//listens for requsts from popup then runs the appropriate function
chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
        console.log("received message " + request.type);
        switch (request.type) {
            case "nameSet":
            	nameSet(request.index, request.name);
            	break;
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
                user = new User(localStorage, request.username, request.password)
            	sendResponse({ success: login(user,
                                              request.portSession,
                                              request.doNotInclude,
                                              request.merge) });
            	return; // return since the response is sent here
            case "logout":
            	sendResponse({ success: logout(false, request.notApply,
            								   request.doNotInclude, request.sync) });
            	return; // return since the response is sent here
            case "isLoggedIn":
                sendResponse({ result: user.loggedIn,
            				   username: user.username });
            	return; // return since the response is sent here
            case "sync":
            	syncNow();
            	return;
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
function login(user, portSession, doNotInclude, merge) {
	receiveData(function() {
		var s = new session();
		user.successfullyLoggedIn();
		console.log("user logged in");
		s.updateAll(function() {
			localStorage.setItem("oldSession", s.serialize());
		}, doNotInclude);
	}, true, portSession, doNotInclude, undefined, merge);

	if (!user.loggedIn)
		return false;

	autoSendDataAndIdleListener();
	return true;
}

function sendDataIfNeeded() {
	console.log("sendDataIfNeeded was called after " + user.elapsedSinceLastSync());
	user.synced();
	var s = new session();
	chrome.idle.queryState(idleInterval, function(state) {
		if (state == "idle")
			return;
		//session is active
		//checking if something has changed since the last sync
		s.updateAll(function() {
			if ( JSON.stringify(s.info) != JSON.stringify(current.info) ) {
				sendData();
			}
		});
	});
};

//setting up automatic data sending
function autoSendData() {
	// sending data to server every fixed number of minutes
	sendDataIntervalId = setInterval(sendDataIfNeeded, sendInterval);
}

function syncNow() {
    //removing listener
	clearInterval(sendDataIntervalId);
	sendDataIfNeeded();
	//adding listener
	autoSendData();
}

function autoSendDataAndIdleListener() {
	autoSendData();
	//sending data when the browser is no longer in the idle state
	chrome.idle.onStateChanged.addListener(idleListener);
}

//used to add and remove listeners
function idleListener() {
	sendData();
}

//logs out the user, but sends the session to the server before then
function logout(dataDeleted, notApply, doNotInclude, sync) {
	chrome.idle.onStateChanged.removeListener(idleListener);
	clearInterval(sendDataIntervalId);
	var callback = function() {
		var old = new session();
		old.deSerialize(localStorage.getItem("oldSession"));
		current = old;
		if (!notApply)
			old.applyAll(null, doNotInclude);
		user.clear();
		user = undefined;
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

//sends the data from the current session to the server
function sendData(callback, doNotInclude, sync) {
    var serial = localStorage.serial;
    var version = localStorage.version;
    var MDK = user.MDK;
    var password = user.password;
    var username = user.username;
	console.log("in sendData");
	if (!user.loggedIn) {
		console.log("user not logged in send data cancelled");
		if (callback)
			callback();
		return;
	}
	console.log("serial " + localStorage.serial);
	current.updateAll(function() {
		try {
		    if (callback)
        		callback();
			var dataToSend = current.serialize();
			//compression then converted to a string from a byte array
			dataToSend = Iuppiter.Base64.encode(Iuppiter.compress(dataToSend), true);
        	
			// adding meta data to compressed versions
			var jsonDataToSend = {};
			jsonDataToSend.data = dataToSend;
			jsonDataToSend.compressed = true;
        	
			var encryptedData = tools.encrypt(JSON.stringify(jsonDataToSend), MDK);
			console.log("encrypted data length = " + encryptedData.length);
			$.ajax({
				type: "POST",
				//since the server receives the data
				url: server + "/ReceiveData",
				cache: false,
				async: !sync,
				timeout: 30000,
				data: {
					user: username,
					pass: password,
					serial: serial,
					version: version,
					dataFromClient: encryptedData
				},
				success: function(data) {
					if ($.trim(data).toLowerCase() == "received") {
						console.log("data from server: " + data);
					} else if (data != "" && data.charAt(0) == '{') { //means there was a conflict
						console.log("conflict - update rejected");
						var answer = confirm("looks like the cloud has more up-to-date data." +
						" would you like to load the windows from the cloud?");
						if (answer) {
							try {
								current.deSerializeAndApply(
									getDecompressedData(
										tools.decrypt(JSON.parse(data).info, MDK)
									)
								);
							} catch (err) {
								console.log("wasn't a JSON");
							}
						}
					} else {//probably means the network is down
						console.log("probably network down");
						current.deSerialize();
						//so update will happen next time even if nothing has changed
					}
				},
				error: function(error) {
					errorFunction(error);
				}
			});
		} catch(err) {
			console.log("ERROR: " + err);
			sendErrorToServer(err, "in send data");
		}
	}, doNotInclude);
}

//sends an error message to the server, with the error err, and the place where it occurred place
function sendErrorToServer(err, place) {
	$.ajax({
		url: server + "/Error",
		cache: false,
		data: {
			user: localStorage.getItem("username"),
			error: place + " error: " + err
		}
	});
}

function getRandomSerial() { return Math.floor(Math.random()*100000); }

//asks the server for the data for the specific user and then 
//sets the data as the current session. Username and password are sent again.
function receiveData(successCallback, sync, portSession,
	doNotInclude, notApply, merge) {
	console.log("in receiveData");
	if (!localStorage.serial)
		localStorage.serial = getRandomSerial();
	$.ajax({
		//since the server sends the data
		url: server + "/SendData",
		async: !sync,
		data: {
			user: user.username,
			pass: user.password,
			version: localStorage.version,
			serial: localStorage.serial
		},
		success: function(data) {
			if (notApply)
				return;
			try {
				data = JSON.parse(data);
			} catch (err) {
				console.log("wasn't a JSON");
				sendErrorToServer("data received from server wasn't a json", "in receiveData");
				return;
			}
			try {
				user.setMDK(data.salt);
				data.info = tools.decrypt(data.info, user.MDK);
				data.info = getDecompressedData(data.info);
				if (successCallback)
					successCallback();
				if (portSession)
					return;
				current.deSerializeAndApply(data.info, doNotInclude, merge);
				console.log("length in receivedata ****** " + current.info.windows.length);
				localStorage.setItem("tooManyTries", "false");
			} catch(err) {
				sendErrorToServer(err, "in receiveData");
			}
		},
		error: function(error) {
			localStorage.setItem("tooManyTries", "false");
			errorFunction(error);
			console.log(error);
			if (error.status == 403) {
				time = error.responseText.substr(error.responseText.indexOf(':') + 1);
				localStorage.setItem("tooManyTries", "true");
				localStorage.setItem("waitTime", time)
			}
		}
	});
}

//decompresses the data if is was compressed beforehand otherwise the data is returns unmodified
function getDecompressedData(dataCompressedOrNot) {
    if (dataCompressedOrNot == "") return "";
	try {
		var json = JSON.parse(dataCompressedOrNot);
		if (json.compressed) {
		//decompress the data by first converting to byte array then base62
			var s =  Iuppiter.decompress(Iuppiter.Base64.decode(
						Iuppiter.toByteArray(json.data), true));
			//bit of a hack but for some reason this process adds two empty chars at the end of the
			//string which makes it fail when parsing
			console.log("data decompressed successfully");
			return s.substring(0, 1 + s.lastIndexOf('}'))
		}
		//otherwise the data is not compressed
		console.log("data was a json but not compressed");
		return dataCompressedOrNot;
	} catch(err) {
		console.log("error - data was not a json");
		sendErrorToServer(err, "in getDecompressedData");
		return dataCompressedOrNot;
	}
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
			user: user.username,
			pass: username.password
		},
		complete: function(data) { 
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

function nameSet(index, name) {
	current.nameSet(index, name);
}