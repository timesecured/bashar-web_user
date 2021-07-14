const db = require("../models");
const cryptoRandomString = require('crypto-random-string');
var twilio = require('twilio');
const ROLES = db.ROLES;
const User = db.user;

checkDuplicateUsernameOrEmail = (req, res, next) => {
    // Email
    User.findOne({
      where: {
        email: req.body.email
      }
    }).then(user => {
      if (user) {
        res.status(400).send({
          message: "Failed! Email is already in use!"
        });
        return;
      }

      next();
    });
  
};

checkDuplicatePhoneNo = (req, res, next) => {
    // Email
    User.findOne({
      where: {
        phone: req.body.phone,
        role: req.body.role
      }
    }).then(user => {
      if (user) {
        res.status(400).send({
          message: "Failed! Phone number is already in use!"
        });
        return;
      }

      next();
    });
  
};


checkRolesExisted = (req, res, next) => {
  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.length; i++) {
      if (!ROLES.includes(req.body.roles[i])) {
        res.status(400).send({
          message: "Failed! Role does not exist = " + req.body.roles[i]
        });
        return;
      }
    }
  }
  
  next();
};

const verifySignUp = {
  checkDuplicateUsernameOrEmail: checkDuplicateUsernameOrEmail,
  checkDuplicatePhoneNo:checkDuplicatePhoneNo,
  checkRolesExisted: checkRolesExisted
};

module.exports = verifySignUp;
