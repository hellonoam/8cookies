function doLogin(username, password){
	setElementValue($("input[type=text]"), username);
	setElementValue($("input[type=email]"), username);
	setElementValue($("#username"), username);
	setElementValue($(".username"), username);
	setElementValue($(".loginText"), username);
	setElementValue($(".login"), username);
	setElementValue($("input[type=password]"), password);
	setElementValue($(".password"), password)
	setTimeout(function() {
		var button = $("input[type=submit]");
		console.log(button);
		if (button) {
			if (button.length > 1)
				button = $("input[type=submit]").closest("input[type=password]");
			button.click();
		}
		var form = $("form");
		if (form) {
			if (form.length > 1)
				form = $("input[type=password]").closest("form");
			console.log(form);
			//timeout to make sure the other didn't work
			setTimeout(function() { form.submit(); }, 3000)
		} else
				throw "no submit found!!";
	}, 1000);
}

function setElementValue(element, value) {
	if (element)
		element.val(value);
}