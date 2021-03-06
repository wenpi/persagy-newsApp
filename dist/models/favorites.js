var mongo = require('./db');
var EventProxy = require('eventproxy');
var ObjectID = require('mongodb').ObjectID;
var moment = require('moment');

function Favorite(item) {
  this.userName = item.userName;
  this.newsId = item.newsId;
  this.createTime = moment().format("YYYY-MM-DD HH:mm:ss");
}
module.exports = Favorite;

Favorite.get = function(userName, callback) {
  mongo.openCheck(function(error, db) {
    var ep;
    if (error) {
      return callback(error);
    }
    ep = new EventProxy();
    ep.on('ids', function(list) {
      var i = 0,
        j = 0,
        idArr = [];
      for (i = 0; i < list.length; i++) {
        idArr.push(ObjectID(list[i].newsId));
      }
      db.collection('news', function(error, collection) {
        if (error) {
          return callback(error);
        }
        collection.find({
          _id: {
            $in: idArr
          }
        }, {
          sign: 1,
          title: 1,
          unit: 1,
          day: 1,
          subtitle: 1
        }).toArray(function(error, docs) {
          if (error) {
            return callback(error);
          }
          for (i = 0; i < list.length; i++) {
            for (j = 0; j < docs.length; j++) {
              if (docs[j]._id === list[i].newsId) {
                docs[j].createTime = list[i].createTime;
                break;
              }
            }
          }
          docs.sort(function(a, b) {
            if (a.createTime > b.createTime) {
              return 1;
            } else if (a < b) {
              return -1;
            } else {
              return 0;
            }
          });

          callback(null, docs);
        });
      });
    });

    db.collection('favorites', function(error, collection) {
      if (error) {
        return callback(error);
      }
      collection.find({
        userName: userName
      }, {
        _id: 0,
        newsId: 1,
        createTime: 1
      }).toArray(function(error, docs) {
        if (error) {
          return callback(error);
        }
        ep.fire('ids', docs);
      });
    });
  });
};

Favorite.del = function(userName, newsId, callback) {
  mongo.openCheck(function(error, db) {
    if (error) {
      return callback(error);
    }
    db.collection('favorites', function(error, collection) {
      var favorite;
      if (error) {
        return callback(error);
      }

      favorite = {
        userName: userName,
        newsId: newsId
      };

      collection.remove(favorite, {
        safe: true
      }, function(err, result) {
        if (err) {
          return callback(err);
        }
        callback(null, result);
      });
    });
  });
};

Favorite.add = function(userName, newsId, callback) {

  mongo.openCheck(function(error, db) {
    if (error) {
      return callback(error);
    }
    db.collection('favorites', function(error, collection) {
      var favorite;
      if (error) {
        return callback(error);
      }

      favorite = new Favorite({
        userName: userName,
        newsId: newsId
      });

      collection.insert(favorite, {
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