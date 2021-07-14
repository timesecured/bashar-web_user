const express = require("express");
const bodyParser = require("body-parser");  

const cors = require("cors");
var fileupload = require("express-fileupload");
const app = express();
var CronJob = require('cron').CronJob;
var dateFormat = require('dateformat');
const { Op } = require('sequelize')


//global.nodeSiteUrl = 'http://rvtechnologies.info:3005'; // node
//global.nodeSiteUrl = 'http://localhost:3005'; // node
//global.nodeSiteUrl = 'http://3.96.252.122:3005'; // node
global.nodeSiteUrl = 'https://timesecured.com'; // node

var corsOptions = {
	origin: '*',
	optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}


app.use(cors(corsOptions));
var expressSession = require('express-session');
app.use(expressSession({secret: 'secretkey-web', resave: false, cookie: {
    maxAge: 24 * 60 * 60 * 365 * 1000
  }}));  
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

global.nodeAdminUrl = 'https://timesecured.com'; // node
//global.nodeAdminUrl = 'http://localhost:3005'; // node
//global.nodeAdminUrl = 'http://rvtechnologies.info:3005/user'; // node
// parse requests of content-type - application/json
// Express body parser
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileupload());
var path = require('path');

// Require static assets from public folder
app.use(express.static(path.join(__dirname, 'app/views/admin/assets')));


// Set 'views' directory for any views 
// being rendered res.render()
app.set('views', path.join(__dirname, 'app/views'));

// Set view engine as EJS
app.set('view engine', 'ejs');

var flash = require('express-flash-messages')
app.use(flash());
// database
const db = require("./app/models");
const commonFunction = require('./app/helpers/commonFunction');
const constant = require('./app/config/main');

const Role = db.role;
const VaultFile = db.vaultFiles;
const Vault = db.vault;
const User = db.user;
const Beneficiary = db.beneficiary;

db.sequelize.sync({force: false});


// simple route
app.get("/", (req, res) => {
	//console.log(req.headers.host);
	//global.nodeAdminUrl = "http://"+req.headers.host; 
	res.render('user/home_page');
	//res.json({ message: "Welcome" });
});
app.post('/submit-form', (req, res) => {
  const username = req.body.username
  //...
  res.end()
})

// routes
require('./app/routes/admin.routes')(app);


//trigger time
var job = new CronJob('*/1 * * * *', async function() {
	var triggerDate = dateFormat(new Date(), "dd/mm/yyyy");
	
	var d = new Date(); 
	d.setMinutes(d.getMinutes() + 4);
	var triggerTime = dateFormat(d, "HH:MM");
	console.log("old time------------",d);
	console.log("trigger job running----------------------------------",triggerTime);
   	var v = await Vault.findAll({
      where: {
        utcDate: triggerDate,
        utcTime: triggerTime,
        triggerType: 2
      } ,
      attributes: ['id', 'beneficiaryId', 'phoneNumber', 'beneficiaries', 'notes', 'name', 'userId' ],
      raw: true,
    });

   	var ids = await v.map((event) => 
   		mailFnc(event)		
   	);
});


// set port, listen for requests
//const PORT = process.env.PORT || 3000;
app.listen(3005, () => {
  console.log(`Server is running on port 3005.`);
});

