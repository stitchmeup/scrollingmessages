var express = require('express');
var router = express.Router();
var jwt = require('../modules/jwtAuth')
var DbClient = require('../modules/DbClient')


/* GET home page. */
router.get('/admin', async function(req, res) {
  const client = new DbClient("appUser");
  var check
  var error = false

  try {
    // Connect to db
    await client.connect();

    // Authentication
    await client.checkAuth(req.cookies.token, req.cookies.username)
    .then(res => check = res)
    .catch(() => error = true);
    
  } catch {
    error = true

  } finally {
    await client.close();
    if (error) {
      // Server Error
      res.status(500).render('error', {message: "Woops, something went wrong!", error: {status: "500, Internal Server Error"}});
    } else if (check) {
      // Auth succesfull
      res.render('admin', {validSession: true})
    } else {
      // Auth denied
      res.status(400).redirect(`/?woops=${check}`)
    }
  }
});

module.exports = router;
