const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");

const username = encodeURIComponent("appUser");
const password = encodeURIComponent("appPassword");
const clusterUrl = "127.0.0.1";
const dbName = "scrolling-messages"
const authMechanism = "DEFAULT";
const uri =
  `mongodb://${username}:${password}@${clusterUrl}/${dbName}?authMechanism=${authMechanism}`;

// Create a new MongoClient
const dbClient = new MongoClient(uri);
dbClient.dbName = dbName;
dbClient.objectId = ObjectId;

// Find a user in database
dbClient.findUser = async function(username) {
  const dbQuery = { username: username }
  // findOne
  return await this.db(this.dbName)
  .collection('users')
  .findOne(dbQuery);
}

dbClient.findUserById = async function(id) {
  const dbQuery = { "_id": this.objectId(id) }
  // findOne
  return await this.db(this.dbName)
  .collection('users')
  .findOne(dbQuery);
}


// Check password for a given user (so ugly)
dbClient.checkPwd = async function(username, pwd) {
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

// Main for test
dbClient.run = async function() {
  try {
    // Ensures that the client will close when you finish/error
    await this.connect();

    return await this.findUserById("601839669be5fc0416e48011");
  } finally {
    // Ensures that the client will close when you finish/error
    await this.close();
  }
}

//dbClient.run()
//.then((res) => console.log(res))
//.catch((err) => console.log(err))


module.exports = dbClient;
