/*
 * GET home page.
 */
var News = require("../models/news.js");
var User = require('../models/users.js');
var Favorite = require("../models/favorites.js")
var EventProxy = require('eventproxy');
var fs = require('fs');

module.exports = function(app) {
  app.get('/', function(req, res) {
    News.getList(true, function(err, news) {
      if (err) {
        news = [];
      }
      res.render('published', {
        title: '已发布列表',
        name: 'published',
        news: news,
        error: req.flash('error').toString(),
        success: req.flash('success').toString()
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
        news: news,
        error: req.flash('error').toString(),
        success: req.flash('success').toString()
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
        id: req.query.id,
        error: req.flash('error').toString(),
        success: req.flash('success').toString()
      });
    });
  });


  app.post('/del', function(req, res) {
    News.del(req.body.id, function(err) {
      if (err) {
        req.flash('error', '删除失败!');
      } else {
        req.flash('success', '删除成功!');
      }
      res.send({
        success: true
      });
    });
  });


  app.post('/edit', function(req, res) {
    var body = req.body,
      news = new News({
        sign: body.sign,
        title: body.title,
        titlecolor: body.titlecolor,
        unit: body.unit,
        subtitle: body.subtitle,
        listeners: body.listeners,
        messageText: body.messageText,
        richText: body.richText,
        textPic: body.textPic,
        date: body.date
      });
    news.save(body.id, function(err) {
      if (err) {
        req.flash('error', body.id ? '编辑失败' : '发布失败!');
      } else {
        req.flash('success', body.id ? '编辑成功' : '发布成功!');
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
    console.dir(req.body);
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
      // console.dir(doc);
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

  app.post('/getFavoritesList', function(req, res) {
    Favorite.get(req.body.username, function(err, doc) {
      var result = {
        msg: null,
        code: '0000',
        intertype: 'getFavoritesList',
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

  app.post('/addFavorite', function(req, res) {
    console.dir(req.body);
    Favorite.add(req.body.username, req.body.newsId, function(err, doc) {
      var result = {
        msg: null,
        code: '0000',
        intertype: 'addFavorite',
        success: false
      };
      if (err) {
        result.msg = err;
        result.code = null;
      } else {
        result.success = true;
      }
      res.send(result);
    });
  });

  app.post('/delFavorite', function(req, res) {
    Favorite.del(req.body.username, req.body.newsId, function(err, doc) {
      var result = {
        msg: null,
        code: '0000',
        intertype: 'delFavorite',
        success: false
      };
      if (err) {
        result.msg = err;
        result.code = null;
      } else {
        result.success = true;
      }
      res.send(result);
    });
  });



  app.post('/getNewsExistByMonth', function(req, res) {
    News.getExistByMonth(req.body.username, req.body.date, function(err, doc) {
      var result = {
        msg: null,
        code: '0000',
        intertype: 'monthBooleanRequest',
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
    var result = {
      msg: null,
      code: '0000',
      successful: true,
      message: null,
      intertype: 'landing'
    };
    var ep = new EventProxy();
    ep.on("user", function(result) {
      if (result.successful) {
        News.getStartDate(req.body.username, function(err, doc) {
          if (err) {
            result.msg = err;
            result.code = null;
          } else {
            result.startDate = doc.startDate;
            result.endDate = doc.endDate;
          }
          res.send(result);
        });
      } else {
        res.send(result);
      }
    });

    User.get(req.body.username, function(err, user) {
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
      ep.emit('user', result);
    });
  });

  app.post('/password', function(req, res) {
    User.get(req.body.username, function(err, user) {
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

  app.post('/upload', function(req, res) {
    // var temp_path=req.files.thumbnail.path;
    var target_path = req.files.image.path;
    var paths = target_path.split('\\');
    var fileName = paths[paths.length - 1];
    var result = {};
    if (fileName) {
      result.result = '上传成功!';
      result.fileUrl = fileName;
    } else {
      result.result = '上传失败!';
      result.fileUrl = '';
    }
    res.send(result);
  });
};