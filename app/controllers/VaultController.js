const db = require("../models"); 
const config = require("../config/auth.config");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const Op = db.Sequelize.Op;
var moment = require('moment');
var path = require('path');
const constant = require('../config/main');
const commonFunction = require('../helpers/commonFunction');
var path = require('path');
const ejs = require("ejs");
const fs = require('fs');

const User = db.user;
const Beneficiary = db.beneficiary;
const Vault = db.vault;
const VaultFile = db.vaultFiles;
const VaultBeneficiaries = db.vaultBeneficiary;
const EmailStatus = db.emailStatus;

var store = require('store')

exports.Vaultlist = (req, res) => { 
  controller = 'Vault';
  action = 'list';  
  var loginUserId = req.session.userId; 
    Vault.findAll({
      where: {
        userId: loginUserId
      },
      order: [
            ['id', 'DESC'],
        ],
    }).then(data => {
      res.render('user/vault/list',{data:data,controller:controller,action:action});
     // res.render('admin/users/edit',{data:data,controller:controller,action:action});
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials."
      });
    });  
};    


async function addVault (req, res){ 
    controller = 'Vault';
    action = 'add';  
    var loginUserId = req.session.userId; 

    // Get Beneficiaries Listing
    const getBeneficiary = await Beneficiary.findAll({
      where : {
        userId : loginUserId
        //userId : 15
      },
      order : [
        [ 'id', 'DESC']
      ]
    });   
    
    res.set('content-type' , 'text/html; charset=mycharset'); 
    res.render('user/vault/add',{page_title:"Vault - ADD",controller:controller,action:action, beneficiary:getBeneficiary});   
}; 

module.exports.addVault = addVault;

