
var DBFQuery = require("dbfkit").DBFQuery;
var mySettings = require('../settings');

exports.index = function(req, res) {
	var pathName = mySettings.dbfBasePath;
	var form = req.query;
	var validate = formValidate(form);
	
	if(!validate) {
		return res.render('peaple_index.html', { title: 'Поиск людей', formvals: form });
	}
	
	var formFIO = form['fio'].toString().trim().toLowerCase().split(' ');
	var formBorndate = form['born_date'].trim().split('.');
	var formProfessia = form['prof_obraz'].toString().trim().toLowerCase();
	var formLastOrg = form['last_org'].toString().trim().toLowerCase();
	var formPhonenum = form['phone_num'].trim();
	
	var needWait = 0;
	
	var qProf, qOrg
	
	if(formProfessia) {
		needWait++;
		qProf = new DBFQuery( pathName + 'KL_PROF.DBF',
						function(record) {
							if(!record['NAIM'])
								return false;
							var check = record['NAIM'].toLowerCase().indexOf(formProfessia) > -1
							return check;
						},
						null,['PROF1','NAIM'], 'cp866',
						function(records) {
							needWait--;
						});
		qProf.selectSimple();
	}
	if(formLastOrg) {
		needWait++;
		qOrg = new DBFQuery( pathName + 'KL_PRED.DBF',
						function(record) {
							if(!record['NAIM'])
								return false;
							return record['NAIM'].toLowerCase().indexOf(formLastOrg) > -1;
						},
						null,['KOD','NAIM'], 'cp866',
						function(records) {
							needWait--;
						});
		qOrg.selectSimple();
	}
	
	while(needWait > 0) {
		setTimeout(null, 50);
	}
	needWait = 0;
	
	var finish = function() {
		//
		if(qOrg) {
			DBFQuery.leftJoin(qPeople.records, 'POSL_RAB', qOrg.records, 'KOD');
		}
		if(qProf) {
			DBFQuery.leftJoin(qPeople.records, 'PROF_OBR', qProf.records, 'PROF1');
		}
		return res.render('peaple_index.html', { title: 'Поиск людей', formvals: form, peopleList: qPeople.records});
	};
	
	var qPeople = new DBFQuery( pathName + 'FIL_OBR.DBF',
							function(record) {
								if(!record['FIO']) {
									return false;
								}
								if(record['UVOL_PR'] && record['UVOL_PR'] == 0) {
									return false;
								}
								var fioVal = record['FIO'].trim().toLowerCase();
								var borndateVal = record['ROGD_DT'];
								var check = true, bTmp;
								if(formBorndate.length == 3) {
									check &= borndateVal == (formBorndate[2]+formBorndate[1]+formBorndate[0]);
								}
								for(i in formFIO) {
									check &= formFIO[i].length == 0 || fioVal.indexOf(formFIO[i]) > -1;
								}
								if(qProf) {
									bTmp = false;
									for(i in qProf.records) {
										bTmp |= qProf.records[i]['PROF1'] == record['PROF_OBR'];
										if(bTmp)
											break;
									}
									check &= bTmp;
								}
								if(qOrg) {
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
								return check;								
							},
							['FIO'],
							['KOD_RM','IND_KART','KART_N','OBR_DT','FIO','POL','ROGD_DT','DATA_KOR','PROF_OBR','POSL_RAB'],
							'cp866', finish);
	
	qPeople.selectSimple();
};

exports.search = function(req, res) {	
	
};

var formValidate = function(form) {
	return (form['fio'] && form['fio'].length > 0) ||
			(form['prof_obraz'] && form['prof_obraz'].length > 0) ||
			(form['last_org'] && form['last_org'].length > 0) ||
			(form['born_date'] && form['born_date'].split('.').length == 3);
			//(form['prof_obraz'].length > 0) ||
			//(form['phone_num'].length > 0);
};

var uglyDateCorrect = function(date) {
	if(!date)
		return '';
	var res = date.toString();
	res = res.slice(6,8)+'.'+res.slice(4,6)+'.'+res.slice(0,4);
	return res;
};
