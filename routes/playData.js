var express = require('express');
var router = express.Router();
var xml2jsonParser = require('../modules/xml2jsonParser');
var formatXml = require('xml-formatter');
var { query, body, validationResult } = require('express-validator');
var DbClient = require('../modules/DbClient')


/* GET */
router.get('/playData', [
  query('piece').isHash('md5'),
  query('equipe.*').optional().isAscii().escape(),
  query('start').optional().isInt().toInt(),
  query('end').optional().isInt().toInt(),
  query('text').optional().isIn(['full', 'sync'])
],
async function(req, res, next) {
  try {
    validationResult(req).throw();

    // Get meta data about the play requested
    var client = new DbClient("appUser");
    await client.connect();

    let playMetaData = await client.findPlayByNameHash(req.query.piece)
    .catch(err => { throw new Error(err) })

    if (playMetaData) {
      let scheme = {
        "scene": {
          "$strict": true,
          "title": true,
          "numero": {
            "$content": []
          },
          "timing": {
            "$strict": true,
            "time": true,
            "text": true,
            "equipe": {
              "$strict": true,
              "id": {
                "$content": []
              },
              "message": true
            }
          }
        }
      }

      if (req.query.hasOwnProperty('equipe')) {
        if (Array.isArray(req.query.equipe)) {
          for (let i in req.query.equipe) {
            scheme.scene.timing.equipe.id.$content.push(req.query.equipe[i]);
          }
        } else {
          scheme.scene.timing.equipe.id.$content.push(req.query.equipe);
        }
      } else {
        scheme.scene.timing.equipe.id = true;
      }
      if (req.query.hasOwnProperty('start') || req.query.hasOwnProperty('end')) {
        let start = (req.query.hasOwnProperty('start') && ! isNaN(req.query.start)) ? req.query.start : 1;
        let end = (req.query.hasOwnProperty('end') && ! isNaN(req.query.end)) ? req.query.end : 100;
        for (let i = start; i <= end; i++) scheme.scene.numero.$content.push(i.toString());
      } else {
        scheme.scene.numero = true;
      }

      if (req.query.hasOwnProperty('text')) {
        if (req.query.text === 'full') scheme.scene.timing.$strict = false;
      } else {
        delete scheme.scene.timing.text;
      }

      // Get requested play content
      const playObj = {
        'piece': await client.getPlayContent(playMetaData.playContentId)
        .then(res => res.piece)
        .catch(err => { throw new Error(500)} )
      }
      const playObjModified = await xml2jsonParser.modifyXmlObj(playObj, scheme).then((res) => res);
      const stringifiedPlayObj = JSON.stringify(playObjModified);
      const finalXml = xml2jsonParser.toXml(stringifiedPlayObj);

      res.set('Content-type', 'text/xml');
      res.send(formatXml(finalXml, { collapseContent: true }));
    } else { throw new Error("La pièce n'existe pas.") }

    //await client.close();
  } catch (err) {
    console.log(err)
    if (err === 500) next(err)
    else next(400)
  }
});

/* POST */
router.post('/playData',
body('piece').isHash('md5'),
async function(req, res, next) {
  try {
    validationResult(req).throw();


    // Get meta data about the play requested
    var client = new DbClient("appUser");
    await client.connect();

    let playMetaData = await client.findPlayByNameHash(req.body.piece)
    .catch(err => { throw new Error(err) })

    if (playMetaData) {
      // C'est moche, revoir une nouvelle version du parser
      let scheme = {
        "piece": {
          "$strict": false,
          "titre": {
            "$content": []
          },
          "listeEquipes": true,
          "scene": {
            "$content": []
          }
        }
      }

      // Get requested play content
      const playObj = {
        'piece': await client.getPlayContent(playMetaData.playContentId)
        .then(res => res.piece)
      }
      const playObjModified = await xml2jsonParser.modifyXmlObj(playObj, scheme).then((res) => res);
      const stringifiedPlayObj = JSON.stringify(playObjModified);
      const finalXml = xml2jsonParser.toXml(stringifiedPlayObj);

      res.set('Content-type', 'text/xml');
      res.send(formatXml(finalXml, { collapseContent: true }));

    } else { throw new Error(400); }

    //await client.close()
  } catch (err) {
    if (err === 400) next(err)
    else next(500)
  }
});

module.exports = router;
