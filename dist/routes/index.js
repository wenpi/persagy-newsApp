/*
 * GET home page.
 */
var News = require("../models/news.js");
var User = require('../models/users.js');

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
		News.get(req.query.id, function(err, news, groups) {
			if (err) {
				news = {};
			}
			res.render('edit', {
				title: '添加编辑',
				name: 'edit',
				news: news,
				groups: groups
			});
		});
	});

	app.get('/appGet', function(req, res) {

	});

	app.post('/login', function(req, res) {
		User.get(req.body.username, function(err, user) {
			// var md5 = crypto.createHash('md5'),
			//     password = md5.update(req.body.password).digest('hex');
			console.dir(req.body);
			console.log('username:', req.body.username);
			console.log('password:', req.body.password);

			var result = {
				msg: null,
				code: '0000',
				successful: true,
				message: null
			};
			if (err) {
				result.msg = err;
				result.code = null;
			} else if (!user) {
				result.successful = false;
				result.message = '用户名不存在';
			} else if (user.userpwd !== req.body.password) {
				result.successful = false;
				result.message = '密码错误';
			} else {
				result.successful = true;
				result.code = '0000';
			}
			res.send(result);
		});
	});
};