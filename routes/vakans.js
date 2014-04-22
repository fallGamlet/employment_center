
var DBFQuery = require("dbfkit").DBFQuery;
var mySettings = require('../settings');

exports.index = function(req, res) {
	return res.render('vakans_index.html', { title: 'Вакансии' });
}

exports.search = function(req, res) {
	var form = req.query;
	if(form.org || form.spec)
		return res.redirect('/vakansii/view'+req._parsedUrl.search);
	
	err = {};
	if(!form.org)
		err['org'] = true;
	if(!form.spec)
		err['spec'] = true;
	return res.render('vakans_search.html', { title: 'Вакансии', err:err });
}

exports.view = function(req, res) {
	var tstart = Date.now();
	var tend;
	var needWait = 2;
	var form = req.query;
	var whereOrg = null;
	var whereSpec = null;
	
	if(form.org && form.org.length > 0) {
		form.org = form.org.toString().trim().toLowerCase();
		whereOrg = function(record) {
			if(record['NAIM']) {
				return record['NAIM'].toString().toLowerCase().indexOf(form.org) > -1;
			} else {
				return false;
			}
		}
	}
	if(form.spec && form.spec.length > 0) {
		form.spec = form.spec.toString().trim().toLowerCase();
		whereSpec = function(record) {
			if(record['NSPEC']) {
				return record['NSPEC'].toLowerCase().indexOf(form.spec) > -1;
			} else {
				return false;
			}
		}
	}
	
	var finish = function() {
		needWait--;
		if(needWait <= 0) {			
			console.log("all readed... "+needWait);
			DBFQuery.leftJoin(vakans.records, 'KPRED', org.records, 'KOD');
			tend = Date.now();
			var dt = (tend - tstart)/1000;
			return res.render('vakans_view.html', { title: 'Вакансии', vakansList: vakans.records, timeLeft: dt});
		}
	};
	
	var pathName = mySettings.dbfBasePath;
	var vakans = new DBFQuery(pathName+'FIL_VAK.DBF', 
							function(record) { 
								if(typeof(record['NV']) != 'number')
									return false;
								var check = true;
								if(whereSpec) {
									check &= whereSpec(record);
								}
								if(whereOrg) {
									check &= org.records.some(function(element) {
													//~ if(record['KPRED'] == 9770)
														//~ console.log(record);
													return record['KPRED'] == element['KOD'];
												});
								}
								var count = record['KOL_G'] + record['KOL_M'] + record['KOL_S'];
								record['count'] = count;
								// Если не заданы методы фильтры организации или специальности, 
								// то выводятся вакагсии на текущий момент
								if(whereOrg || whereSpec)
									check &= count > 0;
								return check;
							}, 
							['NSPEC'], 
							['KPRED', 'NSPEC', 'OBR', 'count', 'ZP', 'KAT'],  
							"cp866", finish);
							
	var org = new DBFQuery(pathName+'KL_PRED.DBF', 
							whereOrg, 
							null,
							['KOD', 'NAIM'],
							"cp866", function(){
								needWait--;
								vakans.selectSimple();
							});
	
	org.selectSimple();
	
	setTimeout(function(){
			console.log('reading ended... '+needWait);
			return res.render('404.html', { err: 'time out'});
	}, 6000);
};



