var express = require('express');
var router = express.Router();
var DbClient = require('../modules/DbClient')
var multer  = require('multer')
var fs = require('fs');
var crypto = require('crypto');
var { query, body, validationResult } = require('express-validator');;
var xml2jsonParser = require("xml2json")

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
      // Insert play into database
      fs.readFile(req.file.path, async function(err, data) {
        if (err) throw new Error(err);
        const xmlObj = JSON.parse(xml2jsonParser.toJson(data, { reversible: true }))
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
    res.render('admin', res.custom)
  } catch (err) {
    console.log(err)
    next(500);
  }
});

router.post('/delete',
body('play').isHash('md5'),
async function(req, res, next) {
  var client = new DbClient("appAdmin");
  res.custom = null;
  try{
    validationResult(req).throw();

    // conncect to db
    await client.connect();

    let playExist = await client.findPlayByNameHash(req.body.play)
    .catch(err => { throw new Error(err) });
    if (playExist) {
      let deletion = await client.deletePlay(req.body.play)
      .then(res => res)
      .catch(err => { throw new Error(err) });
    } else {
      res.custom = {
        'playExist': false,
        'message': 'Erreur lors de la suppression: la pièce n\'existe pas.'
      }
    }
    console.log(res.custom)
    res.render('admin', res.custom);
  } catch {
    next(500);
  } finally {
    //await client.close();
  }
});

router.post('/updatePwd', [
  body('pwd1').isAscii(),
  body('pwd2').isAscii()
],
async function (req, res, next) {
  var client = new DbClient("appAdmin");
  res.custom = null;
  try {
    validationResult(req).throw();

    if (req.body.pwd1 !== req.body.pwd2) {
      res.custom = {
        'pwdMatch': false,
        'message': "Erreur lors du changement de mot de passe: les mots de passe ne correspondent pas."
      }
    } else {
      await client.connect();

      let hashPwd = await client.hashPwd(req.body.pwd1)
      .then(res => res)
      .catch(err => { throw new Error(err) });
      if (hashPwd) {
        let updatePwd = await client.updatePwd(hashPwd, req.cookies.username)
          .then(res => res)
          .catch(err => { throw new Error (err) })
        if (updatePwd) {
          res.custom = {
            'pwdUpdated': true,
            'message': "Le mot de passe a été modifé."
          }
        } else {
          next(500);
        }
      } else {
        next(500);
      }
      res.render('admin', res.custom)
    }
  } catch {
    next(500);
  } finally {
    //await client.close();
  }
});

router.get('/msgUrg',
query('msgUrg').isAscii().escape(),
async function (req, res, next) {
  var client = new DbClient("appAdmin");
  res.custom = null;
  try {
    validationResult(query).throw();
    await client.connect();

    const date = new Date();

    //RFC 3339 format
    const formattedDate = date.toISOString();

    await client.updateMsgUrg(req.query.msgUrg, formattedDate);

    res.render('admin', res.custom);
  } catch (err) {
    console.log(err);
    next(500);
  } finally {
    //await client.close()
  }
});


module.exports = router;
