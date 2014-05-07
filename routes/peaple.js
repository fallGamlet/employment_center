var mysql     = require('mysql')
	,async = require("async")
	,mySettings = require('../settings')
	,dbfkit = require("dbfkit")
	,DBFQuery = dbfkit.DBFQuery
	,DBFParser = dbfkit.DBFParser;

exports.index = function(req, res) {
	return res.render('peaple_index.html', { title: 'Поиск людей'});
}

exports.search = function(req, res) {
	var pathName = mySettings.dbfBasePath,
		form = req.query,
		responsed = false,
		records = null,
		validate = formValidate(form);
	
	if(!validate) {
		return res.render('people_view_inner.html', { title: 'Поиск людей', formvals: form });
	}
	correctingForm(form);
	
	var dbConOptions = mySettings.dbConnOptions;
	var connection = mysql.createConnection(dbConOptions);
	connection.connect();
	
	var qstr = "SELECT pers.id, pers.card_n, pers.ind_card, pers.code_rm, pers.obr_date, pers.fio, pers.sex, pers.born_date, pers.address, pers.phone_num, pers.prof_id, prof.name as prof_name, pers.last_org_id, org.name as last_org_name, pers.STATUS_OB, pers.SN_OB "
		qstr+= "FROM czn.person_card pers ";
		qstr+= "LEFT JOIN czn.org org ON org.id = pers.last_org_id ";
		qstr+= "LEFT JOIN czn.prof prof ON prof.id = pers.prof_id WHERE 1=1 ";
	console.log(form);
	if(form['fname']) {
		qstr += " AND LOWER(fio) like '%"+form['fname']+"%'";
	}
	if(form['mname']) {
		qstr += " AND LOWER(fio) like '%"+form['mname']+"%'";
	}
	if(form['lname']) {
		qstr += " AND LOWER(fio) like '%"+form['lname']+"%'";
	}
	if(form['born_date'] && form['born_date'].length == 3) {
		qstr += " AND born_date = '"+ form['born_date'][2] +"-"+ form['born_date'][1] +"-"+ form['born_date'][0] +"'";
	}
	if(form['phone_num']) {
		qstr += " AND LOWER(phone_num) like '%"+ form['phone_num'] +"%'";
	}
	if(form['address']) {
		qstr += " AND LOWER(pers.address) like '%"+ form['address'] +"%'";
	}
	if(form['kartnum']) {
		qstr += " AND card_n = "+ form['kartnum'];
	}
	if(form['kartyear']) {
		qstr += " AND ind_card = "+ form['kartyear'];
	}
	if(form['kartchar']) {
		qstr += " AND code_rm = '"+ form['kartchar'] +"'";
	}
	if(form['prof_obraz']) {
		qstr += " AND LOWER(prof.name) like '%"+ form['prof_obraz'] +"%'";
	}
	if(form['last_org']) {
		qstr += " AND LOWER(org.name) like '%"+ form['last_org'] +"%'";
	}
	if(form['st_bezrab'] !== 2) {
		qstr += " AND STATUS_OB = "+ form['st_bezrab'];
	}
	if(form['st_uchet'] !== 2) {
		qstr += " AND SN_OB = "+ form['st_uchet'];
	}
	qstr += ";"
	console.log(qstr);
	connection.query(qstr, function(err, rows) {
		if (err) throw err;
		records = rows;
	});
	
	connection.end(function() {
		//~ console.log("Row founded: "+records.length)
		responsed = true;
		return res.render('people_view_inner.html', { title: 'Поиск людей', peopleList: records});
	});
	
	setTimeout(function(){
			if(!responsed) {
				console.log('response timeout... ');
				return res.render('404_inner.html', { err: 'time out'});
			}
	}, 35000);
};

exports.viewone = function(req, res) {
	var records,
		responsed = false,
		qstr,
		pk = req.params['pk'],
		connection = mysql.createConnection(mySettings.dbConnOptions);
	
	connection.connect();
	
	qstr = "SELECT * FROM czn.person_card_view WHERE id=" + pk;
	console.log(qstr);
	connection.query(qstr, function(err, rows) {
		if (err) throw err;
		records = rows;
	});
	
	connection.end(function() {
		console.log("Row founded: "+records.length)
		responsed = true;
		return res.render('people_view_one.html', { title: 'Поиск людей', peopleList: records, record:records[0] });
	});
	
	setTimeout(function(){
			if(!responsed) {
				console.log('response timeout... ');
				return res.render('404.html', { err: 'time out'});
			}
	}, 9000);
}

var formValidate = function(form) {
	return (form['fname'] && form['fname'].length > 0) ||
			(form['mname'] && form['mname'].length > 0) ||
			(form['lname'] && form['lname'].length > 0) ||
			(form['born_date'] && form['born_date'].split('.').length == 3) ||
			(form['phone_num'] && form['phone_num'].length > 0) ||
			(form['address'] && form['address'].length > 0) ||
			
			(form['kartnum'] && form['kartnum'].length > 0) ||
			(form['kartyear'] && form['kartyear'].length > 0) ||
			(form['kartchar'] && form['kartchar'].length > 0) ||
			
			(form['prof_obraz'] && form['prof_obraz'].length > 0) ||
			(form['last_org'] && form['last_org'].length > 0) ||
			
			(form['st_bezrab'] && form['st_bezrab'] != '2') ||
			(form['st_uchet'] && form['st_uchet'] != '2');
};

var uglyDateCorrect = function(date) {
	if(!date)
		return '';
	var res = date.toString();
	res = res.slice(6,8)+'.'+res.slice(4,6)+'.'+res.slice(0,4);
	return res;
};

var correctingForm = function(form) {
	if(form['fname']) form['fname'] = form['fname'].toString().toLowerCase().trim();
	if(form['mname']) form['mname'] = form['mname'].toString().toLowerCase().trim();
	if(form['lname']) form['lname'] = form['lname'].toString().toLowerCase().trim();
	if(form['address']) form['address'] = form['address'].toString().toLowerCase().trim();
	
	if(form['kartnum']) form['kartnum'] = parseInt(form['kartnum']);
	if(form['kartyear']) form['kartyear'] = parseInt(form['kartyear']);
	if(form['kartchar']) form['kartchar'] = form['kartchar'].toLowerCase().trim();
	
	if(form['born_date']) form['born_date'] = form['born_date'].trim().split('.');
	if(form['prof_obraz']) form['prof_obraz'] = form['prof_obraz'].toString().toLowerCase().trim();
	if(form['last_org']) form['last_org'] = form['last_org'].toString().toLowerCase().trim();
	if(form['phone_num']) form['phone_num'] = form['phone_num'].trim();
	
	form["st_uchet"] = parseInt(form["st_uchet"]);
	form["st_bezrab"] = parseInt(form["st_bezrab"]);
}
