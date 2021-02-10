var express = require('express');
var router = express.Router();
var jwt = require('../modules/jwtAuth')
var dbClient = require('../modules/dbClient')


/* GET home page. */
router.get('/admin', async function(req, res) {
  try {
    let verifiedToken = await jwt.verifyToken(req.cookies.token);
    if (verifiedToken.status) {
      await dbClient.connect();
      let user = await dbClient.findUserById(verifiedToken.user.id);
      if (user) {
        if (user.username === req.cookies.username) {
          res.render('admin', {validSession: true})
        } else {
          res.redirect('/woops=2')
        }
      } else {
        res.redirect('/?woops=2')
      }
    } else {
      res.redirect('/?woops=2')
    }
  } catch (err) {
    res.render('error', {message: "Woops, something went wrong!", error: {status: "500, Internal Server Error"} });
  } finally {
    //await dbClient.close();
  }
});

module.exports = router;