// add vault
async function addVaultSave (req, res) {
  try {

    var userTz = moment.tz.guess();

    const checkUser = loginUserId;
    const files = [];
    files.push(req.files);
    const data = req.body;
    const beneficiaryId = data.beneficiaryId;

    if(beneficiaryId == undefined){
      req.flash('error', "Please select beneficiary");
      return res.status(401).redirect('/vault/add');
    }

    //return;
    if (checkUser) {
      const getBene = await Beneficiary.findOne({ where: { id: beneficiaryId }});

      if(getBene && getBene != null) {

        if(data.triggerType == 1){

          //get date of 3rd day from current date 
          if(data.alertDuration == 1){
              var alertDate = moment(new moment()).add(3, 'days').format('DD/MM/YYYY');
            }else{
              var alertDate = moment(new moment()).add(7, 'days').format('DD/MM/YYYY');
            }

            var newTime = moment(new moment()).format('HH:mm');

            //Date time conversion
            {
              var tzone = userTz;

              var fmt = "DD/MM/YYYY HH:mm";

              var convertableTime = moment(alertDate+','+ newTime, fmt, tzone).utc().format(fmt);

              var utcTime = moment(convertableTime, fmt).format('HH:mm');
              var utcDate = moment(convertableTime, fmt).format('DD/MM/YYYY');
            }
                      
            var s = newTime ? newTime.split(':') : "";
            // minutes are worth 60 seconds. Hours are worth 60 minutes.
            //let newTriggerTime = (+s[0]) * 60 * 60 + (+s[1]) * 60 + (+s[2]); 
            var newTriggerTime = (+s[0]) * 60 * 60 + (+s[1]) * 60 + 0;
    
            // TRIGGER date 
            var sd = alertDate ? alertDate.split('/') : '';

            var eStatus = "Pending";
            var reqStatus = "InProcess";

        }else{
          // trigger time
          let triggerTime = data.triggerTime;   // your input string

          var adTime = moment(triggerTime, ["hh:mm A"])

          var newTime = adTime.format("HH:mm");

          //Date time conversion
          {
            var tzone = userTz;
            var fmt = "DD/MM/YYYY HH:mm";

            var convertableTime = moment(data.triggerDate+','+ newTime, fmt, tzone).utc().format(fmt);

            var utcTime = moment(convertableTime, fmt).format('HH:mm');
            var utcDate = moment(convertableTime, fmt).format('DD/MM/YYYY');
          }

          var s = newTime ? newTime.split(':') : "";
          // minutes are worth 60 seconds. Hours are worth 60 minutes.
          //let newTriggerTime = (+s[0]) * 60 * 60 + (+s[1]) * 60 + (+s[2]); 
          var newTriggerTime = (+s[0]) * 60 * 60 + (+s[1]) * 60 + 0;

          // TRIGGER date 
          var sd = data.triggerDate ? data.triggerDate.split('/') : '';

          var eStatus = "";
          var reqStatus = "";
        }

        // TRIGGER date 
        let nsd = `${sd[1]}/${sd[0]}/${sd[2]}`;

        let triggerDate = new Date(nsd).getTime() / 1000 // mm/dd/yyyy  dd/mm/yyyy
        let newTriggerDate = (newTriggerTime) + (triggerDate ? triggerDate : '');
        var triggerDateTimeStamp = newTriggerDate != 'NaN' ? newTriggerDate : '';

        if(data.alertDuration){
          var alertDurationValue = data.alertDuration.length > 0 ? data.alertDuration : null; // 1=> 3 days , 2=> 1 week
        }else{
          var alertDurationValue = null;
        }

        let newObj = {
          userId: checkUser,
          beneficiaryId: ((typeof beneficiaryId) == "object") ? beneficiaryId.join(): beneficiaryId,
          name: data.name,
          //phoneNumber: data.phoneNumber,
          beneficiaries: getBene.name,
          triggerType: data.triggerType,  // 1=> passing, 2=> time passing
          triggerDate: data.triggerDate ? data.triggerDate : alertDate,
          triggerTime: newTime ? newTime : '',
          triggerDateTimeStamp: triggerDateTimeStamp,
          alertDuration: data.alertDuration, // 1=> 3 days , 2=> 1 week
          notes: data.notes, 
          emailStatus: eStatus,
          requestStatus: reqStatus,
          userTimeZone: tzone,
          utcTime: utcTime,
          utcDate: utcDate,
        }

        const getBeneficiary = await Beneficiary.findAll({ where: {id: beneficiaryId } });
        const createVault = await Vault.create(newObj);

        if (createVault) {

            //Send email
            try{
              if(createVault.triggerType == "1"){
                getBeneficiary.forEach(async function(getBeneficiary, index) {

                    var uniLength1 = await commonFunction.createRandomValue();
                    var uniLength2 = await commonFunction.createRandomValue();


                    let createEmsil = {
                      vaultId: createVault.id,
                      beneficiaryId: getBeneficiary.dataValues.id,
                      vaultOwnerUniqueString: uniLength1,
                      beneUniqueString: uniLength2,
                      beneEmailStatus: "InProgress",
                      vaultOwnerEmailStatus: "InProgress",
                    }

                    await EmailStatus.create(createEmsil);

                    var bendficiaryName = getBeneficiary.dataValues.name;
                    var vaultOwnerName = checkUser.userName;
                    var appStoreLink = "https://play.google.com/store/apps/details?id=com.timesecured";
                    var appleLink = "https://apps.apple.com/us/app/timesecured/id1556180587";
                    var ownerEmail = checkUser.email;
                    var root = path.dirname(require.main.filename);
                    var beneEmail = getBeneficiary.dataValues.email;

                    if(createVault.alertDuration == 1){
                      var pDays = 3;
                    }else{
                      var pDays = 7;
                    }
                    
                    var sendLink = "http://timesecured.com:3003/api/document/request/"+uniLength2;

                    ejs.renderFile("/srv/vhost/public_html/Bashar-Backend/views/vault-beneficiary-added.ejs", {
                                    beneName:bendficiaryName,
                                    ownerName:vaultOwnerName,
                                    appStoreLink:appStoreLink,
                                    appleLink:appleLink,
                                    ownerEmail: ownerEmail,
                                    passingDays: pDays,
                                    sendEmailLink:sendLink
                                  }, 
                      function (err, data) {
                        if (err) {
                          console.log(err);
                        } else {
                          var mail = {
                              from: constant.webOwnerEmail,
                              to: beneEmail,
                              subject: "Vault Beneficiary Added",
                              html: data
                          };
                          commonFunction.sendMail(mail);
                        }
                      });
                  });
              }

            }catch(err){
              console.log(err);
            }

            // add files if any
            if (files.length > 0) {

            {
                //var vaultFiles = files[0].files;                
                var vaultFiles = files;                
                vaultFiles.map( async c => {
                  if(Array.isArray(c.files)){
                    var name_a = c.files;

                    name_a.map( async d =>{
                      var img_name = Date.now()+path.extname(d.name); 
                      d.mv('/srv/vhost/public_html/Bashar-Backend/public/uploads/vaults/'+img_name);
                        await VaultFile.create({
                          userId : checkUser,
                          vaultId : createVault.id,
                          file : img_name,
                          fileName : d.name
                        })
                    });
                  }else{
                    var name_a = c.files;
                    var img_name = Date.now()+path.extname(name_a.name); 
                    name_a.mv('/srv/vhost/public_html/Bashar-Backend/public/uploads/vaults/'+img_name);
                    await VaultFile.create({
                      userId : checkUser,
                      vaultId : createVault.id,
                      file : img_name,
                      fileName : name_a.name
                    })
                  }
                });
              }
            }
    
            req.flash('success', "Vault added successfully !!");
            res.redirect(nodeAdminUrl+'/vault/list');
          }
        else {
            res.status(500).send({
              message:"Error in adding vault."
            });
        }
      }
      else {
          res.status(500).send({
            message: "beneficiary does not exist."
          });
      }
    }
    else {
       res.status(500).send({
          message:"Unauthorized."
        });
    }
  } catch (err) {
    res.status(500).send({
        message:
          err.message || "Some error occurred."
      });
  }
};


