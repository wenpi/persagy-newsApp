var mongo = require('./db');
var ObjectID = require('mongodb').ObjectID;
var moment = require('moment');
var EventProxy = require('eventproxy');
var User = require('./users');
var Group = require('./groups');

function News(news) {
  var i,
    str = news.listeners || '',
    listeners = str.split(',');
  for (i = listeners.length - 1; i >= 0; i--) {
    if (listeners[i].length === 0) {
      listeners.splice(i, 1);
    }
  }

  this.sign = news.sign || '';
  this.title = news.title || '';
  this.titlecolor = news.titlecolor || '';
  this.unit = news.unit || '';
  this.subtitle = news.subtitle || '';
  this.text = news.text || '';
  this.richText = news.richText || '';
  this.listeners = listeners;
  this.date = news.date || '';
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
    isPub = this.date ? false : true,
    post = {
      sign: this.sign,
      title: this.title,
      titlecolor: this.titlecolor,
      unit: this.unit,
      subtitle: this.subtitle,
      text: this.text,
      richText: this.richText,
      listeners: this.listeners,
      date: time.format("YYYY-MM-DD HH:mm:ss"),
      month: time.format("YYYY-MM"),
      day: time.format("YYYY-MM-DD"),
      isDel: this.isDel,
      isPub: isPub
    };
  mongo.openCheck(function(err, db) {
    if (err) {
      return callback(err);
    }

    db.collection("news", function(err, collection) {
      if (err) {

        return callback(err);
      }
      collection.insert(post, {
        safe: true
      }, function(err) {

        if (err) {
          return callback(err);
        }
        callback(null);
      });
    });
  });
};

