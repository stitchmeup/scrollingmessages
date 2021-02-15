var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser')
var helmet = require('helmet');
var cors = require('cors');

var app = express();

// require all defined routes
var routers = {}
routers.names = ['index', 'getxml', 'messages', 'login', 'admin', 'logout'];
routers.names.forEach((route) => {
  routers[route] = require(`./routes/${route}`)
});



var app = express();

var allowlist = [];
// Differenciate prod from dev
if (app.get('env') === 'production') {
  allowlist.push('https://scrollingmessages.hopto.org')
} else {
  allowlist.push('http://127.0.0.1:3000')
}
var corsOptions = {
  origin: allowlist
}

// view engine setup
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'pug');


// helmet
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src": ["'self'", "code.jquery.com", "cdn.jsdelivr.net"]
    }
  })
);
app.use(helmet.dnsPrefetchControl());
app.use(helmet.expectCt());
app.use(helmet.frameguard());
app.use(helmet.hidePoweredBy());
app.use(helmet.hsts());
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy());
app.use(helmet.xssFilter());


// CORS
app.use(cors(corsOptions))


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// makes public files available
app.use('/', express.static(path.join(__dirname, 'public')));

app.use(cookieParser());

// use all routes
routers.names.forEach((route) => {
  app.use('/', routers[route]);
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
