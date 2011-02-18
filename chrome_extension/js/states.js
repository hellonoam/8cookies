function init() {
	chrome.extension.sendRequest({ type: "getWindowsSets" }, function(response) {
		sets = JSON.parse(response.result);
		if (sets.length == 1)
			$("table").append("no states were found");
		$(sets).each(function (index, value){
			//since 0 is the current sets
			if (index > 0) {
				temp = value;
				$("table").append(
				"<tr id='tr" + index + "'><td>" +
					index + ") number of windows: " + value.length +
					" number of tabs for the first window: " + value[0].tabs.length +
					"<input type='button' class='open' id='" + index + "' value='open'>" +
					"<input type='button' class='delete' id='" + index + "' value='delete'>" +
				"</td></tr>");
			}
		});
		$(".open").click(function(event) {
			chrome.extension.sendRequest({
				type: "applyWindowsSet",
				index: event.target.id
			});
		});
		$(".delete").click(function(event) {
			chrome.extension.sendRequest({
				type: "deleteWindowsSet",
				index: event.target.id
			}, function() { location.reload(true); });
		});
	});
}

var temp;