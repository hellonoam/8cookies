function doLogin(username, password){
	setElementValue($("input[type=text]"), username);
	setElementValue($("input[type=email]"), username);
	setElementValue($("#username"), username);
	setElementValue($(".username"), username);
	setElementValue($("input[type=password]"), password);
	setElementValue($(".password"), password)
	setTimeout(function() {
		var form = $("form");
		if (form)
			form.submit();
		var button = $("input[type=submit]");
		if (button)
			button.click();
	}, 1000);
}

function setElementValue(element, value) {
	if (element)
		element.val(value);
}