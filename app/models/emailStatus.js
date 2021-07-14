const imgUrl = require('../config/main');
module.exports = function (sequelize, DataTypes) {
	return sequelize.define('emailStatus', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		vaultId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'vaultId'
		},
		beneficiaryId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'beneficiaryId'
		},
		beneEmailStatus: {
			type: DataTypes.STRING(200),
			allowNull: true,
			field: 'beneEmailStatus'
		},
		vaultOwnerEmailStatus: {
			type: DataTypes.STRING(100),
			allowNull: true,
			field: 'vaultOwnerEmailStatus'
		},
		beneUniqueString:{
			type: DataTypes.STRING(100),
			allowNull: true,
			field: 'beneUniqueString'
		},
		vaultOwnerUniqueString: {
			type: DataTypes.STRING(100),
			allowNull: true,
			field: 'vaultOwnerUniqueString'
		}
	},
	{
		tableName: 'emailStatus'
	});
};
