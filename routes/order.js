var mysql     = require('mysql')
	,async = require("async")
	,mySettings = require('../settings');

exports.index = function(req, res) {
	return res.render('order_index.html', { title: 'Приказы'});
};

exports.view = function(req, res) {
	var card_n = req.params['card_n'],
		ind_card = req.params['ind_card'];
		
	getOrders(card_n, ind_card, function(records, err) {
		return res.render('people/order_view_inner.html', { orderList: records});
	});
};

var getOrders = function(card_n, ind_card, callback) {
	var records,
		qstr = ("SELECT * FROM czn.order_view WHERE card_n=" + card_n +" AND ind_card="+ ind_card),
		connection = mysql.createConnection(mySettings.dbConnOptions);
		
	connection.connect();
	connection.query(qstr, function(err, rows) {
		if (err) callback(null, err);
		records = rows;
	});
	connection.end(function() {
		callback(records, null);
	});
};
