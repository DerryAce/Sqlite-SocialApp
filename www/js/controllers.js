angular.module("starter.controllers", [])

app.controller('UsersCtrl', function($scope, $timeout,
$ionicModal, $cordovaSQLite, MyData) {
$scope.newUser = {};
$ionicModal.fromTemplateUrl('templates/userModal.html', {
scope: $scope,
animation: 'fade-in'
}).then(function(modal) {
$scope.userModal = modal;
});
$scope.openUserModal = function(user) {
$scope.user = user || {};
$scope.usergroup = [];
if ((user) && (angular.isObject(user)) &&
(user.hasOwnProperty('id'))) {
$scope.user.groups = [];
MyData.getGroupsByUserId(user.id).then(function(res)
{
for (var i=0; i<res.rows.length; i++) {
$scope.user.groups.push(
res.rows.item(i).groupId);
}
for (var i=0; i<$scope.groups.length; i++) {
$scope.usergroup.push(
$scope.user.groups.indexOf(
$scope.groups[i].id) >= 0);
}
});
}
$scope.userModal.show();
};
$scope.addUser = function() {
MyData.addUser($scope.newUser.name).then(function(res) {
$scope.users.push({
id: res.insertId,
name: $scope.newUser.name
});
$scope.newUser.name = '';
});
}
$scope.save = function(user, usergroup) {
var usergroups = [];
for (var i=0; i<$scope.groups.length; i++) {
if (usergroup[i]) {
usergroups.push([user.id, $scope.groups[i].id]);
}
}
MyData.updateGroupByUserId(user.id,
usergroups).then(function(res) {
});
$scope.userModal.hide();
};
$scope.cancel = function() {
$scope.userModal.hide();
};
});

app.controller('MainCtrl', function($scope, $rootScope,
MyData) {
$scope.users = MyData.users;
$scope.groups = MyData.groups;
$rootScope.$on('$stateChangeStart', function(event,
toState, toParams, fromState, fromParams) {
if (toState.name == 'app.groups') {
getGroups();
}
});
function getGroups() {
MyData.getGroupsAll().then(function(res) {
var newGroups = [];
for (var i=0; i<res.rows.length; i++) {
newGroups[i] = {
id: res.rows.item(i).id,
name: res.rows.item(i).name,
users: []
};
var userIds = res.rows.item(i).userIds ?
res.rows.item(i).userIds.split(',') : [];
for (var j=0; j<userIds.length; j++) {
var name = '';
for (var t=0; t<$scope.users.length; t++) {
if ($scope.users[t].id == userIds[j])
name = $scope.users[t].name
}
newGroups[i].users.push({
id: userIds[j],
name: name
});
}
}
if (newGroups.length < $scope.groups.length) {
for (var o=0; o<$scope.groups.length; o++) {
var doesExist = false;
for (var n=0; n<newGroups.length; n++) {
doesExist = doesExist || (newGroups[n].id ==
$scope.groups[o].id);
}
if (!doesExist) {
newGroups.push({
id: $scope.groups[o].id,
name: $scope.groups[o].name,
users: []
});
}
}
}
angular.copy(newGroups, $scope.groups);
});
}
});

})
