/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('settings', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		title: {
			type: DataTypes.STRING(250),
			allowNull: true,
			field: 'title'
		},
		description: {
			type: DataTypes.TEXT(),
			allowNull: true,
			field: 'description'
		},
	}, {
		tableName: 'settings'
	});
};
