/*
 * This is the Background class it uses 
 */

var Background = function(backup) {
    if (!(this instanceof Background)) //in case this was called as a function rather than a cons
        return new Background(backup);

    this.backup = backup;

    //used to hold the current Session
    this.current = new Session();
    this.extension = new Extension(backup);
    this.user = new User(backup);

    this.sendDataIntervalId;
    this.user.createUserFromBackup();
    if (this.user.loggedIn) {
        this.autoSendDataAndIdleListener();
        this.current.updateAll();
    }
    this.setListeners();
}


/*
 * listens for requsts from popup then runs the appropriate function
 */
Background.prototype.setListeners = function() {
    var self = this;
    chrome.extension.onRequest.addListener(
        function(request, sender, sendResponse) {
            console.log("received message " + request.type);
            switch (request.type) {
                case "nameSet":
                    self.current.nameSet(request.index, request.name);
                    break;
                case "saveNewWindowsSet":
                    self.current.saveNewWindowsSet();
                    self.sendData();
                    break;
                case "deleteWindowsSet":
                    self.current.deleteWindowsSet(request.index);
                    break;
                case "applyWindowsSet":
                    self.current.applyWindowsSet(request.index);
                    break;
                case "getWindowsSets":
                    sendResponse({ result: self.current.getWindowsSets() });
                    return;
                case "deleteFromServer":
                    sendResponse({ result:
                        self.deleteFromServer(request.doNotInclude, request.sync) });
                    return;
                case "createRestore":
                    self.extension.createRestorePoint();
                    break;
                case "doRestore":
                    self.extension.doRestore();
                    break;
                case "login":
                    self.user = new User(localStorage, request.username, request.password)
                    sendResponse({ success: self.login(self.user,
                                                       request.portSession,
                                                       request.doNotInclude,
                                                       request.merge) });
                    return; // return since the response is sent here
                case "logout":
                    sendResponse({ success: self.logout(false, request.notApply,
                                                   request.doNotInclude, request.sync) });
                    return; // return since the response is sent here
                case "isLoggedIn":
                    sendResponse({ result: self.user.loggedIn,
                                   username: self.user.username });
                    return; // return since the response is sent here
                case "sync":
                    self.syncNow();
                    return;
                case "testing":
                //converting the string function into a function and running it
                    var f = eval("(" + request.stringFunction + ")");
                    f();
                    break;
                default:
                    console.log("ERROR: got an ill typed message");
            }
            sendResponse({});
        }
    );
}

//this function authenticates the user. Once the user is authenticated it updates the
//Session to the one the user has on the server
Background.prototype.login = function(user, portSession, doNotInclude, merge) {
    var self = this;
    self.receiveData(function() {
        var s = new Session();
        self.user.successfullyLoggedIn();
        console.log("user logged in");
        s.updateAll(function() {
            self.backup.setItem("oldSession", s.serialize()); //move this somewhere
        }, doNotInclude);
    }, true, portSession, doNotInclude, undefined, merge);

    if (!self.user.loggedIn)
        return false;

    self.autoSendDataAndIdleListener();
    return true;
}

Background.prototype.sendDataIfNeeded = function() {
    var self = this;
    console.log("sendDataIfNeeded was called after " + self.user.elapsedSinceLastSync());
    self.user.synced();
    var s = new Session();
    chrome.idle.queryState(self.extension.idleInterval, function(state) {
        if (state == "idle")
            return;
        //Session is active
        //checking if something has changed since the last sync
        s.updateAll(function() {
            if (JSON.stringify(s.info) != JSON.stringify(self.current.info) ) {
                self.sendData();
            }
        });
    });
};

//setting up automatic data sending
Background.prototype.autoSendData = function() {
    // sending data to server every fixed number of minutes
    this.sendDataIntervalId = setInterval(this.sendDataIfNeeded, this.extension.sendInterval);
}

Background.prototype.syncNow = function() {
    //removing listener
    clearInterval(this.sendDataIntervalId);
    this.sendDataIfNeeded();
    //adding listener
    this.autoSendData();
}

Background.prototype.autoSendDataAndIdleListener = function() {
    this.autoSendData();
    //sending data when the browser is no longer in the idle state
    chrome.idle.onStateChanged.addListener(this.idleListener);
}

//used to add and remove listeners
Background.prototype.idleListener = function() {
    this.sendData();
}

//logs out the user, but sends the Session to the server before then
Background.prototype.logout = function(dataDeleted, notApply, doNotInclude, sync) {
    var self = this;
    chrome.idle.onStateChanged.removeListener(self.idleListener);
    clearInterval(self.sendDataIntervalId);
    var callback = function() {
        var old = new Session();
        old.deSerialize(localStorage.getItem("oldSession")); //todo: move this
        self.current = old;
        if (!notApply)
            old.applyAll(null, doNotInclude);
        self.user.clear();
    };
    if (dataDeleted)
        callback();
    else
        self.sendData(callback, doNotInclude, sync);
    console.log("user logged out");
    return true;
}

//this function is called when an ajax request has resulted in an error
//prints out error message
Background.prototype.errorFunction = function(request) {
    //TODO: maybe add more functionality to this
    console.log(request.status + ": " + request.statusText);
}

