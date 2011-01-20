function getLocalhostWin() {
	var winToOpen = new Object();
	winToOpen.left = 10;
	winToOpen.top = 10;
	winToOpen.type = "normal";
	winToOpen.height = 400;
	winToOpen.incognito = false;
	winToOpen.width = 400;
	var tab = new Object();
	tab.url = "http://localhost/test.html";
	tab.selected = false;
	winToOpen.tabs = [tab, tab, tab];
	return winToOpen;
}