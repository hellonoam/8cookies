function loginTo(url, username, password) {
	chrome.tabs.create({ url: url }, function(tab) {
		console.log("tab was opened " + tab.id);
		chrome.tabs.executeScript(tab.id, {
			code: "doLogin('" + username + "', '" + password + "')"
		});
	});
}