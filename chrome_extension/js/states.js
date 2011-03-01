function init() {
	chrome.extension.sendRequest({ type: "getWindowsSets" }, function(response) {
		sets = JSON.parse(response.result);
		if (sets.length == 1)
			$("table").append("no states were found");
		$(sets).each(function(index, value){
			//since 0 is the current sets
			temp = value;
			if (index > 0) {
				var s = "";
				$(value).each(function(index2, value2) {
					s += "in window " + (index2+1) + " there were " +
						  value2.tabs.length + " tabs <br/>";
				});
				var setName = value[0].setName? value[0].setName + " - " : "";
				$("table").append(
					"<tr id='tr" + index + "'><td>" +
						index + ") " + setName + "saved on " + value[0].savedSetDate + " had " +
						value.length + " windows <br/>" + s +
						"<input type='button' class='open' id='" + index + "' value='open'>" +
						"<input type='button' class='delete' id='" + index + "' value='delete'>" +
						"<input type='button' class='name' id='" + index + "' value='name'>" +
						"<input type='text' class='nameString" + index + "'>" +
					"</td></tr>"
				);
			}
		});
		$(".name").click(function(event) {
			chrome.extension.sendRequest({
				type: "nameSet",
				index: event.target.id,
				name: $(".nameString" + event.target.id).val()
			}, function() { location.reload(true); });
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