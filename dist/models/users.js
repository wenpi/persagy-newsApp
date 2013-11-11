var mongo = require('./db');
var EventProxy = require('eventproxy');

function User(user) {
	this.id = user.id;
	this.name = user.name;
	this.username = user.username;
	this.userpwd = user.userpwd;
}

module.exports = User;


User.get = function(name, callback) {
	mongo.open(function(error, db) {
		if (error) {
			return callback(error);
		}
		db.collection('users', function(error, collection) {
			if (error) {
				mongo.close();
				return callback(error);
			}
			collection.findOne({
				username: name
			}, function(error, user) {
				mongo.close();
				if (error) {
					return callback(error);
				}
				callback(null, user);
			});
		});
	});
};

User.getAll = function(callback) {
	mongo.open(function(error, db) {
		if (error) {
			return callback(error);
		}
		db.collection('users', function(error, collection) {
			if (error) {
				mongo.close();
				return callback(error);
			}
			//todo 只查name和id
			collection.find({}).sort({
				id: -1
			}).toArray(function(err, users) {
				mongo.close();
				if (error) {
					return callback(error);
				}
				callback(null, sortGroup(users));
			});;
		});
	});
};

function sortGroup(users) {
	var i,
		idStr,
		user,
		key,
		result = [],
		tempObj = {};
	for (i = 0; i < users.length; i++) {
		user = users[i];
		idStr = "0000" + user.id.substring(4, 5) + "00000000";
		if (!tempObj[idStr]) {
			tempObj[idStr] = [];
		}
		if (user.id.slice(-4) !== "0000") {
			tempObj[idStr].push({
				name: user.name,
				id: user.id
			});
		}
	}
	for (key in tempObj) {
		result.push(tempObj[key]);
	}
	return result;
}