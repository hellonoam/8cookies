function init() {
	$(".createRestore").click(function(){
		chrome.extension.sendRequest({
			type: "createRestore"
		});
		$(".result").text("restore point has been created!");
	});

	$(".doRestore").click(function() {
		chrome.extension.sendRequest({
			type: "doRestore"
		});

	});

	$(".deleteData").click(function(){
		var answer = confirm("are you sure you want to delete all your data from the server? this can't be undone.");
		if (answer) {
			chrome.extension.sendRequest({
				type: "deleteFromServer"
			}, function(data){
				if (!data.result)
					$(".result").text("you need to be logged in to delete your data");
			});
		}
	});
}