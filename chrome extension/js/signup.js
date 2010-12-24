var server = "http://cloudbrowsing.appspot.com";
// var server = "http://localhost";

$(document).ready(function() { init(); });

function init() {
	$(".submit").click(function() {
		console.log("submit was clicked");
		$.getJSON(server + "/SignUp?callback=?",
			{
				user: $(".username").val(),
				pass: $(".password").val()
			},
			function(json) {
				console.log("data received: " + json);
				if (json.response == "success") {
					$(".signup").hide();
					$(".result").text("signup was successful");
					chrome.extension.sendRequest(
						{
							type: "login",
							username: $(".username").val(),
							password: $(".password").val(),
							portSession: $(".portSession").attr("checked")
						}
					);
				} else
					$(".result").text("username in use please try again");
			}
		);
	});
}