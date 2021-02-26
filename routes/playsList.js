var express = require('express');
var router = express.Router();
var DbClient = require('../modules/DbClient')


/* GET */
router.get('/playsList', async function(req, res, next) {
  var client = new DbClient("appUser");
  try {
    await client.connect();

    let list = await client.getPlaysList()
    .then(res => res)
    .catch(err => { throw new Error(err) })


    res.set('Content-type', 'application/json');
    res.send(list);

  } catch (err) {
    console.log(err);
    next(500);
  }
});

module.exports = router;
