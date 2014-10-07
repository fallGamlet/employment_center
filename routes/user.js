var mySettings = appSettings, //require('../settings'),
    dbftomysql = require('../my_libs/dbf_to_mysql'),
    crypto = require('crypto');

exports.index = function(req, res) {
    res.render('user/index.html');
};

exports.middleware = function(req, res, next) {
//    console.log(req.session);
    if (req.session.authorized) {
        if(req.session.user.is_superuser) {
            next();
        } else {
            var varDict = {errors:"Пользователь не обладает правами Администратора"};
            res.render('user/auth_index.html', varDict);
        }
	} else {
		res.redirect("/login/");
	}
};

exports.login = function(req, res) {
    var shasum, username,passwd;
    if(req.body.login && req.body.password) {
        shasum = crypto.createHash('sha1');
        shasum.update(req.body.password);
        username = req.body.login;
        passwd = shasum.digest('hex');
        
        getUsers(req, {username:username, password:passwd}, function(err, users) {
            if(users[0] && users[0].is_active) {
                req.session.authorized = true;
                //req.session.username = req.body.login;
                users[0].password = undefined;
                req.session.user = users[0];
                res.redirect("/");
            } else {
                res.render('user/login.html', {login:req.body.login});
            }
        });
    } else {
        res.render('user/login.html', {login:req.body.login});
    }
};

exports.dbupdate = function(req, res) {
    var responsed = false;
    dbftomysql.updateAll({
        dbfpath: mySettings.dbfBasePath,
        dbconoptions: mySettings.dbConnOptions,
        callback: function(err, result, timeleft) {
            responsed = true;
            res.render('user/index.html', {'err':err, 'result':result, 'timeleft':timeleft });
        }
    });
    setTimeout(function() {
        if(!responsed)
            res.render('user/index.html', {'err':"time out"});
    }, 50000);
};

exports.dbPersonCardUpdate = function(req, res) {
	var responsed = false;
    dbftomysql.updatePeopleCards({
            dbfpath: mySettings.dbfBasePath,
            dbconoptions: mySettings.dbConnOptions,
            callback: function(err, result, timeleft) {
                responsed = true;
                res.render('user/index.html', {'err':err, 'result':result, 'timeleft':timeleft });
            }
        });
    setTimeout(function() {
            if(!responsed)
                res.render('user/index.html', {'err':"time out"});
        }, 50000);
};

exports.auth_index = function(req, res) {
    var varDict = {
        menu_links: getModelsLinks(),
        offsetDate: offsetDate
    };
    var modelType = req.params["model"];
    var actionType = req.params["action"];
    var curID = Number(req.params["id"]);
    console.log(modelType+" -> "+actionType+" -> "+curID);
    console.log("Method: "+req.method);
    if(modelType === "auth_user") {
        userAction(req, res, varDict);
    } else if(modelType === "auth_group") {
        groupAction(req, res, varDict);
    } else {
        res.render('user/auth_index.html', varDict);
    }
};


var getModelsLinks = function() {
    var baseUrl = "/admin/auth";
    var v = [
        {name:"auth_user", title:"Пользователи", url:baseUrl+"/auth_user", can_add:true},
        {name:"auth_group", title:"Группы", url:baseUrl+"/auth_group", can_add:true},
        {name:"auth_permission", title:"Привилегии", url:baseUrl+"/auth_permission"}
    ];
    return v;
};

var getUsers = function(req, queryObj, callback) {
    var User = req.models.User;
    User.find(queryObj, callback);
};

var getGroups = function(req, queryObj, callback) {
    var Group = req.models.Group;
    Group.find(queryObj, callback);
};

var getPermissions = function(req, queryObj, callback) {
    var Permission = req.models.Permission;
    Group.find(queryObj, callback);
};


var editUser = function(req, callback) {
    var User = req.models.User;
    var curID = req.params["id"];
    var formUser = new forms.UserEditForm(req);
    var err = formUser.is_valid();
    if(err) {
        callback(err, null);
        return;
    }
    if(curID) {
        User.get(curID, function(err, user) {
           if(err) {
               callback(err, null);
               return false;
           }
           formUser.insertTo(user);
           user.save(function(err){
               if(err) {
                   callback(err, null);
               } else {
                   callback(null, "Пользователь успешно сохранен");
               }
           });
        });
    } else {
        callback({title:"Не указан идентификатор редактируемого пользователя."}, null);
    }
};

var addUser = function(req, callback) {
    var User = req.models.User;
    var formUser = new forms.UserEditForm(req);
    console.log(formUser);
    var err = formUser.is_valid();
    if(err) {
        callback(err, null);
        return;
    }
    var user = {};
    formUser.insertTo(user);
    User.create(user, callback);
};

var deleteUser = function(req, callback) {
    var User = req.models.User;
    var curID = req.params["id"];
    if(curID) {
        User.get(curID, function(err, user) {
           if(err) {
               callback(err, null);
               return false;
           }
           user.remove(function(err){
               if(err) {
                   callback(err, null);
               } else {
                   callback(null, "Пользователь успешно удален.");
               }
           });
        });
    } else {
        callback({title:"Не указан идентификатор редактируемого пользователя."}, null);
    }
};

