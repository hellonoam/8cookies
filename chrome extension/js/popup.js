$(document).ready(function() { init(); });

function userLoggedIn(username) {
	$(".login").hide();
	$(".username").hide();
	$(".usernameDiv").hide();
	$(".password").hide();
	$(".passwordDiv").hide();
	$(".logout").show();
	$(".loggedInUser").text(username);
}

function userLoggedOut() {
	$(".login").show();
	$(".username").show();
	$(".usernameDiv").show();
	$(".password").show();
	$(".passwordDiv").show();
	$(".logout").hide();
	$(".loggedInUser").text("");
}

function init() {
	chrome.extension.sendRequest(
		{ type: "isLoggedIn" }, 
		function(response) {
			if (response.result)
				userLoggedIn(response.username);
			else
				userLoggedOut();
		}
	);
	$(".login").click(function() {
		console.log("request to login, sent to bg");
		chrome.extension.sendRequest(
			{
				type: "login",
				username: $(".username").val(),
				password: $(".password").val()
			},
			function(response) {
				console.log(response.success)
				if (response.success)
					userLoggedIn($(".username").val());
			}
		);
	});
	$(".logout").click(function() {
		console.log("request to logout, sent to bg");
		chrome.extension.sendRequest({ type: "logout" });
		userLoggedOut();
	});
	$(".deleteFromServer").click(function() {
		console.log("request to delete from server, sent to bg");
		chrome.extension.sendRequest({ type: "deleteFromServer" });
	});
	$(".signup").click(function() {
		chrome.tabs.create({url:chrome.extension.getURL('signup.html')});
	});
}
