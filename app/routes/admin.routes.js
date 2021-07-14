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
  app.get('/home', controller.homePage);
  app.get('/login', controller.login);
  
  app.get('/privacy_polices', controller.privacyPolicies);

  //ADMIN LOGOUT 
  app.get('/logout', controller.logout);

  //reset test
  app.get('/password-reset/:token', controller.passwordReset);

  app.post('/user/adminlogin', 
  	controller.adminlogin);

  //DASHBOARD
  app.get('/user/dashboard', controller.dashboard);
  
  //Beneficiary
  app.get('/beneficiaries/list', [authJwt.isSessionActive], beneficiary.Beneficiarylist);
  app.get('/beneficiaries/add', [authJwt.isSessionActive], beneficiary.addBeneficiary);
 
  app.post('/beneficiaries/save', [authJwt.isSessionActive], beneficiary.addBeneficiaryDetail);
  
  app.get('/beneficiaries/edit/:id', [authJwt.isSessionActive], beneficiary.editBeneficiary);
  
  app.post('/beneficiaries/editsave', [authJwt.isSessionActive], beneficiary.beneficiaryEditSave);
  
  app.post('/beneficiaries/delete', [authJwt.isSessionActive],  beneficiary.beneficiaryDelete);

  //vault
  app.get('/vault/list', [authJwt.isSessionActive], vault.Vaultlist);
  app.get('/vault/add', [authJwt.isSessionActive], vault.addVault);
  
  app.get('/vault/edit/:id', [authJwt.isSessionActive], vault.editVault);
  app.post('/vault/edit/save', [authJwt.isSessionActive], vault.vaultEditSave);
  app.post('/vault/delete/file', [authJwt.isSessionActive], vault.vaultDelFile);
  app.post('/vault/delete', [authJwt.isSessionActive], vault.vaultDelete);
  
  app.post('/vault/save', [authJwt.isSessionActive], vault.addVaultSave);



  //T & C
  app.get('/terms/services', controller.termServices);

  app.post('/vault/resent/vault/email', [authJwt.isSessionActive], vault.resendVaultEmail);


  //app.post('/admin/users/save', controller.UserSave); 

  //app.get('/user/beneficiaries/edit/:id', beneficiary.beneficiaryEdit);
  
};
