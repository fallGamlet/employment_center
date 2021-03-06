(function() {
var mysql     = require("mysql"),
		async     = require("async"),
		dbfkit    = require("dbfkit"),
		DBFQuery  = dbfkit.DBFQuery,
		DBFParser = dbfkit.DBFParser,
		lib = require("./lib");

var defaultDBConOptions = { host: 'localhost', port: 3311, user: 'root', password: 'root' },
	defaultDBFPath = "R:/CZNF/";

/*
 * Создать схему БД или очистить от данных, если она уже есть
 * options = {
 * 	dbconoptions - объект с настройками подключения к БД (host, port, user, password)
 * 	callback - функция обратного вызова, принимающая параметр - объект с полями:
 * 	{
 * 		error - ошибки, возникшие при выполнении
* 		result - результат выполнения
 * 		timeleft - время обработки
 * 	}
 * }
 */
var createDBSchema = function(options) {
	var path,
		dbConOptions,
		start_time,
		end_time;
	
	start_time = Date.now();
	end_time = null;
	
	if(options.dbconoptions) { dbConOptions = options.dbconoptions; } 
	else { dbConOptions = { host: 'localhost', port: 3311, user: 'root', password: 'root' }; }
	
	var connection = mysql.createConnection(dbConOptions);
	connection.connect();
	var qarr = [];
	//qarr.push("drop database if exists czn; ");
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
	qarr.push("create table if not exists czn.payment_change_type (id integer NOT NULL AUTO_INCREMENT PRIMARY KEY, name varchar(50), pr integer, gr integer);");
	qarr.push("delete from czn.payment_change_type");
	// KL_PRIW.DBF 									KODV,N,4,0	KODP,N,4,0	NAME,C,50	NAMEP,C,70	PR,N,2,0
	qarr.push("create table if not exists czn.payment_change_reason (id integer  NOT NULL AUTO_INCREMENT PRIMARY KEY, code_v integer, name varchar(100), code_p integer, name_p varchar(100), pr integer);");
	qarr.push("delete from czn.payment_change_reason");
	// PRIKAZ.DBF 									KART_N,N,6,0	IND_KART,N,2,0	DATA_OB,D	NOMPRIK,N,6,0	NOMVYP,N,4,0	DATPRIK,D	VIDI,N,4,0	PRIZ,N,4,0	PR_OBV,N,1,0	INF,C,130	OTM,N,2,0
	qarr.push("create table if not exists czn.order (id integer NOT NULL AUTO_INCREMENT PRIMARY KEY, card_n integer, ind_card integer, ob_date datetime, order_num integer, nomvyp integer, order_date datetime, vidi integer, priz integer, pr_obv integer, inf varchar(200), otm integer);");
	qarr.push("delete from czn.order");
	// FIL_OBR.DBF 									KART_N,N,6,0	IND_KART,N,2,0	KOD_RM,C,1	OBR_DT,N,8,0	FIO,C,50	POL,C,1	DOKVID,N,2,0	DOK_SERN,C,8	DOK_SER,C,3	DOK_N,N,10,0	DOK_S,C,10	KEM_VID,C,30	DOK_DT,N,8,0	ROGD_DT,N,8,0	GRAGD,N,2,0	NAC,N,2,0	ADRESS,C,54	TEL,N,7,0	OTNZAN,N,2,0	VIDNEZAN,N,2,0	KAT_SOCZ,N,2,0	DATABZN,N,8,0	DATABZK,N,8,0	ZAKRK,N,2,0	OBRAZ,N,2,0	PROF_OBR,N,6,0	KVA_OBR,N,2,0	STAG_PF,N,3,0	POSL_RAB,N,6,0	DOLGN,N,6,0	KVA_DOLGN,N,2,0	STAG_O,N,3,0	STAG_O_M,N,3,0	STAG_PR_G,N,3,0	STAG_PR_M,N,3,0	STAG_12,N,2,0	SEKT_EK,N,2,0	OTR_NH,N,2,0	UVOL_DT,N,8,0	SREDN_ZAR,N,10,0	SEM_POL,N,2,0	UVOL_PR,N,2,0	KOL_IGD,N,3,0	TR_FSOB,N,2,0	TR_PRED,N,9,0	TR_PROF,N,6,0	TR_KVA,N,2,0	TR_KOLDPRF,N,3,0	TR_SOP,N,2,0	TR_VIDR,N,2,0	TR_SMEN,N,2,0	TR_ZARPL,N,10,0	TR_RAIG,N,2,0	TR_KOLOPRF,N,3,0	DATA_KOR,D	STATUS_OB,N,2,0	SN_OB,N,2,0	DAT_OSU,D	VID_TRKN,N,2,0	SER_TRKN,C,8	NOM_TRKN,C,12	DAT_TRKN,D	POVTOR,N,1,0	PR_POSOB,N,2,0	PR_STIP,N,2,0	KODNP,N,2,0	RAIOG,N,2,0	VID_ADR,N,1,0	KOD_UL,N,4,0	NDOM,N,3,0	IND_DOM,C,1	NKV,N,3,0
	qarr.push("create table if not exists czn.person_card (id integer NOT NULL AUTO_INCREMENT PRIMARY KEY, card_n integer, ind_card integer, code_rm varchar(5), obr_date datetime, fio varchar(200), sex varchar(20), doc_type_id integer, doc_sern varchar(10), doc_series varchar(10), doc_num integer, doc_s varchar(25), doc_bywho varchar(100), doc_date datetime, born_date datetime, citizen_id integer, nationality_id integer, address varchar(200), phone_num varchar(25), empl_status_id integer, unempl_type_id integer, soc_protection_type_id integer, bzn_date datetime, bzk_date datetime, ZAKRK integer, education_type_id integer, prof_id integer, qualific_id integer, stag_pf integer, last_org_id integer, post_id integer, post_qualific_id integer, stag_o integer, stag_o_m integer, stag_pr_g integer, stag_pr_m integer, stag_12 integer, secteconom_id integer, otrnarhoz_id integer, dismiss_date datetime, avg_salary integer, marital_status_id integer, dismiss_type_id integer, dependent_num integer, TR_FSOB integer, TR_PRED integer, TR_PROF integer, TR_KVA integer, TR_KOLDPRF integer, TR_SOP integer, TR_VIDR integer, TR_SMEN integer, TR_ZARPL integer, TR_RAIG integer, TR_KOLOPRF integer, DATA_KOR datetime, STATUS_OB integer, SN_OB integer, DAT_OSU datetime, VID_TRKN integer, SER_TRKN varchar(25), NOM_TRKN integer, DAT_TRKN datetime, POVTOR integer, PR_POSOB integer, PR_STIP integer, city_id integer, district_id integer);");
	qarr.push("delete from czn.person_card");
	// Таблица - Семейное положение
	//~ qarr.push("drop table if exists czn.marital_status;");
	qarr.push("create table if not exists czn.marital_status (id integer NOT NULL PRIMARY KEY, name varchar(30));");
	qarr.push("delete from czn.marital_status;");
	// создание представления для person_card - карточек персон (людей)
	qarr.push("DROP VIEW IF EXISTS czn.person_card_view;");
	qarr.push("CREATE VIEW czn.person_card_view AS  select pers.id AS id, 	pers.card_n AS card_n, 	pers.ind_card AS ind_card, 	pers.code_rm AS code_rm, 	pers.obr_date AS obr_date, 	pers.fio AS fio, 	pers.sex AS sex, 	pers.doc_type_id AS doc_type_id, 	doc_type.name AS doc_type_name, 	pers.doc_sern AS doc_sern, 	doc_series.name AS doc_sern_name, 	pers.doc_series AS doc_series, 	pers.doc_num AS doc_num, 	pers.doc_s AS doc_s, 	pers.doc_bywho AS doc_bywho, 	pers.doc_date AS doc_date, 	pers.born_date AS born_date, 	pers.citizen_id AS citizen_id, 	citizen.name AS citizen_name, 	pers.nationality_id AS nationality_id, 	nationality.name AS nationality_name, 	pers.address AS address, 	pers.phone_num AS phone_num, 	pers.empl_status_id AS empl_status_id, 	empl_status.name AS empl_status_name, 	pers.unempl_type_id AS unempl_type_id, 	unempl_type.name AS unempl_type_name, 	pers.soc_protection_type_id AS soc_protection_type_id, 	soc_protection_type.name AS soc_protection_type_name, 	pers.bzn_date AS bzn_date, 	pers.bzk_date AS bzk_date, 	pers.ZAKRK AS ZAKRK, 	card_close_reason.name AS card_close_reason_name, 	pers.education_type_id AS education_type_id, 	education_type.name AS education_type_name, 	pers.prof_id AS prof_id, 	prof.name AS prof_name, 	pers.qualific_id AS qualific_id, 	qualification.name AS qualific_name, 	pers.stag_pf AS stag_pf, 	pers.last_org_id AS last_org_id, 	org.name AS last_org_name, 	pers.post_id AS post_id, 	post.name AS post_name, 	pers.post_qualific_id AS post_qualific_id, 	post_qualific.name AS post_qualific_name, 	pers.stag_o AS stag_o, 	pers.stag_o_m AS stag_o_m, 	pers.stag_pr_g AS stag_pr_g, 	pers.stag_pr_m AS stag_pr_m, 	pers.stag_12 AS stag_12, 	pers.secteconom_id AS secteconom_id, 	secteconom.name AS secteconom_name, 	pers.otrnarhoz_id AS otrnarhoz_id, 	otrnarhoz.name AS otrnarhoz_name, 	pers.dismiss_date AS dismiss_date, 	pers.avg_salary AS avg_salary, 	pers.marital_status_id AS marital_status_id, 	marital_status.name as marital_status_name, 	pers.dismiss_type_id AS dismiss_type_id, 	dismiss_type.name AS dismiss_type_name, 	pers.dependent_num AS dependent_num, 	pers.TR_FSOB AS TR_FSOB, 	pers.TR_PRED AS TR_PRED, 	pers.TR_PROF AS TR_PROF, 	pers.TR_KVA AS TR_KVA, 	pers.TR_KOLDPRF AS TR_KOLDPRF, 	pers.TR_SOP AS TR_SOP, 	pers.TR_VIDR AS TR_VIDR, 	pers.TR_SMEN AS TR_SMEN, 	pers.TR_ZARPL AS TR_ZARPL, 	pers.TR_RAIG AS TR_RAIG, 	pers.TR_KOLOPRF AS TR_KOLOPRF, 	pers.DATA_KOR AS DATA_KOR, 	pers.STATUS_OB AS STATUS_OB, 	pers.SN_OB AS SN_OB, 	pers.DAT_OSU AS DAT_OSU, 	pers.VID_TRKN AS VID_TRKN, 	work_book_type.name as work_book_type_name, 	pers.SER_TRKN AS SER_TRKN, 	pers.NOM_TRKN AS NOM_TRKN, 	pers.DAT_TRKN AS DAT_TRKN, 	pers.POVTOR AS POVTOR, 	pers.PR_POSOB AS PR_POSOB, 	pers.PR_STIP AS PR_STIP, 	pers.city_id AS city_id, 	city.name AS city_name, 	pers.district_id AS district_id, 	district.name AS district_name  from ((((((((((((((((((((( czn.person_card pers  left join czn.city on((city.id = pers.city_id)))  left join czn.district on((district.id = pers.district_id)))  left join czn.doc_type on((doc_type.id = pers.doc_type_id)))  left join czn.doc_series on((doc_series.id = pers.doc_sern)))  left join czn.citizen on((citizen.id = pers.citizen_id)))  left join czn.nationality on((nationality.id = pers.nationality_id)))  left join czn.empl_status on((empl_status.id = pers.empl_status_id)))  left join czn.unempl_type on((unempl_type.id = pers.unempl_type_id)))  left join czn.soc_protection_type on((soc_protection_type.id = pers.soc_protection_type_id)))  left join czn.dismiss_type on((dismiss_type.id = pers.dismiss_type_id)))  left join czn.secteconom on((secteconom.id = pers.secteconom_id)))  left join czn.otrnarhoz on((otrnarhoz.id = pers.otrnarhoz_id)))  left join czn.education_type on((education_type.id = pers.education_type_id)))  left join czn.prof on((prof.id = pers.prof_id)))  left join czn.qualification on((qualification.id = pers.qualific_id)))  left join czn.org on((org.id = pers.last_org_id)))  left join czn.qualification post_qualific on((post_qualific.id = pers.post_qualific_id)))  left join czn.prof post on((post.id = pers.post_id))) left join czn.work_book_type work_book_type ON (work_book_type.id = pers.VID_TRKN)) left join czn.card_close_reason ON (card_close_reason.id = pers.ZAKRK)) left join czn.marital_status ON (marital_status.id = pers.marital_status_id))");
	// создание представления для order - приказов
	qarr.push("DROP VIEW IF EXISTS czn.order_view;");
	qarr.push("CREATE VIEW czn.order_view AS SELECT o.id ,o.card_n ,o.ind_card ,o.ob_date ,o.order_num ,o.nomvyp ,o.order_date ,o.vidi ,pct.name as vidi_name ,o.priz ,pcr.name as priz_name ,o.pr_obv ,o.inf ,o.otm FROM czn.order o LEFT JOIN czn.payment_change_type pct ON pct.id = o.vidi LEFT JOIN czn.payment_change_reason pcr ON pcr.code_v = pct.id and pcr.code_p = o.priz");
	
	for(i in qarr) {
		connection.query(qarr[i], function(err) {
		  if (err) throw err;
		});
	}
	connection.end(function(){
		if(typeof(options.callback) == 'function') {
			end_time = Date.now();
			timeleft = (end_time - start_time)/1000;
			options.callback({error:null, result:"tables created...OK", timeleft:timeleft});
		}
	});
};

var updateOrders = function(options) {
	var path, 
		dbf,
		dbConOptions,
		start_time = Date.now(),
		end_time,
		dbfCount=0,
		insCount=0;
	
	if(options.dbfpath) { path = options.dbfpath; } 
	else { path = defaultDBFPath; }
	
	if(options.dbconoptions) { dbConOptions = options.dbconoptions; } 
	else { dbConOptions = defaultDBConOptions; }
	
	// PRIKAZ.DBF 										KART_N,N,6,0	IND_KART,N,2,0	KOD_RM,C,1	OBR_DT,N,8,0	FIO,C,50	POL,C,1	DOKVID,N,2,0	DOK_SERN,C,8	DOK_SER,C,3	DOK_N,N,10,0	DOK_S,C,10	KEM_VID,C,30	DOK_DT,N,8,0	ROGD_DT,N,8,0	GRAGD,N,2,0	NAC,N,2,0	ADRESS,C,54	TEL,N,7,0	OTNZAN,N,2,0	VIDNEZAN,N,2,0	KAT_SOCZ,N,2,0	DATABZN,N,8,0	DATABZK,N,8,0	ZAKRK,N,2,0	OBRAZ,N,2,0	PROF_OBR,N,6,0	KVA_OBR,N,2,0	STAG_PF,N,3,0	POSL_RAB,N,6,0	DOLGN,N,6,0	KVA_DOLGN,N,2,0	STAG_O,N,3,0	STAG_O_M,N,3,0	STAG_PR_G,N,3,0	STAG_PR_M,N,3,0	STAG_12,N,2,0	SEKT_EK,N,2,0	OTR_NH,N,2,0	UVOL_DT,N,8,0	SREDN_ZAR,N,10,0	SEM_POL,N,2,0	UVOL_PR,N,2,0	KOL_IGD,N,3,0	TR_FSOB,N,2,0	TR_PRED,N,9,0	TR_PROF,N,6,0	TR_KVA,N,2,0	TR_KOLDPRF,N,3,0	TR_SOP,N,2,0	TR_VIDR,N,2,0	TR_SMEN,N,2,0	TR_ZARPL,N,10,0	TR_RAIG,N,2,0	TR_KOLOPRF,N,3,0	DATA_KOR,D	STATUS_OB,N,2,0	SN_OB,N,2,0	DAT_OSU,D	VID_TRKN,N,2,0	SER_TRKN,C,8	NOM_TRKN,C,12	DAT_TRKN,D	POVTOR,N,1,0	PR_POSOB,N,2,0	PR_STIP,N,2,0	KODNP,N,2,0	RAIOG,N,2,0	VID_ADR,N,1,0	KOD_UL,N,4,0	NDOM,N,3,0	IND_DOM,C,1	NKV,N,3,0
	qarr = [];
	//~ qarr.push("drop table if exists czn.person_card;");
	qarr.push("create table if not exists czn.person_card (id integer NOT NULL AUTO_INCREMENT PRIMARY KEY, card_n integer, ind_card integer, code_rm varchar(5), obr_date datetime, fio varchar(200), sex varchar(20), doc_type_id integer, doc_sern varchar(10), doc_series varchar(10), doc_num integer, doc_s varchar(25), doc_bywho varchar(100), doc_date datetime, born_date datetime, citizen_id integer, nationality_id integer, address varchar(200), phone_num varchar(25), empl_status_id integer, unempl_type_id integer, soc_protection_type_id integer, bzn_date datetime, bzk_date datetime, ZAKRK integer, education_type_id integer, prof_id integer, qualific_id integer, stag_pf integer, last_org_id integer, post_id integer, post_qualific_id integer, stag_o integer, stag_o_m integer, stag_pr_g integer, stag_pr_m integer, stag_12 integer, secteconom_id integer, otrnarhoz_id integer, dismiss_date datetime, avg_salary integer, marital_status_id integer, dismiss_type_id integer, dependent_num integer, TR_FSOB integer, TR_PRED integer, TR_PROF integer, TR_KVA integer, TR_KOLDPRF integer, TR_SOP integer, TR_VIDR integer, TR_SMEN integer, TR_ZARPL integer, TR_RAIG integer, TR_KOLOPRF integer, DATA_KOR datetime, STATUS_OB integer, SN_OB integer, DAT_OSU datetime, VID_TRKN integer, SER_TRKN varchar(25), NOM_TRKN integer, DAT_TRKN datetime, POVTOR integer, PR_POSOB integer, PR_STIP integer, city_id integer, district_id integer);");
	qarr.push("delete from czn.person_card");
	dbConOptions = { host: 'localhost', port: 3311, user: 'root', password: 'root' }; 
	var connection = mysql.createConnection(dbConOptions);
	//~ connection.connect();
	try {
		qarr.forEach(function(qstr) {
			connection.query(qstr, function(err, res) {
				if (err) {
					err['query'] = qstr;
					throw err;
				}
			});
		});
	} catch(err) {
		//~ console.log(err);
		if(typeof(options.callback) == 'function') {
			options.callback({error: err, result: null, timeleft: undefined});
		}
		return;
	}
	
	var dbf = new DBFParser(path + "PRIKAZ.DBF", 'cp866');
	dbf.on('record', function(record) {
		if(record['KART_N'] == null || record['KART_N'] == undefined) {
			return false;
		}
		dbfCount++;
		
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
			} else {
				insCount++;
			}
		});
	});
	dbf.on('end', function() {
		connection.end(function() {
			if(typeof(options.callback) == 'function') {
				end_time = Date.now();
				options.callback({ error: null, 
								result: "order... OK. DBF count:"+dbfCount +", inserted count: "+insCount, 
								timeleft: (end_time - start_time)/1000});
			}
		});
	});
	dbf.parse();
}
	
