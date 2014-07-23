/**
 * New node file
 */
var auth = require("./lib/auth");

module.exports = function (db, callback) {
    auth(db, null);
    
    if(callback === "function")
    	return callback();
};