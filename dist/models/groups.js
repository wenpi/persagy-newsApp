var mongo = require('./db');
var User = require('./users');
var EventProxy = require('eventproxy');

function Group() {
	this.id = '';
	this.pid = '';
	this.name = '';
	this.subGroup = [];

}

module.exports = Group;

Group.get = function(db, callback) {
	var ep = EventProxy.create("groups", "users", function(groups, users) {
		callback(null, treeFactory(groups.concat(users)));
	});
	db.collection("groups", function(err, collection) {
		if (err) {
			mongo.close();
			return callback(err);
		}
		collection.find({}, {
			'pid': 1,
			'id': 1,
			'_id': 0,
			'name': 1
		}).toArray(function(err, groups) {
			if (err) {
				mongo.close();
				return callback(err);
			}
			ep.emit('groups', groups);
		});
	});
	db.collection("users", function(err, collection) {
		if (err) {
			mongo.close();
			return callback(err);
		}
		collection.find({}, {
			'pid': 1,
			'showname': 1
		}).toArray(function(err, users) {
			if (err) {
				mongo.close();
				return callback(err);
			}
			ep.emit('users', users);
		});
	});
};

function treeFactory(list) {
	var i,
		root = new Group();
	for (i = 0; i < list.length; i++) {
		if (list[i].pid === null) {
			root.id = list[i].id;
			root.name = list[i].name;

		}
		break;
	}
	root.subGroup = findSubNode(root, list);
	return root;
}


function findSubNode(root, list) {
	var i,
		subList = [],
		id,
		name,
		tempNode;
	for (i = 0; i < list.length; i++) {
		id = list[i]._id || list[i].id;
		name = list[i].showname || list[i].name;
		if (root.id === list[i].pid) {
			tempNode = new Group();
			tempNode.id = id;
			tempNode.name = name;
			tempNode.pid = list[i].pid;
			subList.push(tempNode);
		}
	}
	if (subList.length !== 0) {
		for (i = 0; i < subList.length; i++) {
			subList[i].subGroup = findSubNode(subList[i], list);
		}
	}
	return subList;
}