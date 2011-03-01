$(document).ready(function() { init(); });

function init() {
	$(".email").keypress(function(event) {
		if (event.charCode == 13)
			$("input[type='submit']").click();
	});
	$("input[type='submit']").click(function() {
		if (!validateEmail($(".email").val()))
			return;
		$(".main p").text("you'll know");
		$(".inside").hide();
		$(".main").height(50);
		$.ajax({
			url: "http://cloudbrowsing.appspot.com/BetaSignUp",
			data: { email: $(".email").val() },
			cached: false,
			dataType: "jsonp"
		});
	})
}

function validateEmail(email) {
	var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return email.match(regex);
}