module.exports.addVaultSave = addVaultSave;

async function editVault(req, res){
  controller = 'vault';
  action = 'add_edit'; 
  var loginUserId = req.session.userId; 

  const vaultFiles = await VaultFile.findAll({
      where: {
        vaultId: req.params.id
      },
      attributes: ['id', 'file', 'fileName'],
      order : [
      [ 'id', 'DESC']
    ]
  }); 

  // Get Beneficiaries Listing
  const getBeneficiary = await Beneficiary.findAll({
    where : {
      userId : loginUserId
      //userId : 15
    },
    order : [
      [ 'id', 'DESC']
    ]
  });  

  Vault.findOne({
    where: {
      id: req.params.id,
    },
  }).then(data => {

    if(data.triggerTime && data.triggerTime != "0:0"){
      var timeString = data.triggerTime;

      var H = +timeString.substr(0, 1);
      var h = (H % 12) || 12;
      var ampm = H < 12 ? " am" : " pm";

      timeString = timeString + ampm;
    }else{
      var timeString = "";
    }

    res.render('user/vault/edit',{data:data,controller:controller,action:action, beneficiary:getBeneficiary, timeString:timeString, vaultFiles: vaultFiles});
  })
  .catch(err => {
    res.status(500).send({
      message:
        err.message || "Some error occurred."
    });
  });   
}
module.exports.editVault = editVault;