// trigger email
let mailFnc = async function(event){

	var arrBene = event.beneficiaryId.split(",");

	//update email status
	{
		await Vault.update({
				"emailStatus":"Sent",
				"requestStatus":"accepted"
			},{
			
			where:{
				"id": event.id
			}
		})
	}

	const getBeneficiary = await Beneficiary.findAll({ attributes: ['email', 'name'], where: {id: arrBene } });
   		
   		getBeneficiary.forEach(async function(bene,index) {
			 
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
		    var appStoreLink = "https://play.google.com/store/apps/details?id=com.timesecured";
        	var appleLink = "https://apps.apple.com/us/app/timesecured/id1556180587";
		    var mail = {
		      	from: constant.webOwnerEmail,
		      	to: bene.email,
		      	subject: constant.beneficiaryEmailSubject,
		      	attachments: fileAtchments != null ? fileAtchments : null,
            	html:`<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, shrink-to-fit=no"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="x-apple-disable-message-reformatting"><title>Request accepted email – download</title><style>@media only screen and (max-width: 450px){.break{width: 100%!important; text-align: center!important;display: block!important;}}@media only screen and (max-width: 600px){.full_width{width: 100%!important; }}</style></head><body style="margin: 0px; padding: 0px; font-family: arial; background: #dfdfdf;" bgcolor="#dfdfdf"><table class="full_width" cellspacing="0" cellpadding="0" border="0" width="100%" bgcolor="#dfdfdf" style="width: 100%; background: #dfdfdf;"><tr><td><center><table class="full_width" cellspacing="0" cellpadding="0" border="0" width="600" bgcolor="#fff" align="center" style="margin: 0 auto; width: 600px; background: #fff;"><tr><td><table class="full_width" cellspacing="0" cellpadding="0" border="0" width="600" bgcolor="#fff" style="width: 600px; background: #fff; border-top: 8px solid #3c52a5;"><tr><td style="background: #fff;" bgcolor="#fff"><table class="full_width" cellspacing="0" cellpadding="0" border="0" width="600" bgcolor="#fff" style="width: 600px; background: #fff;"><tr><td style="width: 20px;" width="20">&nbsp;</td><td><table class="full_width" cellspacing="0" cellpadding="0" border="0" width="560" bgcolor="#fff" style="width: 560px; background: #fff;"><tr><td style="height: 20px; line-height: 1px; font-size: 0px;" height="20">&nbsp;</td></tr><tr><td><a href=""><img src="https://i.ibb.co/tCFLYpc/img-810-1-2.png" alt="" style="width: 250px; max-width: 250px; -ms-interpolation-mode: bicubic; border: 0; height: auto;" width="250" class="full_width"></a></td></tr><tr><td style="height: 20px; line-height: 1px; font-size: 0px;" height="20">&nbsp;</td></tr></table></td><td style="width: 20px;" width="20">&nbsp;</td></tr></table></td></tr><tr><td style="background: #fff;" bgcolor="#fff"><table class="full_width" cellspacing="0" cellpadding="0" border="0" width="600" bgcolor="#fff" style="width: 600px; background: #fff;"><tr><td style="width: 20px;" width="20">&nbsp;</td><td><table class="full_width" cellspacing="0" cellpadding="0" border="0" width="560" bgcolor="#fff" style="width: 560px; background: #fff;"><tr><td style="height: 20px; line-height: 1px; font-size: 0px;" height="20">&nbsp;</td></tr><tr><td><p style="margin: 0px; font-size: 14px; text-align: left; color: #333;"><b>Hi ${beneName},</b></p></td></tr><tr><td style="height: 20px; line-height: 1px; font-size: 0px;" height="20">&nbsp;</td></tr><tr><td><p style="margin: 0px; font-size: 14px; text-align: left; color: #333; line-height: 1.5;">Please find attached files that ${vaultOwnerName} has sent for your information and use through the Time Secured app. For more information please visit the <a href="https://www.timesecured.com" style="color: #3c52a5; text-decoration: none;"><b>Time Secured website</b></a>.</p></td></tr><tr><td><p style="margin: 0px; font-size: 14px; text-align: left; color: #333; line-height: 1.5;">You may also download the Time Secured iOS or Android App, but you will not need it to access the files attached.</p></td></tr><tr><td style="height: 20px; line-height: 1px; font-size: 0px;" height="20">&nbsp;</td></tr><tr><td><center><table style="background: transparent;" cellspacing="0" cellpadding="0" border="0" bgcolor="transparent"><tr><td style="width: 120px;" width="120"><a href="${appStoreLink}"><img src="https://i.ibb.co/KXVrHPc/img-76-7.png" alt="" style="width: 120px;" width="120" border="0"></a></td><td style="width: 8px;" width="8">&nbsp;</td><td style="width: 120px;" width="120"><a href=${appleLink}><img src="https://i.ibb.co/59Zs5th/img-76-8.png" alt="" style="width: 120px;" width="120" border="0"></a></td></tr></table></center></td></tr><tr><td style="height: 20px; line-height: 1px; font-size: 0px;" height="20">&nbsp;</td></tr><tr><td><p style="margin: 0px; font-size: 14px; text-align: left; color: #333; line-height: 1.5;">Please do not reply to this email. Should you require more information or details on the nature of the files please contact ${vaultOwnerName} directly at <a href="" style="color: #3c52a5; text-decoration: none;">${vaultOwnerEmail}</a>. If you have any technical issues or are unclear on the above instructions, please contact Time Secured directly at <a href="mailto:timesecured@outlook.com" style="color: #3c52a5; text-decoration: none;">timesecured@outlook.com</a>.</p></td></tr><tr><td style="height: 20px; line-height: 1px; font-size: 0px;" height="20">&nbsp;</td></tr><tr><td><p style="margin: 0px; font-size: 14px; text-align: left; color: #333; line-height: 1.5;">Regards,</p><p style="margin: 0px; font-size: 14px; text-align: left; color: #333; line-height: 1.5;"><b><i>Time Secured</i></b></p></td></tr><tr><td style="height: 40px; line-height: 1px; font-size: 0px;" height="40">&nbsp;</td></tr><tr><td style="height: 40px; line-height: 1px; font-size: 0px;" height="40">&nbsp;</td></tr></table></td><td style="width: 20px;" width="20">&nbsp;</td></tr></table></td></tr><tr><td><table class="full_width" cellspacing="0" cellpadding="0" border="0" width="600" bgcolor="#3c52a5" style="width: 600px; background: #3c52a5;"><tr><td style="width: 20px;" width="20">&nbsp;</td><td><table class="full_width" cellspacing="0" cellpadding="0" border="0" width="560" bgcolor="#3c52a5" style="width: 560px; background: #3c52a5;"><tr><td style="height: 20px; line-height: 1px; font-size: 0px;" height="20">&nbsp;</td></tr><tr><td> <center> <table cellspacing="0" cellpadding="0" align="center" border="0" bgcolor="#3c52a5" style="margin: 0 auto; background: #3c52a5;"> <tr> <td style="width: 25px;" width="25"> <a href="https://www.facebook.com/timesecured/"><img src="https://image.ibb.co/nR76Wd/facebook-circle.png" alt="" style="width: 25px;" width="25" border="0"></a> </td> <td style="width: 8px;" width="8">&nbsp;</td> <td style="width: 25px;" width="25"> <a href="https://twitter.com/timesecured"><img src="https://image.ibb.co/faf4HJ/twitter-circle1.png" alt="" style="width: 25px;" width="25" border="0"></a> </td> <td style="width: 8px;" width="8">&nbsp;</td> <td style="width: 25px;" width="25"> <a href="https://www.linkedin.com/company/timesecured"><img src="http://timesecured.com:3003/uploads/linkedin.png" alt="" style="width: 25px;" width="25" border="0"></a> </td> <td style="width: 8px;" width="8">&nbsp;</td> <td style="width: 25px;" width="25"> <a href="http://instagram.com/timesecured"><img src="https://image.ibb.co/iQOfrd/instagram-circle1.png" alt="" style="width: 25px;" width="25" border="0"></a> </td> </tr> </table> </center></td></tr><tr><td style="height: 10px; line-height: 1px; font-size: 0px;" height="10">&nbsp;</td></tr><tr><td><p style="margin: 0px; font-size: 12px; text-align: center; color: #fff;">&copy; Copyright 2021. All rights reserved TimeSecured.</p></td></tr><tr><td style="height: 20px; line-height: 1px; font-size: 0px;" height="20">&nbsp;</td></tr></table></td><td style="width: 20px;" width="20">&nbsp;</td></td></tr></table></body></html>`,
            };
            setTimeout(function(index) {
	    		commonFunction.sendMail(mail);
	    	}, 2000 * index);
		})
   		
}

