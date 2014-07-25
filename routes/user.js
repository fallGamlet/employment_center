var mySettings = require('../settings');
	dbftomysql = require('../my_libs/dbf_to_mysql'),
	adminUserName = "admin";

exports.index = function(req, res) {
    res.render('user/index.html');
};

exports.middleware = function(req, res, next) {
    console.log("User middleware");
    if (req.session.authorized && req.session.username ==='admin') {
		console.log('This is admin!');
		next();
	} else {
		res.redirect("/login/");
	}
}

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
    console.log(req.params);
    if(modelType === "auth_user" && actionType === undefined) {
        console.log("USER VIEW");
        getUsers(req, {}, function(err, users){
            varDict["error"] = err;
            varDict["users"] = users;
            res.render('user/auth_index.html', varDict);
        });
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