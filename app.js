const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const hbs = require('express-handlebars')
const bodyParser = require('body-parser')
const session = require('express-session')
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');
const crypto = require('crypto');
const nocache = require('nocache')
require('dotenv').config()

const app = express();
const randomSecretKey = crypto.randomBytes(32).toString('hex');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({ extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layout/', partialsDir: __dirname + '/views/partials/' ,runtimeOptions:{
  allowedProtoPropertiesBydefault:true,allowProtoMethodsByDefault:true,
},}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret:randomSecretKey, 
  resave:false,
  saveUninitialized:true,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
}))
app.use(nocache())

app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

app.use('/', userRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
