var mongo = require('./db');
var moment = require('moment');

function News(news) {
	this.sign = news.sign;
	this.title = news.title;
	this.unit = news.unit;
	this.subtitle = news.subtitle;
	this.text = news.text;
	this.listeners=[];
	this.date = "";
	this.month = "";
	this.day = "";
	this.isDel = false;
	this.isPub = false;
}

module.exports = News;

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

News.getPub = function(id, callback) {
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
				isPub: true
			};
			if (id) {
				query._id = id;
			}
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

News.getUnPub = function(id, callback) {
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
				isPub: false
			};
			if (id) {
				query._id = id;
			}
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
				isPub: false
			};
			if (id) {
				query._id = id;
			}
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