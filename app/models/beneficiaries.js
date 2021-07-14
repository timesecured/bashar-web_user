/* jshint indent: 1 */
const imgUrl = require('../config/main');
module.exports = function (sequelize, DataTypes) {
	return sequelize.define('beneficiaries', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		userId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'userId'
		},
		name: {
			type: DataTypes.STRING(200),
			allowNull: false,
			field: 'name'
		},
		relation: {
			type: DataTypes.STRING(200),
			allowNull: true,
			field: 'relation'
		},
	    email: {
	      type: DataTypes.STRING(250),
	      allowNull: false,
	      field: 'email'
	    },
	    dialCode: {
	      type: DataTypes.STRING(250),
	      allowNull: true,
	      field: 'dialCode'
	    },
	    phoneDialCode: {
	      type: DataTypes.STRING(250),
	      allowNull: true,
	      field: 'phoneDialCode'
	    },
		workContact: {
			type: DataTypes.STRING(100),
			allowNull: true,
			field: 'workContact'
		},
		homeContact: {
			type: DataTypes.STRING(100),
			allowNull: true,
			field: 'homeContact'
		},
		mobileNumber: {
			type: DataTypes.STRING(100),
			allowNull: true,
			field: 'mobileNumber'
		},
	    image: {
	      type: DataTypes.STRING(250),
	      allowNull: true,
	      field: 'image'
	    },
	},
  {
    getterMethods: {
      image: function () {
        return this.getDataValue('image')!='' ? imgUrl.beneficiaryFileUrl+this.getDataValue('image') : ''
      }
    },
  },
  {
    tableName: 'beneficiaries'
  });
};
