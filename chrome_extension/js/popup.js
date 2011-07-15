//hides and shows the appropriate things when a user is logged in
function userLoggedIn(username) {
	$(".whenNotLoggedIn").hide();
	$(".loggedInUser").show();
	$(".loggedInUser p:first").text("hello " + username);
}

//hides and shows the appropriate things when a user is logged out
function userLoggedOut() {
	$(".whenNotLoggedIn").show();;
	$(".loggedInUser").hide();
	$(".loggedInUser p:first").text("");
}

function init() {
	chrome.extension.sendRequest(
		{ type: "isLoggedIn" },
		function(response) {
		    console.log(response)
			if (response.result && response.result != "false")
				userLoggedIn(response.username);
			else
				userLoggedOut();
		}
	);

    setInterval(function() {
        $(".syncText").text("synced " + 
            chrome.extension.getBackgroundPage().user.elapsedSinceLastSync() + " ago...");
    }, 1000);

	//maps enter to submit
	$(".enter").keypress(function(event) {
		if (event.charCode == 13)
			$(".login").click();
	});

	//sends the a login request to the background page
	$(".login").click(function() {
		$(".result").text("verifying");
		console.log("request to login, sent to bg");
		chrome.extension.sendRequest(
			{
				type: "login",
				username: $(".username").val(),
				password: $(".password").val(),
				merge: $(".checkbox").attr("checked")
			},
			function(response) {
				if (response.success)
					userLoggedIn($(".username").val());
				else {
					if (localStorage.tooManyTries == "true")
						$(".result").text("too many attemps, please wait "
						  + parseInt(localStorage.waitTime)/60 + " minutes");
					else
						$(".result").text("wrong username or password");
				}
			}
		);
	});
	$(".logout").click(function(event) {
		event.stopPropagation(); //so delete won't be called // probably not needed anymore
		console.log("request to logout, sent to bg");
		chrome.extension.sendRequest({ type: "logout" });
		userLoggedOut();
	});

	//used to disable sync after the first click for the situations 
	//where someone clicks twice in a tow
	var synced = false;
	$(".syncButton").click(function() {
	    if (!synced) {
		    chrome.extension.sendRequest({ type: "sync" });
		    $(".syncButton").val("synced");
		    synced = true;
		}
	});

	var showed = false;
	$(".showStates").click(function() {
	    if (!showed)
		    chrome.tabs.create({url:chrome.extension.getURL('states.html')});
		showed = true;
	});

	var saved = false;
	$(".saveState").click(function() {
	    if (!saved) {
		    chrome.extension.sendRequest({ type: "saveNewWindowsSet" });
		    $(".saveState").val("saved!");
		    saved = true;
	    }
	});
	$(".signup").click(function() {
		chrome.tabs.create({url:chrome.extension.getURL('signup.html')});
	});
}