module.exports = {
	createDBSchema: createDBSchema,
	
	updateAll: function(options) {		
		var path,
			dbConOptions,
			start_time,
			end_time;
		
		start_time = Date.now();
		end_time = null;
		
		if(options.dbfpath) { path = options.dbfpath; } 
		else { path = "R:/CZNF/"; }
		
		if(options.dbconoptions) { dbConOptions = options.dbconoptions; } 
		else { dbConOptions = { host: 'localhost', port: 3311, user: 'root', password: 'root' }; }
		
		async.series([
			function(callback) {
				var connection = mysql.createConnection(dbConOptions);
				connection.connect();

				var qarr = [];
				qarr.push("drop database if exists czn; ");
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
				qarr.push("create table if not exists czn.payment_change_type (id integer NOT NULL AUTO_INCREMENT PRIMARY KEY, name varchar(50), pr integer, gr integer);");
				qarr.push("delete from czn.payment_change_type");
				// KL_PRIW.DBF 									KODV,N,4,0	KODP,N,4,0	NAME,C,50	NAMEP,C,70	PR,N,2,0
				qarr.push("create table if not exists czn.payment_change_reason (id integer  NOT NULL AUTO_INCREMENT PRIMARY KEY, code_v integer, name varchar(100), code_p integer, name_p varchar(100), pr integer);");
				qarr.push("delete from czn.payment_change_reason");
				// PRIKAZ.DBF 									KART_N,N,6,0	IND_KART,N,2,0	DATA_OB,D	NOMPRIK,N,6,0	NOMVYP,N,4,0	DATPRIK,D	VIDI,N,4,0	PRIZ,N,4,0	PR_OBV,N,1,0	INF,C,130	OTM,N,2,0
				qarr.push("create table if not exists czn.order (id integer NOT NULL AUTO_INCREMENT PRIMARY KEY, card_n integer, ind_card integer, ob_date datetime, order_num integer, nomvyp integer, order_date datetime, vidi integer, priz integer, pr_obv integer, inf varchar(200), otm integer);");
				qarr.push("delete from czn.order");
				// FIL_OBR.DBF 									KART_N,N,6,0	IND_KART,N,2,0	KOD_RM,C,1	OBR_DT,N,8,0	FIO,C,50	POL,C,1	DOKVID,N,2,0	DOK_SERN,C,8	DOK_SER,C,3	DOK_N,N,10,0	DOK_S,C,10	KEM_VID,C,30	DOK_DT,N,8,0	ROGD_DT,N,8,0	GRAGD,N,2,0	NAC,N,2,0	ADRESS,C,54	TEL,N,7,0	OTNZAN,N,2,0	VIDNEZAN,N,2,0	KAT_SOCZ,N,2,0	DATABZN,N,8,0	DATABZK,N,8,0	ZAKRK,N,2,0	OBRAZ,N,2,0	PROF_OBR,N,6,0	KVA_OBR,N,2,0	STAG_PF,N,3,0	POSL_RAB,N,6,0	DOLGN,N,6,0	KVA_DOLGN,N,2,0	STAG_O,N,3,0	STAG_O_M,N,3,0	STAG_PR_G,N,3,0	STAG_PR_M,N,3,0	STAG_12,N,2,0	SEKT_EK,N,2,0	OTR_NH,N,2,0	UVOL_DT,N,8,0	SREDN_ZAR,N,10,0	SEM_POL,N,2,0	UVOL_PR,N,2,0	KOL_IGD,N,3,0	TR_FSOB,N,2,0	TR_PRED,N,9,0	TR_PROF,N,6,0	TR_KVA,N,2,0	TR_KOLDPRF,N,3,0	TR_SOP,N,2,0	TR_VIDR,N,2,0	TR_SMEN,N,2,0	TR_ZARPL,N,10,0	TR_RAIG,N,2,0	TR_KOLOPRF,N,3,0	DATA_KOR,D	STATUS_OB,N,2,0	SN_OB,N,2,0	DAT_OSU,D	VID_TRKN,N,2,0	SER_TRKN,C,8	NOM_TRKN,C,12	DAT_TRKN,D	POVTOR,N,1,0	PR_POSOB,N,2,0	PR_STIP,N,2,0	KODNP,N,2,0	RAIOG,N,2,0	VID_ADR,N,1,0	KOD_UL,N,4,0	NDOM,N,3,0	IND_DOM,C,1	NKV,N,3,0
				qarr.push("create table if not exists czn.person_card (id integer NOT NULL AUTO_INCREMENT PRIMARY KEY, card_n integer, ind_card integer, code_rm varchar(5), obr_date datetime, fio varchar(200), sex varchar(20), doc_type_id integer, doc_sern varchar(10), doc_series varchar(10), doc_num integer, doc_s varchar(25), doc_bywho varchar(100), doc_date datetime, born_date datetime, citizen_id integer, nationality_id integer, address varchar(200), phone_num varchar(25), empl_status_id integer, unempl_type_id integer, soc_protection_type_id integer, bzn_date datetime, bzk_date datetime, ZAKRK integer, education_type_id integer, prof_id integer, qualific_id integer, stag_pf integer, last_org_id integer, post_id integer, post_qualific_id integer, stag_o integer, stag_o_m integer, stag_pr_g integer, stag_pr_m integer, stag_12 integer, secteconom_id integer, otrnarhoz_id integer, dismiss_date datetime, avg_salary integer, marital_status_id integer, dismiss_type_id integer, dependent_num integer, TR_FSOB integer, TR_PRED integer, TR_PROF integer, TR_KVA integer, TR_KOLDPRF integer, TR_SOP integer, TR_VIDR integer, TR_SMEN integer, TR_ZARPL integer, TR_RAIG integer, TR_KOLOPRF integer, DATA_KOR datetime, STATUS_OB integer, SN_OB integer, DAT_OSU datetime, VID_TRKN integer, SER_TRKN varchar(25), NOM_TRKN integer, DAT_TRKN datetime, POVTOR integer, PR_POSOB integer, PR_STIP integer, city_id integer, district_id integer);");
				qarr.push("delete from czn.person_card");
				// Таблица - Семейное положение
				qarr.push("drop table if exists czn.marital_status;");
				qarr.push("create table if not exists czn.marital_status (id integer NOT NULL PRIMARY KEY, name varchar(30));");
				// создание представления для person_card - карточек персон (людей)
				qarr.push("DROP VIEW IF EXISTS czn.person_card_view;");
				qarr.push("CREATE VIEW czn.person_card_view AS  select pers.id AS id, 	pers.card_n AS card_n, 	pers.ind_card AS ind_card, 	pers.code_rm AS code_rm, 	pers.obr_date AS obr_date, 	pers.fio AS fio, 	pers.sex AS sex, 	pers.doc_type_id AS doc_type_id, 	doc_type.name AS doc_type_name, 	pers.doc_sern AS doc_sern, 	doc_series.name AS doc_sern_name, 	pers.doc_series AS doc_series, 	pers.doc_num AS doc_num, 	pers.doc_s AS doc_s, 	pers.doc_bywho AS doc_bywho, 	pers.doc_date AS doc_date, 	pers.born_date AS born_date, 	pers.citizen_id AS citizen_id, 	citizen.name AS citizen_name, 	pers.nationality_id AS nationality_id, 	nationality.name AS nationality_name, 	pers.address AS address, 	pers.phone_num AS phone_num, 	pers.empl_status_id AS empl_status_id, 	empl_status.name AS empl_status_name, 	pers.unempl_type_id AS unempl_type_id, 	unempl_type.name AS unempl_type_name, 	pers.soc_protection_type_id AS soc_protection_type_id, 	soc_protection_type.name AS soc_protection_type_name, 	pers.bzn_date AS bzn_date, 	pers.bzk_date AS bzk_date, 	pers.ZAKRK AS ZAKRK, 	card_close_reason.name AS card_close_reason_name, 	pers.education_type_id AS education_type_id, 	education_type.name AS education_type_name, 	pers.prof_id AS prof_id, 	prof.name AS prof_name, 	pers.qualific_id AS qualific_id, 	qualification.name AS qualific_name, 	pers.stag_pf AS stag_pf, 	pers.last_org_id AS last_org_id, 	org.name AS last_org_name, 	pers.post_id AS post_id, 	post.name AS post_name, 	pers.post_qualific_id AS post_qualific_id, 	post_qualific.name AS post_qualific_name, 	pers.stag_o AS stag_o, 	pers.stag_o_m AS stag_o_m, 	pers.stag_pr_g AS stag_pr_g, 	pers.stag_pr_m AS stag_pr_m, 	pers.stag_12 AS stag_12, 	pers.secteconom_id AS secteconom_id, 	secteconom.name AS secteconom_name, 	pers.otrnarhoz_id AS otrnarhoz_id, 	otrnarhoz.name AS otrnarhoz_name, 	pers.dismiss_date AS dismiss_date, 	pers.avg_salary AS avg_salary, 	pers.marital_status_id AS marital_status_id, 	marital_status.name as marital_status_name, 	pers.dismiss_type_id AS dismiss_type_id, 	dismiss_type.name AS dismiss_type_name, 	pers.dependent_num AS dependent_num, 	pers.TR_FSOB AS TR_FSOB, 	pers.TR_PRED AS TR_PRED, 	pers.TR_PROF AS TR_PROF, 	pers.TR_KVA AS TR_KVA, 	pers.TR_KOLDPRF AS TR_KOLDPRF, 	pers.TR_SOP AS TR_SOP, 	pers.TR_VIDR AS TR_VIDR, 	pers.TR_SMEN AS TR_SMEN, 	pers.TR_ZARPL AS TR_ZARPL, 	pers.TR_RAIG AS TR_RAIG, 	pers.TR_KOLOPRF AS TR_KOLOPRF, 	pers.DATA_KOR AS DATA_KOR, 	pers.STATUS_OB AS STATUS_OB, 	pers.SN_OB AS SN_OB, 	pers.DAT_OSU AS DAT_OSU, 	pers.VID_TRKN AS VID_TRKN, 	work_book_type.name as work_book_type_name, 	pers.SER_TRKN AS SER_TRKN, 	pers.NOM_TRKN AS NOM_TRKN, 	pers.DAT_TRKN AS DAT_TRKN, 	pers.POVTOR AS POVTOR, 	pers.PR_POSOB AS PR_POSOB, 	pers.PR_STIP AS PR_STIP, 	pers.city_id AS city_id, 	city.name AS city_name, 	pers.district_id AS district_id, 	district.name AS district_name  from ((((((((((((((((((((( czn.person_card pers  left join czn.city on((city.id = pers.city_id)))  left join czn.district on((district.id = pers.district_id)))  left join czn.doc_type on((doc_type.id = pers.doc_type_id)))  left join czn.doc_series on((doc_series.id = pers.doc_sern)))  left join czn.citizen on((citizen.id = pers.citizen_id)))  left join czn.nationality on((nationality.id = pers.nationality_id)))  left join czn.empl_status on((empl_status.id = pers.empl_status_id)))  left join czn.unempl_type on((unempl_type.id = pers.unempl_type_id)))  left join czn.soc_protection_type on((soc_protection_type.id = pers.soc_protection_type_id)))  left join czn.dismiss_type on((dismiss_type.id = pers.dismiss_type_id)))  left join czn.secteconom on((secteconom.id = pers.secteconom_id)))  left join czn.otrnarhoz on((otrnarhoz.id = pers.otrnarhoz_id)))  left join czn.education_type on((education_type.id = pers.education_type_id)))  left join czn.prof on((prof.id = pers.prof_id)))  left join czn.qualification on((qualification.id = pers.qualific_id)))  left join czn.org on((org.id = pers.last_org_id)))  left join czn.qualification post_qualific on((post_qualific.id = pers.post_qualific_id)))  left join czn.prof post on((post.id = pers.post_id))) left join czn.work_book_type work_book_type ON (work_book_type.id = pers.VID_TRKN)) left join czn.card_close_reason ON (card_close_reason.id = pers.ZAKRK)) left join czn.marital_status ON (marital_status.id = pers.marital_status_id))");
				// создание представления для order - приказов
				qarr.push("DROP VIEW IF EXISTS czn.order_view;");
				qarr.push("CREATE VIEW czn.order_view AS SELECT o.id ,o.card_n ,o.ind_card ,o.ob_date ,o.order_num ,o.nomvyp ,o.order_date ,o.vidi ,pct.name as vidi_name ,o.priz ,pcr.name as priz_name ,o.pr_obv ,o.inf ,o.otm FROM czn.order o LEFT JOIN czn.payment_change_type pct ON pct.id = o.vidi LEFT JOIN czn.payment_change_reason pcr ON pcr.code_v = pct.id and pcr.code_p = o.priz");
				
				for(i in qarr) {
					connection.query(qarr[i], function(err) {
					  if (err) throw err;
					});
				}
				connection.end(function(){
					callback(null, "tables created...OK");
				});

			},
			// Семейное положение
			function(callback) {
				var connection = mysql.createConnection(dbConOptions);
				connection.connect();
				var qarr = [];
				qarr.push("insert into czn.marital_status (id, name) values (0, 'неопределено');");
				qarr.push("insert into czn.marital_status (id, name) values (1, 'холост (не замужем)');");
				qarr.push("insert into czn.marital_status (id, name) values (2, 'женат (за мужем)');");
				qarr.push("insert into czn.marital_status (id, name) values (3, 'разведен (разведена)');");
				qarr.push("insert into czn.marital_status (id, name) values (4, 'вдовец (вдова)');");
				qarr.forEach(function(qitem) {
					connection.query(qitem, function(err, res) {
						if (err) {
							console.log(qitem);
							console.log(err);
							throw err;
						}
					});
				});
				connection.end(function() {
					callback(null, "marital_state... OK");
				});
			},
			// FIL_OBR.DBF
			function(callback) {
				var connection = mysql.createConnection(dbConOptions);
				connection.connect();
				var dbf = new DBFQuery(path + "FIL_OBR.DBF",
							function(record) {
								return (record['KART_N'] !== null && record['KART_N'] !== undefined);
							},
							null,
							null,
							"cp866",
							function(records) {
								console.log("DBF person_card count: "+ records.length);
								records.forEach(function(record, i) {
									
									var qstr = "insert into czn.person_card (id, card_n, ind_card, code_rm , obr_date, fio , sex , doc_type_id, doc_sern, doc_series, doc_num, doc_s, doc_bywho, doc_date, born_date, citizen_id, nationality_id, address , phone_num, empl_status_id, unempl_type_id, soc_protection_type_id, bzn_date, bzk_date, ZAKRK, education_type_id, prof_id, qualific_id, stag_pf, last_org_id, post_id, post_qualific_id, stag_o, stag_o_m, stag_pr_g, stag_pr_m, stag_12, secteconom_id, otrnarhoz_id, dismiss_date, avg_salary, marital_status_id, dismiss_type_id, dependent_num, TR_FSOB, TR_PRED, TR_PROF, TR_KVA, TR_KOLDPRF, TR_SOP, TR_VIDR, TR_SMEN, TR_ZARPL, TR_RAIG, TR_KOLOPRF, DATA_KOR, STATUS_OB, SN_OB, DAT_OSU, VID_TRKN, SER_TRKN, NOM_TRKN, DAT_TRKN, POVTOR, PR_POSOB, PR_STIP, city_id, district_id) values (";
									qstr += (i+1) + ", ";
									qstr += lib.fieldToString(record["KART_N"]) +", ";
									qstr += lib.fieldToString(record["IND_KART"]) +", ";
									qstr += lib.fieldToString(record["KOD_RM"]) +", ";
									qstr += lib.uglyDateToString(record["OBR_DT"]) + ", ";
									qstr += lib.fieldToString(record["FIO"]) +", ";
									qstr += lib.fieldToString(record["POL"]) +", ";
									qstr += lib.fieldToString(record["DOKVID"]) +", ";
									qstr += lib.fieldToString(record["DOK_SERN"]) +", ";
									qstr += lib.fieldToString(record["DOK_SER"]) +", ";
									qstr += lib.fieldToString(record["DOK_N"]) +", ";
									qstr += lib.fieldToString(record["DOK_S"]) +", ";
									qstr += lib.fieldToString(record["KEM_VID"]) +", ";
									qstr += lib.uglyDateToString(record["DOK_DT"]) + ", ";
									qstr += lib.uglyDateToString(record["ROGD_DT"]) + ", ";
									qstr += lib.fieldToString(record["GRAGD"]) +", ";
									qstr += lib.fieldToString(record["NAC"]) +", ";
									qstr += lib.fieldToString(record["ADRESS"]) +", ";
									qstr += lib.fieldToString(record["TEL"]) +", ";
									qstr += lib.fieldToString(record["OTNZAN"]) +", ";
									qstr += lib.fieldToString(record["VIDNEZAN"]) +", ";
									qstr += lib.fieldToString(record["KAT_SOCZ"]) +", ";
									qstr += lib.uglyDateToString(record["DATABZN"]) +", ";
									qstr += lib.uglyDateToString(record["DATABZK"]) +", ";
									qstr += lib.fieldToString(record["ZAKRK"]) +", ";
									qstr += lib.fieldToString(record["OBRAZ"]) +", ";
									qstr += lib.fieldToString(record["PROF_OBR"]) +", ";
									qstr += lib.fieldToString(record["KVA_OBR"]) +", ";
									qstr += lib.fieldToString(record["STAG_PF"]) +", ";
									qstr += lib.fieldToString(record["POSL_RAB"]) +", ";
									qstr += lib.fieldToString(record["DOLGN"]) +", ";
									qstr += lib.fieldToString(record["KVA_DOLGN"]) +", ";
									qstr += lib.fieldToString(record["STAG_O"]) +", ";
									qstr += lib.fieldToString(record["STAG_O_M"]) +", ";
									qstr += lib.fieldToString(record["STAG_PR_G"]) +", ";
									qstr += lib.fieldToString(record["STAG_PR_M"]) +", ";
									qstr += lib.fieldToString(record["STAG_12"]) +", ";
									qstr += lib.fieldToString(record["SEKT_EK"]) +", ";
									qstr += lib.fieldToString(record["OTR_NH"]) +", ";
									qstr += lib.uglyDateToString(record["UVOL_DT"]) +", ";
									qstr += lib.fieldToString(record["SREDN_ZAR"]) +", ";
									qstr += lib.fieldToString(record["SEM_POL"]) +", ";
									qstr += lib.fieldToString(record["UVOL_PR"]) +", ";
									qstr += lib.fieldToString(record["KOL_IGD"]) +", ";
									qstr += lib.fieldToString(record["TR_FSOB"]) +", ";
									qstr += lib.fieldToString(record["TR_PRED"]) +", ";
									qstr += lib.fieldToString(record["TR_PROF"]) +", ";
									qstr += lib.fieldToString(record["TR_KVA"]) +", ";
									qstr += lib.fieldToString(record["TR_KOLDPRF"]) +", ";
									qstr += lib.fieldToString(record["TR_SOP"]) +", ";
									qstr += lib.fieldToString(record["TR_VIDR"]) +", ";
									qstr += lib.fieldToString(record["TR_SMEN"]) +", ";
									qstr += lib.fieldToString(record["TR_ZARPL"]) +", ";
									qstr += lib.fieldToString(record["TR_RAIG"]) +", ";
									qstr += lib.fieldToString(record["TR_KOLOPRF"]) +", ";
									qstr += lib.fieldToString(record["DATA_KOR"]) +", "; /*datetime*/
									qstr += lib.fieldToString(record["STATUS_OB"]) +", ";
									qstr += lib.fieldToString(record["SN_OB"]) +", ";
									qstr += lib.fieldToString(record["DAT_OSU"]) +", "; /*datetime*/
									qstr += lib.fieldToString(record["VID_TRKN"]) +", ";
									qstr += lib.fieldToString(record["SER_TRKN"]) +", ";
									qstr += lib.fieldToString(record["NOM_TRKN"]) +", ";
									qstr += lib.fieldToString(record["DAT_TRKN"]) +", "; /*datetime*/
									qstr += lib.fieldToString(record["POVTOR"]) +", ";
									qstr += lib.fieldToString(record["PR_POSOB"]) +", ";
									qstr += lib.fieldToString(record["PR_STIP"]) +", ";
									qstr += lib.fieldToString(record["KODNP"]) +", ";
									qstr += lib.fieldToString(record["RAIOG"]) +")";
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
				dbf.selectSimple();
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
					options.callback({error:err, result:results, timeleft:time_left});
				}
			}
		);
	},
	updatePeopleCards: function(options) {
		var path, 
			dbf,
			dbConOptions,
			start_time = Date.now(),
			end_time,
			dbfCount=0,
			insCount=0;
		
		if(options.dbfpath) { path = options.dbfpath; } 
		else { path = "R:/CZNF/"; }
		
		if(options.dbconoptions) { dbConOptions = options.dbconoptions; } 
		else { dbConOptions = { host: 'localhost', port: 3311, user: 'root', password: 'root' }; }
		
		// FIL_OBR.DBF 										KART_N,N,6,0	IND_KART,N,2,0	KOD_RM,C,1	OBR_DT,N,8,0	FIO,C,50	POL,C,1	DOKVID,N,2,0	DOK_SERN,C,8	DOK_SER,C,3	DOK_N,N,10,0	DOK_S,C,10	KEM_VID,C,30	DOK_DT,N,8,0	ROGD_DT,N,8,0	GRAGD,N,2,0	NAC,N,2,0	ADRESS,C,54	TEL,N,7,0	OTNZAN,N,2,0	VIDNEZAN,N,2,0	KAT_SOCZ,N,2,0	DATABZN,N,8,0	DATABZK,N,8,0	ZAKRK,N,2,0	OBRAZ,N,2,0	PROF_OBR,N,6,0	KVA_OBR,N,2,0	STAG_PF,N,3,0	POSL_RAB,N,6,0	DOLGN,N,6,0	KVA_DOLGN,N,2,0	STAG_O,N,3,0	STAG_O_M,N,3,0	STAG_PR_G,N,3,0	STAG_PR_M,N,3,0	STAG_12,N,2,0	SEKT_EK,N,2,0	OTR_NH,N,2,0	UVOL_DT,N,8,0	SREDN_ZAR,N,10,0	SEM_POL,N,2,0	UVOL_PR,N,2,0	KOL_IGD,N,3,0	TR_FSOB,N,2,0	TR_PRED,N,9,0	TR_PROF,N,6,0	TR_KVA,N,2,0	TR_KOLDPRF,N,3,0	TR_SOP,N,2,0	TR_VIDR,N,2,0	TR_SMEN,N,2,0	TR_ZARPL,N,10,0	TR_RAIG,N,2,0	TR_KOLOPRF,N,3,0	DATA_KOR,D	STATUS_OB,N,2,0	SN_OB,N,2,0	DAT_OSU,D	VID_TRKN,N,2,0	SER_TRKN,C,8	NOM_TRKN,C,12	DAT_TRKN,D	POVTOR,N,1,0	PR_POSOB,N,2,0	PR_STIP,N,2,0	KODNP,N,2,0	RAIOG,N,2,0	VID_ADR,N,1,0	KOD_UL,N,4,0	NDOM,N,3,0	IND_DOM,C,1	NKV,N,3,0
		qarr = [];
		//qarr.push("drop table if exists czn.person_card;");
		qarr.push("create table if not exists czn.person_card (id integer NOT NULL AUTO_INCREMENT PRIMARY KEY, card_n integer, ind_card integer, code_rm varchar(5), obr_date datetime, fio varchar(200), sex varchar(20), doc_type_id integer, doc_sern varchar(10), doc_series varchar(10), doc_num integer, doc_s varchar(25), doc_bywho varchar(100), doc_date datetime, born_date datetime, citizen_id integer, nationality_id integer, address varchar(200), phone_num varchar(25), empl_status_id integer, unempl_type_id integer, soc_protection_type_id integer, bzn_date datetime, bzk_date datetime, ZAKRK integer, education_type_id integer, prof_id integer, qualific_id integer, stag_pf integer, last_org_id integer, post_id integer, post_qualific_id integer, stag_o integer, stag_o_m integer, stag_pr_g integer, stag_pr_m integer, stag_12 integer, secteconom_id integer, otrnarhoz_id integer, dismiss_date datetime, avg_salary integer, marital_status_id integer, dismiss_type_id integer, dependent_num integer, TR_FSOB integer, TR_PRED integer, TR_PROF integer, TR_KVA integer, TR_KOLDPRF integer, TR_SOP integer, TR_VIDR integer, TR_SMEN integer, TR_ZARPL integer, TR_RAIG integer, TR_KOLOPRF integer, DATA_KOR datetime, STATUS_OB integer, SN_OB integer, DAT_OSU datetime, VID_TRKN integer, SER_TRKN varchar(25), NOM_TRKN integer, DAT_TRKN datetime, POVTOR integer, PR_POSOB integer, PR_STIP integer, city_id integer, district_id integer);");
		qarr.push("delete from lib.fieldToString");
		//~ qarr.push("delete from czn.person_card");
		dbConOptions = { host: 'localhost', port: 3311, user: 'root', password: 'root' }; 
		var connection = mysql.createConnection(dbConOptions);
		//~ connection.connect();
		try {
			qarr.forEach(function(qstr) {
				connection.query(qstr, function(err, res) {
					if (err) {
						err['query'] = qstr;
						throw err;
					}
				});
			});
		} catch(err) {
			//~ console.log(err);
			// Вызов функции обратного вызова с ошибкой и пустым результатом
			if(typeof(options.callback) == 'function') {
				options.callback({error:err, resilt:null, timeleft:undefined});
			}
			return;
		}
		
		var dbf = new DBFParser(path + "FIL_OBR.DBF", 'cp866');
		dbf.on('record', function(record) {
			if(record['KART_N'] == null || record['KART_N'] == undefined) {
				return false;
			}
			dbfCount++;
			var qstr = "insert into czn.person_card (card_n, ind_card, code_rm , obr_date, fio , sex , doc_type_id, doc_sern, doc_series, doc_num, doc_s, doc_bywho, doc_date, born_date, citizen_id, nationality_id, address , phone_num, empl_status_id, unempl_type_id, soc_protection_type_id, bzn_date, bzk_date, ZAKRK, education_type_id, prof_id, qualific_id, stag_pf, last_org_id, post_id, post_qualific_id, stag_o, stag_o_m, stag_pr_g, stag_pr_m, stag_12, secteconom_id, otrnarhoz_id, dismiss_date, avg_salary, marital_status_id, dismiss_type_id, dependent_num, TR_FSOB, TR_PRED, TR_PROF, TR_KVA, TR_KOLDPRF, TR_SOP, TR_VIDR, TR_SMEN, TR_ZARPL, TR_RAIG, TR_KOLOPRF, DATA_KOR, STATUS_OB, SN_OB, DAT_OSU, VID_TRKN, SER_TRKN, NOM_TRKN, DAT_TRKN, POVTOR, PR_POSOB, PR_STIP, city_id, district_id) values (";
			//qstr += (i+1) + ", ";
			qstr += lib.fieldToString(record["KART_N"]) +", ";
			qstr += lib.fieldToString(record["IND_KART"]) +", ";
			qstr += lib.fieldToString(record["KOD_RM"]) +", ";
			qstr += lib.uglyDateToString(record["OBR_DT"]) + ", ";
			qstr += lib.fieldToString(record["FIO"]) +", ";
			qstr += lib.fieldToString(record["POL"]) +", ";
			qstr += lib.fieldToString(record["DOKVID"]) +", ";
			qstr += lib.fieldToString(record["DOK_SERN"]) +", ";
			qstr += lib.fieldToString(record["DOK_SER"]) +", ";
			qstr += lib.fieldToString(record["DOK_N"]) +", ";
			qstr += lib.fieldToString(record["DOK_S"]) +", ";
			qstr += lib.fieldToString(record["KEM_VID"]) +", ";
			qstr += lib.uglyDateToString(record["DOK_DT"]) + ", ";
			qstr += lib.uglyDateToString(record["ROGD_DT"]) + ", ";
			qstr += lib.fieldToString(record["GRAGD"]) +", ";
			qstr += lib.fieldToString(record["NAC"]) +", ";
			qstr += lib.fieldToString(record["ADRESS"]) +", ";
			qstr += lib.fieldToString(record["TEL"]) +", ";
			qstr += lib.fieldToString(record["OTNZAN"]) +", ";
			qstr += lib.fieldToString(record["VIDNEZAN"]) +", ";
			qstr += lib.fieldToString(record["KAT_SOCZ"]) +", ";
			qstr += lib.uglyDateToString(record["DATABZN"]) +", ";
			qstr += lib.uglyDateToString(record["DATABZK"]) +", ";
			qstr += lib.fieldToString(record["ZAKRK"]) +", ";
			qstr += lib.fieldToString(record["OBRAZ"]) +", ";
			qstr += lib.fieldToString(record["PROF_OBR"]) +", ";
			qstr += lib.fieldToString(record["KVA_OBR"]) +", ";
			qstr += lib.fieldToString(record["STAG_PF"]) +", ";
			qstr += lib.fieldToString(record["POSL_RAB"]) +", ";
			qstr += lib.fieldToString(record["DOLGN"]) +", ";
			qstr += lib.fieldToString(record["KVA_DOLGN"]) +", ";
			qstr += lib.fieldToString(record["STAG_O"]) +", ";
			qstr += lib.fieldToString(record["STAG_O_M"]) +", ";
			qstr += lib.fieldToString(record["STAG_PR_G"]) +", ";
			qstr += lib.fieldToString(record["STAG_PR_M"]) +", ";
			qstr += lib.fieldToString(record["STAG_12"]) +", ";
			qstr += lib.fieldToString(record["SEKT_EK"]) +", ";
			qstr += lib.fieldToString(record["OTR_NH"]) +", ";
			qstr += lib.uglyDateToString(record["UVOL_DT"]) +", ";
			qstr += lib.fieldToString(record["SREDN_ZAR"]) +", ";
			qstr += lib.fieldToString(record["SEM_POL"]) +", ";
			qstr += lib.fieldToString(record["UVOL_PR"]) +", ";
			qstr += lib.fieldToString(record["KOL_IGD"]) +", ";
			qstr += lib.fieldToString(record["TR_FSOB"]) +", ";
			qstr += lib.fieldToString(record["TR_PRED"]) +", ";
			qstr += lib.fieldToString(record["TR_PROF"]) +", ";
			qstr += lib.fieldToString(record["TR_KVA"]) +", ";
			qstr += lib.fieldToString(record["TR_KOLDPRF"]) +", ";
			qstr += lib.fieldToString(record["TR_SOP"]) +", ";
			qstr += lib.fieldToString(record["TR_VIDR"]) +", ";
			qstr += lib.fieldToString(record["TR_SMEN"]) +", ";
			qstr += lib.fieldToString(record["TR_ZARPL"]) +", ";
			qstr += lib.fieldToString(record["TR_RAIG"]) +", ";
			qstr += lib.fieldToString(record["TR_KOLOPRF"]) +", ";
			qstr += lib.fieldToString(record["DATA_KOR"]) +", "; /*datetime*/
			qstr += lib.fieldToString(record["STATUS_OB"]) +", ";
			qstr += lib.fieldToString(record["SN_OB"]) +", ";
			qstr += lib.fieldToString(record["DAT_OSU"]) +", "; /*datetime*/
			qstr += lib.fieldToString(record["VID_TRKN"]) +", ";
			qstr += lib.fieldToString(record["SER_TRKN"]) +", ";
			qstr += lib.fieldToString(record["NOM_TRKN"]) +", ";
			qstr += lib.fieldToString(record["DAT_TRKN"]) +", "; /*datetime*/
			qstr += lib.fieldToString(record["POVTOR"]) +", ";
			qstr += lib.fieldToString(record["PR_POSOB"]) +", ";
			qstr += lib.fieldToString(record["PR_STIP"]) +", ";
			qstr += lib.fieldToString(record["KODNP"]) +", ";
			qstr += lib.fieldToString(record["RAIOG"]) +")";
			//~ console.log(qstr);
			connection.query(qstr, function(err, res) {
				if (err) {
					console.log(qstr);
					console.log(err);
					throw err;
				} else {
					insCount++;
				}
			});
		});
		dbf.on('end', function() {
			connection.end(function() {
				if(typeof(options.callback) == 'function') {
					var error = null,
						result = ["person_card... OK. DBF count:"+dbfCount +", inserted count: "+insCount], 
						end_time = Date.now();
						timeleft = (end_time - start_time)/1000;
					options.callback({error:error, result:result, timeleft:timeleft});
				 }
			});
		});
		dbf.parse();
	},
	updateOrders: updateOrders
}
	
}).call(this);