exports.vaultEditSave = async (req, res)=> { 

  var loginUserId = req.session.userId;

  var controller = 'Vault';
  var action = 'add_edit';
  res.set('content-type' , 'text/html; charset=mycharset'); 

  const checkUser = loginUserId;
  //const checkUser =7;
  const data = req.body;
  const files = [];
  const beneficiaryId = data.beneficiaryId;
  
  files.push(req.files);

  if(beneficiaryId == undefined){
    req.flash('error', "Please select beneficiary");
    return res.status(401).redirect('/vault/edit/'+ data.vaultId);
  }

  if (checkUser) {

      if(data.triggerType == 1){

          //get date of 3rd day from current date 
          if(data.alertDuration == 1){
            var alertDate = moment(new moment()).add(3, 'days').format('DD/MM/YYYY');
          }else{
            var alertDate = moment(new moment()).add(7, 'days').format('DD/MM/YYYY');
          }

          var newTime = moment(new moment()).format('HH:mm');
                    
          var s = newTime ? newTime.split(':') : "";
          // minutes are worth 60 seconds. Hours are worth 60 minutes.
          //let newTriggerTime = (+s[0]) * 60 * 60 + (+s[1]) * 60 + (+s[2]); 
          var newTriggerTime = (+s[0]) * 60 * 60 + (+s[1]) * 60 + 0;
  
          // TRIGGER date 
          var sd = alertDate ? alertDate.split('/') : '';

        }else{
           // trigger time
          let triggerTime = data.triggerTime;   // your input string

          var adTime = moment(triggerTime, ["hh:mm A"])

          var newTime= adTime.format("HH:mm");

          var s = newTime ? newTime.split(':') : "";
          // minutes are worth 60 seconds. Hours are worth 60 minutes.
          //let newTriggerTime = (+s[0]) * 60 * 60 + (+s[1]) * 60 + (+s[2]); 
          var newTriggerTime = (+s[0]) * 60 * 60 + (+s[1]) * 60 + 0;

          // TRIGGER date 
          var sd = data.triggerDate ? data.triggerDate.split('/') : '';
        }

      // TRIGGER date 
      let nsd = `${sd[1]}/${sd[0]}/${sd[2]}`;
      let triggerDate = new Date(nsd).getTime() / 1000 // mm/dd/yyyy  dd/mm/yyyy
      let newTriggerDate = (newTriggerTime) + (triggerDate ? triggerDate : '');

      var triggerDateTimeStamp = newTriggerDate != 'NaN' ? newTriggerDate : '';

      let newObj = {
        name: data.name,
        //phoneNumber: data.phoneNumber,
        beneficiaries: data.beneficiaries,
        beneficiaryId:((typeof beneficiaryId) == "object") ? beneficiaryId.join(): beneficiaryId,
        triggerType: data.triggerType,  // 1=> passing, 2=> time passing
        triggerDate: alertDate ? alertDate : data.triggerDate,
        triggerTime: newTime ? newTime : '',
        triggerDateTimeStamp: triggerDateTimeStamp,
        alertDuration: data.alertDuration, // 1=> 3 days , 2=> 1 week
        notes: data.notes, 
      }

      //delete old vault beneficiaries
      {
        const beneficiary = await Beneficiary.findAll({ attributes: ['id'], where: { id: beneficiaryId }});

        await VaultBeneficiaries.destroy({
            where: {
              vaultId: data.vaultId
            }
        })

        //create multiple benficaries record
        {
          var multiBene = [];
          beneficiary.forEach(await function(vehicle) {
              multiBene.push({
                "vaultId": data.vaultId,
                "beneficiaryId": vehicle.id
              })
          });

          VaultBeneficiaries.bulkCreate(multiBene);
        }
      }

      const getVault = await Vault.findOne({
        where: { id: data.vaultId }
      });

      if(getVault && getVault != null) {
        const updateVault = await Vault.update(newObj, {
          where: { id: data.vaultId }
        });
        if (updateVault) {
          const getUpdatedVault = await Vault.findOne({ where: { id: data.vaultId } });
          const getVaultFile = await VaultFile.findOne({ where: { vaultId: data.vaultId } });
          var vaultFile = getVaultFile !=null ? getVaultFile.dataValues.file : null;
                    
           if (files.length > 0) {

            {
                //var vaultFiles = files[0].files;                
                var vaultFiles = files;                
                vaultFiles.map( async c => {
                  if(Array.isArray(c.files)){
                    var name_a = c.files;

                    name_a.map( async d =>{
                      var img_name = Date.now()+path.extname(d.name); 
                      d.mv('/srv/vhost/public_html/Bashar-Backend/public/uploads/'+img_name);
                      await VaultFile.create({
                          userId : checkUser,
                          vaultId : data.vaultId,
                          file : img_name,
                          fileName : d.name
                        })
                    });
                  }else{
                    var name_a = c.files;
                    var img_name = Date.now()+path.extname(name_a.name); 
                    name_a.mv('/srv/vhost/public_html/Bashar-Backend/public/uploads/vaults/'+img_name);
                    await VaultFile.create({
                      userId : checkUser,
                      vaultId : data.vaultId,
                      file : img_name,
                      fileName : c.name
                    })
                  }
                });
              }
            }
          req.flash('success', "Vault updated successfully !!");
          res.redirect(nodeAdminUrl+'/vault/list');
        }
        else {
          return res.status(500).send({
              message:"Error while updating vault!"
            });
        }
      }
      else {
        return res.status(500).send({
            message:"Vault Not Found!"
          });
      }
    }
    else {
      res.status(500).send({
          message:"Unauthorized."
        });
    }
};

