const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");

jwt.config = config;

jwt.verifyToken = (token) => {
  if (!token) {
    return {"status": false, "blame": "jwt"}
  }

  return jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return {"status": false, "blame": "jwt"};
    } else {
      return {"status": true, "user": { "id": decoded.id } };
    }
  });
};

jwt.createToken = (user) => {
  var token = jwt.sign({ id: user.id }, config.secret, {
    expiresIn: 86400 // 24 hours
  });
}

module.exports = jwt;
