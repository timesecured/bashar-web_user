"use strict";
const nodemailer = require("nodemailer");
const db = require("../models");
const config = require("../config/auth.config");
const cryptoRandomString = require('crypto-random-string');
var twilio = require('twilio');
const LookupsClient = require('twilio').LookupsClient;
const RestaurantAndFoodTruck = db.restaurants_and_foodtruck;
const User = db.user;
const Privacy = db.privacy;
const Role = db.role;
const Address = db.address;
const Schedule = db.schedule;

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");


exports.signup = (req, res) => {
  
async function UploadDeviceToken(req, res){

	try{

		console.log(req.userId);

	User.update({ device_token: req.body.device_token }, { where: { id: req.userId } }).then(user =>{
		 return   res.send({ 
	      status:"1",
	      message: "Device Token updated successfully!",
	    
	    });

	});

	   

	}catch(err) {
         return res.status(500).send({ message: err });
    };

 };
exports.UploadDeviceToken = UploadDeviceToken;



 function IsEmail(email) {
  var regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  if(!regex.test(email)) {
    return false;
  }else{
    return true;
  }
}

exports.signin = (req, res) => {
  
  if(req.body.role == '2'){


        User.findOne({
          where: {
            email: req.body.email,
            role: req.body.role
          }
        })
        .then(user => {
          if (!user) {
            return res.status(404).send({ message: "User Not found." });
          }

          var passwordIsValid = bcrypt.compareSync(
            req.body.password,
            user.password
          );

          if (!passwordIsValid) {
            return res.status(404).send({
              accessToken: null,
              message: "Invalid Password!"
            });
          }


      if(req.body.role == '2'){

        if(user.isverified_otp == '0'){

        var otp = cryptoRandomString({length: 4, type: 'numeric'});
        var accountSid = 'AC6f22d72a6d944a43d20e33c45d2a3a23'; // Your Account SID from www.twilio.com/console
        var authToken = '430aeef0c9d8a1eedadd7e0da182fb45';   // Your Auth Token from www.twilio.com/console
        var client = new twilio(accountSid, authToken);

        client.messages.create({ 
              to: user.country_code+user.phone,// Text this number
              from: '+14422673988',   // From a valid Twilio number
              body: otp 
             }, function(err, result) { 
              
              if(err){
                  console.log(err); 
               return   res.status(401).send({ 
                    status:"0",
                    message: "Invalid phone number" 
                  });
              }

              User.update({ otp: otp }, { where: { id: user.id } });

           return  res.status(200).send({
                status:"1",
                isverifyotp:false,
                id: user.id,
                message:"Please Verify otp first",
              });
        });

      }else{



       var token = jwt.sign({ id: user.id }, config.secret);

       return  res.status(200).send({
            status:"1",
            isverifyotp:true,
            auth:true,
            message:"Login Successfully",
            data:{
            id: user.id,
            name:user.name,
            lastname:user.lastname,
            role:user.role,
            privacy_status:user.privacy_status,
            latitude:user.latitude,
            longitude:user.longitude,
            online:user.online,
            email: user.email,
            address:user.address,
            phone: user.phone,
            country_code: user.country_code,
            
          },
          accessToken: token,
          id: user.id
          });

        }

      }else{

         var token = jwt.sign({ id: user.id }, config.secret, {
             expiresIn: 86400 // 24 hours
          });

         return  res.status(200).send({
              status:"1",
              isverifyotp:true,
              auth:true,
              message:"Login Successfully",
              data:{
              id: user.id,
              name:user.name,
              lastname:user.lastname,
              role:user.role,
              privacy_status:user.privacy_status,
              online:user.online,
              email: user.email,
              address:user.address,
              latitude:user.latitude,
              longitude:user.longitude,
              phone: user.phone,
              country_code: user.country_code,
              
            },
            accessToken: token,
            id: user.id
            });
      }
   
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });


      }else{

          if(IsEmail(req.body.email) == false){

            User.findOne({
              where: {
                phone: req.body.email,
                role: req.body.role
              }
            })
              .then(user => {
                if (!user) {
                  return res.status(404).send({ message: "User Not found." });
                }

                var passwordIsValid = bcrypt.compareSync(
                  req.body.password,
                  user.password
                );

                if (!passwordIsValid) {
                  return res.status(404).send({
                    accessToken: null,
                    message: "Invalid Password!"
                  });
                }


                RestaurantAndFoodTruck.findOne({where:{approval_code:user.approval_code}}).then(restaurant =>{
                  var token = jwt.sign({ id: user.id }, config.secret);

                   return  res.status(200).send({
                        status:"1",
                        isverifyotp:true,
                        auth:true,
                        message:"Login Successfully",
                        data:{
                        id: user.id,
                        name:user.name,
                        image: 'http://52.22.77.138:3000/upload/artisan_restaurant/'+restaurant.image,
                        lastname:user.lastname,
                        role:user.role,
                        restaurant_type:restaurant.type,
                        privacy_status:user.privacy_status,
                          latitude:user.latitude,
                        longitude:user.longitude,
                        online:user.online,
                        email: user.email,
                        address:user.address,
                        phone: user.phone,
                        country_code: user.country_code,
                        
                      },
                      accessToken: token,
                      id: user.id
                      });

              });

              })
              .catch(err => {
                res.status(500).send({ message: err.message });
              });

     }else{

           User.findOne({
              where: {
                email: req.body.email,
                role: req.body.role
              }
            })
              .then(user => {
                if (!user) {
                  return res.status(404).send({ message: "User Not found." });
                }

                var passwordIsValid = bcrypt.compareSync(
                  req.body.password,
                  user.password
                );

                if (!passwordIsValid) {
                  return res.status(404).send({
                    accessToken: null,
                    message: "Invalid Password!"
                  });
                }

                RestaurantAndFoodTruck.findOne({where:{approval_code:user.approval_code}}).then(restaurant =>{
                    var token = jwt.sign({ id: user.id }, config.secret);

                     return  res.status(200).send({
                          status:"1",
                          isverifyotp:true,
                          auth:true,
                          message:"Login Successfully",
                          data:{
                          id: user.id,
                          name:user.name,
                          lastname:user.lastname,
                          image: 'http://52.22.77.138:3000/upload/artisan_restaurant/'+restaurant.image,
                          role:user.role,
                          restaurant_type:restaurant.type,
                          privacy_status:user.privacy_status,
                            latitude:user.latitude,
                          longitude:user.longitude,
                          online:user.online,
                          email: user.email,
                          address:user.address,
                          phone: user.phone,
                          country_code: user.country_code,
                          
                        },
                        accessToken: token,
                        id: user.id
                        });

                });
             
              })
              .catch(err => {
                res.status(500).send({ message: err.message });
              });

          }

      }

  
  
};



exports.verifyotp = (req, res) => {
  User.findOne({
    where: {
      otp: req.body.otp
    }
  })
    .then(user => {
      if (!user) {
        return res.status(404).send({ 
          status:"0",
          message: "Please add correct otp." });
      }

     User.update({ isverified_otp: '1'}, { where: { otp: req.body.otp } });

      var token = jwt.sign({ id: user.id }, config.secret);
        
        res.status(200).send({
          status:"1",
          isverifyotp:true,
          auth:true,
          message:"Login Successfully",
          data:{
          id: user.id,
          name:user.name,
          lastname:user.lastname,
          role:user.role,
          email: user.email,
          address:user.address,
          phone: user.phone,
          country_code: user.country_code,
          
        },
        accessToken: token
        });
    
    })
    .catch(err => {
      res.status(500).send({ 
        status:"0",
        message: err.message });
    });
};

exports.privacy_status = (req, res) => {
  User.findOne({
    where: {
      id: req.userId 
    }
  })
    .then(user => {

   var userupdate =  User.update({ privacy_status: '1'}, { where: { id: req.userId } }).then(userupdate => {

      User.findOne({
      where: {
        id: req.userId 
      }
    })
    .then(user1 => {
        RestaurantAndFoodTruck.findOne({where: { restaurant_userid: req.userId }}).then(res_data => {
          user1.restaurant_type = res_data.type;

          return  res.status(200).send({
                status:"1",
                data:{
                    id: user1.id,
                    name: user1.name,
                    lastname: user1.lastname,
                    address: user1.address,
                    image: 'http://52.22.77.138:3000/upload/artisan_restaurant/'+res_data.image,
                    role: user1.role,
                    email: user1.email,
                    country_code: user1.country_code,
                    phone: user1.phone,
                    otp: user1.otp,
                    customer_id: user1.customer_id,
                    isverified_otp: user1.isverified_otp,
                    latitude: user1.latitude,
                     latitude: user1.latitude,
                     privacy_status: user1.privacy_status,  
                     device_token: user1.device_token,
                     approval_code: user1.approval_code,
                     online:user1.online,
                     restaurant_type:res_data.type
                },
                auth:true,
                message:"Accepted Privacy policy",
                
              });
        });

        
      });

   });
       
    
    })
    .catch(err => {
      res.status(500).send({ 
        status:"0",
        message: err.message });
    });
};


exports.privacy = (req, res) => {
  Privacy.findOne({
    where: {
      id: '1'
    }
  })
    .then(privacy => {
      
     
        
        res.status(200).send(privacy.description);
    
    })
    .catch(err => {
      res.status(500).send({ 
        status:"0",
        message: err.message });
    });
};

exports.resendotp = (req, res) => {
  User.findOne({
    where: {
      id: req.body.userid
    }
  })
    .then(user => {

      if (!user) {
        return res.status(404).send({
        status: "0",
         message: "User Not Found." });
      }

        var otp = cryptoRandomString({length: 4, type: 'numeric'});
        var accountSid = 'AC6f22d72a6d944a43d20e33c45d2a3a23'; // Your Account SID from www.twilio.com/console
        var authToken = '430aeef0c9d8a1eedadd7e0da182fb45';   // Your Auth Token from www.twilio.com/console
        var client = new twilio(accountSid, authToken);
        
        client.messages.create({ 
              to: user.country_code+user.phone,// Text this number
              from: '+14422673988',   // From a valid Twilio number
              body: otp 
             }, function(err, result) { 
              
              if(err){
                  console.log(err); 
              return  res.status(401).send({ 
                    status:"0",
                    message: "Invalid phone number" 
                  });
              }

              User.update({ otp: otp }, { where: { id: user.id } });

            return  res.status(200).send({
                status:"1",
                isverifyotp:false,
                message:"Otp sent",
              });
        });
      
    })
    .catch(err => {
      res.status(500).send({ 
        status:"0",
        message: err.message 
      });
    });

};


exports.forgotpassword = (req, res) => {

  User.findOne({
    where: {
      email: req.body.email
    }
  })
    .then(user => {
      if (!user) {
        return res.status(404).send({
        status: "0",
         message: "Email Not Registered." });
      }

     var randomstring = cryptoRandomString({length: 10, type: 'base64'});

     var token = makeid(8);

     var newpassword = bcrypt.hashSync(randomstring, 8);
     var email = req.body.email;
     User.update({ reset_password_token: token}, { where: { email: req.body.email } }).then((result) => {  
              main(email,token).catch(console.error);
     });

     console.log(newpassword);
        return res.status(200).send({
          status:"1", 
          message: "Email Sent." });
      
    })
    .catch(err => {
      res.status(500).send({ 
        status:"0",
        message: err.message 
      });
    });


};
exports.addresslist = (req, res) => {

  User.findOne({
    where: {
      id: req.userId
    }
  })
    .then(user => {

      if (!user) {
            Address.findAll({
         where: {
            user_id: req.userId
          } 
      }).then(addresschk => {

        if(addresschk.length > 0){

            return  res.send({ 
                status:"1",
                message: "Data found Successfully",
                data:addresschk

            });
        }else{

          return  res.send({ 
                status:"0",
                message: "User Address not found"
            });
        }
        
      })
      }

      Address.findAll({
         where: {
            user_id: req.userId
          } 
      }).then(addresschk => {

        if(addresschk.length > 0){

            return  res.send({ 
                status:"1",
                message: "Data found Successfully",
                data:addresschk

            });
        }else{

          return  res.send({ 
                status:"0",
                message: "Data not found"
            });
        }
        
      })

      
    })
    .catch(err => {
      res.status(500).send({ 
        status:"0",
        message: err.message 
      });
    });
};

exports.updatedeliveryaddress = (req, res) => {

  User.findOne({
    where: {
      id: req.userId
    }
  })
    .then(user => {

      if (!user) {
        return res.status(404).send({
        status: "0",
         message: "User Not Exist." });
      }

      Address.findOne({
         where: {
            user_id: req.userId,
            address_type: req.body.address_type
          } 
      }).then(addresschk => {
        if(addresschk){

          Address.update({ 

              status: '0'

            }, { where: { 

                  user_id: req.userId
            } 
          }).then(data =>{

             Address.update({ 

              status: req.body.status

                }, { where: { 
                      user_id: req.userId,
                      address_type: req.body.address_type
                } 
              }).then(address1 =>{

               Address.findAll({
                 where: {
                    user_id: req.userId,
                    status: '1'
                  } 
              }).then(addresschkexist => {

                console.log(addresschkexist.length);
                if(addresschkexist.length > 0){

                  return  res.send({ 
                          status:"1",
                          message: "Address Updated Successfully"
                      });

                }else{

                  Address.update({ 
                    status: '1'

                      }, { where: { 
                            user_id: req.userId,
                            address_type: '1'
                      } 
                    }).then(address2 =>{

                      return  res.send({ 
                          status:"1",
                          message: "Address Updated Successfully"
                      });

                    });

                }

              });
                  
              });

          });

         

        }else{

          return  res.send({ 
                      status:"0",
                      message: "Something went wrong!"
                  });
        }
        
      })

      
    })
    .catch(err => {
      res.status(500).send({ 
        status:"0",
        message: err.message 
      });
    });
};

exports.addressdelete = (req, res) => {

  User.findOne({
    where: {
      id: req.userId
    }
  })
    .then(user => {

      if (!user) {
        return res.status(404).send({
        status: "0",
         message: "User Not Exist." });
      }

      Address.findOne({
         where: {
            user_id: req.userId,
            address_type: req.body.address_type
          } 
      }).then(addresschk => {
        if(addresschk){

          Address.destroy({ where: {  user_id: req.userId,
            address_type: req.body.address_type } }).then(data1 =>{


                Address.findAll({
                 where: {
                    user_id: req.userId,
                    status: '1'
                  } 
              }).then(addresschkexist => {

                console.log(addresschkexist.length);
                if(addresschkexist.length > 0){

                 return res.status(200).send({ 
                    status:"1",
                    message: 'Address deleted Successfully' 
                  });

                }else{

                  Address.update({ 
                    status: '1'

                      }, { where: { 
                            user_id: req.userId,
                            address_type: '1'
                      } 
                    }).then(address2 =>{

                      return res.status(200).send({ 
                    status:"1",
                    message: 'Address deleted Successfully' 
                  });

                    });

                }

              });
                 
            });

           

        }else{

       return res.status(200).send({ 
            status:"0",
            message: 'Address not found' 
          });
          
        }
      })
    })
    .catch(err => {
      res.status(500).send({ 
        status:"0",
        message: err.message 
      });
    });
};

exports.addressupdate = (req, res) => {

  if(req.tokenType == 'device_token'){
 
           Address.create({
                user_id: req.userId,
                location: req.body.location,
                complete_address: req.body.complete_address,
                address_type: req.body.address_type,
                latitude: req.body.latitude,
                longitude: req.body.longitude,
                status: '1'

            }).then(addresscreate => {

            
                 return  res.send({ 
                    status:"1",
                    message: "User address updated successfully!",
                    data: addresscreate
                });
                

            });

  }else{

    var user_id_data = req.userId;
    var id_data = user_id_data.toString();
    

     User.findOne({
    where: {
      id: req.userId
    }
  })
    .then(user => {

      if (!user) {
        return res.status(404).send({
        status: "0",
         message: "User Not Exist." });
      }

      Address.findOne({
         where: {
            user_id: id_data,
            address_type: req.body.address_type
          } 
      }).then(addresschk => {
        if(addresschk){

          if(req.body.address_type == '1'){
            var status = 1;
            }else{
              var status = 0;
            }

          Address.update({ 
              user_id: req.userId,
              location: req.body.location,
              complete_address: req.body.complete_address,
              address_type: req.body.address_type,
              latitude: req.body.latitude,
              longitude: req.body.longitude,
              status: status

            }, { where: { 
                  user_id: req.userId,
                  address_type: req.body.address_type
            } 
          }).then(addressupdatechk => {
            console.log(addressupdatechk);
            if(addressupdatechk){
              Address.update({ 
              status: '0'
            }, { where: { 
                  user_id: req.userId
            } 
          }).then(data =>{

             Address.update({ 

              status: '1'

                }, { where: { 
                      user_id: id_data,
                      address_type: req.body.address_type
                } 
              }).then(address =>{
                   return  res.send({ 
                      status:"1",
                      message: "User address updated successfully!"
                  });
              });

          });

           
            }
          });

        }else{

          if(req.body.address_type == '1'){
            var status = 1;
          }else{
            var status = 0;
          }
             Address.create({
                user_id: req.userId,
                location: req.body.location,
                complete_address: req.body.complete_address,
                address_type: req.body.address_type,
                latitude: req.body.latitude,
                longitude: req.body.longitude,
                status: status

            }).then(addresscreate => {

                Address.update({ 
                    status: '0'
                  }, { where: { 
                        user_id: id_data
                  } 
                }).then(data =>{

                   Address.update({ 

                    status: '1'

                      }, { where: { 
                            user_id: id_data,
                            address_type: req.body.address_type
                      } 
                    }).then(address =>{
                         return  res.send({ 
                            status:"1",
                            message: "User address updated successfully!",
                            data: addresscreate
                        });
                    });

          });

            

            });
        }
      })
    })
    .catch(err => {
      res.status(500).send({ 
        status:"0",
        message: err.message 
      });
    });

  }


 
};

exports.logout = function(req, res){     
     return res.status(200).send({ 
      status:"1",
      auth: false,
      accessToken: null 
    });     
}


exports.changepassword = function(req, res){ 

   User.findOne({
    where: {
      id: req.userId
    }
  })
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }
    
        var update = User.update({ 
                   password: bcrypt.hashSync(req.body.password, 8)
            }, { where: { id: user.id } }).then(result => {
                 var user_data = User.findOne({where: {id: user.id  }}).then(userdatda => {
                    return  res.status(200).send({
                      status:"1",
                      message:"Password Updated Successfully",
                      data:{
                      id: userdatda.id,
                      name:userdatda.name,
                      lastname:userdatda.lastname,
                      role:userdatda.role,
                      email: userdatda.email,
                      address:userdatda.address,
                      phone: userdatda.phone,
                      country_code: userdatda.country_code,
                      
                 }                   
               });
           });
      });
     
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
   
}


