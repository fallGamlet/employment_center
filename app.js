/**
 * Module dependencies.
 */
appSettings = require('./settings');
offsetDate = new Date().getTimezoneOffset();
util = require("util");
forms = require("./forms");

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var vakans_view = require('./routes/vakans');
var people_view = require('./routes/people');
var order_view = require('./routes/order');
var http = require('http');
var path = require('path');
var swig = require('swig');
var orm = require("orm");

var app = express();

// all environments
app.engine('html', swig.renderFile);

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));

app.use(orm.express(appSettings.getConnectionStr(), {
    define: function (db, models, next) {
    	db.load("./models", function(err) {
    		console.log(err);
    	});
    	models.User = db.models["auth_user"];
        models.Group = db.models["auth_group"];
        models.ContentTable = db.models["content_table"];
        models.Permissions = db.models["auth_permission"];
//        db.sync();
        next();
    }
}));

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.cookieParser());
app.use(express.session({ secret: 'thisIsMySuperSecretKeyHaHaHa'} ));
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

app.get('/vakansii', vakans_view.index);
app.get('/vakansii/view', vakans_view.view);
app.get('/vakansii/search', vakans_view.search);

app.get('/search-peaple', people_view.index);
app.get('/search-peaple/preview', people_view.search);
app.get('/people/view/:pk/:fio', people_view.viewone);

app.get('/order/view/:card_n/:ind_card', order_view.view);

app.get('/login', user.login);
app.post('/login', user.login);
app.get(/[/]admin([/].*)*$/, user.middleware);
app.post(/[/]admin([/].*)*$/, user.middleware);
app.get('/admin', user.index);
app.get('/admin/db/update', user.dbupdate);
app.get('/admin/db/update/person-cards', user.dbPersonCardUpdate);
app.get('/admin/auth/:model?/:action?/:id?', user.auth_index);
app.post('/admin/auth/:model?/:action?/:id?', user.auth_index);

app.get('/javascripts/forms/:file_js', function(req, res){
    var filename = "./forms/lib/"+req.params['file_js'];
    res.sendfile(filename);
});


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


process.on('uncaughtException', function (err) {
  console.log(err.stack);
});
