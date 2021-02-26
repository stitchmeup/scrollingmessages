var express = require('express');
var router = express.Router();
var jwt = require('../modules/jwtAuth')
var DbClient = require('../modules/DbClient')
var multer  = require('multer')
var fs = require('fs');
var crypto = require('crypto');
var { body, validationResult } = require('express-validator');
var fileUpload = require('express-fileupload');
var xmlParser = require("xml2json")

/* GET home page. */
router.use(async function adminAuth(req, res, next) {
  var client = new DbClient("appUser");
  try {
    // Connect to db
    await client.connect();

    // Authentication
    let auth = await client.checkAuth(req.cookies.token, req.cookies.username)
    .then(res => res)
    .catch(err => { throw new Error(err) });

    if (auth) {
      res.custom = {
        valid: true,
      }
      next();
    }
    else next(401);
    // Close connect to DB
    //await client.close();

  } catch (err) {
    console.log(err)
    next(500)
  }
});


router.get('/',
function(req, res) {
  res.render('admin', res.custom);
});


// XML File upload
var upload = multer({ dest: '/tmp/sm'})

router.post('/upload', upload.single('xmlFile'),
body('name').isAscii().stripLow().escape().not().isEmpty(),
async function(req, res, next) {
  var client = new DbClient("appAdmin");
  try {
    validationResult(req).throw();

    // connection to db
    await client.connect();

    // To prevent weird play naming and match, lets use md5 hash as name
    let nameHash = crypto.createHmac('md5', '').update(req.body.name).digest('hex');
    // Check for existing play by the name providing in the form
    let playExist = await client.findPlayByNameHash(nameHash)
    .catch(err => { throw new Error(err) });
    if (!playExist) {
      console.log("INSERTION")
      // Insert play into database
      fs.readFile(req.file.path, async function(err, data) {
        if (err) throw new Error(err);
        const xmlObj = JSON.parse(xmlParser.toJson(data, { reversible: true }))
        await client.insertPlay(xmlObj, req.body.name, nameHash)
        .catch(err => { throw new Error(err) });
      });
      res.custom.error = null
    // if play exist use 400 HTTP status and print a message
    } else {
      res.custom.error = {
        'playExist': true,
        'message': "Erreur lors de l'ajout: nom de pièce déjà utilisé."
      }
    }

    //await client.close();
    res.status(res.custom.status).render('admin', res.custom)
  } catch (err) {
    console.log(err)
    next(500);
  }
});


module.exports = router;
