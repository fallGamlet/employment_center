/**
 * New node file
 */
var auth = require("./lib/auth");

module.exports = function (db, callback) {
    if(callback === "function")
    	return callback();
};