exports.vaultDelete = async (req, res)=> { 
  controller = 'Vault';
  action = 'add';  

  var vaultId = req.body.id;
  var vault = Vault.findOne({ where: { id: req.body.id } });

   if(vault && vault != null) {

          const getVaultFile = await VaultFile.findAll({ where: { vaultId: vaultId } , raw: true });
          
          // Remove Vault File Image from Folder
          getVaultFile.map( async vaultFile => {
              var uploadDir =  constant.filePath;
              var oldFile = uploadDir + vaultFile.file;

              if (fs.existsSync(oldFile)){
                fs.unlink(oldFile, err => {
                    console.log("Vault File Deleted from Directory!");    
                  if (err) throw err;
                });
              }else {
                console.log("File Not Found");
              }
            });
          
          Vault.destroy({
            where : { 
              id: vaultId
            }
          }).then(result => {
            console.log("Vault File Deleted from database!");
            VaultFile.destroy({
              where : { 
                vaultId: vaultId
              }
            }).then(data => {
              console.log('Vault Deleted Successfully!');
            }).catch(error => {
              console.error(error)
            });
          }).catch(error => {
            console.error(error)
          });
        }
        else {
          return responseHelper.get(res, {}, 'Vault Not Found!');
        }

    res.redirect(nodeAdminUrl+'/vault/list');
}; 

exports.vaultDelFile = async (req, res)=> { 
  controller = 'Vault';
  action = 'add';  
  //VaultFile.destroy({ where: { id: req.body.id } });

  const getVaultFile = await VaultFile.findOne({
            where: {
              id: req.body.id
            },
          })

  let vaultFile = getVaultFile != null ? constant.filePath+getVaultFile.dataValues.file : null;

  VaultFile.destroy({
          where : { 
            id: getVaultFile.id
          }
        }).then(data => {
      // Remove Vault File Image from Folder
      if (fs.existsSync(vaultFile)) {
        fs.unlink(vaultFile, err => {
          console.log("Vault File Deleted from Directory!");
        })
      }
      else {
        console.log('File Not Found');
      }
    })

  //res.redirect(nodeAdminUrl+'/vault/list');
}; 


exports.resendVaultEmail = async (req, res) => {

        var data = req.body;
        var getVault = await Vault.findOne({ where: { id: data.vaultId} });

        const vault = await Vault.update(
            {
              requestStatus: "accepted",
              emailStatus: "sent",
              uniqueString: null,
            }, {
            where: {
              id: data.vaultId
            }
          });


        //Sent email
        commonFunction.sentVaultFiles(getVault);

          res.status(200).send({
      message:
       "Email Sent Successfully!!."
    });
           res.redirect(nodeAdminUrl+'/vault/list');

        //return responseHelper.post(res, getVault, "Email Sent.");
  }
