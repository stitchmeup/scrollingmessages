var express = require('express');
var router = express.Router();
var { body, validationResult } = require('express-validator');
var session = require('express-session')
var bcrypt = require('bcrypt')
var dbClient = require('../modules/dbClient')
var jwt = require('../modules/jwtAuth')


/* GET home page. */
router.post('/login', [
body("username").isAscii(),
body("password").isAscii()
],
async function(req, res) {
  try {
    var errors = {'login': 0, 'other': false}
    validationResult(req).throw();
    try {
      // Ensures that the client will close when you finish/error
      await dbClient.connect();
      var check = await dbClient.checkPwd(req.body.username, req.body.password);
      if (check.status) {
        var token = jwt.sign({ id: check.user._id }, jwt.config.secret, {
          expiresIn: 86400 // 24 hours
        });
      } else {
        errors.login = 1;
      }

    } catch (err) {
      errors.other = true
    } finally {
      // Ensures that the client will close when you finish/error
      await dbClient.close();
    }
  } catch (err) {
    // if validationResult failed
    if (err.hasOwnProperty('errors')) {
      errors.login = 1;
    } else {
      // somthing elese failed
      errors.other = true;
    }
  } finally {
    // No errors
    if (!errors.login && !errors.other) {
     res.cookie("token", token, {
       secure: true,
       httpOnly: true,
       expires: new Date(Date.now() + 8 * 3600000)
     });
     res.cookie("username", check.user.username, {
       secure: true,
       httpOnly: true,
       expires: new Date(Date.now() + 8 * 3600000)
     });
     res.redirect('/admin')
    // login failed (1) or authentication error (2)
    } else if (errors.login) {
      res.status(400).redirect(`/?woops=${errors.login}`);
    // something else went wrong
    } else if (errors.other) {
      res.status(500).render('error', {message: "Woops, something went wrong!", error: {status: "500, Internal Server Error"} });
    }
    //await dbClient.close();
  }
});

module.exports = router;
