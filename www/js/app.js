// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic','ngCordova'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

app.config(function($stateProvider, $urlRouterProvider) {
$stateProvider
.state('app', {
url: "/app",
abstract: true,
templateUrl: "templates/layout.html",
controller: 'MainCtrl'
})
.state('app.users', {
url: "/users",
views: {
'main': {
templateUrl: "templates/users.html",
controller: "UsersCtrl"
}
}
})
.state('app.groups', {
url: "/groups",
views: {
'main': {
templateUrl: "templates/groups.html"
}
}
});
$urlRouterProvider.otherwise('/app/users');
});

app.factory('MyData', function($ionicPlatform,
$cordovaSQLite, $q) {
var db = {},
users = [],
groups = [],
usergroup = [];
var initdb = {
users: ["User A", "User B", "User C", "User D",
"User E"],
groups: ["Group 1", "Group 2", "Group 3"]
};

//tables
var createUsers = function() {
$cordovaSQLite.nestedExecute(db,
'CREATE TABLE IF NOT EXISTS users (id integer primary
key, name text)',
'INSERT INTO users (name) VALUES (?),(?),(?),(?),(?)',
[],
initdb.users
).then(function(res) {
$cordovaSQLite.execute(db, 'SELECT * FROM
users').then(function(res) {
for (var i=0; i<res.rows.length; i++) {
users.push(res.rows.item(i));
}
}, function (err) {
console.error(err);
});
}, function (err) {
console.error(err);
});
};
var createGroups = function() {
$cordovaSQLite.nestedExecute(db,
'CREATE TABLE IF NOT EXISTS groups (id integer primary
key, name text)',
'INSERT INTO groups (name) VALUES (?),(?),(?)',
[],
initdb.groups
).then(function(res) {
$cordovaSQLite.execute(db, 'SELECT * FROM
groups').then(function(res) {
for (var i=0; i<res.rows.length; i++) {
groups.push(res.rows.item(i));
}
}, function (err) {
console.error(err);
});
}, function (err) {
console.error(err);
});
}
$ionicPlatform.ready(function() {
db = $cordovaSQLite.openDB("my.db", 1);
$cordovaSQLite.execute(db, 'DROP TABLE IF EXISTS
users').then(function(res) {
createUsers();
}, function (err) {
console.error(err);
});
$cordovaSQLite.execute(db, 'DROP TABLE IF EXISTS
groups').then(function(res) {
createGroups();
}, function (err) {
console.error(err);
});
$cordovaSQLite.execute(db, 'DROP TABLE IF EXISTS
usergroup').then(function(res) {
$cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS
usergroup (id integer primary key, userId integer,
groupId integer)').then(function(res) {
}, function (err) {
console.error(err);
});
}, function (err) {
console.error(err);
});
});

});

return {
users: users,
groups: groups,
getGroupsByUserId: function(userId) {
var q = $q.defer();
var query = "SELECT groupId FROM usergroup WHERE
userId = (?)";
$cordovaSQLite.execute(db, query,
[userId]).then(function(res) {
q.resolve(res);
}, function (err) {
console.error(err);
q.reject(err);
});
return q.promise;
},
getGroupsAll: function() {
var q = $q.defer();
var query = "SELECT groups.id, groups.name,
GROUP_CONCAT(usergroup.userId) AS userIds FROM groups
LEFT OUTER JOIN usergroup ON groups.id =
usergroup.groupId GROUP BY usergroup.groupId";
$cordovaSQLite.execute(db, query).then(function(res) {
q.resolve(res);
}, function (err) {
q.reject(err);
});
return q.promise;
},
addUser: function(params) {
var q = $q.defer();
var query = "INSERT INTO users (name) VALUES (?)";
$cordovaSQLite.execute(db, query,
[params.name]).then(function(res) {
q.resolve(res);
}, function (err) {
console.error(err);
q.reject(err);
});
return q.promise;
},
updateGroupByUserId: function(userId, usergroups) {
var q = $q.defer();
var query = "DELETE FROM usergroup WHERE userId = (?)";
$cordovaSQLite.execute(db, query,
[userId]).then(function(res) {
var query = "INSERT INTO usergroup (userId, groupId)
VALUES (?,?)";
$cordovaSQLite.insertCollection(db, query,
usergroups).then(function(res) {
q.resolve(res);
}, function (err) {
console.error(err);
q.reject(err);
});
}, function (err) {
console.error(err);
q.reject(err);
});
return q.promise;
}
}  