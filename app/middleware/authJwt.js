const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;

verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];
  

  if (!token) {
    let device_token = req.headers["device_id"];

    if(device_token){
       req.userId = device_token;
       req.tokenType = 'device_token';
       next();
       return;
    }else{
      return res.status(403).send({
      message: "No token provided!"
    });
    }
    
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!"
      });
    }
    let device_token = req.headers["device_id"];

    if(device_token){
        req.devicetoken = device_token;
      }else{
        req.devicetoken = '';
      }
    req.userId = decoded.id;
    req.tokenType = 'token';
    next();
  });
};

isSessionActive = (req, res, next) => {
 
    if(req.session.userId){
      next();
      return;
    }else{
      res.redirect('/home');
    }
};

isAuthenticate = (req, res, next) => {
    if(req.session.authenticated) {
      next();
      return;
    }else{
      res.status(403).send({
      message: "You don't have permission to access this module!"
    });
  }
};

const authJwt = {
  verifyToken: verifyToken,
  isSessionActive: isSessionActive,
  isAuthenticate: isAuthenticate,

};
module.exports = authJwt;
