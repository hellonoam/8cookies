function init() {
	$("input[type='submit']").click(function() {
		$.ajax({
			url: server + "/betaSignUp?callback=?",
			data: { email: $(".email").val() },
			complete: function() {
				$(".mail").text("we'll let you know");
			}
		});
	})
}