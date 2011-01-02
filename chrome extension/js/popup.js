
function userLoggedIn(username) {
	$(".whenNotLoggedIn").hide();
	$(".loggedInUser").show();
	$(".loggedInUser p").text("hello " + username);
}

function userLoggedOut() {
	$(".whenNotLoggedIn").show();;
	$(".loggedInUser").hide();
	$(".loggedInUser p").text("");
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
				if (response.success)
					userLoggedIn($(".username").val());
				else
					$(".result").text("wrong username or password");
			}
		);
	});
	$(".logout").click(function(event) {
		event.stopPropagation(); //so delete won't be called
		console.log("request to logout, sent to bg");
		chrome.extension.sendRequest({ type: "logout" });
		userLoggedOut();
	});
	$(".deleteFromServer").click(function() {
		console.log("request to delete from server, sent to bg");
		chrome.extension.sendRequest({
			type: "deleteFromServer"
		});
	});
	$(".signup").click(function() {
		chrome.tabs.create({url:chrome.extension.getURL('signup.html')});
	});
}
