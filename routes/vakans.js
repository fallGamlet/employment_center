
var DBFQuery = require("dbfkit").DBFQuery;
var mySettings = require('../settings');

exports.index = function(req, res) {
	var tstart = Date.now();
	var tend;
	var needWait = 2;
	
	
	var finish = function() {
		needWait--;
		if(needWait <= 0) {			
			console.log("all readed... "+needWait);
			DBFQuery.leftJoin(vakans.records, 'KPRED', org.records, 'KOD');
			tend = Date.now();
			var dt = (tend - tstart)/1000;
			return res.render('vakans_index.html', { title: 'Вакансии', vakansList: vakans.records, timeLeft: dt});
		}
	};
	
	var pathName = mySettings.dbfBasePath;
	var vakans = new DBFQuery(pathName+'FIL_VAK.DBF', 
							function(record) { 
								var count = record['KOL_G'] + record['KOL_M'] + record['KOL_S'];
								record['count'] = count;
								return typeof(record['NV']) == 'number' &&  count > 0;
							}, 
							['NSPEC'], 
							['KPRED', 'NSPEC', 'OBR', 'count', 'ZP', 'KAT'],  
							"cp866", finish);
	var org = new DBFQuery(pathName+'KL_PRED.DBF', null, null,
							['KOD', 'NAIM'],
							"cp866", finish);
	
	vakans.selectSimple();
	org.selectSimple();
	
	setTimeout(function(){
			console.log('reading ended... '+needWait);
			return res.render('404.html', { err: 'time out'});
		}, 5000);
};



