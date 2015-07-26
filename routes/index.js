var express = require('express');
var router = express.Router();
var passport = require('passport');
var httpreq = require('httpreq');

/* GET home page. */
//router.get('/', passport.authenticate(['basic', 'digest']),function(req, res, next) {
router.get('/', passport.authenticate('basic'),function(req, res, next) {
  res.send('OK');
});

module.exports = router;
