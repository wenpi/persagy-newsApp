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
				groups = {};
			}
			res.render('edit', {
				title: '添加编辑',
				name: 'edit',
				news: news,
				groups: groups,
				error: req.flash('error').toString(),
				success: req.flash('success').toString()
			});
		});
	});

	app.post('/edit', function(req, res) {
		var body = req.body,
			news = new News({
				sign: body.sign,
				title: body.title,
				unit: body.unit,
				subtitle: body.subtitle,
				listeners: body.listeners,
				text: body.text,
				richText: body.richText,
				date: body.date
			});
		console.dir(body);
		news.save(function(err) {
			if (err) {
				req.flash('error', '发布失败!');
			} else {
				req.flash('success', '发布成功!');
			}
			res.redirect('/edit'); //注册成功后返回主页
		});
	});

	app.get('/newsText/:id', function(req, res) {
		News.getRichText(req.params.id, function(err, text) {
			if (err) {
				text = '操作异常';
			}
			res.render('news', {
				title: '文章正文',
				richText: text
			});
		});
	});

	app.post('/news', function(req, res) {
		News.getNews(req.body.id, function(err, doc) {
			var result = {
				msg: null,
				code: '0000',
				intertype: 'typeRequest',
				data: []
			};
			if (err) {
				result.msg = err;
				result.code = null;
			} else {
				doc.textadd = '/newsText/' + doc._id;
				result.data = doc;
			}
			res.send(result);
		});
	});

	app.post('/getNewsByDay', function(req, res) {
		News.getByDay(req.body.username, req.body.date, req.body.auto, function(err, doc) {
			var i = 0,
				result = {
					msg: null,
					code: '0000',
					intertype: 'dayRequest',
					data: []
				};

			if (err) {
				result.msg = err;
				result.code = null;
			} else {
				if (doc && doc.length !== 0) {
					for (i = 0; i < doc.length; i++) {
						doc[i].textadd = '/newsText/' + doc[i]._id;
						doc[i].date = doc[i].day;
					}
				} else {
					doc = [];
				}
				result.data = doc;
			}
			console.dir(doc);
			res.send(result);
		});
	});
	// News.getListByMonth
	app.post('/getNewsListByMonth', function(req, res) {
		News.getListByMonth(req.body.username, req.body.date, function(err, doc) {
			var result = {
				msg: null,
				code: '0000',
				intertype: 'monthRequest',
				data: []
			};
			if (err) {
				result.msg = err;
				result.code = null;
			} else {
				result.data = doc;
			}
			res.send(result);
		});
	});

	app.post('/getNewsExistByMonth', function(req, res) {
		News.getExistByMonth(req.body.username, req.body.date, function(err, doc) {
			var result = {
				msg: null,
				code: '0000',
				intertype: 'monthRequest',
				data: []
			};
			if (err) {
				result.msg = err;
				result.code = null;
			} else {
				result.data = doc;
			}
			res.send(result);
		});
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
				message: null,
				intertype: 'landing'
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
			}
			res.send(result);
		});
	});

	app.post('/password', function(req, res) {
		User.get(req.body.username, function(err, user) {
			// var md5 = crypto.createHash('md5'),
			//     password = md5.update(req.body.password).digest('hex');
			console.dir(req.body);
			console.log('username:', req.body.username);
			console.log('oldPassword:', req.body.oldPassword);

			var result = {
				msg: null,
				code: '0000',
				successful: false,
				message: null,
				intertype: 'changePassword'
			};
			if (err) {
				result.msg = err;
				result.code = null;
			} else if (user.userpwd !== req.body.oldPassword) {
				result.successful = false;
				result.message = '原密码不正确';
			} else {
				User.changePassword(req.body.username, req.body.newPassword, function() {
					if (err) {
						result.msg = err;
						result.code = null;
					} else {
						result.successful = true;
					}
					res.send(result);
				});
			}
		});
	});

	// app.post()
};