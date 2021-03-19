var express = require('express');
var router = express.Router();
const DbClient = require('../modules/DbClient');

/* GET home page. */
router.get('/urgent', async function(req, res, next) {
  var feed = {
    "version": "https://jsonfeed.org/version/1.1",
    "title": "Message Urgent",
    "feed_url": "https://scrollingmessages.hopto.org/urgent",
    "items": [
      {
        "title": "Message Urgent",
      }
    ]
  }
  try {
    const client = new DbClient("appUser");

    await client.connect();

    let msgUrg = await client.findMsgUrg();

    feed.items[0].id = `message_urgent.${msgUrg.date}`;
    feed.items[0].date_published = msgUrg.timestamp;
    feed.items[0].message = msgUrg.message;

    res.set('Content-type', 'application/json');
    res.send(feed)
  } catch (err) {
    console.log(err)
    next(500)
  } finally {
    //await client.close();
  }
});

module.exports = router;
