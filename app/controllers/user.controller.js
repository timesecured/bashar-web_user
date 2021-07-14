const db = require("../models");
const User = db.user;
var bcrypt = require("bcryptjs");

exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.userBoard = (req, res) => {
  res.status(200).send("User Content.");
};

exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

exports.moderatorBoard = (req, res) => {
  res.status(200).send("Moderator Content.");
};


exports.changepassword = (req, res) => {
	User.findOne({
	    where: {
	      reset_password_token: req.body.token
	    }
	  })
    .then(user => {
		console.log(user);
		if(user){
	     	User.update({ password: bcrypt.hashSync(req.body.password, 8),reset_password_token: null}, { where: { reset_password_token: req.body.token } }).then((result) => {  
				console.log('2');
	            return  res.send({ 
	                status:"1",
	                message: "Password changed successfully!",
	            });  
	        });
		}else{
			return  res.send({ 
                status:"0",
                message: "Something went wrong!",
            });
		}
    })
    .catch(err => {
      res.status(500).send({ 
        status:"0",
        message: err.message 
      });
    });


};
