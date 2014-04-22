
var DBFQuery = require("dbfkit").DBFQuery;
var async = require("async");
var mySettings = require('../settings');

exports.index = function(req, res) {
	return res.render('peaple_index.html', { title: 'Поиск людей'});
}

exports.search = function(req, res) {
	var pathName = mySettings.dbfBasePath,
		form = req.query,
		responsed = false,
		validate = formValidate(form);
	
	if(!validate) {
		return res.render('peaple_view_inner.html', { title: 'Поиск людей', formvals: form });
	}
	correctingForm(form);
	
	console.log(form);
	
	async.parallel({
			"qprof" :function(callback) {
				if(form['prof_obraz']) {
					var qProf = new DBFQuery( pathName + 'KL_PROF.DBF',
							function(record) {
								if(!record['NAIM'])
									return false;
								var check = record['NAIM'].toLowerCase().indexOf(form['prof_obraz']) > -1
								return check;
							},
							null,['PROF1','NAIM'], 'cp866',
							function() {
								console.log("prof ended...");
								callback(null, qProf);
							});
					qProf.selectSimple();
				} else {
					callback(null, null);
				}
			},
			"qorg": function(callback) {
				if(form['last_org']) {
					var qOrg = new DBFQuery( pathName + 'KL_PRED.DBF',
							function(record) {
								if(!record['NAIM'])
									return false;
								return record['NAIM'].toLowerCase().indexOf(form['last_org']) > -1;
							},
							null,['KOD','NAIM'], 'cp866',
							function() {
								console.log("last org ended...");
								callback(null, qOrg);
							});
					qOrg.selectSimple();
				} else {
					callback(null, null);
				}
			}},
			function(err, results) {
				if(err) {
					console.log("People... err");
					console.log(err);
					return res.render('404.html', { err: err});
				}
				console.log("People... serching");
				
				var qOrg = results["qorg"],
					qProf = results["qprof"];
				
				var wherePeople = function(record) {
					if(!record['FIO']) {
						return false;
					}
					var fioVal = record['FIO'].toLowerCase().trim().replace('  ', ' ').split(' '),
						borndateVal = record['ROGD_DT'],
						check = true, 
						bTmp;
						
					if(fioVal.length > 3) {
						var str = "";
						for(var i=3; i<fioVal.length; i++) {
							str += fioVal[i];
							delete fioVal[i];
						}
						fioVal[2] += str;
					}
					
					if(form['kartnum']) {
						check &= form['kartnum'] == record['KART_N'];
					}
					if(form['kartyear']) {
						check &= form['kartyear'] == record['IND_KART'];
					}
					if(form['kartchar']) {
						check &= form['kartchar'] == record['KOD_RM'].toLowerCase().trim();
					}
					if(form['lname'] && fioVal.length >= 1) {
						check &= form['lname'].length == 0 || fioVal[0].indexOf(form['lname']) > -1;
					}
					if(form['fname'] && fioVal.length >= 2) {
						check &= form['fname'].length == 0 || fioVal[1].indexOf(form['fname']) > -1;
					}
					if(form['mname'] && fioVal.length >=3) {
						check &= form['mname'].length == 0 || fioVal[2].indexOf(form['mname']) > -1;
					}
					if(form['born_date'].length == 3) {
						check &= borndateVal == (form['born_date'][2]+form['born_date'][1]+form['born_date'][0]);
					}
					if(form['address']) {
						if(!record['ADRESS'])
							check &= false;
						else
							check &= form['address'].length == 0 || record['ADRESS'].toString().toLowerCase().indexOf(form['address']) > -1;
					}
					
					if(form['phone_num']) {
						check &= form['phone_num'].length == 0 || record['TEL'].toString().indexOf(form['phone_num']) > -1;
					}
					
					if(form['st_bezrab'] != 2 ) {
						check &= form['st_bezrab'] === record["STATUS_OB"];
					}
					if(form['st_uchet'] != 2 ) {
						check &= form['st_uchet'] === record["SN_OB"];
					}
					
					if(check && qProf) {
						bTmp = false;
						for(i in qProf.records) {
							bTmp |= qProf.records[i]['PROF1'] == record['PROF_OBR'];
							if(bTmp)
								break;
						}
						check &= bTmp;
					}
					if(check && qOrg) {
						bTmp = false;
						for(i in qOrg.records) {
							bTmp |= qOrg.records[i]['KOD'] == record['POSL_RAB'];
							if(bTmp)
								break;
						}
						check &= bTmp;
					}
					if(check) {
						record['ROGD_DT'] = uglyDateCorrect(record['ROGD_DT']);
						record['OBR_DT'] = uglyDateCorrect(record['OBR_DT']);
						
						//var dataKor = record['DATA_KOR']? record['DATA_KOR'].split('.');
					}
					//
					return check;								
				}
				
				
				var finish = function() {
					console.log("People... Readed all...");
					if(qOrg) {
						console.log("People... joining qOrg");
						DBFQuery.leftJoin(qPeople.records, 'POSL_RAB', qOrg.records, 'KOD');
					}
					if(qProf) {
						console.log("People... joining qProf");
						DBFQuery.leftJoin(qPeople.records, 'PROF_OBR', qProf.records, 'PROF1');
					}
					responsed = true;
					return res.render('peaple_view_inner.html', { title: 'Поиск людей', peopleList: qPeople.records});
				};
			
			
				var qPeople = new DBFQuery( pathName + 'FIL_OBR.DBF',
							wherePeople,
							['FIO'],
							['KOD_RM','IND_KART','KART_N','OBR_DT','FIO','POL','ROGD_DT','ADRESS','STATUS_OB','SN_OB','DATA_KOR','PROF_OBR','POSL_RAB'],
							'cp866', finish);
			
				qPeople.selectSimple();
	});
	setTimeout(function(){
			if(!responsed) {
				console.log('response timeout... ');
				return res.render('404_inner.html', { err: 'time out'});
			}
	}, 9000);
};

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
