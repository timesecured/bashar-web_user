const db = require("../../models"); 
const config = require("../../config/auth.config");
const User = db.user;
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const Op = db.Sequelize.Op;
var moment = require('moment');
var store = require('store')


// test reset

exports.passwordReset = (req, res) => {
  res.set('content-type' , 'text/html; charset=mycharset'); 
    res.render('reset-password');  
};

exports.homePage = (req, res) => {
	res.set('content-type' , 'text/html; charset=mycharset'); 
  res.render('user/home_page');  
};

exports.login = (req, res) => {
  res.set('content-type' , 'text/html; charset=mycharset'); 
  res.render('admin/login');  
};

exports.privacyPolicies = (req, res) => {
  res.set('content-type' , 'text/html; charset=mycharset'); 
  res.render('user/privacy-policies');  
};

exports.termServices = (req, res) => {
  res.set('content-type' , 'text/html; charset=mycharset'); 
  res.render('user/term-services');  
};


async function dashboard (req, res){ 
    controller = 'dashboard';
    action = 'dashboard';  
    var count = await User.count({
          where: {
              userType: {
                [Op.ne]: 1
              }
            }
          });

    var order = [];

    var restaurant = []; 
    var foodtruck =  []; 

    res.set('content-type' , 'text/html; charset=mycharset'); 
    res.render('admin/dashboard',{page_title:"Admin - Dashboard",controller:controller,action:action,user:count,order:order,restaurant:restaurant,foodtruck:foodtruck});     
};  

exports.dashboard = dashboard;

exports.adminlogin = (req, res) => {
  var sess;

	User.findOne({
    where: {
        userName: req.body.username,
        '$socialType$': null
      }
    })
    .then(user => {
      if (!user) {
        req.flash('error', "Invalid credentials");

        return res.status(401).redirect('/login');
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        req.flash('error', "Invalid credentials");
        return res.status(401).redirect('/login');
      }
      
		  var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });

      req.session.authenticated = true;; 
      req.session.userId = user.id; 
      req.session.domain = req.headers.host; 

      //store.set('user', { user_id:user.id })
      return res.redirect('/beneficiaries/list');  
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

//Change redirection to home page on logout
exports.logout = (req, res) => { 

    //store.remove('user');
    req.session.destroy(function(err){  
        if(err){  
            console.log(err);  
        }  
        else  
        {  
          res.redirect('/home');  
        }  
    });   
}; 


