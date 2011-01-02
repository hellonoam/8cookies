
//saves the current session
var current = new session();

//listens for requsts from popup then runs the appropriate function
chrome.extension.onRequest.addListener(
function(request, sender, sendResponse) {
	console.log("received message " + request.type);
	switch (request.type) {
		case "send": 
			sendData();
			break;
		case "receive":	
			receiveData();
			break;
		case "deleteLocal":
			deleteCookies();
			break;
		case "deleteFromServer":
			deleteFromServer();
			break;
		case "login":
			sendResponse({ success: login(request.username, 
										  request.password,
										  request.portSession) });
			return; // return since the response is sent here
		case "logout":
			sendResponse({ success: logout() });
			return; // return since the response is sent here
		case "isLoggedIn":
		    sendResponse({ result: isLoggedIn(), 
						   username: localStorage.getItem("username") });
			return; // return since the response is sent here
		default:
			console.log("ERROR: got an ill typed message from 'popup'");
	}
    sendResponse({});
});

//this function authenticates the user. Once the user is authenticated it updates the
//session to the one the user has on the server
function login(username, password, portSession) {
	if (username == "" || password == "" || !username || !password) {
		console.log("username or password not valid");
		return false;
	}

	receiveData(function() {
		var s = new session();
		s.updateAll(function() {
			localStorage.setItem("oldSession", s.serialize());
			current = new session();
			localStorage.setItem("username", username);
			localStorage.setItem("password", password);
			console.log("user logged in");
		});
	}, false, username, password, portSession);
	//TODO: some bug here
	return isLoggedIn();
}

//logs out the user, but sends the session to the server before then
function logout(dataDeleted) {
	var old = new session();
	old.deSerialize(localStorage.getItem("oldSession"));
	var callback = function() {
		old.applyAll();
		current = old;
		localStorage.setItem("username", "");
		localStorage.setItem("password", "");
	};
	if (dataDeleted)
	 	callback();
	else
		sendData(callback);
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
function sendData(callback) {
	console.log("in sendData");
	if (!isLoggedIn()) {
		console.log("user not logged in send data cancelled");
		if (callback)
			callback();
		return;
	}
	current.updateAll(function() {
		$.ajax({
			type: "POST",
			//since the server receives the data
			url: server + "/ReceiveData",
			cache: false,
			data: {	
				user: localStorage.getItem("username"),
				pass: localStorage.getItem("password"),
				dataFromClient: current.serialize()
			},
			success: function(data) {
				console.log("data from server: " + data);
			},
			complete: function() {
				if (callback)
					callback();
			},
			error: errorFunction
		});
	});
}

//asks the server for the data for the specific user and then sets the data as the current
//session. Username and password are sent again.
function receiveData(successCallback, async, username, password, portSession) {
	console.log("in receiveData");
	$.ajax({
		//since the server sends the data
		url: server + "/SendData",
		async: async,
		data: {
			user: username,
			pass: password
		},
		success: function(data) {
			successCallback();
			if (portSession && data == "") {
				console.log("no data was received");
				return; // no cookies to set
			}
			current.deSerialize(data);
			current.applyAll();
		},
		error: errorFunction
	});
}

//deletes all information from the server.
function deleteFromServer() {
	$.ajax({
		url: server + "/DeleteCookiesFromServer",
		cache: false,
		data: {
			user: localStorage.getItem("username"),
			pass: localStorage.getItem("password")
		},
		success: function(data) { 
			logout(true);
			console.log(data);	
		},
		error: errorFunction
	});
}