var job2 = new CronJob('00 00 12 * * 0-6', async function() {
	var triggerDate = dateFormat(new Date(), "dd/mm/yyyy");
	var triggerTime = dateFormat(new Date(), "HH:MM");

   	var v = await Vault.findAll({
      where: {
        utcDate: triggerDate,
        triggerType:1,
        requestStatus: "InProcess"
      } ,
      attributes: ['id', 'beneficiaryId', 'uniqueString', 'beneficiaries', 'notes', 'name', 'userId', 'alertDuration' ],
      raw: true,
    });
   	console.log("ids--------",v);
   	var ids = await v.map((event) => 
   		mailFnc(event)		
   	);
});

//passing email
let mailFnc2 = async function(event){

	var arrBene = event.beneficiaryId.split(",");

	if(event.alertDuration == 1){
		var passingDays = "3 days";
	}else{
		var passingDays = "7 days";
	}

	//update email status
	{
		await Vault.update({
				"emailSentDate":passingDays
			},{
			where:{
				"id": event.id
			}
		})
	}

	/* Removed in new logic
	var rejectRequest = "http://timesecured.com:3003/api/file/request/"+event.uniqueString+"/rejected";

	const getBeneficiary = await Beneficiary.findAll({ attributes: ['email', 'name'], where: {id: arrBene } });
   		
   		getBeneficiary.forEach(async function(bene) {
			 
			var getUser = await User.findOne({where: {id: event.userId}});

		    var mail = {
		      	from: constant.emailFrom,
		      	to: bene.email,
		      	subject: "Beneficiary",
                html:`<!DOCTYPE html><html lang="it"> <head> <meta charset="UTF-8"> <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, shrink-to-fit=no"> <meta http-equiv="X-UA-Compatible" content="IE=edge"> <meta name="x-apple-disable-message-reformatting"> <title>Passing Vault Share with beneficiary (cc creator)</title> <style>@media only screen and (max-width: 450px){.break{width: 100%!important; text-align: center!important;display: block!important;}}@media only screen and (max-width: 600px){.full_width{width: 100%!important; }}</style> </head> <body style="margin: 0px; padding: 0px; font-family: arial; background: #dfdfdf;" bgcolor="#dfdfdf"> <table class="full_width" cellspacing="0" cellpadding="0" border="0" width="100%" bgcolor="#dfdfdf" style="width: 100%; background: #dfdfdf;"> <tr> <td> <center> <table class="full_width" cellspacing="0" cellpadding="0" border="0" width="600" bgcolor="#fff" align="center" style="margin: 0 auto; width: 600px; background: #fff;"> <tr> <td> <table class="full_width" cellspacing="0" cellpadding="0" border="0" width="600" bgcolor="#fff" style="width: 600px; background: #fff; border-top: 8px solid #3c52a5;"> <tr> <td style="background: #fff;" bgcolor="#fff"> <table class="full_width" cellspacing="0" cellpadding="0" border="0" width="600" bgcolor="#fff" style="width: 600px; background: #fff;"> <tr> <td style="width: 20px;" width="20">&nbsp;</td> <td> <table class="full_width" cellspacing="0" cellpadding="0" border="0" width="560" bgcolor="#fff" style="width: 560px; background: #fff;"> <tr> <td style="height: 20px; line-height: 1px; font-size: 0px;" height="20">&nbsp;</td> </tr> <tr> <td><a href=""><img src="https://i.ibb.co/tCFLYpc/img-810-1-2.png" alt="" style="width: 250px; max-width: 250px; -ms-interpolation-mode: bicubic; border: 0; height: auto;" width="250" class="full_width"></a></td> </tr> <tr> <td style="height: 20px; line-height: 1px; font-size: 0px;" height="20">&nbsp;</td> </tr> </table> </td> <td style="width: 20px;" width="20">&nbsp;</td> </tr> </table> </td> </tr> <tr> <td style="background: #fff;" bgcolor="#fff"> <table class="full_width" cellspacing="0" cellpadding="0" border="0" width="600" bgcolor="#fff" style="width: 600px; background: #fff;"> <tr> <td style="width: 20px;" width="20">&nbsp;</td> <td> <table class="full_width" cellspacing="0" cellpadding="0" border="0" width="560" bgcolor="#fff" style="width: 560px; background: #fff;"> <tr> <td style="height: 20px; line-height: 1px; font-size: 0px;" height="20">&nbsp;</td> </tr> <tr> <td> <p style="margin: 0px; font-size: 14px; text-align: left; color: #333;"><b>Hi <b>${getUser.userName}</b>,</b></p> </td> </tr> <tr> <td style="height: 20px; line-height: 1px; font-size: 0px;" height="20">&nbsp;</td> </tr> <tr> <td> <p style="margin: 0px; font-size: 14px; text-align: left; color: #333; line-height: 1.5;">There has been a request by ${bene.name} to access their assigned files. If this is correct please do nothing.</p> </td> </tr> <tr> <td style="height: 20px; line-height: 1px; font-size: 0px;" height="20">&nbsp;</td> </tr> <tr> <td> <p style="margin: 0px; font-size: 14px; text-align: left; color: #333; line-height: 1.5;">If this is incorrect,and you wish the files to remain confidential, please reject the access request within ${passingDays} from the date of this email by clicking the button below.</p> </td> </tr> <tr> <td style="height: 20px; line-height: 1px; font-size: 0px;" height="20">&nbsp;</td> </tr> <tr> <td> <p style="margin: 0px; font-size: 14px; text-align: left; color: #333; line-height: 1.5;">The beneficiary will still be able to make another request in the future if you reject this one. If you wish to change your vaults or beneficiaries, you may do so through the Time Secured app.</p> </td> </tr> <tr> <td style="height: 20px; line-height: 1px; font-size: 0px;" height="20">&nbsp;</td> </tr> <tr> <td> <p style="margin: 0px; font-size: 14px; text-align: left; color: #333; line-height: 1.5;">Please do not reply to this email. Should you require more information or details please contact Time Secured directly at <a href="mailto:timesecured@outlook.com" style="color: #3c52a5; text-decoration: none;">timesecured@outlook.com</a>.</p> </td> </tr> <tr> <td style="height: 20px; line-height: 1px; font-size: 0px;" height="20">&nbsp;</td> </tr> <tr> <td> <p style="margin: 0px; font-size: 14px; text-align: left; color: #333; line-height: 1.5;">Regards,</p> <p style="margin: 0px; font-size: 14px; text-align: left; color: #333; line-height: 1.5;"><b><i>Time Secured</i></b></p> </td> </tr> <tr> <td style="height: 40px; line-height: 1px; font-size: 0px;" height="40">&nbsp;</td> </tr> <tr> <td> <center> <a href="" style="text-decoration: none;" target="_blank"> <table cellpadding="0" cellspacing="0" bgcolor="#3c52a5" style="background: #3c52a5; border-radius: 3px;"> <tr> <td colspan="3" style="height: 8px; line-height: 1px; font-size: 0px;" height="8">&nbsp;</td> </tr> <tr> <td style="width: 30px;" width="30">&nbsp;</td> <td> <a style=" font-family: arial; font-size: 12px; color: #fff; text-decoration: none;" href=${rejectRequest}><b>Reject File Access Request</b></a> </td> <td style="width: 30px;" width="30">&nbsp; </td> </tr> <tr> <td colspan="3" style="height: 8px; line-height: 1px; font-size: 0px;" height="8">&nbsp; </td> </tr> </table></a> </center> </td> </tr> <tr> <td style="height: 40px; line-height: 1px; font-size: 0px;" height="40">&nbsp;</td> </tr> </table> </td> <td style="width: 20px;" width="20">&nbsp;</td> </tr> </table> </td> </tr> <tr> <td> <table class="full_width" cellspacing="0" cellpadding="0" border="0" width="600" bgcolor="#3c52a5" style="width: 600px; background: #3c52a5;"> <tr> <td style="width: 20px;" width="20">&nbsp;</td> <td> <table class="full_width" cellspacing="0" cellpadding="0" border="0" width="560" bgcolor="#3c52a5" style="width: 560px; background: #3c52a5;"> <tr> <td style="height: 20px; line-height: 1px; font-size: 0px;" height="20">&nbsp;</td> </tr> <tr> <td> <center> <table cellspacing="0" cellpadding="0" align="center" border="0" bgcolor="#3c52a5" style="margin: 0 auto; background: #3c52a5;"> <tr> <td style="width: 25px;" width="25"> <a href="https://www.facebook.com/timesecured/"><img src="https://image.ibb.co/nR76Wd/facebook-circle.png" alt="" style="width: 25px;" width="25" border="0"></a> </td> <td style="width: 8px;" width="8">&nbsp;</td> <td style="width: 25px;" width="25"> <a href="https://twitter.com/timesecured"><img src="https://image.ibb.co/faf4HJ/twitter-circle1.png" alt="" style="width: 25px;" width="25" border="0"></a> </td> <td style="width: 8px;" width="8">&nbsp;</td> <td style="width: 25px;" width="25"> <a href="https://www.linkedin.com/company/timesecured"><img src="<%=nodeSiteUrl%>:3003/uploads/linkedin.png" alt="" style="width: 25px;" width="25" border="0"></a> </td> <td style="width: 8px;" width="8">&nbsp;</td> <td style="width: 25px;" width="25"> <a href="http://instagram.com/timesecured"><img src="https://image.ibb.co/iQOfrd/instagram-circle1.png" alt="" style="width: 25px;" width="25" border="0"></a> </td> </tr> </table> </center> </td> </tr> <tr> <td style="height: 10px; line-height: 1px; font-size: 0px;" height="10">&nbsp;</td> </tr> <tr> <td> <p style="margin: 0px; font-size: 12px; text-align: center; color: #fff;">&copy; Copyright 2021. All rights reserved TimeSecured.</p> </td> </tr> <tr> <td style="height: 20px; line-height: 1px; font-size: 0px;" height="20">&nbsp;</td> </tr> </table> </td> <td style="width: 20px;" width="20">&nbsp;</td> </tr> </table> </td> </tr> </table> </td> </tr> </table> </center> </td> </tr> </table> </body></html>`
		    };
	    	commonFunction.sendMail(mail);
		})*/
	
	await Vault.update({"emailSentDate": event.alertDuration}, {
		where:{
			id: event.id
		}
	})
}


//Mail 3
//passing vault email with attachment
var job3 = new CronJob('00 00 12 * * 0-6', async function(){
	//decrease value by one
	{
		await Vault.decrement(
	        { emailSentDate: 1 },
	        {
	            where:{
	            	id: {
	            		[Op.gte]: 1
	            	},
	            	emailSentDate: {
	            		[Op.not]: -1
	            	}
	            }
	        }
	    );
	}

	//Sent email to all users whose email sent is 0
	{
		var allVault = await Vault.findAll({ attributes: ['id','userId', 'beneficiaryId'], 
							where: {emailSentDate: 0 }, raw:true 
						})

		if(allVault.length > 0){

			var ids = await allVault.map((event) => 
		   		mailFnc(event)		
		   	);
		}
	}

})


job.start();
job2.start();
job3.start();
