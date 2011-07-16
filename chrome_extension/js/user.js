/*
 * this is a class that reprents a user
 */
 
 /*
  * contructor for user
  */
var User = function(backup, username, nakedPass) {
    if (!(this instanceof User)) //in case this was called as a function rather than a cons
        return new User(backup, username, nakedPass);

    this.backup = backup;
    this.username = username;
    this.nakedPass = nakedPass;
    this.paused = false;
    this.password = tools.getLoginToken(this.nakedPass, this.username).toString();
    this.windows;
    this.lastSync = new Date();
    this.loggedIn = false;
    //so the backup won't be overwritted with undefined values
    if (username)
        this.createBackup();
}

/*
 * creates the user from the backup
 */
User.prototype.createUserFromBackup = function() {
    this.password = this.backup.password;
    this.username = this.backup.username;
    this.nakedPass = this.backup.nakedPass;
    this.loggedIn = this.backup.loggedIn == "true";
    this.windows = this.backup.windows;  
    this.paused = this.backup.paused == "true";
    if (this.backup.MDK && this.backup.MDK != "undefined")
        this.MDK = JSON.parse(this.backup.MDK);
}

/*
 * creates a backup for the user
 * by writing the fields of the user to 'backup'
 * @item 
 *  if only one item needs to be backed up then it is passed
 *  if it's undefined all fields are backup up.
 */
User.prototype.createBackup = function(item) {
    var self = this;
    var stringArr = ["username", "password", "MDK", "windows", "nakedPass", "loggedIn", "paused"];
    var argArr = [this.username, this.password, JSON.stringify(this.MDK),
                  this.windows, this.nakedPass, this.loggedIn, this.paused];
    stringArr.forEach(function(value, index) {
        if (!item || item == value)
            self.backup.setItem(value, argArr[index]);
    });
}

/*
 * removes any traces of the user
 */
User.prototype.clear = function(backup) {
    var self = this;
    ["username", "password", "MDK", "windows", "nakedPass", "loggedIn", "paused"].forEach(
        function(value, index) {
            self.backup.removeItem(value);
            self[value] = undefined;
        }
    );
}

/*
 * changes the state of sync for the user from pause to continue and vice versa
 */
User.prototype.togglePaused = function() {
    this.paused = !this.paused;
    this.createBackup("paused");
}

/*
 * called when the user has been synced
 */
User.prototype.synced = function() {
    this.lastSync = new Date();
}

/*
 * calculates the time since last sync
 * @return
 *  time since last sync with 'min' or 'seconds' added
 */
User.prototype.elapsedSinceLastSync = function() {
	var time = Math.round( (new Date() - this.lastSync) / 1000 );
	if (time < 60) return "" + time + " seconds";
	return "" + Math.round(time / 60) + " mins";
}

/*
 * indicates that the user has been successfully authenticated
 */
User.prototype.successfullyLoggedIn = function() {
    this.loggedIn = true;
    this.createBackup("loggedIn");
}

/*
 * creates the MDK and saves it to the user
 * @salt
 *  the user specific salt
 */
User.prototype.setMDK = function(salt) {
    console.log("in setMDK");
    if (!this.password || this.password == "")
        throw("invalid password");
    this.MDK = tools.getMasterDataKey(this.nakedPass, salt);
    if (this.MDK == [] || this.MDK == "")
        throw("ERROR: bad MDK");
    this.createBackup("MDK");
}