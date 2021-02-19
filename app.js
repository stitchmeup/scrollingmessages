var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser')
var helmet = require('helmet');
var cors = require('cors');

var app = express();

// allow list for cors
var allowlist = ['http://127.0.0.1:3000'];
// differenciate prod from dev
if (app.get('env') === 'production') {
  allowlist.push('https://scrollingmessages.hopto.org')
}
var corsOptions = {
  origin: allowlist
}

// always wear helmet (CSP)
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'script-src': ["'self'", "code.jquery.com", "cdn.jsdelivr.net"]
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

// view engine setup
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// makes public files available
app.use('/', express.static(path.join(__dirname, 'public')));

app.use(cookieParser());


// require all defined routes
var routers = {}
routers.names = ['index', 'getxml', 'messages', 'login', 'admin', 'logout',
 'upload'];
routers.names.forEach((route) => {
  routers[route] = require(`./routes/${route}`)
});

// use all routes
routers.names.forEach((route) => {
  app.use('/', routers[route]);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Specific error handler
app.use(function(err, req, res, next) {
  let errorsMessages = {
    400: 'Bad Request',
    500: 'Internal Server Error'
  }
  if (err === 500) res.status(500).render('error', {
    message: 'Woops, something went wrong!',
    error: {
      status: `${err} ${errorsMessages[err]}`
    }
  });
  else if (err === 400) res.redirect('/?woops=2');
  else next(err);
});

// error handler
app.use(function(err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error')
});


module.exports = app;
