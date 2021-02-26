const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const bcrypt = require("bcrypt");
const jwt = require("./jwtAuth.js")
//const dbUsers = require("../config/db.users")


class DbClient {
  static param = {
    "dbUsers": require ("../config/db.users.js"),
    "clusterUrl": "127.0.0.1",
    "dbName": "scrolling-messages",
    "authMechanism": "DEFAULT",
    "MongoClient": MongoClient,
    "objectId": ObjectId
  }

  constructor(user) {
    this.db = null;
    this.uri =
      `mongodb://${DbClient.param.dbUsers[user].username}:${DbClient.param.dbUsers[user].password}@${DbClient.param.clusterUrl}/${DbClient.param.dbName}?authMechanism=${DbClient.param.authMechanism}`;
    this.client = new MongoClient(this.uri);
  }

  async connect(dbName = DbClient.param.dbName) {
    await this.client.connect()
    this.db = await this.client.db(dbName);
  }

  async close() {
    await this.client.close();
  }

  // Find a user in database
  async findUser(username) {
    const dbQuery = { username: username }
    // findOne
    return await this.db.collection('users')
    .findOne(dbQuery);
  }

  // Find user by object id (jwt token use it)
  async findUserById(id) {
    const dbQuery = { "_id": new DbClient.param.objectId(id) }
    // findOne
    return await this.db.collection('users')
    .findOne(dbQuery);
  }

  // Find plays by filename
  async findPlayByNameHash(nameHash) {
    const dbQuery = { "nameHash": nameHash };
    return await this.db.collection('playsList')
    .findOne(dbQuery)
    .then(res => res)
    .catch(err => err);
  }

  async getPlayContent(id) {
    const dbQuery = { "_id": new DbClient.param.objectId(id) }
    return await this.db.collection('playsContent')
    .findOne(dbQuery)
    .then(res => res)
    .catch(err => err)
  }

  async getPlaysList() {
    const dbQueryOptions = { 'projection': {'_id': 0, 'title': 1, 'name': 1, 'nameHash': 1}}
    return await this.db.collection('playsList')
    .find({}, dbQueryOptions).toArray()
    .then(res => res)
    .catch(err => err)
  }

  // insert play into database
  async insertPlay(playObj, name, nameHash) {
    let insert = await this.db.collection('playsContent')
    .insertOne(playObj, { checkKeys: false })
    .then(res => res)
    .catch(err => err);
    if (insert.hasOwnProperty('insertedId')) {
      return await this.insertIntoPlaysList(playObj, name, nameHash, insert.insertedId)
    } else {
      return false
    }
  }

  // insert db metadata into playsList collecztion
  async insertIntoPlaysList(playObj, name, nameHash, playContentId) {
    let dbQuery = {
      title: playObj.piece.titre['$t'],
      name: name,
      nameHash: nameHash,
      playContentId: new DbClient.param.objectId(playContentId)
    }
    if (playObj.piece.hasOwnProperty('listeEquipes')) {
      dbQuery.equipes = playObj.piece.listeEquipes.id.map(field => field['$t']);
    }
    return await this.db.collection('playsList')
    .insertOne(dbQuery)
    .then(res => res)
    .catch(err => err);
  }

  // Check password for a given user (so ugly)
  async checkPwd(username, pwd) {
    let user = await this.findUser(username)
    if (user) {
      let check = await bcrypt.compare(pwd, user.pwd);
      if (check) {
        return {"status": check, "user": user};
      } else {
        return {"status": check, "blame": "bcrypt"};
      }
    } else {
      return {"status": false, "blame": "findUser"};
    }
  }

  // Check Auth
  async checkAuth(tokenCookie, usernameCookie) {
    let verifiedToken = await jwt.verifyToken(tokenCookie);
    if (verifiedToken.status) {
      return await this.findUserById(verifiedToken.user.id)
      .then(user => user.username === usernameCookie)
      .catch(() => false);
    } else {
      return false;
    }
  }
}

/*
// Main for test
let run =  async function() {
  const client = new DbClient("appUser");
  try {
    await client.connect()
    // Ensures that the client will close when you finish/error
    return await client.findUserById("601839669be5fc0416e48011");
  } catch (err) {
    return err;
  } finally {
    await client.close()
  }
}


run()
.then((res) => console.log(res))
.catch((err) => console.log(err))
*/

module.exports = DbClient;
