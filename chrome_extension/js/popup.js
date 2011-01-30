
function userLoggedIn(username) {
	$(".whenNotLoggedIn").hide();
	$(".loggedInUser").show();
	$(".loggedInUser p:first").text("hello " + username);
}

function userLoggedOut() {
	$(".whenNotLoggedIn").show();;
	$(".loggedInUser").hide();
	$(".loggedInUser p:first").text("");
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
				password: $(".password").val(),
				merge: $(".checkbox").attr("checked")
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
	$(".fail").click(function() {
		chrome.extension.sendRequest({ type: "failedToReproduce" });
		$(".fail").hide();
		$(".failText").text("thanks, we'll try to make it producible")
	})
	$(".signup").click(function() {
		chrome.tabs.create({url:chrome.extension.getURL('signup.html')});
	});
}
