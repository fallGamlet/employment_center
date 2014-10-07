(function(){
    var dbConnOptions = { 
        driver:'mysql', 
        host: 'localhost', 
        port: 3311, 
        user: 'root', 
        password: 'root', 
        dbname:'czn' 
    };
    var getConnectionStr = function() {
        return util.format("%s://%s:%s@%s:%s/%s", 
                dbConnOptions.driver,
                dbConnOptions.user,
                dbConnOptions.password,
                dbConnOptions.host,
                dbConnOptions.port,
                dbConnOptions.dbname);
    };
    module.exports = {
        dbfBasePath: "R:/CZNF/",
        dbConnOptions: dbConnOptions,
        dbVersion: '0.0.4',
        getConnectionStr : getConnectionStr
    };
}).call(this);
