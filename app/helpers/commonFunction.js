var FCM = require('fcm-node');
var serverKey = ''; //put your server key here
const nodemailer = require('nodemailer');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const constant = require('../config/main');
var crypto = require('crypto');
const db = require('../models');
const User = db.user;
const Beneficiary = db.beneficiary;
const Vault = db.vault;
const VaultFile = db.vaultFiles;
//const Notification = db.notifications;

// Express Mailer
/* var app1 = require('express')();
const mailer = require('express-mailer');

mailer.extend(app1, {
  emailFrom: "test@gmail.com",
  host: 'smtp.gmail.com', // hostname
  secureConnection: true, // use SSL
  port: 465, // port for secure SMTP
  transportMethod: 'SMTP', // default is SMTP. Accepts anything that nodemailer accepts
  auth: {
    user: 'test4rv@rvtechnologies.com',
    pass: 'rd=VT5nR'
  }
}); */

module.exports = {

  // FCM Notification for MULTIPLE users
  pushNotification: async (data, userId) => {
    console.log('pushData==>', data);
    const checkUser = await User.findOne({
      attributes: ['id', 'deviceType', 'deviceToken'],
      where: {
        id: userId
      }
    });
    if (checkUser) {
      if (checkUser.dataValues.deviceType == "1") {	// For iOS		
        var fcm = new FCM(serverKey);
        var userToken = checkUser.dataValues.deviceToken;
        var message = {
          to: userToken,
          notification: {
            title: data['title'],
            type: data['type'],
            body: data['message'],
          },
          data: data['jobDetail']

        };
        console.log("message : ", message)
        fcm.send(message, function (err, response) {
          if (err) {
            console.log("Something has gone wrong!");
            console.log('FCM error===>', err)
          } else {
            console.log("Successfully sent with response: ", response);
          }
        });
      } else if (checkUser.dataValues.deviceType == "2") { // For Android
        var fcm = new FCM(serverKey);
        var userToken = checkUser.dataValues.deviceToken;
        /*  var message = {
           to: userToken,
           notification: {
             title: data['title'],
             body: {
               data: data['message'],
               type: data['type']
             }
           },
           data:  data['jobDetail']
           
         }; */
        var message = {
          to: userToken,
          notification: {
            title: data['title'],
            type: data['type'],
            body: data['message'],
          },
          data: data['jobDetail']

        };
        fcm.send(message, function (err, response) {
          if (err) {
            console.log("Something has gone wrong!");
            console.log('FCM error===>', err)
          } else {
            console.log("Successfully sent with response: ", response);
          }
        });
      } else {
        console.log("No device type found!");
      }
      // save push notification data
      let createPushData = {
        senderId: data['senderId'],
        receiverId: userId,
        jobId: data['jobId'],
        description: data['message'],
        type: data['type'],
      }
      // Notification.create(createPushData);
      //
    }
  },

  // send Email
  sendMail: async (object) => {
    try {
      //var transporter = nodemailer.createTransport(constant.mailAuth);
      var transporter = nodemailer.createTransport({
        //host: "smtp-mail.outlook.com",
        host: "smtp.live.com",
        port: 587,
        tls: {
           ciphers:'SSLv3'
        },
        auth: {
            user: "alert.timesecured@outlook.com",
            pass: "Time80secured!",
        }
    });

      var mailOptions = object;
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log("D", error, info);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
    } catch (err) {
      throw err;
    }
  },

  // create Random Number
  createRandomValue: async () => {
    try {
      let currentDate = (new Date()).valueOf().toString();
      let random = Math.random().toString();
      return crypto.createHash('sha1').update(currentDate + random).digest('hex');
    } catch (err) {
      throw err;
    }
  },

  //Sent Vault Files
  sentVaultFiles: async (event) => {
    try{

      var arrBene = event.beneficiaryId.split(",");

      const getBeneficiary = await Beneficiary.findAll({ attributes: ['email', 'name'], where: {id: arrBene } });
      
      getBeneficiary.forEach(async function(bene) {
       
      var getUser = await User.findOne({where: {id: event.userId}});

        var files = await VaultFile.findAll({
          where:{
            vaultId: event.id,
          },
          attributes: ['id', 'file'],
          raw: true,
        });

        var fileAtchments = [];

        await files.map( async c =>{
        var r = {
          path: c ? "http://timesecured.com:3003/uploads/vaults/"+c.file : null
        }
        fileAtchments.push(r)
        });


        var fileText = fileAtchments != null ? "<p><b>Note : Please find the file attached with this email.</b></p><br/>" : '';

        var beneName = bene.name;
        var vaultOwnerName = getUser.userName;
        var vaultOwnerEmail = getUser.email;
        var mail = {
            from: constant.webOwnerEmail,
            to: bene.email,
            subject: constant.beneficiaryEmailSubject,
            attachments: fileAtchments != null ? fileAtchments : null,
            html: `<!DOCTYPE html><html lang="it"> <head> <meta charset="UTF-8"> <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, shrink-to-fit=no"> <meta http-equiv="X-UA-Compatible" content="IE=edge"> <meta name="x-apple-disable-message-reformatting"> <title>Target time vault email</title> <style>@media only screen and (max-width: 450px){.break{width: 100%!important; text-align: center!important;display: block!important;}}@media only screen and (max-width: 600px){.full_width{width: 100%!important; }}</style> </head> <body style="margin: 0px; padding: 0px; font-family: arial; background: #dfdfdf;" bgcolor="#dfdfdf"> <table class="full_width" cellspacing="0" cellpadding="0" border="0" width="100%" bgcolor="#dfdfdf" style="width: 100%; background: #dfdfdf;"> <tr> <td> <center> <table class="full_width" cellspacing="0" cellpadding="0" border="0" width="600" bgcolor="#fff" align="center" style="margin: 0 auto; width: 600px; background: #fff;"> <tr> <td> <table class="full_width" cellspacing="0" cellpadding="0" border="0" width="600" bgcolor="#fff" style="width: 600px; background: #fff; border-top: 8px solid #3c52a5;"> <tr> <td style="background: #fff;" bgcolor="#fff"> <table class="full_width" cellspacing="0" cellpadding="0" border="0" width="600" bgcolor="#fff" style="width: 600px; background: #fff;"> <tr> <td style="width: 20px;" width="20">&nbsp;</td> <td> <table class="full_width" cellspacing="0" cellpadding="0" border="0" width="560" bgcolor="#fff" style="width: 560px; background: #fff;"> <tr> <td style="height: 20px; line-height: 1px; font-size: 0px;" height="20">&nbsp;</td> </tr> <tr> <td><a href="https://www.timesecured.com"><img src="https://i.ibb.co/tCFLYpc/img-810-1-2.png" alt="" style="width: 250px; max-width: 250px; -ms-interpolation-mode: bicubic; border: 0; height: auto;" width="250" class="full_width"></a></td> </tr> <tr> <td style="height: 20px; line-height: 1px; font-size: 0px;" height="20">&nbsp;</td> </tr> </table> </td> <td style="width: 20px;" width="20">&nbsp;</td> </tr> </table> </td> </tr> <tr> <td style="background: #fff;" bgcolor="#fff"> <table class="full_width" cellspacing="0" cellpadding="0" border="0" width="600" bgcolor="#fff" style="width: 600px; background: #fff;"> <tr> <td style="width: 20px;" width="20">&nbsp;</td> <td> <table class="full_width" cellspacing="0" cellpadding="0" border="0" width="560" bgcolor="#fff" style="width: 560px; background: #fff;"> <tr> <td style="height: 20px; line-height: 1px; font-size: 0px;" height="20">&nbsp;</td> </tr> <tr> <td> <p style="margin: 0px; font-size: 14px; text-align: left; color: #333;"><b>Hi ${beneName},</b></p> </td> </tr> <tr> <td style="height: 20px; line-height: 1px; font-size: 0px;" height="20">&nbsp;</td> </tr> <tr> <td> <p style="margin: 0px; font-size: 14px; text-align: left; color: #333; line-height: 1.5;">${vaultOwnerName} would like to share documents with you, Please find the file attached with this email. </p> </td> </tr> <tr> <td style="height: 40px; line-height: 1px; font-size: 0px;" height="40">&nbsp;</td> </tr> <tr> <td> <p style="margin: 0px; font-size: 14px; text-align: left; color: #333; line-height: 1.5;">Should you require more information or details on the nature of the files please contact ${vaultOwnerName} directly at <a href="" style="color: #3c52a5; text-decoration: none;">${vaultOwnerEmail}</a>. If you have any technical issues in accessing the files, please contact Time Secured directly at <a href="mailto:timesecured@outlook.com" style="color: #3c52a5; text-decoration: none;">timesecured@outlook.com</a>.</p> </td> </tr> <tr> <td> <center> <table style="background: transparent;" cellspacing="0" cellpadding="0" border="0" bgcolor="transparent"> <br/> <br> <tr> <td style="width: 120px;" width="120"> <a href="https://www.timesecured.com"> <img src="https://i.ibb.co/KXVrHPc/img-76-7.png" alt="" style="width: 120px;" width="120" border="0"> </a> </td> <td style="width: 8px;" width="8">&nbsp;</td> <td style="width: 120px;" width="120"> <a href="https://www.timesecured.com"> <img src="https://i.ibb.co/59Zs5th/img-76-8.png" alt="" style="width: 120px;" width="120" border="0"> </a> </td> </tr> </table> </center> </td> </tr> <tr> <td style="height: 20px; line-height: 1px; font-size: 0px;" height="20">&nbsp;</td> </tr> <tr> <td> <p style="margin: 0px; font-size: 14px; text-align: left; color: red; line-height: 1.5;">Please do not reply to this email.</p> </td> </tr> <br> <br> <tr> <td style="height: 20px; line-height: 1px; font-size: 0px;" height="20">&nbsp;</td> </tr> <tr> <td> <p style="margin: 0px; font-size: 14px; text-align: left; color: #333; line-height: 1.5;">Regards,</p> <p style="margin: 0px; font-size: 14px; text-align: left; color: #333; line-height: 1.5;"><b><i>Time Secured</i></b></p> </td> </tr> <tr> <td style="height: 40px; line-height: 1px; font-size: 0px;" height="40">&nbsp;</td> </tr> </table> </td> <td style="width: 20px;" width="20">&nbsp;</td> </tr> </table> </td> </tr> <tr> <td> <table class="full_width" cellspacing="0" cellpadding="0" border="0" width="600" bgcolor="#3c52a5" style="width: 600px; background: #3c52a5;"> <tr> <td style="width: 20px;" width="20">&nbsp;</td> <td> <table class="full_width" cellspacing="0" cellpadding="0" border="0" width="560" bgcolor="#3c52a5" style="width: 560px; background: #3c52a5;"> <tr> <td style="height: 20px; line-height: 1px; font-size: 0px;" height="20">&nbsp;</td> </tr> <tr> <td> <center> <table cellspacing="0" cellpadding="0" align="center" border="0" bgcolor="#3c52a5" style="margin: 0 auto; background: #3c52a5;"> <tr> <td style="width: 25px;" width="25"> <a href="https://www.facebook.com/timesecured/"><img src="https://image.ibb.co/nR76Wd/facebook-circle.png" alt="" style="width: 25px;" width="25" border="0"></a> </td> <td style="width: 8px;" width="8">&nbsp;</td> <td style="width: 25px;" width="25"> <a href="https://twitter.com/timesecured"><img src="https://image.ibb.co/faf4HJ/twitter-circle1.png" alt="" style="width: 25px;" width="25" border="0"></a> </td> <td style="width: 8px;" width="8">&nbsp;</td> <td style="width: 25px;" width="25"> <a href="https://www.linkedin.com/company/timesecured"><img src="http://timesecured.com:3003/uploads/linkedin.png" alt="" style="width: 25px;" width="25" border="0"></a> </td> <td style="width: 8px;" width="8">&nbsp;</td> <td style="width: 25px;" width="25"> <a href="http://instagram.com/timesecured"><img src="https://image.ibb.co/iQOfrd/instagram-circle1.png" alt="" style="width: 25px;" width="25" border="0"></a> </td> </tr> </table> </center> </td> </tr> <tr> <td style="height: 10px; line-height: 1px; font-size: 0px;" height="10">&nbsp;</td> </tr> <tr> <td> <p style="margin: 0px; font-size: 12px; text-align: center; color: #fff;">&copy; Copyright 2021. All rights reserved TimeSecured.</p> </td> </tr> <tr> <td style="height: 20px; line-height: 1px; font-size: 0px;" height="20">&nbsp;</td> </tr> </table> </td> <td style="width: 20px;" width="20">&nbsp;</td> </tr> </table> </td> </tr> </table> </td> </tr> </table> </center> </td> </tr> </table> </body></html>`
        
        };
        
        //var transporter = nodemailer.createTransport(constant.mailAuth);
        var transporter = nodemailer.createTransport({
        host: "smtp-mail.outlook.com",
        port: 587,
        tls: {
           ciphers:'SSLv3'
        },
        auth: {
            user: "alert.timesecured@outlook.com",
            pass: "Time80secured!",
        }
    });

          var mailOptions = mail;
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log("D", error, info);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
    })

    }catch(err){
      throw err;
    }
  }
}