/* jshint indent: 1 */
module.exports = function (sequelize, DataTypes) {
	return sequelize.define('vault_beneficiaries', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		vaultId: {
			type: DataTypes.STRING(250),
			allowNull: true,
			field: 'vaultId'
		},
		beneficiaryId: {
	      	type: DataTypes.STRING(250),
	      	allowNull: false,
	      	field: 'beneficiaryId'
	    }
	},
  {
    tableName: 'vault_beneficiaries'
  });
};
