const db = require("../models"); 
const config = require("../config/auth.config");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const Op = db.Sequelize.Op;
var moment = require('moment');
var path = require('path');
const ejs = require("ejs");
const constant = require('../config/main');
const commonFunction = require('../helpers/commonFunction');

const User = db.user;
const Beneficiary = db.beneficiary;
var store = require('store')

exports.Beneficiarylist = (req, res) => { 

   //var loginUserId = store.get('user');

    controller = 'Beneficiaries';
    action = 'list';  
    loginUserId = req.session.userId; 

    if(loginUserId){
      Beneficiary.findAll({
        where: {
          userId: loginUserId
        } 
      }).then(data => {
        res.render('user/beneficiaries/list',{data:data,controller:controller,action:action});
       // res.render('admin/users/edit',{data:data,controller:controller,action:action});
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving tutorials."
        });
      });  
    }else{
      res.redirect('/user/home');  
    }
};    


exports.addBeneficiary = (req, res) => { 
    controller = 'Beneficiary';
    action = 'add';  
    res.set('content-type' , 'text/html; charset=mycharset'); 
    res.render('user/beneficiaries/add',{page_title:"Beneficiary - ADD",controller:controller,action:action});   
}; 


exports.addBeneficiaryDetail =  async(req, res) => { 
    controller = 'Beneficiary';
    action = 'add'; 
    var loginUserId = req.session.userId; 

    //Bene with email exist check
    {
      const getBeneficiary = await Beneficiary.findOne({ where: { email: req.body.email } });
      

      if (getBeneficiary) {
        req.flash('error', "Email is already used, Please select another");

        return res.redirect('/beneficiaries/add');  
      }
    }

    if(req.files){
      var file = req.files.image;

      var img_name = Date.now()+path.extname(file.name); 

      //file.mv('app/views/admin/assets/upload/beneficiary/'+img_name);

      //file.mv('/home/server3/TimeSecured/public/uploads/beneficiaries/'+img_name);
      file.mv('/srv/vhost/public_html/Bashar-Backend/public/uploads/beneficiaries/'+img_name);
    }else{
      var img_name = "";
    } 

    // Save User to Database
    Beneficiary.create({
      userId:loginUserId,
      name: req.body.name,
      email: req.body.email,
      relation: req.body.relation,
      mobileNumber: req.body.mobileNumber,
      workContact: req.body.workContact,
      image: img_name,
    }).then(async user => {
      /*return res.send({ 
            status:"1",
            message: "Beneficiary registered successfully!",
      });*/

          //Send email
          try{
                const loginUser = await User.findOne({ where: { id: user.userId } });

                var bendficiaryName = req.body.name;
                var vaultOwnerName = loginUser.userName;
                var appStoreLink = "https://play.google.com/store/apps/details?id=com.timesecured";
                var appleLink = "https://apps.apple.com/us/app/timesecured/id1556180587";
                var ownerEmail = loginUser.email;
                var beneEmail = req.body.email;

                  ejs.renderFile("/srv/vhost/public_html/Bashar-Backend/views/benficaryAddedEmail.ejs", {
                                  beneName:bendficiaryName,
                                  ownerName:vaultOwnerName,
                                  appStoreLink:appStoreLink,
                                  appleLink:appleLink,
                                  ownerEmail: ownerEmail,
                                }, 
                    function (err, data) {
                      if (err) {
                        console.log(err);
                      } else {
                        var mail = {
                            from: constant.webOwnerEmail,
                            to: beneEmail,
                            subject: "Added As a Beneficiary",
                            html: data
                        };
                        commonFunction.sendMail(mail);
                      }
                    });
                

            }catch(err){
              console.log(err);
            }


       res.redirect(nodeAdminUrl+'/beneficiaries/list');

    })
    .catch(err => {
     return res.status(500).send({ message: err.message });
    });    
}; 

exports.editBeneficiary = (req, res) => {
  controller = 'admin';
  action = 'add_edit';  
  Beneficiary.findOne({
    where: {
      id: req.params.id,
    },
  }).then(data => {
    res.render('user/beneficiaries/edit',{data:data,controller:controller,action:action});
  })
  .catch(err => {
    res.status(500).send({
      message:
        err.message || "Some error occurred while retrieving tutorials."
    });
  });   
}

exports.beneficiaryEditSave = async (req, res)=> { 
  var controller = 'Beneficiary';
  var action = 'add_edit';
  res.set('content-type' , 'text/html; charset=mycharset'); 

  var rest_cat1 =  await Beneficiary.findOne({where:{id:req.body.id}}).then(b =>{ return b; });

  //Bene with email exist check
  {
    
    const beneEmail = await Beneficiary.findOne({ where: { email: req.body.email , 
                        id: {
                            [Op.ne]:req.body.id
                          }}});

    if (beneEmail) {
      req.flash("error", 'Email is already used, Please select another');

      return res.redirect(nodeAdminUrl+'/beneficiaries/edit/'+req.body.id); 
    }
  }

  if(req.files){
     var file = req.files.image;
     var img_name=Date.now()+path.extname(file.name);                         
     //file.mv('/home/server3/TimeSecured/public/uploads/beneficiaries/'+img_name);
     file.mv('/srv/vhost/public_html/Bashar-Backend/public/uploads/beneficiaries/'+img_name);
  }else if(rest_cat1.image){
    var img_name = rest_cat1.image;
  }else{
    var img_name = null;
  }

  var category_data = await Beneficiary.update({
                          name: req.body.name,
                          email: req.body.email,
                          relation: req.body.relation,
                          mobileNumber: req.body.mobileNumber,
                          workContact: req.body.workContact,
                          image: img_name,
                        },{where:{id:req.body.id}});

  res.redirect(nodeAdminUrl+'/beneficiaries/list');
};

exports.beneficiaryDelete = async (req, res)=> { 
  controller = 'Beneficiary';
  action = 'add';  
  Beneficiary.destroy({ where: { id: req.body.id } });

  res.redirect(nodeAdminUrl+'/beneficiaries/list');
}; 



