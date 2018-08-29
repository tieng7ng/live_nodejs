//  This is a Constructor function taking age and passport 

const jwt = require('jsonwebtoken');


//  as the paramaters
function Token(tokenSecret) {
  // Configuration
  this.tokenSecret = tokenSecret;
}

/**
 * 
 * @param {string} email 
 * @param {string} id 
 */
Token.prototype.create = function (email, id) {

  //=====
  // Genere token
  const JWTToken = jwt.sign({
    email: email,
    _id: id
  },
    this.tokenSecret,
    {
      expiresIn: '2h'
    });
  return JWTToken;
  // Genere token
  //=====
};

/**
 * 
 * @param {string} token 
 */
Token.prototype.valid = function (token) {
  console.log('token valid ' + this.tokenSecret)
  const tabReturn = [];
  jwt.verify(token, this.tokenSecret, function (err, decoded) {
    if (err) {
      console.log('valid KO');
      tabReturn['return'] = false;
    } else {
      console.log('valid OK');
      tabReturn['return'] = true;
      tabReturn['decoded'] = decoded;
    }
  });
  return tabReturn;
}


module.exports = Token;