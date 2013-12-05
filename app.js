
/**
 * Module dependencies.
 */

var express = require('express'),
 fs = require('fs'),
 http = require('http');
 path = require('path');
 passport = require('passport');
 flash = require('connect-flash');
 mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/spartan_storage');

var models_dir = __dirname + '/models';

require(models_dir+'/user.js');
require(models_dir+'/file.js');
require(models_dir+'/tracker.js');


require('./passport')(passport)

var app = express();
app.locals.moment = require('moment');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({ secret: 'keyboard cat' }));


app.use(passport.initialize());
app.use(passport.session());
app.use(express.methodOverride());
app.use(flash())
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

require('./routes')(app, passport);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
