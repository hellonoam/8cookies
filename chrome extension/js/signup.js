
function init() {
	$(".submit").click(function() {
		console.log("submit was clicked");
		$.getJSON(server + "/SignUp?callback=?",
			{
				user: $(".username").val(),
				pass: $(".password").val(),
				email: $(".email").val(),
				invite: $(".invitation").val()
			},
			function(json) {
				console.log("data received: " + json);
				if (json.response == "success") {
					$(".result").text("signup was successful");
					chrome.extension.sendRequest(
						{
							type: "login",
							username: $(".username").val(),
							password: $(".password").val(),
							portSession: $(".portSession").attr("checked")
						},
						function() {
							setTimeout(function() {
								chrome.tabs.getSelected(null, function(tab) {
							    	chrome.tabs.remove(tab.id);
									// console.log(tab.id);
								});
							}, 1500);
						}
					);
				} else if (json.response == "unknown-invitation")
					$(".result").text("sorry! wrong invitation code");
				else
					$(".result").text("username in use please try again");
			}
		);
	});
}