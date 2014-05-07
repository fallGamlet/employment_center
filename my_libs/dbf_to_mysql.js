(function() {
	module.exports = function(options) {
		
		var mysql     = require('mysql'),
			async     = require('async'),
			dbfkit    = require("dbfkit"),
			DBFQuery  = dbfkit.DBFQuery,
			DBFParser = dbfkit.DBFParser,
			path,
			dbConOptions,
			start_time,
			end_time;
		
		start_time = Date.now();
		end_time = null;
		
		if(options.dbfpath) { path = options.dbfpath; } 
		else { path = "R:/CZNF/"; }
		
		if(options.dbconoptions) { dbConOptions = options.dbconoptions; } 
		else { dbConOptions = { host: 'localhost', port: 3311, user: 'root', password: 'root' }; }
				
		var uglyDateCorrect = function(date) {
			if(!date)
				return '';
			var res = date.toString();
			res = res.slice(0,4)+'-'+res.slice(4,6)+'-'+res.slice(6,8);
			return res;
		};
		var uglyDateToString = function(date) {
			var v = uglyDateCorrect(date);
			if(v.length == 0)
				return null;
			else
				return "'"+v+"'";
		}
		var fieldToString = function(val) {
			if(val == null || val == undefined)
				return null;
			else if(typeof(val) == 'object')
				return "'"+ val.toISOString().slice(0,10) +"'";
			else if(typeof(val) == 'number')
				return val;
			else 
				return "'"+val+"'";
		}

		
		async.series([
			function(callback) {
				var connection = mysql.createConnection(dbConOptions);
				connection.connect();

				var qarr = [];
				//~ qarr.push("drop database if exists czn; ");
				qarr.push("create database if not exists czn default character set utf8 default collate utf8_general_ci;");
				// Таблица "Организации"
				// KL_PRED.DBF									KOD,N,9,0	NAIM,C,50	NP,N,2,0	RAION,N,2,0	ADRES,C,60	TEL,N,7,0	OTR,N,3,0	SEKTOR,N,2,0	SOBSTV,N,2,0	DOP,N,2,0	FIO_Z,C,30
				qarr.push("create table if not exists czn.org (id integer, name varchar(500), city_id integer, district_id integer, address varchar(60), phone varchar(60), otrnarhoz_id integer, secteconom_id integer, ownership_id integer, dop_id integer, fiocustomer varchar(50));");
				qarr.push("delete from czn.org");
				// Таблица "Профессии"
				// KL_PROF.DBF									PROF1,C,6	NAIM,C,60	KAT,N,2,0
				qarr.push("create table if not exists czn.prof (id integer, name varchar(60), proftype_id integer);");
				qarr.push("delete from czn.prof");
				// Таблица "Виды серий документов"
				// KL_SER.DBF 									SERV,N,2,0	SERVT,C,8
				qarr.push("create table if not exists czn.doc_series (id integer, name varchar(10));");
				qarr.push("delete from czn.doc_series");
				// Таблица "Тип образования"
				// KL_OBRAZ.DBF									OBRAZ,C,1	NAIM,C,19	KOD,N,9,0
				qarr.push("create table if not exists czn.education_type (id integer, name varchar(50));");
				qarr.push("delete from czn.education_type");
				// Таблица "Гражданство"
				// KL_GRAGD.DBF 								KOD,N,4,0	NAIM,C,15
				qarr.push("create table if not exists czn.citizen (id integer, name varchar(50));");
				qarr.push("delete from czn.citizen");
				// KL_DOK.DBF 									KOD,C,2	NAIM,C,12
				qarr.push("create table if not exists czn.doc_type (id integer, name varchar(50));");
				qarr.push("delete from czn.doc_type");
				// KL_OTN.DBF									OTNZAN,C,1	NAIM,C,31	KOD,N,9,0
				qarr.push("create table if not exists czn.empl_status (id integer, name varchar(50));");
				qarr.push("delete from czn.empl_status");
				// KL_NEZVI.DBF 								VID,C,1	NAIM,C,45	KOD,N,9,0
				qarr.push("create table if not exists czn.unempl_type (id integer, name varchar(50));");
				qarr.push("delete from czn.unempl_type");
				// KL_NEZAN.DBF 								NEZAN,C,2	NAIN,C,45
				qarr.push("create table if not exists czn.soc_protection_type (id integer, name varchar(50));");
				qarr.push("delete from czn.soc_protection_type");
				// KL_KVA.DBF									KVAL,C,2	NAKVA,C,12	KVA,C,2
				qarr.push("create table if not exists czn.qualification (id integer, name varchar(50), altcode varchar(2));");
				qarr.push("delete from czn.qualification");
				// KL_SEKT.DBF 									KODS,C,1	NAIMS,C,20	KOD,N,9,0
				qarr.push("create table if not exists czn.secteconom (id integer, name varchar(50));");
				qarr.push("delete from czn.secteconom");
				// KL_OTR.DBF 									KOD,C,2	NAIM,C,35	KODN,N,9,0	KOD_1T,N,2,0
				qarr.push("create table if not exists czn.otrnarhoz (id integer, name varchar(50), code_1t integer);");
				qarr.push("delete from czn.otrnarhoz");
				// KL_UVOL.DBF 									UVOL_PR,C,2	NAIM,C,28	PRU,N,2,0	KOD,N,2,0
				qarr.push("create table if not exists czn.dismiss_type (id integer, name varchar(50));");
				qarr.push("delete from czn.dismiss_type");
				// KL_OKL.DBF 									KOD,C,2	NAIM,C,23
				qarr.push("create table if not exists czn.salary_type (id integer, name varchar(50));");
				qarr.push("delete from czn.salary_type");
				// KL_VIDRA.DBF 								KOD,C,2	NAIM,C,38
				qarr.push("create table if not exists czn.work_type (id integer, name varchar(50));");
				qarr.push("delete from czn.work_type");
				// KL_SMEN.DBF 									KOD,N,2,0	NAIM,C,21
				qarr.push("create table if not exists czn.work_shift (id integer, name varchar(50));");
				qarr.push("delete from czn.work_shift");
				// KL_TR_OB.DBF 								KOD,C,2	NAIM,C,17
				qarr.push("create table if not exists czn.education_required (id integer, name varchar(50));");
				qarr.push("delete from czn.education_required");
				// KL_NAC.DBF 									NAC,C,2	NAIM,C,12
				qarr.push("create table if not exists czn.nationality (id integer, name varchar(50));");
				qarr.push("delete from czn.nationality");
				// KL_ROTN.DBF 									ROD_OTN,N,2,0	NAME,C,10	VIDR,N,2,0
				qarr.push("create table if not exists czn.kinship (id integer, name varchar(50));");
				qarr.push("delete from czn.kinship");
				// KL_RAIOG.DBF 								KODR,N,2,0	NAIMR,C,40
				qarr.push("create table if not exists czn.district (id integer, name varchar(50));");
				qarr.push("delete from czn.district");
				// KL_ZAKR.DBF 									ZAKR_PR,C,2	NAIM,C,30
				qarr.push("create table if not exists czn.card_close_reason (id integer, name varchar(50));");
				qarr.push("delete from czn.card_close_reason");
				// KL_OTKAZ.DBF 								KOD,N,2,0	NAIM,C,30
				qarr.push("create table if not exists czn.work_rejection_reason (id integer, name varchar(50));");
				qarr.push("delete from czn.work_rejection_reason");
				// KL_FSOB.DBF									KODS,C,1	NAIMS,C,20	KOD,N,9,0	KOD_1T,N,2,0	NAME,C,30
				qarr.push("create table if not exists czn.ownership (id integer, name varchar(50), codes integer, code_1t integer, names varchar(50));");
				qarr.push("delete from czn.ownership");
				// KL_NP.DBF 									KOD,N,2,0	NAME,C,30
				qarr.push("create table if not exists czn.city (id integer, name varchar(50));");
				qarr.push("delete from czn.city");
				// KL_VIDTR.DBF 								KOD,N,9,0	NAME,C,30
				qarr.push("create table if not exists czn.work_book_type (id integer, name varchar(50));");
				qarr.push("delete from czn.work_book_type");
				// KL_VIDIW.DBF 								KOD,N,9,0	NAME,C,50	PR,N,2,0	GR,N,2,0
				qarr.push("create table if not exists czn.payment_change_type (id integer, name varchar(50), pr integer, gr integer);");
				qarr.push("delete from czn.payment_change_type");
				// KL_PRIW.DBF 									KODV,N,4,0	KODP,N,4,0	NAME,C,50	NAMEP,C,70	PR,N,2,0
				qarr.push("create table if not exists czn.payment_change_reason (id integer, code_v integer, name varchar(100), code_p integer, name_p varchar(100), pr integer);");
				qarr.push("delete from czn.payment_change_reason");
				// PRIKAZ.DBF 									KART_N,N,6,0	IND_KART,N,2,0	DATA_OB,D	NOMPRIK,N,6,0	NOMVYP,N,4,0	DATPRIK,D	VIDI,N,4,0	PRIZ,N,4,0	PR_OBV,N,1,0	INF,C,130	OTM,N,2,0
				qarr.push("create table if not exists czn.order (id integer NOT NULL AUTO_INCREMENT PRIMARY KEY, card_n integer, ind_card integer, ob_date datetime, order_num integer, nomvyp integer, order_date datetime, vidi integer, priz integer, pr_obv integer, inf varchar(200), otm integer);");
				qarr.push("delete from czn.order");
				// FIL_OBR.DBF 									KART_N,N,6,0	IND_KART,N,2,0	KOD_RM,C,1	OBR_DT,N,8,0	FIO,C,50	POL,C,1	DOKVID,N,2,0	DOK_SERN,C,8	DOK_SER,C,3	DOK_N,N,10,0	DOK_S,C,10	KEM_VID,C,30	DOK_DT,N,8,0	ROGD_DT,N,8,0	GRAGD,N,2,0	NAC,N,2,0	ADRESS,C,54	TEL,N,7,0	OTNZAN,N,2,0	VIDNEZAN,N,2,0	KAT_SOCZ,N,2,0	DATABZN,N,8,0	DATABZK,N,8,0	ZAKRK,N,2,0	OBRAZ,N,2,0	PROF_OBR,N,6,0	KVA_OBR,N,2,0	STAG_PF,N,3,0	POSL_RAB,N,6,0	DOLGN,N,6,0	KVA_DOLGN,N,2,0	STAG_O,N,3,0	STAG_O_M,N,3,0	STAG_PR_G,N,3,0	STAG_PR_M,N,3,0	STAG_12,N,2,0	SEKT_EK,N,2,0	OTR_NH,N,2,0	UVOL_DT,N,8,0	SREDN_ZAR,N,10,0	SEM_POL,N,2,0	UVOL_PR,N,2,0	KOL_IGD,N,3,0	TR_FSOB,N,2,0	TR_PRED,N,9,0	TR_PROF,N,6,0	TR_KVA,N,2,0	TR_KOLDPRF,N,3,0	TR_SOP,N,2,0	TR_VIDR,N,2,0	TR_SMEN,N,2,0	TR_ZARPL,N,10,0	TR_RAIG,N,2,0	TR_KOLOPRF,N,3,0	DATA_KOR,D	STATUS_OB,N,2,0	SN_OB,N,2,0	DAT_OSU,D	VID_TRKN,N,2,0	SER_TRKN,C,8	NOM_TRKN,C,12	DAT_TRKN,D	POVTOR,N,1,0	PR_POSOB,N,2,0	PR_STIP,N,2,0	KODNP,N,2,0	RAIOG,N,2,0	VID_ADR,N,1,0	KOD_UL,N,4,0	NDOM,N,3,0	IND_DOM,C,1	NKV,N,3,0
				qarr.push("create table if not exists czn.person_card (id integer NOT NULL AUTO_INCREMENT PRIMARY KEY, card_n integer, ind_card integer, code_rm varchar(5), obr_date datetime, fio varchar(200), sex varchar(20), doc_type_id integer, doc_sern varchar(10), doc_series varchar(10), doc_num integer, doc_s integer, doc_bywho varchar(100), doc_date datetime, born_date datetime, citizen_id integer, nationality_id integer, address varchar(200), phone_num varchar(25), empl_status_id integer, unempl_type_id integer, soc_protection_type_id integer, bzn_date datetime, bzk_date datetime, ZAKRK integer, education_type_id integer, prof_id integer, qualific_id integer, stag_pf integer, last_org_id integer, post_id integer, post_qualific_id integer, stag_o integer, stag_o_m integer, stag_pr_g integer, stag_pr_m integer, stag_12 integer, secteconom_id integer, otrnarhoz_id integer, dismiss_date datetime, avg_salary integer, femaly_status_id integer, dismiss_type_id integer, dependent_num integer, TR_FSOB integer, TR_PRED integer, TR_PROF integer, TR_KVA integer, TR_KOLDPRF integer, TR_SOP integer, TR_VIDR integer, TR_SMEN integer, TR_ZARPL integer, TR_RAIG integer, TR_KOLOPRF integer, DATA_KOR datetime, STATUS_OB integer, SN_OB integer, DAT_OSU datetime, VID_TRKN integer, SER_TRKN varchar(25), NOM_TRKN integer, DAT_TRKN datetime, POVTOR integer, PR_POSOB integer, PR_STIP integer, city_id integer, district_id integer);");
				qarr.push("delete from czn.person_card");
				// создание представления для person_card
				qarr.push("DROP VIEW IF EXISTS czn.person_card_view;");
				qarr.push("CREATE VIEW czn.person_card_view AS SELECT pers.id, pers.card_n, pers.ind_card, pers.code_rm, pers.obr_date, pers.fio, pers.sex, pers.doc_type_id, doc_type.name as doc_type_name, pers.doc_sern, doc_series.name as doc_sern_name, pers.doc_series, pers.doc_num, pers.doc_s, pers.doc_bywho, pers.doc_date, pers.born_date, pers.citizen_id, citizen.name as citizen_name, pers.nationality_id, nationality.name as nationality_name, pers.address, pers.phone_num, pers.empl_status_id, empl_status.name as empl_status_name, pers.unempl_type_id, unempl_type.name as unempl_type_name, pers.soc_protection_type_id, soc_protection_type.name as soc_protection_type_name, pers.bzn_date, pers.bzk_date, pers.ZAKRK, pers.education_type_id, education_type.name as education_type_name, pers.prof_id, prof.name as prof_name, pers.qualific_id, qualification.name as qualific_name, pers.stag_pf, pers.last_org_id, org.name as last_org_name, pers.post_id, post.name as post_name, pers.post_qualific_id, post_qualific.name as post_qualific_name, pers.stag_o, pers.stag_o_m, pers.stag_pr_g, pers.stag_pr_m, pers.stag_12, pers.secteconom_id, secteconom.name as secteconom_name, pers.otrnarhoz_id, otrnarhoz.name as otrnarhoz_name, pers.dismiss_date, pers.avg_salary, pers.femaly_status_id, pers.dismiss_type_id, dismiss_type.name as dismiss_type_name, pers.dependent_num, pers.TR_FSOB, pers.TR_PRED, pers.TR_PROF, pers.TR_KVA, pers.TR_KOLDPRF, pers.TR_SOP, pers.TR_VIDR, pers.TR_SMEN, pers.TR_ZARPL, pers.TR_RAIG, pers.TR_KOLOPRF, pers.DATA_KOR, pers.STATUS_OB, pers.SN_OB, pers.DAT_OSU, pers.VID_TRKN, pers.SER_TRKN, pers.NOM_TRKN, pers.DAT_TRKN, pers.POVTOR, pers.PR_POSOB, pers.PR_STIP, pers.city_id, city.name as city_name, pers.district_id, district.name as district_name FROM czn.person_card pers LEFT JOIN czn.city city ON city.id = pers.city_id LEFT JOIN czn.district district ON district.id = pers.district_id LEFT JOIN czn.doc_type doc_type ON doc_type.id = pers.doc_type_id LEFT JOIN czn.doc_series doc_series ON doc_series.id = pers.doc_sern LEFT JOIN czn.citizen citizen ON citizen.id = pers.citizen_id LEFT JOIN czn.nationality nationality ON nationality.id = pers.nationality_id LEFT JOIN czn.empl_status empl_status ON empl_status.id = pers.empl_status_id LEFT JOIN czn.unempl_type unempl_type ON unempl_type.id = pers.unempl_type_id LEFT JOIN czn.soc_protection_type soc_protection_type ON soc_protection_type.id = pers.soc_protection_type_id LEFT JOIN czn.dismiss_type dismiss_type ON dismiss_type.id = pers.dismiss_type_id LEFT JOIN czn.secteconom secteconom ON secteconom.id = pers.secteconom_id LEFT JOIN czn.otrnarhoz otrnarhoz ON otrnarhoz.id = pers.otrnarhoz_id LEFT JOIN czn.education_type education_type ON education_type.id = pers.education_type_id LEFT JOIN czn.prof prof ON prof.id = pers.prof_id LEFT JOIN czn.qualification qualification ON qualification.id = pers.qualific_id LEFT JOIN czn.org org ON org.id = pers.last_org_id LEFT JOIN czn.qualification post_qualific ON post_qualific.id = pers.post_qualific_id LEFT JOIN czn.prof post ON post.id = pers.post_id");
				
				for(i in qarr) {
					connection.query(qarr[i], function(err) {
					  if (err) throw err;
					});
				}
				connection.end(function(){
					callback(null, "tables created...OK");
				});

			},
			// FIL_OBR.DBF
			function(callback) {
				var connection = mysql.createConnection(dbConOptions);
				connection.connect();
				var orgs = new DBFQuery(path + "FIL_OBR.DBF",
							function(record) {
								return (record['KART_N'] !== null && record['KART_N'] !== undefined);
							},
							null,
							null,
							"cp866",
							function(records) {
								console.log("DBF person_card count: "+ records.length);
								records.forEach(function(record, i) {
									
									var qstr = "insert into czn.person_card (id, card_n, ind_card, code_rm , obr_date, fio , sex , doc_type_id, doc_sern, doc_series, doc_num, doc_s, doc_bywho, doc_date, born_date, citizen_id, nationality_id, address , phone_num, empl_status_id, unempl_type_id, soc_protection_type_id, bzn_date, bzk_date, ZAKRK, education_type_id, prof_id, qualific_id, stag_pf, last_org_id, post_id, post_qualific_id, stag_o, stag_o_m, stag_pr_g, stag_pr_m, stag_12, secteconom_id, otrnarhoz_id, dismiss_date, avg_salary, femaly_status_id, dismiss_type_id, dependent_num, TR_FSOB, TR_PRED, TR_PROF, TR_KVA, TR_KOLDPRF, TR_SOP, TR_VIDR, TR_SMEN, TR_ZARPL, TR_RAIG, TR_KOLOPRF, DATA_KOR, STATUS_OB, SN_OB, DAT_OSU, VID_TRKN, SER_TRKN, NOM_TRKN, DAT_TRKN, POVTOR, PR_POSOB, PR_STIP, city_id, district_id) values (";
									qstr += (i+1) + ", ";
									qstr += fieldToString(record["KART_N"]) +", ";
									qstr += fieldToString(record["IND_KART"]) +", ";
									qstr += fieldToString(record["KOD_RM"]) +", ";
									qstr += uglyDateToString(record["OBR_DT"]) + ", ";
									qstr += fieldToString(record["FIO"]) +", ";
									qstr += fieldToString(record["POL"]) +", ";
									qstr += fieldToString(record["DOKVID"]) +", ";
									qstr += fieldToString(record["DOK_SERN"]) +", ";
									qstr += fieldToString(record["DOK_SER"]) +", ";
									qstr += fieldToString(record["DOK_N"]) +", ";
									qstr += fieldToString(record["DOK_S"]) +", ";
									qstr += fieldToString(record["KEM_VID"]) +", ";
									qstr += uglyDateToString(record["DOK_DT"]) + ", ";
									qstr += uglyDateToString(record["ROGD_DT"]) + ", ";
									qstr += fieldToString(record["GRAGD"]) +", ";
									qstr += fieldToString(record["NAC"]) +", ";
									qstr += fieldToString(record["ADRESS"]) +", ";
									qstr += fieldToString(record["TEL"]) +", ";
									qstr += fieldToString(record["OTNZAN"]) +", ";
									qstr += fieldToString(record["VIDNEZAN"]) +", ";
									qstr += fieldToString(record["KAT_SOCZ"]) +", ";
									qstr += uglyDateToString(record["DATABZN"]) +", ";
									qstr += uglyDateToString(record["DATABZK"]) +", ";
									qstr += fieldToString(record["ZAKRK"]) +", ";
									qstr += fieldToString(record["OBRAZ"]) +", ";
									qstr += fieldToString(record["PROF_OBR"]) +", ";
									qstr += fieldToString(record["KVA_OBR"]) +", ";
									qstr += fieldToString(record["STAG_PF"]) +", ";
									qstr += fieldToString(record["POSL_RAB"]) +", ";
									qstr += fieldToString(record["DOLGN"]) +", ";
									qstr += fieldToString(record["KVA_DOLGN"]) +", ";
									qstr += fieldToString(record["STAG_O"]) +", ";
									qstr += fieldToString(record["STAG_O_M"]) +", ";
									qstr += fieldToString(record["STAG_PR_G"]) +", ";
									qstr += fieldToString(record["STAG_PR_M"]) +", ";
									qstr += fieldToString(record["STAG_12"]) +", ";
									qstr += fieldToString(record["SEKT_EK"]) +", ";
									qstr += fieldToString(record["OTR_NH"]) +", ";
									qstr += uglyDateToString(record["UVOL_DT"]) +", ";
									qstr += fieldToString(record["SREDN_ZAR"]) +", ";
									qstr += fieldToString(record["SEM_POL"]) +", ";
									qstr += fieldToString(record["UVOL_PR"]) +", ";
									qstr += fieldToString(record["KOL_IGD"]) +", ";
									qstr += fieldToString(record["TR_FSOB"]) +", ";
									qstr += fieldToString(record["TR_PRED"]) +", ";
									qstr += fieldToString(record["TR_PROF"]) +", ";
									qstr += fieldToString(record["TR_KVA"]) +", ";
									qstr += fieldToString(record["TR_KOLDPRF"]) +", ";
									qstr += fieldToString(record["TR_SOP"]) +", ";
									qstr += fieldToString(record["TR_VIDR"]) +", ";
									qstr += fieldToString(record["TR_SMEN"]) +", ";
									qstr += fieldToString(record["TR_ZARPL"]) +", ";
									qstr += fieldToString(record["TR_RAIG"]) +", ";
									qstr += fieldToString(record["TR_KOLOPRF"]) +", ";
									qstr += fieldToString(record["DATA_KOR"]) +", "; /*datetime*/
									qstr += fieldToString(record["STATUS_OB"]) +", ";
									qstr += fieldToString(record["SN_OB"]) +", ";
									qstr += fieldToString(record["DAT_OSU"]) +", "; /*datetime*/
									qstr += fieldToString(record["VID_TRKN"]) +", ";
									qstr += fieldToString(record["SER_TRKN"]) +", ";
									qstr += fieldToString(record["NOM_TRKN"]) +", ";
									qstr += fieldToString(record["DAT_TRKN"]) +", "; /*datetime*/
									qstr += fieldToString(record["POVTOR"]) +", ";
									qstr += fieldToString(record["PR_POSOB"]) +", ";
									qstr += fieldToString(record["PR_STIP"]) +", ";
									qstr += fieldToString(record["KODNP"]) +", ";
									qstr += fieldToString(record["RAIOG"]) +")";
									//~ console.log(qstr);
									connection.query(qstr, function(err, res) {
										if (err) {
											console.log(qstr);
											console.log(err);
											throw err;
										}
									});
								});
								connection.end(function() {
									callback(null, "person_card... OK");
								});
							});
				orgs.selectSimple();
			},
			// PRIKAZ.DBF
			function(callback) {
				var connection = mysql.createConnection(dbConOptions);
				connection.connect();
				var orgs = new DBFQuery(path + "PRIKAZ.DBF",
							function(record) {
								return (record['KART_N'] !== null && record['KART_N'] !== undefined);
							},
							null,
							null,
							"cp866",
							function(records) {
								console.log("DBF order count: "+ records.length);
								records.forEach(function(record, i) {
									if(record["NAME"]) record["NAME"] = record["NAME"].replace(/\\/gi, "/");
									if(record["NAMEP"]) record["NAMEP"] = record["NAMEP"].replace(/\\/gi, "/");
									if(record["DATA_OB"]) record["DATA_OB"] = "'"+ record["DATA_OB"].toISOString().slice(0,10) +"'";
									if(record["DATPRIK"]) record["DATPRIK"] = "'"+ record["DATPRIK"].toISOString().slice(0,10) +"'";
									var qstr = "insert into czn.order (id, card_n, ind_card, ob_date, order_num, nomvyp, order_date, vidi, priz, pr_obv, inf, otm) values (";
									qstr += (i+1) + ", ";
									qstr += record["KART_N"] + ", ";
									qstr += record["IND_KART"] + ", ";
									qstr += record["DATA_OB"] + ", ";
									qstr += record["NOMPRIK"] + ", ";
									qstr += record["NOMVYP"] + ", ";
									qstr += record["DATPRIK"] + ", ";
									qstr += record["VIDI"] + ", ";
									qstr += record["PRIZ"] + ", ";
									qstr += record["PR_OBV"] + ", ";
									qstr += "'"+record["INF"] + "', ";
									qstr += record["OTM"] + ")";
									//~ console.log(qstr);
									connection.query(qstr, function(err, res) {
										if (err) {
											console.log(qstr);
											console.log(err);
											throw err;
										}
									});
								});
								connection.end(function() {
									callback(null, "order... OK");
								});
							});
				orgs.selectSimple();
			},
			// KL_PRIW.DBF
			function(callback) {
				var connection = mysql.createConnection(dbConOptions);
				connection.connect();
				var orgs = new DBFQuery(path + "KL_PRIW.DBF",
							function(record) {
								return (record['KODV'] !== null && record['KODV'] !== undefined);
							},
							null,
							null,
							"cp866",
							function(records) {
								console.log("DBF payment_change_reason count: "+ records.length);
								records.forEach(function(record, i) {
									if(record["NAME"]) record["NAME"] = record["NAME"].replace(/\\/gi, "/");
									if(record["NAMEP"]) record["NAMEP"] = record["NAMEP"].replace(/\\/gi, "/");
									var qstr = "insert into czn.payment_change_reason (id, code_v, name, code_p, name_p, pr) values (";
									qstr += (i+1) + ", ";
									qstr += record["KODV"] + ", ";
									qstr += "'"+record["NAME"] + "', ";
									qstr += record["KODP"] + ", ";
									qstr += "'"+record["NAMEP"] + "', ";
									qstr += record["PR"] + ")";
									//~ console.log(qstr);
									connection.query(qstr, function(err, res) {
										if (err) {
											console.log(qstr);
											console.log(err);
											throw err;
										}
									});
								});
								connection.end(function() {
									callback(null, "payment_change_reason... OK");
								});
							});
				orgs.selectSimple();
			},
			// KL_VIDIW.DBF
			function(callback) {
				var connection = mysql.createConnection(dbConOptions);
				connection.connect();
				var orgs = new DBFQuery(path + "KL_VIDIW.DBF",
							function(record) {
								return (record['KOD'] !== null && record['KOD'] !== undefined);
							},
							null,
							null,
							"cp866",
							function(records) {
								console.log("DBF payment_change_type count: "+ records.length);
								records.forEach(function(record) {
									if(record["NAME"]) record["NAME"] = record["NAME"].replace(/\\/gi, "/");
									var qstr = "insert into czn.payment_change_type (id, pr, gr, name) values (";
									qstr += record["KOD"] + ", ";
									qstr += record["PR"] + ", ";
									qstr += record["GR"] + ", ";
									qstr += "'"+record["NAME"] + "');";
									//~ console.log(qstr);
									connection.query(qstr, function(err, res) {
										if (err) {
											console.log(qstr);
											console.log(err);
											throw err;
										}
									});
								});
								connection.end(function() {
									callback(null, "payment_change_type... OK");
								});
							});
				orgs.selectSimple();
			},
			// KL_VIDTR.DBF
			function(callback) {
				var connection = mysql.createConnection(dbConOptions);
				connection.connect();
				var orgs = new DBFQuery(path + "KL_VIDTR.DBF",
							function(record) {
								return (record['KOD'] !== null && record['KOD'] !== undefined);
							},
							null,
							null,
							"cp866",
							function(records) {
								console.log("DBF work_book_type count: "+ records.length);
								records.forEach(function(record) {
									if(record["NAME"]) record["NAME"] = record["NAME"].replace(/\\/gi, "/");
									var qstr = "insert into czn.work_book_type (id, name) values (";
									qstr += record["KOD"] + ", ";
									qstr += "'"+record["NAME"] + "');";
									//~ console.log(qstr);
									connection.query(qstr, function(err, res) {
										if (err) {
											console.log(qstr);
											console.log(err);
											throw err;
										}
									});
								});
								connection.end(function() {
									callback(null, "work_book_type... OK");
								});
							});
				orgs.selectSimple();
			},
			// KL_NP.DBF
			function(callback) {
				var connection = mysql.createConnection(dbConOptions);
				connection.connect();
				var orgs = new DBFQuery(path + "KL_NP.DBF",
							function(record) {
								return (record['KOD'] !== null && record['KOD'] !== undefined);
							},
							null,
							null,
							"cp866",
							function(records) {
								console.log("DBF city count: "+ records.length);
								records.forEach(function(record) {
									if(record["NAME"]) record["NAME"] = record["NAME"].replace(/\\/gi, "/");
									var qstr = "insert into czn.city (id, name) values (";
									qstr += record["KOD"] + ", ";
									qstr += "'"+record["NAME"] + "');";
									//~ console.log(qstr);
									connection.query(qstr, function(err, res) {
										if (err) {
											console.log(qstr);
											console.log(err);
											throw err;
										}
									});
								});
								connection.end(function() {
									callback(null, "city... OK");
								});
							});
				orgs.selectSimple();
			},
			// KL_FSOB.DBF
			function(callback) {
				var connection = mysql.createConnection(dbConOptions);
				connection.connect();
				var orgs = new DBFQuery(path + "KL_FSOB.DBF",
							function(record) {
								return (record['KOD'] !== null && record['KOD'] !== undefined);
							},
							null,
							null,
							"cp866",
							function(records) {
								console.log("DBF ownership count: "+ records.length);
								records.forEach(function(record) {
									if(record["NAME"]) record["NAME"] = record["NAME"].replace(/\\/gi, "/");
									if(record["NAIMS"]) record["NAIMS"] = record["NAIMS"].replace(/\\/gi, "/");
									var qstr = "insert into czn.ownership (id, name, codes, code_1t, names) values (";
									qstr += record["KOD"] + ", ";
									qstr += "'"+record["NAME"] + "', ";
									qstr += record["KODS"] + ", ";
									qstr += record["KOD_1T"] + ", ";
									qstr += "'"+record["NAIMS"] + "');";
									//~ console.log(qstr);
									connection.query(qstr, function(err, res) {
										if (err) {
											console.log(qstr);
											console.log(err);
											throw err;
										}
									});
								});
								connection.end(function() {
									callback(null, "ownership... OK");
								});
							});
				orgs.selectSimple();
			},
			// KL_OTKAZ.DBF
			function(callback) {
				var connection = mysql.createConnection(dbConOptions);
				connection.connect();
				var orgs = new DBFQuery(path + "KL_OTKAZ.DBF",
							function(record) {
								return (record['KOD'] !== null && record['KOD'] !== undefined);
							},
							null,
							null,
							"cp866",
							function(records) {
								console.log("DBF work_rejection_reason count: "+ records.length);
								records.forEach(function(record) {
									record["NAIM"] = record["NAIM"].replace(/\\/gi, "/");
									var qstr = "insert into czn.work_rejection_reason (id, name) values (";
									qstr += record["KOD"] + ", ";
									qstr += "'"+record["NAIM"] + "');";
									//~ console.log(qstr);
									connection.query(qstr, function(err, res) {
										if (err) {
											console.log(qstr);
											console.log(err);
											throw err;
										}
									});
								});
								connection.end(function() {
									callback(null, "work_rejection_reason... OK");
								});
							});
				orgs.selectSimple();
			},
			// KL_ZAKR.DBF
			function(callback) {
				var connection = mysql.createConnection(dbConOptions);
				connection.connect();
				var orgs = new DBFQuery(path + "KL_ZAKR.DBF",
							function(record) {
								return (record['ZAKR_PR'] !== null && record['ZAKR_PR'] !== undefined);
							},
							null,
							null,
							"cp866",
							function(records) {
								console.log("DBF card_close_reason count: "+ records.length);
								records.forEach(function(record, i) {
									record["NAIM"] = record["NAIM"].replace(/\\/gi, "/");
									var qstr = "insert into czn.card_close_reason (id, name) values (";
									qstr += record["ZAKR_PR"] + ", ";
									qstr += "'"+record["NAIM"] + "');";
									//~ console.log(qstr);
									connection.query(qstr, function(err, res) {
										if (err) {
											console.log(qstr);
											console.log(err);
											throw err;
										}
										//~ console.log("orgs - "+i);
									});
								});
								connection.end(function() {
									callback(null, "card_close_reason... OK")
								});
							});
				orgs.selectSimple();
			},
			// KL_PRED.DBF	
			function(callback) {
				var connection = mysql.createConnection(dbConOptions);
				connection.connect();
				var orgs = new DBFQuery(path + "KL_PRED.DBF",
							function(record) {
								return (record['KOD'] !== null && record['KOD'] !== undefined) &&
									   (record['NAIM'] !== null && record['NAIM'] !== undefined);
							},
							null,
							null,
							"cp866",
							function(records) {
								console.log("DBF orgs count: "+ records.length);
								records.forEach(function(record, i) {
									//~ if(record["DOP"] == null) { record["DOP"] = 0; }
									//~ if(record["NP"] == null) { record["NP"] = 0; }
									//~ if(record["RAION"] == null) { record["RAION"] = 0; }
									//~ if(record["TEL"] == null) { record["TEL"] = 0; }
									//~ if(record["OTR"] == null) { record["OTR"] = 0; }
									//~ if(record["SEKTOR"] == null) { record["SEKTOR"] = 0; }
									//~ if(record["SOBSTV"] == null) { record["SOBSTV"] = 0; }
									//~ if(record["NAIM"] == null) { record["NAIM"] = ""; }
									//~ if(record["ADRES"] == null) { record["ADRES"] = ""; }
									var qstr = "insert into czn.org (id, name, city_id, district_id, address, phone, otrnarhoz_id, secteconom_id, ownership_id, dop_id, fiocustomer) values (";
									qstr += record["KOD"] + ", ";
									qstr += "'"+record["NAIM"] + "', ";
									qstr += record["NP"] + ", ";
									qstr += record["RAION"] + ", ";
									qstr += "'"+ record["ADRES"] +"', ";
									if(record["TEL"]) {
										qstr += "'"+ record["TEL"] +"', ";
									} else {
										qstr += "'', ";
									}
									qstr += record["OTR"] + ", ";
									qstr += record["SEKTOR"] + ", ";
									qstr += record["SOBSTV"] + ", ";
									qstr += record["DOP"] + ", ";
									qstr += "'"+record["FIO_Z"] + "');";
									//~ console.log(qstr);
									connection.query(qstr, function(err, res) {
										if (err) {
											console.log(qstr);
											console.log(err);
											throw err;
										}
										//~ console.log("orgs - "+i);
									});
								});
								var qstr = "ALTER IGNORE TABLE czn.org ADD PRIMARY KEY (id);";
								connection.query(qstr, function(err, res) {
									if (err) {
											console.log(qstr);
											console.log(err);
											throw err;
										}
								});
								connection.end(function() {
									callback(null, "orgs... OK")
								});
							});
				orgs.selectSimple();
			},
			// KL_PROF.DBF
			function(callback) {
				var connection = mysql.createConnection(dbConOptions);
				connection.connect();
				var  profs = new DBFQuery(path + "KL_PROF.DBF",
							function(record) {
								return (record['PROF1'] !== undefined && record['PROF1'] !== null) &&
										(record['NAIM'] !== undefined && record['NAIM'] !== null); 
							},
							null,
							null,
							"cp866",
							function(records) {
								console.log("DBF profs count: "+ records.length);
								records.forEach(function(record, i) {
									var qstr = "insert into czn.prof (id, name, proftype_id) values (";
									qstr += record["PROF1"] + ", ";
									qstr += "'"+record["NAIM"] + "', ";
									qstr += record["KAT"] + ");";
									//~ console.log(qstr);
									connection.query(qstr, function(err, res) {
										if (err) {
											console.log(qstr);
											console.log(err);
											throw err;
										} 
										//~ console.log("profs - "+i);
									});
								});
								var qstr = "ALTER IGNORE TABLE czn.prof ADD PRIMARY KEY (id);";
								connection.query(qstr, function(err, res) {
									if (err) {
											console.log(qstr);
											console.log(err);
											throw err;
										}
								});
								connection.end(function() {
									callback(null, "professions... OK");
								});
								
							});
				 profs.selectSimple();
			},
			// KL_SER.DBF
			function(callback) {
				var connection = mysql.createConnection(dbConOptions);
				connection.connect();
				var  docseries = new DBFQuery(path + "KL_SER.DBF",
							function(record) {
								return (record['SERV'] !== undefined && record['SERV'] !== null); 
							},
							null,
							null,
							"cp866",
							function(records) {
								console.log("DBF docseries count: "+ records.length);
								records.forEach(function(record) {
									var qstr = "insert into czn.doc_series (id, name) values (";
									qstr += record["SERV"] + ", ";
									qstr += "'"+record["SERVT"] + "');";
									//~ console.log(qstr);
									connection.query(qstr, function(err, res) {
										if (err) {
											console.log(qstr);
											console.log(err);
											throw err;
										} 
									});
								});
								connection.end(function() {
									callback(null, "docseries... OK");
								});
								
							});
				 docseries.selectSimple();
			},
			// KL_OBRAZ.DBF
			function(callback) {
				var connection = mysql.createConnection(dbConOptions);
				connection.connect();
				var  educationType = new DBFQuery(path + "KL_OBRAZ.DBF",
							function(record) {
								return (record['KOD'] !== undefined && record['KOD'] !== null); 
							},
							null,
							null,
							"cp866",
							function(records) {
								console.log("DBF educationtype count: "+ records.length);
								records.forEach(function(record) {
									var qstr = "insert into czn.education_type (id, name) values (";
									qstr += record["KOD"] + ", ";
									qstr += "'"+record["NAIM"] + "');";
									//~ console.log(qstr);
									connection.query(qstr, function(err, res) {
										if (err) {
											console.log(qstr);
											console.log(err);
											throw err;
										} 
									});
								});
								connection.end(function() {
									callback(null, "educationtype... OK");
								});
								
							});
				 educationType.selectSimple();
			},
			// KL_GRAGD.DB
			function(callback) {
				var connection = mysql.createConnection(dbConOptions);
				connection.connect();
				var  citizen = new DBFQuery(path + "KL_GRAGD.DBF",
							function(record) {
								return (record['KOD'] !== undefined && record['KOD'] !== null); 
							},
							null,
							null,
							"cp866",
							function(records) {
								console.log("DBF citizen count: "+ records.length);
								records.forEach(function(record) {
									var qstr = "insert into czn.citizen (id, name) values (";
									qstr += record["KOD"] + ", ";
									qstr += "'"+record["NAIM"] + "');";
									//~ console.log(qstr);
									connection.query(qstr, function(err, res) {
										if (err) {
											console.log(qstr);
											console.log(err);
											throw err;
										} 
									});
								});
								connection.end(function() {
									callback(null, "citizen... OK");
								});
								
							});
				 citizen.selectSimple();
			},
			// KL_DOK.DBF 
			function(callback) {
				var connection = mysql.createConnection(dbConOptions);
				connection.connect();
				var  docType = new DBFQuery(path + "KL_DOK.DBF",
							function(record) {
								return (record['KOD'] !== undefined && record['KOD'] !== null); 
							},
							null,
							null,
							"cp866",
							function(records) {
								console.log("DBF doctype count: "+ records.length);
								records.forEach(function(record) {
									var qstr = "insert into czn.doc_type (id, name) values (";
									qstr += record["KOD"] + ", ";
									qstr += "'"+record["NAIM"] + "');";
									//~ console.log(qstr);
									connection.query(qstr, function(err, res) {
										if (err) {
											console.log(qstr);
											console.log(err);
											throw err;
										} 
									});
								});
								connection.end(function() {
									callback(null, "doctype... OK");
								});
								
							});
				 docType.selectSimple();
			},
			// KL_OTN.DBF
			function(callback) {
				var connection = mysql.createConnection(dbConOptions);
				connection.connect();
				var dbf = new DBFQuery(path + "KL_OTN.DBF",
							function(record) {
								return (record['KOD'] !== undefined && record['KOD'] !== null); 
							},
							null,
							null,
							"cp866",
							function(records) {
								console.log("DBF empl_status count: "+ records.length);
								records.forEach(function(record) {
									var qstr = "insert into czn.empl_status (id, name) values (";
									qstr += record["KOD"] + ", ";
									qstr += "'"+record["NAIM"] + "');";
									//~ console.log(qstr);
									connection.query(qstr, function(err, res) {
										if (err) {
											console.log(qstr);
											console.log(err);
											throw err;
										} 
									});
								});
								connection.end(function() {
									callback(null, "empl_status... OK");
								});
								
							});
				 dbf.selectSimple();
			},
			// KL_NEZVI.DBF
			function(callback) {
				var connection = mysql.createConnection(dbConOptions);
				connection.connect();
				var dbf = new DBFQuery(path + "KL_NEZVI.DBF",
							function(record) {
								return (record['KOD'] !== undefined && record['KOD'] !== null); 
							},
							null,
							null,
							"cp866",
							function(records) {
								console.log("DBF unempl_type count: "+ records.length);
								records.forEach(function(record) {
									var qstr = "insert into czn.unempl_type (id, name) values (";
									qstr += record["KOD"] + ", ";
									qstr += "'"+record["NAIM"] + "');";
									//~ console.log(qstr);
									connection.query(qstr, function(err, res) {
										if (err) {
											console.log(qstr);
											console.log(err);
											throw err;
										} 
									});
								});
								connection.end(function() {
									callback(null, "unempl_type... OK");
								});
								
							});
				 dbf.selectSimple();
			},
			// KL_NEZAN.DBF
			function(callback) {
				var connection = mysql.createConnection(dbConOptions);
				connection.connect();
				var dbf = new DBFQuery(path + "KL_NEZAN.DBF",
							function(record) {
								return (record['NEZAN'] !== undefined && record['NEZAN'] !== null); 
							},
							null,
							null,
							"cp866",
							function(records) {
								console.log("DBF soc_protection_type count: "+ records.length);
								records.forEach(function(record) {
									var qstr = "insert into czn.soc_protection_type (id, name) values (";
									qstr += record["NEZAN"] + ", ";
									qstr += "'"+record["NAIN"] + "');";
									//~ console.log(qstr);
									connection.query(qstr, function(err, res) {
										if (err) {
											console.log(qstr);
											console.log(err);
											throw err;
										} 
									});
								});
								connection.end(function() {
									callback(null, "soc_protection_type... OK");
								});
								
							});
				 dbf.selectSimple();
			},
			// KL_KVA.DBF
			function(callback) {
				var connection = mysql.createConnection(dbConOptions);
				connection.connect();
				var dbf = new DBFQuery(path + "KL_KVA.DBF",
							function(record) {
								return (record['KVAL'] !== undefined && record['KVAL'] !== null); 
							},
							null,
							null,
							"cp866",
							function(records) {
								console.log("DBF qualification count: "+ records.length);
								records.forEach(function(record) {
									var qstr = "insert into czn.qualification (id, name, altcode) values (";
									qstr += record["KVAL"] + ", ";
									qstr += "'"+record["NAKVA"] + "', ";
									qstr += "'"+record["KVA"] + "');";
									//~ console.log(qstr);
									connection.query(qstr, function(err, res) {
										if (err) {
											console.log(qstr);
											console.log(err);
											throw err;
										} 
									});
								});
								connection.end(function() {
									callback(null, "qualification... OK");
								});
								
							});
				 dbf.selectSimple();
			},
			// KL_SEKT.DBF
			function(callback) {
				var connection = mysql.createConnection(dbConOptions);
				connection.connect();
				var dbf = new DBFQuery(path + "KL_SEKT.DBF",
							function(record) {
								return (record['KOD'] !== undefined && record['KOD'] !== null); 
							},
							null,
							null,
							"cp866",
							function(records) {
								console.log("DBF secteconom count: "+ records.length);
								records.forEach(function(record) {
									var qstr = "insert into czn.secteconom (id, name) values (";
									qstr += record["KOD"] + ", ";
									qstr += "'"+record["NAIMS"] + "');";
									//~ console.log(qstr);
									connection.query(qstr, function(err, res) {
										if (err) {
											console.log(qstr);
											console.log(err);
											throw err;
										} 
									});
								});
								connection.end(function() {
									callback(null, "secteconom... OK");
								});
								
							});
				 dbf.selectSimple();
			},
			// KL_OTR.DBF
			function(callback) {
				var connection = mysql.createConnection(dbConOptions);
				connection.connect();
				var dbf = new DBFQuery(path + "KL_OTR.DBF",
							function(record) {
								return (record['KODN'] !== undefined && record['KODN'] !== null); 
							},
							null,
							null,
							"cp866",
							function(records) {
								console.log("DBF otrnarhoz count: "+ records.length);
								records.forEach(function(record) {
									var qstr = "insert into czn.otrnarhoz (id, name, code_1t) values (";
									qstr += record["KODN"] + ", ";
									qstr += "'"+record["NAIM"] + "', ";
									qstr += record["KOD_1T"] + ");";
									//~ console.log(qstr);
									connection.query(qstr, function(err, res) {
										if (err) {
											console.log(qstr);
											console.log(err);
											throw err;
										} 
									});
								});
								connection.end(function() {
									callback(null, "otrnarhoz... OK");
								});
								
							});
				 dbf.selectSimple();
			},
			// KL_UVOL.DBF
			function(callback) {
				var connection = mysql.createConnection(dbConOptions);
				connection.connect();
				var dbf = new DBFQuery(path + "KL_UVOL.DBF",
							function(record) {
								return (record['UVOL_PR'] !== undefined && record['UVOL_PR'] !== null); 
							},
							null,
							null,
							"cp866",
							function(records) {
								console.log("DBF dismiss_type count: "+ records.length);
								records.forEach(function(record) {
									record["NAIM"] = record["NAIM"].replace(/\\/gi, "/");
									var qstr = "insert into czn.dismiss_type (id, name) values (";
									qstr += record["UVOL_PR"] + ", ";
									qstr += "'"+record["NAIM"] + "');";
									//~ console.log(qstr);
									connection.query(qstr, function(err, res) {
										if (err) {
											console.log(qstr);
											console.log(err);
											throw err;
										} 
									});
								});
								connection.end(function() {
									callback(null, "dismiss_type... OK");
								});
								
							});
				 dbf.selectSimple();
			},
			// KL_OKL.DBF
			function(callback) {
				var connection = mysql.createConnection(dbConOptions);
				connection.connect();
				var dbf = new DBFQuery(path + "KL_OKL.DBF",
							function(record) {
								return (record['KOD'] !== undefined && record['KOD'] !== null); 
							},
							null,
							null,
							"cp866",
							function(records) {
								console.log("DBF salary_type count: "+ records.length);
								records.forEach(function(record) {
									record["NAIM"] = record["NAIM"].replace(/\\/gi, "/");
									var qstr = "insert into czn.salary_type (id, name) values (";
									qstr += record["KOD"] + ", ";
									qstr += "'"+record["NAIM"] + "');";
									//~ console.log(qstr);
									connection.query(qstr, function(err, res) {
										if (err) {
											console.log(qstr);
											console.log(err);
											throw err;
										} 
									});
								});
								connection.end(function() {
									callback(null, "salary_type... OK");
								});
								
							});
				 dbf.selectSimple();
			},
			// KL_VIDRA.DBF
			function(callback) {
				var connection = mysql.createConnection(dbConOptions);
				connection.connect();
				var dbf = new DBFQuery(path + "KL_VIDRA.DBF",
							function(record) {
								return (record['KOD'] !== undefined && record['KOD'] !== null); 
							},
							null,
							null,
							"cp866",
							function(records) {
								console.log("DBF work_type count: "+ records.length);
								records.forEach(function(record) {
									record["NAIM"] = record["NAIM"].replace(/\\/gi, "/");
									var qstr = "insert into czn.work_type (id, name) values (";
									qstr += record["KOD"] + ", ";
									qstr += "'"+record["NAIM"] + "');";
									//~ console.log(qstr);
									connection.query(qstr, function(err, res) {
										if (err) {
											console.log(qstr);
											console.log(err);
											throw err;
										}
									});
								});
								connection.end(function() {
									callback(null, "work_type... OK");
								});
								
							});
				 dbf.selectSimple();
			},
			// KL_SMEN.DBF
			function(callback) {
				var connection = mysql.createConnection(dbConOptions);
				connection.connect();
				var dbf = new DBFQuery(path + "KL_SMEN.DBF",
							function(record) {
								return (record['KOD'] !== undefined && record['KOD'] !== null); 
							},
							null,
							null,
							"cp866",
							function(records) {
								console.log("DBF work_shift count: "+ records.length);
								records.forEach(function(record) {
									record["NAIM"] = record["NAIM"].replace(/\\/gi, "/");
									var qstr = "insert into czn.work_shift (id, name) values (";
									qstr += record["KOD"] + ", ";
									qstr += "'"+record["NAIM"] + "');";
									//~ console.log(qstr);
									connection.query(qstr, function(err, res) {
										if (err) {
											console.log(qstr);
											console.log(err);
											throw err;
										}
									});
								});
								connection.end(function() {
									callback(null, "work_shift... OK");
								});
								
							});
				 dbf.selectSimple();
			},
			// KL_TR_OB.DBF
			function(callback) {
				var connection = mysql.createConnection(dbConOptions);
				connection.connect();
				var dbf = new DBFQuery(path + "KL_TR_OB.DBF",
							function(record) {
								return (record['KOD'] !== undefined && record['KOD'] !== null); 
							},
							null,
							null,
							"cp866",
							function(records) {
								console.log("DBF education_required count: "+ records.length);
								records.forEach(function(record) {
									record["NAIM"] = record["NAIM"].replace(/\\/gi, "/");
									var qstr = "insert into czn.education_required (id, name) values (";
									qstr += record["KOD"] + ", ";
									qstr += "'"+record["NAIM"] + "');";
									//~ console.log(qstr);
									connection.query(qstr, function(err, res) {
										if (err) {
											console.log(qstr);
											console.log(err);
											throw err;
										}
									});
								});
								connection.end(function() {
									callback(null, "education_required... OK");
								});
								
							});
				 dbf.selectSimple();
			},
			// KL_NAC.DBF
			function(callback) {
				var connection = mysql.createConnection(dbConOptions);
				connection.connect();
				var dbf = new DBFQuery(path + "KL_NAC.DBF",
							function(record) {
								return (record['NAC'] !== undefined && record['NAC'] !== null); 
							},
							null,
							null,
							"cp866",
							function(records) {
								console.log("DBF nationality count: "+ records.length);
								records.forEach(function(record) {
									record["NAIM"] = record["NAIM"].replace(/\\/gi, "/");
									var qstr = "insert into czn.nationality (id, name) values (";
									qstr += record["NAC"] + ", ";
									qstr += "'"+record["NAIM"] + "');";
									//~ console.log(qstr);
									connection.query(qstr, function(err, res) {
										if (err) {
											console.log(qstr);
											console.log(err);
											throw err;
										}
									});
								});
								connection.end(function() {
									callback(null, "nationality... OK");
								});
								
							});
				 dbf.selectSimple();
			},
			// KL_ROTN.DBF
			function(callback) {
				var connection = mysql.createConnection(dbConOptions);
				connection.connect();
				var dbf = new DBFQuery(path + "KL_ROTN.DBF",
							function(record) {
								return (record['ROD_OTN'] !== undefined && record['ROD_OTN'] !== null); 
							},
							null,
							null,
							"cp866",
							function(records) {
								console.log("DBF kinship count: "+ records.length);
								records.forEach(function(record) {
									record["NAME"] = record["NAME"].replace(/\\/gi, "/");
									var qstr = "insert into czn.kinship (id, name) values (";
									qstr += record["ROD_OTN"] + ", ";
									qstr += "'"+record["NAME"] + "');";
									//~ console.log(qstr);
									connection.query(qstr, function(err, res) {
										if (err) {
											console.log(qstr);
											console.log(err);
											throw err;
										}
									});
								});
								connection.end(function() {
									callback(null, "kinship... OK");
								});
								
							});
				 dbf.selectSimple();
			},
			// KL_RAIOG.DBF
			function(callback) {
				var connection = mysql.createConnection(dbConOptions);
				connection.connect();
				var dbf = new DBFQuery(path + "KL_RAIOG.DBF",
							function(record) {
								return (record['KODR'] !== undefined && record['KODR'] !== null); 
							},
							null,
							null,
							"cp866",
							function(records) {
								console.log("DBF district count: "+ records.length);
								records.forEach(function(record) {
									record["NAIMR"] = record["NAIMR"].replace(/\\/gi, "/");
									var qstr = "insert into czn.district (id, name) values (";
									qstr += record["KODR"] + ", ";
									qstr += "'"+record["NAIMR"] + "');";
									//~ console.log(qstr);
									connection.query(qstr, function(err, res) {
										if (err) {
											console.log(qstr);
											console.log(err);
											throw err;
										}
									});
								});
								connection.end(function() {
									callback(null, "district... OK");
								});
								
							});
				 dbf.selectSimple();
			}
			],
			function(err, results) {
				end_time = Date.now();
				var time_left = (end_time - start_time) / 1000;
				//~ console.log("--- time left: "+ time_left);
				//~ console.log("--- Errors: ");
				//~ console.log(err);
				//~ console.log("--- Results: ");
				if(options.callback) {
					options.callback(err, results, time_left);
				}
			}
		);
	}
}).call(this);



