var mongo = require('./db');
var ObjectID = require('mongodb').ObjectID;
var moment = require('moment');
var EventProxy = require('eventproxy');
var User = require('./users');
var Group = require('./groups');

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
		ep = EventProxy.create("news", "groups", function(news, groups) {
			mongo.close();
			console.dir(news);
			console.dir(groups);
			callback(null, news, groups);
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
			Group.get(db, function(err, groups) {
				if (err) {
					return callback(err);
				}
				ep.emit("groups", groups);
			});
		});
	} else {
		callback(null, new News({}));
	}
};