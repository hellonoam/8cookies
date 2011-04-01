var inputArr;

function autoLogin(start) {
	tools.deleteCookies();
	if (!input) {
		throw "input wasn't not detected";
		return;
	}
	inputArr = input.split('\n');
	$(inputArr).each(function(index, value) {
		inputArr[index] = value.split("	");
		start = parseInt(start);
		if (index < start+10 && index >= start) {
			loginToArray(index);
			// sleep(5000); //doesn't help
		}
	});
}

function loginToArray(index){
	loginTo(inputArr[index][3], inputArr[index][2], inputArr[index][1]);
}

function open(index) {
	chrome.tabs.create({ url: inputArr[index][3] });
}

function loginTo(url, username, password) {
	console.log(url);
	chrome.tabs.create({ url: url }, function(tab) {
		inject(tab.id, "doLogin('" + username + "', '" + password + "')");
		console.log("tab id " + tab.id);
	});
}

function inject(tabId, string) {
	chrome.tabs.executeScript(tabId, {
		code: string
	});
}

function sleep(millis) {
	var date = new Date();
	var curDate = null;
	do { curDate = new Date(); }
	while(curDate-date < millis);
}