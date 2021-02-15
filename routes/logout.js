var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/logout', async function(req, res) {
  try {
    if ( ! req.cookies.username || ! req.cookies.token) {
      res.status(400).render('error', {message: "Woops, something went wrong!", error: {status: "400, Bad request"} });
    } else {
      res.cookie('username', null, {expires: new Date(Date.now())});
      res.cookie('token', null, {expires: new Date(Date.now())});
      res.redirect('/');
    }
  } catch (err) {
    console.log(err);
    res.render('error', {message: "Woops, something went wrong!", error: {status: "500, Internal Server Error"} });
  }
});

module.exports = router;
