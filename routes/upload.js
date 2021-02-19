var express = require('express');
var router = express.Router();
var multer  = require('multer')
var fs = require('fs');
var crypto = require('crypto')
var { body, validationResult } = require('express-validator');
var fileUpload = require('express-fileupload');
var xmlParser = require("xml2json")
var DbClient = require('../modules/DbClient')

var upload = multer({ dest: '/tmp/sm'})

router.post('/admin/upload', upload.single('xmlFile'),
body('filename').isAscii().stripLow().escape(),
async function(req, res, next) {
  var client = new DbClient("appAdmin");
  var check = 200;
  var isSuccess = false;
  var error = { from: null, message: null };

  try {
    validationResult(req).throw();

    // connection to db
    await client.connect();

    // Authentication
    await client.checkAuth(req.cookies.token, req.cookies.username)
    .then(res => { if (!res) check = 400; })
    .catch(() => check = 500);

    // To prevent weird collection name, lets use md5 hash as name
    let hash = crypto.createHash('md5').update(req.body.filename).digest(md5)

    // To make it cleaner, we should use authentication and whole xmlFile handling
    // as middleware and use next()
    if (check === 200) {
      let collectionExist = await client.db.listCollections().toArray()
      .then(res => {
        let exist = false;
        res.forEach(col => {
          if (col.name === req.body.filename) exist = true;
        })
        return exist;
      })
      .catch(next(500))

      if (!collectionExist) {
        fs.readFile(req.file.path, async function(err, data) {
          const xmlObj = JSON.parse(xmlParser.toJson(data, { reversible: true }))
          console.log(xmlObj)
          await client.db.createCollection(req.body.filename);
          // checkKeys: false to prevent error during serialization due to $t key
          await client.db.collection(req.body.filename)
          .insertOne(xmlObj, { checkKeys: false })
          .then(res => console.log(res))
          .catch(err => console.log(err));
        });
      } else {
        isSuccess = {status: false, message: "Nom de pièce existante, "};
      }
    }
  } catch (err) {
    console.log(err);
  } finally {
    //await client.close();
    if (check === 200) res.redirect(`/admin?upload=${isSuccess}`);
    else next(check);
  }
});

module.exports = router;
