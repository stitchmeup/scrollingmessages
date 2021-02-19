var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/logout', function(req, res, next) {
  if ( ! req.cookies.username || ! req.cookies.token) {
    next(400);
  } else {
    res.cookie('username', null, {expires: new Date(Date.now())});
    res.cookie('token', null, {expires: new Date(Date.now())});
    res.redirect('/');
  }
});

module.exports = router;
