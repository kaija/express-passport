var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var DigestStrategy = require('passport-http').DigestStrategy;
var BasicStrategy = require('passport-http').BasicStrategy;

var routes = require('./routes/index');
var users = require('./routes/users');

var pred_users = [
    { id: 1, username: 'bob', password: 'secret', email: 'bob@example.com' },
    { id: 2, username: 'kevin', password: 'demo', email: 'kevin@example.com' },
  , { id: 3, username: 'joe', password: 'birthday', email: 'joe@example.com' }
];

function findByUsername(username, fn) {
  for (var i = 0, len = pred_users.length; i < len; i++) {
    var user = pred_users[i];
    if (user.username === username) {
      return fn(null, user);
    }
  }
  return fn(null, null);
}


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('express-session')({
  secret: 'penroses',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function(user, done) {
  done(null, user.username);
});
passport.deserializeUser(function(id, done) {
  done(null, id);
});

app.use(express.static(path.join(__dirname, 'public')));

passport.use(new DigestStrategy({ qop: 'auth' },
  function(username, done) {
    // Find the user by username.  If there is no user with the given username
    // set the user to `false` to indicate failure.  Otherwise, return the
    // user and user's password.
    findByUsername(username, function(err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      return done(null, user, user.password);
    })
  },
  function(params, done) {
    // asynchronous validation, for effect...
    process.nextTick(function () {
      // check nonces in params here, if desired
      return done(null, true);
    });
  }
));
passport.use(new BasicStrategy(function(username, password, done) {
  // Find the user by username.  If there is no user with the given
  // username, or the password is not correct, set the user to `false` to
  // indicate failure.  Otherwise, return the authenticated `user`.
  findByUsername(username, function(err, user) {
    if (err) { return done(err); }
    if (!user) { return done(null, false); }
    if (user.password != password) { return done(null, false); }
    return done(null, user);
  })
}));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
