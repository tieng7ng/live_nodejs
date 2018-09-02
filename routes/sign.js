const config = require('../config');

const Token = require('../services/token');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const User = require('../models/user'),
  Todo = require('../models/todo')


module.exports = function (server) {

  //=====
  // Signin
  server.post('/sign/in', (req, res, next) => {
    let tabReq = JSON.parse(req.body);

    console.log(config, req.body);

    User.findOne({ email: tabReq.email })
      .exec()
      .then(function (user) {

        console.log('user');
        console.log(user);

        if (user) {
          bcrypt.compare(tabReq.password, user.password, function (err, result) {
            if (err) {
              return res.status(401).json({
                failed: 'Unauthorized Access'
              });
            }
            if (result) {
              //=====
              // Genere token
              token = new Token(config.tokenSecret);
              return res.send(200, {
                success: 'Welcome to the JWT Auth',
                firstname: user.name.first,
                lastname: user.name.last,
                token: token.create(req.body.email, user._id)
              });
              // Genere token
              //=====
            }
            res.send(500, {
              failed: 'Unauthorized Access'
            })
          });
        } else {
          res.send(500, {
            failed: 'User no found'
          })
        }
      })
      .catch(error => {
        console.log(error);
        res.send(500, {
          error: error
        })
      });

  })
  // Signin
  //=====


}
