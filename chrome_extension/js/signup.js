function init() {
	$(".inputText").keypress(function(event) {
		if (event.charCode == 13)
			$(".submit").click();
	});
	$(".submit").click(function() {
		if (!validateEmail($(".email").val())) {
			$(".result").text("invalid email");
			return;
		}
		if ($(".password").val().length < 6) {
			$(".result").text("password too short")
			return;
		}
		if ($(".username").val().length < 5) {
			$(".result").text("username too short")
			return;
		}
		console.log("submit was clicked");
		$(".result").text("verifying");
		$.getJSON(server + "/SignUp?callback=?",
			{
				user: $(".username").val(),
				pass: tools.getLoginToken($(".password").val(), $(".username").val()).toString(),
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
							portSession: !$(".portSession").attr("checked")
						},
						function() {
							if (!$(".portSession").attr("checked")) {
								setTimeout(function() {
									chrome.tabs.getSelected(null, function(tab) {
							    		chrome.tabs.remove(tab.id);
									});
								}, 1000);
							}
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

function validateEmail(email) {
	var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return email.match(regex);
}