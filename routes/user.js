var mySettings = require('../settings');
	dbftomysql = require('../my_libs/dbf_to_mysql'),
	adminUserName = "admin";

exports.index = function(req, res) {
	if (req.session.authorized && req.session.username ==='admin') {
		console.log('This is admin!');
		res.render('user/index.html', { title: 'Центр занятости насяления' });
	} else {
		res.redirect("/user/login");
	}
};

exports.login = function(req, res) {
	if ((req.body.login===adminUserName)&&(req.body.password==='admin')) {
		req.session.authorized = true;
		req.session.username = req.body.login;
		console.log('admin is here!');
		res.redirect("/user");
	} else {
		res.render('user/login.html', { title: 'Центр занятости насяления' });
	}
};

exports.dbupdate = function(req, res) {
	var responsed = false;
	if (req.session.authorized && req.session.username === adminUserName) {
		dbftomysql.updateAll({
				dbfpath: mySettings.dbfBasePath,
				dbconoptions: mySettings.dbConnOptions,
				callback: function(err, result, timeleft) {
					responsed = true;
					res.render('user/index.html', { 'title': 'Центр занятости насяления', 'err':err, 'result':result, 'timeleft':timeleft });
				}
			});
		setTimeout(function() {
				if(!responsed)
					res.render('user/index.html', { 'title': 'Центр занятости насяления', 'err':"time out"});
			}, 50000);
	} else {
		res.redirect("/user/login");
	}
};

exports.dbPersonCardUpdate = function(req, res) {
	var responsed = false;
	if (req.session.authorized && req.session.username === adminUserName) {
		dbftomysql.updatePeopleCards({
				dbfpath: mySettings.dbfBasePath,
				dbconoptions: mySettings.dbConnOptions,
				callback: function(err, result, timeleft) {
					responsed = true;
					res.render('user/index.html', { 'title': 'Центр занятости насяления', 'err':err, 'result':result, 'timeleft':timeleft });
				}
			});
		setTimeout(function() {
				if(!responsed)
					res.render('user/index.html', { 'title': 'Центр занятости насяления', 'err':"time out"});
			}, 50000);
	} else {
		res.redirect("/user/login");
	}
};

exports.auth_index = function(req, res) {
	if (req.session.authorized && req.session.username ==='admin') {
		res.render('user/auth_index.html', { title: 'Центр занятости насяления' });
	} else {
		res.redirect("/user/login");
	}
};

exports.auth_user_list = function(req, res) {
	if (req.session.authorized && req.session.username ==='admin') {
		res.render('user/auth_index.html', { title: 'Центр занятости насяления' });
	} else {
		res.redirect("/user/login");
	}
};

exports.auth_group_list = function(req, res) {
	if (req.session.authorized && req.session.username ==='admin') {
		res.render('user/auth_index.html', { title: 'Центр занятости насяления' });
	} else {
		res.redirect("/user/login");
	}
};

exports.auth_permission_list = function(req, res) {
	if (req.session.authorized && req.session.username ==='admin') {
		res.render('user/auth_index.html', { title: 'Центр занятости насяления' });
	} else {
		res.redirect("/user/login");
	}
};