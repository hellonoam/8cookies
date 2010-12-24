$(document).ready(function() { init(); });

function userLoggedIn(username) {
	$(".whenNotLoggedIn").hide();
	$(".logout").show();
	$(".loggedInUser").text(username);
}

function userLoggedOut() {
	$(".whenNotLoggedIn").show();;
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
		chrome.extension.sendRequest({
			type: "deleteFromServer",
			username: $(".username").val(),
			password: $(".password").val(),
		});
	});
	$(".signup").click(function() {
		chrome.tabs.create({url:chrome.extension.getURL('signup.html')});
	});
}