var userAction = function(req, res, varDict) {
    var varDict = varDict;
    if(!varDict) varDict = {};
    var actionType = req.params["action"];
    var curID = Number(req.params["id"]);
    
    if(actionType === undefined) {
        getUsers(req, {}, function(err, users){
            varDict.errors = err;
            varDict.users = users;
            res.render('user/auth_index.html', varDict);
        });
    } else if(actionType === "add") {
        if(req.method.toLowerCase() === "post") {
            addUser(req, function(err, results){
                varDict.errors = err;
                varDict.ok_message = results;
                res.render('user/auth_index.html', varDict);
            });
        } else {
            varDict.user = new forms.UserEditForm();
            res.render('user/auth_index.html', varDict);
        }
    } else if(actionType === "edit") {
        if(req.method.toLowerCase() === "post") {
            editUser(req, function(err, result){
                if(err) {
                    varDict.errors = err;
                } else {
                    varDict.ok_message = result;
                }
                res.render('user/auth_index.html', varDict);
            });
        } else {
            if(curID.toString() === "NaN") {
                res.render('user/auth_index.html', varDict);
            } else {
                getUsers(req, {id:curID}, function(err, users){
                    varDict.errors = err;
                    if(users.length > 0) {
                        varDict.user = users[0];
//                        varDict.user.getGroups(function(err, data){
//                            console.log("Err: "+err);
//                            console.log("Data: "+data);
//                        });
                    } else {
                        varDict.errors = {title:"Указаный пользователь не найден"};
                    }
                    res.render('user/auth_index.html', varDict);
                });
            }
        }
    } else if(actionType === "delete") {
        deleteUser(req, function(err, results){
            varDict.errors = err;
            varDict.ok_message = results;
            res.render('user/auth_index.html', varDict);
        });
    } else {
        varDict.errors = {title:"Не указано действие, или действие указано некорректно."};
        res.render('user/auth_index.html', varDict);
    }
};


var addGroup = function(req, callback) {
    var Group = req.models.Group;
    var formGroup = new forms.GroupEditForm(req);
    //console.log(formGroup);
    var err = formGroup.is_valid();
    if(err) {
        callback(err, null);
        return;
    }
    var group = {};
    formGroup.insertTo(group);
    Group.create(group, callback);
};

var editGroup = function(req, callback) {
    var Group = req.models.Group;
    var curID = req.params["id"];
    var formGroup = new forms.GroupEditForm(req);
    var err = formGroup.is_valid();
    if(err) {
        callback(err, null);
        return;
    }
    if(curID) {
        Group.get(curID, function(err, group) {
           if(err) {
               callback(err, null);
               return false;
           }
           formGroup.insertTo(group);
           group.save(function(err){
               if(err) {
                   callback(err, null);
               } else {
                   callback(null, "Группа успешно сохранен");
               }
           });
        });
    } else {
        callback({title:"Не указан идентификатор редактируемой группы."}, null);
    }
};

var deleteGroup = function(req, callback) {
    var Group = req.models.Group;
    var curID = req.params["id"];
    if(curID) {
        Group.get(curID, function(err, group) {
           if(err) {
               callback(err, null);
               return false;
           }
           group.remove(function(err){
               if(err) {
                   callback(err, null);
               } else {
                   callback(null, "Группа успешно удалена.");
               }
           });
        });
    } else {
        callback({title:"Не указан идентификатор редактируемой группы."}, null);
    }
};

var groupAction = function(req, res, vardict) {
    var varDict = vardict;
    if(!varDict) varDict = {};
    var actionType = req.params["action"];
    var curID = Number(req.params["id"]);
    
    if(actionType === undefined) {
        getGroups(req, {}, function(err, groups){
            varDict.errors = err;
            varDict["groups"] = groups;
            res.render('user/auth_index.html', varDict);
        });
    } else if(actionType === "add") {
        if(req.method.toLowerCase() === "post") {
            addGroup(req, function(err, results){
                varDict.errors = err;
                varDict.ok_message = results;
                res.render('user/auth_index.html', varDict);
            });
        } else {
            varDict["group"] = new forms.GroupEditForm();
            res.render('user/auth_index.html', varDict);
        }
    } else if(actionType === "edit") {
        if(req.method.toLowerCase() === "post") {
            editGroup(req, function(err, result){
                if(err) {
                    varDict.errors = err;
                } else {
                    varDict.ok_message = result;
                }
                res.render('user/auth_index.html', varDict);
            });
        } else {
            if(curID.toString() === "NaN") {
                res.render('user/auth_index.html', varDict);
            } else {
                getGroups(req, {id:curID}, function(err, groups){
                    varDict.errors = err;
                    if(groups.length > 0) {
                        varDict["group"] = groups[0];
                    } else {
                        varDict.errors = {title:"Указаный пользователь не найден"};
                    }
                    res.render('user/auth_index.html', varDict);
                });
            }
        }
    } else if(actionType === "delete") {
        deleteGroup(req, function(err, results){
            varDict.errors = err;
            varDict.ok_message = results;
            res.render('user/auth_index.html', varDict);
        });
    } else {
        varDict.errors = {title:"Не указано действие, или действие указано некорректно."};
        res.render('user/auth_index.html', varDict);
    }
};









