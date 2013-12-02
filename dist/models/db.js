var settings = require('../setting'),
  Db = require('mongodb').Db,
  Connection = require('mongodb').Connection,
  Server = require('mongodb').Server,
  db = new Db(settings.db, new Server(settings.host, Connection.DEFAULT_PORT), {
    safe: true
  });

db.openCheck = function(callback) {
  if (this._state === 'connecting') {
    setTimeout(function() {
      db.openCheck(callback);
    }, 500);
  } else if (this._state !== "connected") {
    this.open(callback);
  } else {
    callback(null, this);
  }

};
module.exports = db;