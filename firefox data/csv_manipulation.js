var csv = require('csv');
var fs = require('fs');

/*
 * Manipulates a csv file and pastes the result in another csv file
 * Gets the result of the firefox experiment and calculates the average of tabs each user has
 */
function csvMan(){
	var self = this;
	self.sumOfTabs = [];
	self.tabsEvents = [];
	self.userAvg = [];
	self.maxTabs = [];
	self.doMaxTabs();
};

/*
 * appends the appropriate functions to the csv object to find max number of tabs
 */
csvMan.prototype.doMaxTabs = function() {
	var self = this;
	csv()
		.fromPath('./witl_large/events.csv')
		// .toPath('./sample.csv')
		.transform(function(data,index) {
			if (index % 100000 == 0)
				console.log(index);
			self.onTransformMaxTabs(data);
		})
		.on('error',function(error) {
		    console.log(error.message);
		})
		.on('end',function(count) {
			console.log('Number of lines: '+count);
			var temp = [];
			self.maxTabs.forEach(function(val, index) {if (val && val != null) temp.push(val); });
			self.maxTabs = temp;
		    self.writeArrayToFile("maxTabs.csv", self.maxTabs);
		});
}

/*
 * gets an event of a user, if it's a tabs event it checks if it's the max and if so updates maxTabs
 */
csvMan.prototype.onTransformMaxTabs = function(data) {
	var self = this;

	if (data[1] == '26') {
		var str = data[3];
		var numOfTabs = parseInt(str.substring(0, str.indexOf(' ')));
		//setting the values
		if (!self.maxTabs[data[0]] || self.maxTabs[data[0]] < numOfTabs)
			self.maxTabs[data[0]] = numOfTabs;
	}
}

/*
 * appends the appropriate functions to the csv object to find avg number of tabs
 */
csvMan.prototype.doAvgTabs = function() {
	var self = this;
	csv()
		.fromPath('./witl_large/events.csv')
		// .toPath('./sample.csv')
		.transform(function(data,index) {
			if (index % 100000 == 0)
				console.log(index);
			self.onTransform(data);
		})
		.on('error',function(error) {
		    console.log(error.message);
		})
		.on('end',function(count) {
			console.log('Number of lines: '+count);
		    self.onEnd("avgTabs.csv");
		});
};

/*
 * gets an event of a user. if it's the tabs event it is add to the sum
 */
csvMan.prototype.onTransform = function(data) {
	var self = this;

	if (data[1] == '26') {
		//setting the value to zero
		if (!self.sumOfTabs[data[0]]) {
			self.sumOfTabs[data[0]] = 0;
			self.tabsEvents[data[0]] = 0;
		}
		var str = data[3];
		self.sumOfTabs[data[0]] += parseInt(str.substring(0, str.indexOf(' ')))
		self.tabsEvents[data[0]]++;
	}
}

/*
 * calculates the average number of tabs per user. writes it to the array and then dumps it to file
 */
csvMan.prototype.onEnd = function(file) {
	var self = this;
	for (var i=0; i<self.sumOfTabs.length; i++) {
		if (self.sumOfTabs[i] != null && self.tabsEvents[i] != null)
			self.userAvg.push(self.sumOfTabs[i] / self.tabsEvents[i]);
	}
	self.writeArrayToFile(file, self.userAvg);
}

/*
 * writes the array to the file
 */
csvMan.prototype.writeArrayToFile = function(file, array) {
	fs.open("./" + file, "w+", undefined, function(err, fd) {
		if (err) return console.log(err);
		fs.write(fd, array);
	});
}


var csvMan = new csvMan();