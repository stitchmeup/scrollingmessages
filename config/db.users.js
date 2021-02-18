const dbUsers = {
  "appUser": {
    "username": encodeURIComponent("appUser"),
    "password": encodeURIComponent("userPassword")
  },
  "appAdmin": {
    "username": encodeURIComponent("appUser"),
    "password": encodeURIComponent("adminPassword")
  }
}

module.exports = dbUsers;
