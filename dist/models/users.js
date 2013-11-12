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

// User.getAll = function(callback) {
// 	mongo.open(function(error, db) {
// 		if (error) {
// 			return callback(error);
// 		}
// 		db.collection('users', function(error, collection) {
// 			if (error) {
// 				mongo.close();
// 				return callback(error);
// 			}
// 			//todo 只查name和id
// 			collection.find({}).sort({
// 				id: -1
// 			}).toArray(function(err, users) {
// 				mongo.close();
// 				if (error) {
// 					return callback(error);
// 				}
// 				callback(null, sortGroup(users));
// 			});;
// 		});
// 	});
// };