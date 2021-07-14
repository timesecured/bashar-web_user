/* jshint indent: 1 */
const imgUrl = require('../config/main');
module.exports = function (sequelize, DataTypes) {
	return sequelize.define('vaults', {
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
		beneficiaryId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'beneficiaryId'
		},
		name: {
			type: DataTypes.STRING(200),
			allowNull: true,
			field: 'name'
		},
		phoneNumber: {
			type: DataTypes.STRING(100),
			allowNull: true,
			field: 'phoneNumber'
		},
		beneficiaries: {
			type: DataTypes.STRING(200),
			allowNull: true,
			field: 'beneficiaries'
		},
		triggerType: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			field: 'triggerType'
		},

		triggerDate: {
			type: DataTypes.STRING(100),
			allowNull: true,
			field: 'triggerDate'
		},
		triggerTime: {
			type: DataTypes.STRING(100),
			allowNull: true,
			field: 'triggerTime'
		},
		triggerDateTimeStamp: {
			type: DataTypes.STRING(200),
			allowNull: true,
			field: 'triggerDateTimeStamp'
		},

		alertDuration: {
			type: DataTypes.INTEGER(4),
			allowNull: true,
			field: 'alertDuration'
		},
		notes: {
			type: DataTypes.STRING(255),
			allowNull: true,
			field: 'notes'
		},
		requestStatus: {
			type: DataTypes.STRING(255),
			allowNull: true,
			field: 'requestStatus'
		},
		emailStatus: {
			type: DataTypes.STRING(255),
			allowNull: true,
			field: 'emailStatus'
		},
		uniqueString: {
			type: DataTypes.STRING(255),
			allowNull: true,
			field: 'uniqueString'
		},
		emailSentDate: {
			type: DataTypes.STRING(255),
			allowNull: true,
			field: 'emailSentDate'
		},
		userTimeZone: {
			type: DataTypes.STRING(255),
			allowNull: true,
			field: 'userTimeZone'
		},
		utcTime: {
			type: DataTypes.STRING(255),
			allowNull: true,
			field: 'utcTime'
		},
		utcDate: {
			type: DataTypes.STRING(255),
			allowNull: true,
			field: 'utcDate'
		}
	},
		{
			tableName: 'vaults'
		});
};
