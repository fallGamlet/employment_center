/**
 * New node file
 */
var auth = require("./lib/auth");

module.exports = function (db, callback) {
    auth(db);
    if(typeof(callback) === "function")
    	return callback();
};