News.getList = function(isPub, callback) {
  mongo.openCheck(function(err, db) {
    if (err) {
      return callback(err);
    }
    db.collection("news", function(err, collection) {
      if (err) {

        return callback(err);
      }
      var query = {
        isDel: false,
        isPub: isPub
      };
      collection.find(query).sort({
        date: -1
      }).toArray(function(err, docs) {

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

      console.dir(news);
      console.dir(groups);
      callback(null, news, groups);
    });
    mongo.openCheck(function(err, db) {
      if (err) {
        return callback(err);
      }
      db.collection("news", function(err, collection) {
        if (err) {

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
    mongo.openCheck(function(err, db) {
      if (err) {
        return callback(err);
      }
      Group.get(db, function(err, groups) {

        if (err) {
          return callback(err);
        }
        callback(null, new News({}), groups);
      });
    });

  }
};


News.getNews = function(id, callback) {
  if (id && id.length === 24) {
    mongo.openCheck(function(err, db) {
      if (err) {
        return callback(err);
      }
      db.collection("news", function(err, collection) {
        if (err) {
          return callback(err);
        }
        collection.findOne({
          _id: ObjectID(id)
        }, {
          _id: 1,
          sign: 1,
          title: 1,
          titlecolor: 1,
          unit: 1,
          subtitle: 1,
          text: 1,
          day:1
        }, function(err, doc) {
          if (err) {
            return callback(err);
          }
          callback(null, doc);
        });
      });
    });
  } else {
    callback(null, '参数不正确');
  }
};

News.getRichText = function(id, callback) {
  if (id && id.length === 24) {
    mongo.openCheck(function(err, db) {
      if (err) {
        return callback(err);
      }
      db.collection("news", function(err, collection) {
        if (err) {

          return callback(err);
        }
        collection.findOne({
          _id: ObjectID(id)
        }, {
          richText: 1,
          _id: 0
        }, function(err, doc) {

          if (err) {
            return callback(err);
          }
          if (doc) {
            callback(null, doc.richText);
          } else {
            callback(null, '未查询到文章');
          }

        });
      });
    });
  } else {
    callback(null, '参数不正确');
  }
};

News.getByDay = function(username, date, auto, callback) {
  mongo.openCheck(function(err, db) {
    if (err) {
      return callback(err);
    }
    var ep = new EventProxy();

    Group.getListeners(db, username, function(err, root) {
      ep.on('date', function(dateStr) {
        db.collection("news", function(err, collection) {
          if (err) {
            return callback(err);
          }
          collection.find({
            'listeners': {
              "$in": getListeners(username, root)
            },
            'day': dateStr
          }, {
            _id: 1,
            sign: 1,
            title: 1,
            titlecolor: 1,
            unit: 1,
            subtitle: 1,
            text: 1,
            day: 1
          }).toArray(function(err, news) {
            if (err) {
              return callback(err);
            }
            callback(null, news);
          });
        });
      });
      if (auto === 'current') {
        ep.fire('date', date);
      } else if (auto === 'left') {
        db.collection("news", function(err, collection) {
          if (err) {
            return callback(err);
          }
          collection.findOne({
            listeners: {
              '$in': getListeners(username, root)
            },
            day: {
              '$lte': date
            }
          }, {
            fields: {
              _id: 0,
              day: 1
            },
            limit: 1,
            sort: {
              date: -1
            }
          }, function(err, newOne) {
            if (err) {
              return callback(err);
            }
            if (newOne) {
              ep.fire('date', newOne.day);
            } else {
              callback(null, []);
            }
          });
        });
      } else if (auto === 'right') {
        db.collection("news", function(err, collection) {
          if (err) {
            return callback(err);
          }
          collection.findOne({
            listeners: {
              '$in': getListeners(username, root)
            },
            day: {
              '$gte': date
            }
          }, {
            fields: {
              _id: 0,
              day: 1
            },
            limit: 1,
            sort: {
              date: -1
            }
          }, function(err, newOne) {
            if (err) {
              return callback(err);
            }
            if (newOne) {
              ep.fire('date', newOne.day);
            } else {
              callback(null, []);
            }
          });
        });
      }
    });
  });
};

News.getListByMonth = function(username, date, callback) {
  mongo.openCheck(function(err, db) {
    if (err) {
      return callback(err);
    }
    Group.getListeners(db, username, function(err, root) {
      // console.dir(getListeners(username,root));
      // 
      db.collection("news", function(err, collection) {
        if (err) {

          return callback(err);
        }
        //{'listeners':{"$in": ['10000001']}}
        collection.find({
          'listeners': {
            "$in": getListeners(username, root)
          },
          'month': date
        }, {
          _id: 1,
          sign: 1,
          title: 1,
          unit: 1,
          subtitle: 1
        }).toArray(function(err, news) {

          if (err) {
            return callback(err);
          }
          callback(null, news);
        });
      });
    });
  });
};

News.getExistByMonth = function(username, date, callback) {
  mongo.openCheck(function(err, db) {
    if (err) {
      return callback(err);
    }
    Group.getListeners(db, username, function(err, root) {
      // console.dir(getListeners(username,root));
      // 
      db.collection("news", function(err, collection) {
        if (err) {

          return callback(err);
        }
        //{'listeners':{"$in": ['10000001']}}
        collection.find({
          'listeners': {
            "$in": getListeners(username, root)
          },
          'month': date
        }, {
          _id: 0,
          day: 1
        }).toArray(function(err, news) {

          if (err) {
            return callback(err);
          }
          var i = 0,
            day,
            length = moment(date, 'YYYY-MM').daysInMonth(),
            arr = [];
          for (i = 0; i < length; i++) {
            arr[i] = false;
          }
          for (i = 0; i < news.length; i++) {
            day = news[i].day.slice(-2) - 1;
            arr[day] = true;
          }
          callback(null, arr);
        });
      });
    });
  });
};


function getListeners(username, root) {
  var listeners = [],
    name = username,
    isFind = false;
  // arguments.callee
  (function(root) {
    var i = 0,
      list = root.subGroup;
    if (root.name === name) {
      isFind = true;
      listeners.push(root.id);
      return;
    }
    if (list.length === 0) {
      return;
    } else {
      for (i = 0; i < list.length; i++) {
        arguments.callee(list[i]);
      }
      if (isFind) {
        listeners.push(root.id);
      }
    }
  })(root);
  return listeners;
}