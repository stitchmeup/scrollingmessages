var express = require('express');
var router = express.Router();
var { body, validationResult } = require('express-validator');
var session = require('express-session')
var bcrypt = require('bcrypt')
var DbClient = require('../modules/DbClient')
var jwt = require('../modules/jwtAuth')


/* GET home page. */
router.post('/login', [
body("username").isAscii(),
body("password").isAscii()
],
async function(req, res) {
  var errors = {'login': 0, 'other': false}
  var token, username;

  try {
    validationResult(req).throw();
    var client = new DbClient("appUser");
    
    try {
      // Connect to db
      await client.connect();

      // Check password
      await client.checkPwd(req.body.username, req.body.password)
      .then(res => {
        if (res.status) {
          token = jwt.sign({ id: res.user._id }, jwt.config.secret, { expiresIn: 86400 });
          username = res.user.username;
        } else {
          errors.login = 1;
        }
      })
      .catch(err => {
        errors.other = true;
      });

    } catch {
      errors.other = true

    } finally {
      // Ensures that the client will close when you finish/error
      await client.close();
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
    if (!errors.login && !errors.other) {
      // No error, username/password combinaison is valid

      // Set cookie with token and username
      res.cookie("token", token, {
        secure: true,
        httpOnly: true,
        expires: new Date(Date.now() + 8 * 3600000)
      });
      res.cookie("username", username, {
       secure: true,
       httpOnly: true,
       expires: new Date(Date.now() + 8 * 3600000)
      });

      // Go to admin page
      res.redirect('/admin')
    }
    // login failed (1) or authentication error (2)
    else if (errors.login) { next(400); }
      // something else went wrong
    else if (errors.other) { next(500); }
  }
});

module.exports = router;
