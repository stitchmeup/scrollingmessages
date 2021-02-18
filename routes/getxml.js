var express = require('express');
var router = express.Router();
var path = require('path');
var xmlParser = require('../modules/xmlParser');
var formatXml = require('xml-formatter');
var fs = require('fs');
var { query, validationResult, oneOf } = require('express-validator');


/* GET */
router.get('/getxml', [
  query('equipe.*').optional().isAscii().escape(),
  query('start').optional().isInt().toInt(),
  query('end').optional().isInt().toInt(),
  query('text').optional().isIn(['full', 'sync'])
],
function(req, res) {
  if (Object.keys(req.query).length == 0) {
    res.sendFile('projet.xml', { root: __dirname + '/../public/' });
  } else {
    try {
      validationResult(req).throw();
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

      let xmlFilePath = './public/projet.xml';
      fs.readFile(xmlFilePath, async function(err, data) {
        const xmlObj = xmlParser.toJson(data, { reversible: true, object: true });
        const xmlObjModified = await xmlParser.modifyXmlObj(xmlObj, scheme).then((res) => res);
        const stringifiedXmlObj = JSON.stringify(xmlObjModified);
        const finalXml = xmlParser.toXml(stringifiedXmlObj);
        res.set('Content-type', 'text/xml');
        res.send(formatXml(finalXml, { collapseContent: true }));
      });

    } catch (err) {
      console.log(err);
      res.status(400).json( { 'errors': err.array() })
    }
  }
});

/* POST */
router.post('/getxml',
query('piece').isAscii().escape(),
function(req, res) {
  try {
    validationResult(req).throw();

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

    let xmlFilePath = './public/projet.xml';
    fs.readFile(xmlFilePath, async function(err, data) {
      const xmlObj = xmlParser.toJson(data, { reversible: true, object: true });
      const xmlObjModified = await xmlParser.modifyXmlObj(xmlObj, scheme).then((res) => res);
      const stringifiedXmlObj = JSON.stringify(xmlObjModified);
      const finalXml = xmlParser.toXml(stringifiedXmlObj);
      res.set('Content-type', 'text/xml');
      res.send(formatXml(finalXml, { collapseContent: true }));
    });

  } catch (err) {
    console.log(err);
    res.status(400).json( { 'errors': err.array() })
  }
});

module.exports = router;