exports.profileupdate = function(req, res){ 

   User.findOne({
    where: {
      id: req.userId
    }
  })
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

     var accountSid = 'AC6f22d72a6d944a43d20e33c45d2a3a23'; // Your Account SID from www.twilio.com/console
        var authToken = '430aeef0c9d8a1eedadd7e0da182fb45';   // Your Auth Token from www.twilio.com/console
        const client = new twilio(accountSid, authToken);
     
         client.messages.create({ 
              to: req.body.country_code+req.body.phone,// Text this number
              from: '+14422673988',   // From a valid Twilio number
              body: 'Phone number verified' 
             }, function(err, result) { 
              
              if(err){
                  console.log(err); 
              return  res.status(401).send({ 
                    status:"0",
                    message: "Invalid phone number" 
                  });
              }

            var update = User.update({ 
                  name: req.body.name,
                  lastname: req.body.lastname,
                  email: req.body.email,
                  phone: req.body.phone,
                  country_code: req.body.country_code,

            }, { where: { id: user.id } }).then(result => {
                 var user_data = User.findOne({where: {id: user.id  }}).then(userdatda => {
                    return  res.status(200).send({
                      status:"1",
                      message:"User Info Updated Successfully",
                      data:{
                      id: userdatda.id,
                      name:userdatda.name,
                      lastname:userdatda.lastname,
                      role:userdatda.role,
                      email: userdatda.email,
                      address:userdatda.address,
                      phone: userdatda.phone,
                      country_code: userdatda.country_code,
                      
                    }
                    
                    });
           });
      });
        });


  
   
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });

      
    
}

// generate token
function makeid(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}
// generate token

// async..await is not allowed in global scope, must use a wrapper
async function main(email,newpass) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      // user: "apiumanager@gmail.com", // generated ethereal user
      // pass: "Renacimiento2008" // generated ethereal password
      user: "apiumanager@gmail.com", // generated ethereal user
      pass: "Renacimiento2008" // generated ethereal password
    }
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: 'apiumanager@gmail.com', // sender address
    to: email, // list of receivers
    subject: "Forgot Password", // Subject line
    text : 'Click on the following link to reset your password : http://52.22.77.138:3000/password-reset/'+newpass ,
    html : 'Click on the following link to reset your password : http://52.22.77.138:3000/password-reset/'+newpass 
    // text: 'Your new Password is: ' +newpass, // plain text body  
    // html: 'Your new Password is: ' +newpass, // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}