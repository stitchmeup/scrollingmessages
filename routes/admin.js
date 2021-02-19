var express = require('express');
var router = express.Router();
var jwt = require('../modules/jwtAuth')
var DbClient = require('../modules/DbClient')


/* GET home page. */
router.get('/admin', async function(req, res, next) {
  var client = new DbClient("appUser");
  var check = 200

  try {
    // Connect to db
    await client.connect();

    // Authentication
    await client.checkAuth(req.cookies.token, req.cookies.username)
    .then(res => { if (!res) check = 400; })
    .catch(() => check = 500);

  } catch {
    error = true

  } finally {
    await client.close();
    // successful auth
    if (check === 200) res.render('admin', {validSession: true});
    // Auth denied or serveur error
    else next(check);
  }
});

module.exports = router;
