var mongo = require('./db');
var EventProxy = require('eventproxy');

function User(user) {
  this.id = user.id;
  this.name = user.name;
  this.username = user.username;
  this.userpwd = user.userpwd;
}

module.exports = User;


User.get = function(name, callback) {
  mongo.openCheck(function(error, db) {
    if (error) {
      return callback(error);
    }
    db.collection('users', function(error, collection) {
      if (error) {

        return callback(error);
      }
      collection.findOne({
        username: name
      }, function(error, user) {

        if (error) {
          return callback(error);
        }
        callback(null, user);
      });
    });
  });
};

User.changePassword = function(name, pwd, callback) {
  mongo.openCheck(function(error, db) {
    if (error) {
      return callback(error);
    }
    db.collection('users', function(error, collection) {
      if (error) {

        return callback(error);
      }
      collection.update({
        username: name
      }, {
        $set: {
          userpwd: pwd
        }
      }, function(err) {

        if (err) {
          return callback(err);
        }
        callback(null);
      });
    });
  });
};