//sends the data from the current Session to the server
Background.prototype.sendData = function(callback, doNotInclude, sync) {
    var self = this;
    var MDK = self.user.MDK;
    var password = self.user.password;
    var username = self.user.username;
    console.log("in sendData");
    if (!self.user.loggedIn) {
        console.log("user not logged in send data cancelled");
        if (callback)
            callback();
        return;
    }
    self.current.updateAll(function() {
        try {
            if (callback)
                callback();
            var dataToSend = self.current.serialize();
            //compression then converted to a string from a byte array
            dataToSend = Iuppiter.Base64.encode(Iuppiter.compress(dataToSend), true);
            
            // adding meta data to compressed versions
            var jsonDataToSend = {};
            jsonDataToSend.data = dataToSend;
            jsonDataToSend.compressed = true;
            
            var encryptedData = tools.encrypt(JSON.stringify(jsonDataToSend), MDK);
            console.log("encrypted data length = " + encryptedData.length);
            $.ajax({
                type: "POST",
                //since the server receives the data
                url: server + "/ReceiveData",
                cache: false,
                async: !sync,
                timeout: 30000,
                data: {
                    user: username,
                    pass: password,
                    serial: self.extension.serial,
                    version: self.extension.version,
                    dataFromClient: encryptedData
                },
                success: function(data) {
                    if ($.trim(data).toLowerCase() == "received")
                        console.log("data from server: " + data);
                    else if (data != "" && data.charAt(0) == '{') { //means there was a conflict
                        console.log("conflict - update rejected");
                        var answer = confirm("looks like the cloud has more up-to-date data." +
                        " would you like to load the windows from the cloud?");
                        if (answer) {
                            try {
                                self.current.deSerializeAndApply(
                                    self.getDecompressedData(
                                        tools.decrypt(JSON.parse(data).info, MDK)
                                    )
                                );
                            } catch (err) {
                                console.log("wasn't a JSON");
                            }
                        }
                    } else {//probably means the network is down
                        console.log("probably network down");
                        self.current.deSerialize();
                        //so update will happen next time even if nothing has changed
                    }
                },
                error: function(error) {
                    self.errorFunction(error);
                }
            });
        } catch(err) {
            console.log("ERROR: " + err);
            self.sendErrorToServer(err, "in send data");
        }
    }, doNotInclude);
}

//sends an error message to the server, with the error err, and the place where it occurred place
Background.prototype.sendErrorToServer = function(err, place) {
    console.log("ERROR: " + err + " place " + place);
    var self = this;
    $.ajax({
        url: server + "/Error",
        cache: false,
        data: {
            user: self.user.username,
            error: place + " error: " + err
        }
    });
}

//asks the server for the data for the specific user and then 
//sets the data as the current Session. Username and password are sent again.
Background.prototype.receiveData = function(successCallback, sync, portSession,
        doNotInclude, notApply, merge) {
    var self = this;
    console.log("in receiveData");
    $.ajax({
        //since the server sends the data
        url: server + "/SendData",
        async: !sync,
        data: {
            user: self.user.username,
            pass: self.user.password,
            version: self.extension.version,
            serial: self.extension.serial
        },
        success: function(data) {
            if (notApply)
                return;
            try {
                data = JSON.parse(data);
            } catch (err) {
                console.log("wasn't a JSON");
                self.sendErrorToServer("data received from server wasn't a json", "in receiveData");
                return;
            }
            try {
                self.user.setMDK(data.salt);
                data.info = tools.decrypt(data.info, self.user.MDK);
                data.info = self.getDecompressedData(data.info);
                if (successCallback)
                    successCallback();
                if (portSession)
                    return;
                self.current.deSerializeAndApply(data.info, doNotInclude, merge);
                console.log("length in receivedata ****** " + self.current.info.windows.length);
                self.tooManyTries = false;
            } catch(err) {
                self.sendErrorToServer(err, "in receiveData");
            }
        },
        error: function(error) {
            self.tooManyTries = false;
            self.errorFunction(error);
            console.log(error);
            if (error.status == 403) {
                time = error.responseText.substr(error.responseText.indexOf(':') + 1);
                self.tooManyTries = true;
                self.waitTime = time;
            }
        }
    });
}

//decompresses the data if is was compressed beforehand otherwise the data is returns unmodified
Background.prototype.getDecompressedData = function(dataCompressedOrNot) {
    var self = this;
    if (dataCompressedOrNot == "") return "";
    try {
        var json = JSON.parse(dataCompressedOrNot);
        if (json.compressed) {
        //decompress the data by first converting to byte array then base62
            var s =  Iuppiter.decompress(Iuppiter.Base64.decode(
                        Iuppiter.toByteArray(json.data), true));
            //bit of a hack but for some reason this process adds two empty chars at the end of the
            //string which makes it fail when parsing
            console.log("data decompressed successfully");
            return s.substring(0, 1 + s.lastIndexOf('}'))
        }
        //otherwise the data is not compressed
        console.log("data was a json but not compressed");
        return dataCompressedOrNot;
    } catch(err) {
        console.log("error - data was not a json");
        self.sendErrorToServer(err, "in getDecompressedData");
        return dataCompressedOrNot;
    }
}

//deletes all information from the server.
Background.prototype.deleteFromServer = function(doNotInclude, sync) {
    var self = this;
    if (!self.user.loggedIn)
        return false;
    $.ajax({
        url: server + "/DeleteCookiesFromServer",
        cache: false,
        async: !sync,
        data: {
            user: self.user.username,
            pass: self.user.password
        },
        complete: function(data) { 
            self.logout(true, null, doNotInclude);
        },
        error: self.errorFunction
    });
    return true;
}

var background = new Background(localStorage);