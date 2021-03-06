var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var busboy = require('connect-busboy');
var index = require('./routes/index');
var users = require('./routes/users');
var sessions = require('./routes/sessions');

//var Session = require('./models/session');

var app = express();

// connect to db
mongoose.connect('mongodb://localhost:27017/StudyBuddy');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(busboy());

app.use('/', index);
app.use('/users', users);
app.use('/sessions',sessions);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.sendStatus(404);
});

module.exports = app;