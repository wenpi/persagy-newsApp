var mongo = require('./db');
var ObjectID = require('mongodb').ObjectID;
var moment = require('moment');
var EventProxy = require('eventproxy');
var User = require('./users');

function News(news) {
	this.sign = news.sign || '';
	this.title = news.title || '';
	this.unit = news.unit || '';
	this.subtitle = news.subtitle || '';
	this.text = news.text || '';
	this.listeners = [];
	this.date = '';
	this.month = '';
	this.day = '';
	this.isDel = false;
	this.isPub = false;
}

module.exports = News;

/*
{
	"listeners":{ "$elemMatch":{ "$gt":200,"$lt":300 }}
}
 */

News.prototype.save = function(callback) {
	var time = this.date ? moment(this.date) : moment(),
		post = {
			sign: this.sign,
			title: this.title,
			unit: this.unit,
			subtitle: this.subtitle,
			text: this.text,
			date: time.format("YYYY-MM-DD HH:mm:ss"),
			month: time.format("YYYY-MM"),
			day: time.format("YYYY-MM-DD")
		};
	mongo.open(function(err, db) {
		if (err) {
			return callback(err);
		}

		db.collection("news", function(err, collection) {
			if (err) {
				mongo.close();
				return callback(err);
			}
			collection.insert(post, {
				safe: true
			}, function(err) {
				mongo.close();
				if (err) {
					return callback(err);
				}
				callback(null);
			});
		});
	});
};

News.getList = function(isPub, callback) {
	mongo.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection("news", function(err, collection) {
			if (err) {
				mongo.close();
				return callback(err);
			}
			var query = {
				isDel: false,
				isPub: isPub
			};
			collection.find(query).sort({
				date: -1
			}).toArray(function(err, docs) {
				mongo.close();
				if (err) {
					return callback(err);
				}
				callback(null, docs);
			});
		});
	});
};

News.get = function(id, callback) {
	var ep;
	if (id) {
		ep = EventProxy.create("news", "users", function(news, users) {
			news.users = users;
			mongo.close();
			console.dir(news);
			console.dir(news.users.length);
			callback(null, news);
		});
		mongo.open(function(err, db) {
			if (err) {
				return callback(err);
			}
			db.collection("news", function(err, collection) {
				if (err) {
					mongo.close();
					return callback(err);
				}
				collection.findOne({
					_id: ObjectID(id)
				}, function(err, doc) {
					if (err) {
						return callback(err);
					}
					ep.emit("news", doc);
				});
			});
			db.collection('users', function(error, collection) {
				if (error) {
					mongo.close();
					return callback(error);
				}
				//todo 只查name和id
				/**/
				collection.find().sort({
					userid: -1
				}).toArray(function(err, users) {
					if (error) {
						return callback(error);
					}
					ep.emit("users", sortGroup(users));
				});
			});
		});
	} else {
		callback(null, new News({}));
	}
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
		idStr = "0000" + user.userid.substring(4, 5) + "00000000";
		if (!tempObj[idStr]) {
			tempObj[idStr] = [];
		}
		if (user.userid.slice(-4) !== "0000") {
			tempObj[idStr].push({
				name: user.name,
				userid: user.userid
			});
		} else {

		}
	}
	for (key in tempObj) {
		result.push(tempObj[key]);
	}
	return result;
}