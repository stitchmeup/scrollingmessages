var express = require('express');
var router = express.Router();
var { query, validationResult } = require('express-validator');


/* GET home page. */
router.get('/',
query('woops').optional().isNumeric(),
function(req, res, next) {
  var woops = null;
  try {
    validationResult(query).throw();
    var woops = req.query.woops;
  } finally {
    if (woops) res.status(400);
    res.render('index', {woops: woops});
  }
});

module.exports = router;
