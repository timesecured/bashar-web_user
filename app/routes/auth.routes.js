const { verifySignUp,authJwt } = require("../middleware");
const controller = require("../controllers/auth.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept, device_id"
    );
    next();
  });

  //ALL APS

  app.post(
    "/api/signup",
    [
      verifySignUp.checkDuplicateUsernameOrEmail,
      verifySignUp.checkDuplicatePhoneNo,
    ],
    controller.signup
  );

 app.post(
    "/api/signin",
    controller.signin
  );
};
