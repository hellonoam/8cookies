function init() {
	chrome.extension.sendRequest({ type: "getWindowsSets" }, function(response) {
		sets = JSON.parse(response.result);
		if (sets.length == 1)
			$("table").append("no states were found");
		$(sets).each(function(index, value){
			//since 0 is the current sets
			if (index > 0) {
				var s = "";
				$(value).each(function(index2, value2) {
					s += "for window " + (index2+1) + " there are " +
						  value2.tabs.length + " tabs <br/>";
				});
				$("table").append(
					"<tr id='tr" + index + "'><td>" +
						index + ") " + value.length + " windows <br/>" + s +
						"<input type='button' class='open' id='" + index + "' value='open'>" +
						"<input type='button' class='delete' id='" + index + "' value='delete'>" +
					"</td></tr>"
				);
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