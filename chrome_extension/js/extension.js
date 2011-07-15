/*
 * This class represents the extension, it contains information about the extension such as version number and
 * restore options
 */

/*
 * the ctor for the class
 * @backup
 *  the backup option for the class, usually localStorage
 */
var Extension = function(backup) {
    if (!(this instanceof Extension)) //in case this was called as a function rather than a cons
        return new Extension(backup);
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

/*
 * gets the version number of the extension
 */
Extension.prototype.getVersion = function() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', chrome.extension.getURL('manifest.json'), false);
    xhr.send(null);
    var manifest = JSON.parse(xhr.responseText);
    return manifest.version;
}

/*
 * creates a restore point and saves it in backup
 */
Extension.prototype.createRestorePoint = function() {
    var self = this;
    var restoreSession = new session();
	restoreSession.updateAll(function() {
		self.backup.restore = restoreSession.serialize();
		console.log("restore point was created");
	});
}

/*
 * goes to the restore point
 */
Extension.prototype.doRestore = function() {
    var s = new session();
	s.deSerializeAndApply(this.backup.restore);
}

/*
 * generates a random number berween 0 and 100,000
 */
Extension.prototype.getRandomSerial = function() {
    return Math.floor(Math.random()*100000);
}