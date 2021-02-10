var express = require('express');
var router = express.Router();
var { query, validationResult } = require('express-validator');


/* GET home page. */
router.get('/',
query('woops').optional().isNumeric().isIn(["a"]),
function(req, res) {
  var woops = null;
  try {
    validationResult(query).throw();
    var woops = req.query.woops
  } finally {
    res.render('index', {woops: woops});
  }
});

module.exports = router;
