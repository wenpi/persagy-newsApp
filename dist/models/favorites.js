var mongo = require('./db');
var EventProxy = require('eventproxy');
var ObjectID = require('mongodb').ObjectID;

function Favorite(item) {
  this.userName = item.name;
  this.newsId = item.username;
}
module.exports = Favorite;

Favorite.get = function(username, callback) {
  mongo.openCheck(function(error, db) {
    var ep;
    if (error) {
      return callback(error);
    }
    ep = new EventProxy();
    ep.on('ids', function(list) {
      var i = 0,
        idArr = [];
      for (i = 0; i < list.length; i++) {
        idArr.push(ObjectID(list[i].newsId));
      };
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
          callback(null, docs);
        });
      });
    })
    db.collection('favorites', function(error, collection) {
      if (error) {
        return callback(error);
      }
      collection.find({
        username: username
      }, {
        _id: 0,
        username: 1,
        newsId: 1
      }).toArray(function(error, docs) {
        if (error) {
          return callback(error);
        }
        ep.fire('ids', docs)
      });
    });
  });
};

Favorite.del = function(username, newsId, callback) {
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
        username: username,
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

Favorite.add = function(username, newsId, callback) {
  console.log(username, newsId);
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
        username: username,
        newsId: newsId
      };

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