/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var vakans_view = require('./routes/vakans');
var peaple_view = require('./routes/peaple');
var http = require('http');
var path = require('path');
var swig = require('swig');

var mySettings = require('./settings');

var app = express();

// all environments
app.engine('html', swig.renderFile);

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
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
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/user', user.index);
app.get('/user/login', user.login);
app.post('/user/login', user.login);
app.get('/user/db/update', user.dbupdate);
app.get('/vakansii', vakans_view.index);
app.get('/vakansii/view', vakans_view.view);
app.get('/vakansii/search', vakans_view.search);
app.get('/search-peaple', peaple_view.index);
app.get('/search-peaple/preview', peaple_view.search);
app.get('/people/view/:pk/:fio', peaple_view.viewone);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


process.on('uncaughtException', function (err) {
  console.log(err.stack);
});
