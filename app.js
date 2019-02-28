var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

const index = require('./routes/index');
const users = require('./routes/users');
const log = require('libs/log')(module);
const mongoose = require('libs/mongoose');

var app = express();

// view engine setup
app.engine('ejs', require('ejs-locals'));//layout blocks partial
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const config = require('config');

app.use(session({
  secret: config.get("session:secret"),
  key: config.get("session:key"),
  cookie: config.get("session:cookie"),
  store: new MongoStore({mongooseConnection: mongoose.connection})
}));
app.use(require('middleware/loadUser'));
app.use(express.static(path.join(__dirname, 'public')));

require('routes')(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  //console.log(`ERROR - app ->${res.locals.message}|${res.locals.error}|${err.status}|`);
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
