var mySettings = require('../settings');
	dbftomysql = require('../my_libs/dbf_to_mysql'),
	adminUserName = "admin";

exports.index = function(req, res) {
    res.render('user/index.html');
};

exports.middleware = function(req, res, next) {
    if (req.session.authorized && req.session.username ==='admin') {
		next();
	} else {
		res.redirect("/login/");
	}
};

exports.login = function(req, res) {
	if ((req.body.login===adminUserName)&&(req.body.password==='admin')) {
		req.session.authorized = true;
		req.session.username = req.body.login;
        res.redirect("/");
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
    console.log(req.method);
    if(modelType === "auth_user") {
        if(actionType === undefined) {
            getUsers(req, {}, function(err, users){
                varDict["error"] = err;
                varDict["users"] = users;
                res.render('user/auth_index.html', varDict);
            });
        } else if(actionType === "add") {
            varDict["user"] = {
                username: "",
                password: "",
                f_name : "",
                m_name : "",
                l_name : "",
                email : "",
                phone : "",
                created: new Date(),
                last_login: null,
                is_active: false,
                is_superuser: false
            };
            res.render('user/auth_index.html', varDict);
        } else if(actionType === "edit") {
//            if(req.method.toLowerCase() == "post")
            if(curID.toString() === "NaN") {
                res.render('user/auth_index.html', varDict);
            } else {
                getUsers(req, {id:curID}, function(err, users){
                    varDict["error"] = err;
                    if(users.length > 0) {
                        varDict["user"] = users[0];
                    } else {
                        varDict["error"] = "Указаный пользователь не найден";
                    }
                    res.render('user/auth_index.html', varDict);
                });
            }
        }
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
    var formUser = getUserFromFrom(req);
    if(curID) {
        User.get(curID, function(err, userItem){
           if(err) {
               callback(err, null);
               return false;
           }
           
        });
    }
    User.find(queryObj, callback);
};

var getUserFromFrom = function(req) {
    if(req.method.toLowerCase() !== "post")
        return null;
    var formUser = {
        username: req.body["username"],
        password: req.body["password"],
        f_name: req.body["f_name"],
        m_name: req.body["m_name"],
        l_name: req.body["l_name"],
        email: req.body["email"],
        phone: req.body["phone"],
        created: req.body["created"],
        last_login: req.body["last_login"],
        is_active: req.body["is_active"],
        is_superuser: req.body["is_superuser"]
    };
    return formUser;
};