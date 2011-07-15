var Extension = function(backup) {
    this.version = this.getVersion();
    this.backup = backup;
    if (!this.backup.restore)
    	this.createRestorePoint();
    if (!this.backup.serial)
        this.backup.serial = this.getRandomSerial();
    this.serial = this.backup.serial;
    //interval for sending data and when does the browser move to the idle state
    this.sendInterval = 300000; //300000 every 5 minutes
    this.idleInterval = 600; //600 every 10 minutes
}

Extension.prototype.getVersion = function() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', chrome.extension.getURL('manifest.json'), false);
    xhr.send(null);
    var manifest = JSON.parse(xhr.responseText);
    return manifest.version;
}

Extension.prototype.createRestorePoint = function() {
    var self = this;
    var restoreSession = new session();
	restoreSession.updateAll(function() {
		self.backup.restore = restoreSession.serialize();
		console.log("restore point was created");
	});
}

Extension.prototype.doRestore = function() {
    var s = new session();
	s.deSerializeAndApply(backup.restore);
}

Extension.prototype.getRandomSerial = function() {
    return Math.floor(Math.random()*100000);
}