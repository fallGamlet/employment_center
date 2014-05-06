var mySettings = require('../settings');
	dbftomysql = require('../my_libs/dbf_to_mysql');

exports.index = function(req, res) {
	if (req.session.authorized && req.session.username ==='admin') {
		console.log('This is admin!');
		res.render('user/index.html', { title: 'Центр занятости насяления' });
	} else {
		res.redirect("/user/login");
	}
};

exports.login = function(req, res) {
	if ((req.body.login==='admin')&&(req.body.password==='admin')) {
		req.session.authorized = true;
		req.session.username = req.body.login;
		console.log('admin is here!');
		res.redirect("/user");
	} else {
		res.render('user/login.html', { title: 'Центр занятости насяления' });
	}
};

exports.dbupdate = function(req, res) {
	if (req.session.authorized && req.session.username ==='admin') {
		var pathName = mySettings.dbfBasePath;
		dbftomysql({
				dbfpath: pathName,
				dbconoptions: {
					host: 'localhost', 
					port: 3311, 
					user: 'root', 
					password: 'root'
				},
				callback: function(err, result, timeleft) {
					res.render('user/index.html', { 'title': 'Центр занятости насяления', 'err':err, 'result':result, 'timeleft':timeleft });
				}
			});
		setTimeout(function() {
				res.render('user/index.html', { 'title': 'Центр занятости насяления', 'err':"time out"});
			}, 50000);
	} else {
		res.redirect("/user/login");
	}
};
