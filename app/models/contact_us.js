/* jshint indent: 1 */
const imgUrl = require('../config/main');
module.exports = function (sequelize, DataTypes) {
	return sequelize.define('contact_us', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		name: {
			type: DataTypes.STRING(250),
			allowNull: true,
			field: 'name'
		},
		email: {
      type: DataTypes.STRING(250),
      allowNull: false,
      field: 'email'
    },
    subject: {
      type: DataTypes.STRING(250),
      allowNull: true,
      field: 'subject'
    },
    message: {
      type: DataTypes.TEXT(250),
      allowNull: true,
      field: 'message'
    }
	},
  {
    tableName: 'contact_us'
  });
};
