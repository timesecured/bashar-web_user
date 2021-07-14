const { authJwt } = require("../middleware");
const controller = require("../controllers/AdminController/admin.controller");

const beneficiary = require("../controllers/BeneficiaryController");
const vault = require("../controllers/VaultController");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept, device-token-id"
    );
    next();
  });

  // ADMIN LOGIN
  app.get('/user/login', controller.login);
  
  //ADMIN LOGOUT 
  app.get('/user/logout', controller.logout);

  //reset test
  app.get('/password-reset/:token', controller.passwordReset);

  app.post('/user/adminlogin', 
  	controller.adminlogin);

  //DASHBOARD
  app.get('/user/dashboard', controller.dashboard);
  
  //Beneficiary
  app.get('/user/beneficiaries/list', beneficiary.Beneficiarylist);
  app.get('/user/beneficiaries/add', beneficiary.addBeneficiary);
 
  app.post('/user/beneficiaries/save', beneficiary.addBeneficiaryDetail);
  
  app.get('/user/beneficiaries/edit/:id', beneficiary.editBeneficiary);
  
  app.post('/user/beneficiaries/editsave', beneficiary.beneficiaryEditSave);
  
  app.post('/user/beneficiaries/delete', beneficiary.beneficiaryDelete);

  //vault
  app.get('/user/vault/list', vault.Vaultlist);
  app.get('/user/vault/add', vault.addVault);
  
  app.get('/user/vault/edit/:id', vault.editVault);
  app.post('/user/vault/edit/save', vault.vaultEditSave);
  app.post('/user/vault/delete/file', vault.vaultDelFile);
  
  app.post('/user/vault/save', vault.addVaultSave);


  //app.post('/admin/users/save', controller.UserSave); 

  //app.get('/user/beneficiaries/edit/:id', beneficiary.beneficiaryEdit);
  
  app.post('/user/user/editsave',[ authJwt.isAuthenticate], controller.userEditSave);
  
};
