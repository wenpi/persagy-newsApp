/*
 * GET home page.
 */
var News = require("../models/news.js");

module.exports = function(app) {
	app.get('/', function(req, res) {
		News.getList(true, function(err, news) {
			if (err) {
				news = [];
			}
			res.render('published', {
				title: '已发布列表',
				name: 'published',
				news: news
			});
		});
	});

	app.get('/time', function(req, res) {
		News.getList(false, function(err, news) {
			if (err) {
				news = [];
			}
			res.render('time', {
				title: '已发布列表',
				name: 'time',
				news: news
			});
		});
	});

	app.get('/edit', function(req, res) {
		News.get(req.query.id, function(err, news) {
			if (err) {
				news = {};
			}
			res.render('edit', {
				title: '添加编辑',
				name: 'edit',
				news: news
			});
		});
	});
};