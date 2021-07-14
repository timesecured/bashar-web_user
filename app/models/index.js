const config = require("../config/db.config.js");
const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  config.DB,
  config.USER,
  config.PASSWORD,
  {
    host: config.HOST,
    dialect: config.dialect,
    operatorsAliases: false,

    pool: {
      max: config.pool.max,
      min: config.pool.min,
      acquire: config.pool.acquire,
      idle: config.pool.idle
    }
  }
);


const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.user = require("../models/users.js")(sequelize, Sequelize);
db.beneficiary = require("../models/beneficiaries.js")(sequelize, Sequelize);
db.vault = require("../models/vaults.js")(sequelize, Sequelize);
db.vaultFiles = require("../models/vaultFiles.js")(sequelize, Sequelize);
db.vaultBeneficiary = require("../models/vault_beneficiaries.js")(sequelize, Sequelize);
db.emailStatus = require("../models/emailStatus.js")(sequelize, Sequelize);
/*db.role = require("../models/role.model.js")(sequelize, Sequelize);

db.role.belongsToMany(db.user, {
  through: "user_roles",
  foreignKey: "roleId",
  otherKey: "userId"
});
db.user.belongsToMany(db.role, {
  through: "user_roles",
  foreignKey: "userId",
  otherKey: "roleId"
});*/


db.vault.belongsTo(db.user, { foreignKey: 'userId' })
db.vault.hasMany(db.vaultFiles, { foreignKey: 'vaultId' })



db.ROLES = ["user", "admin", "moderator"];

module.exports = db;
