/* jshint indent: 1 */
const fileURL = require('../config/main');
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('vaultFiles', {
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
    vaultId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      field: 'vaultId'
    },
    file: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'file'
    },
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'fileName'
    },
  },
    {
        getterMethods: {
        file: function () {
            return (this.getDataValue('file')!='' && this.getDataValue('file')!= null) ? fileURL.fileUrl+this.getDataValue('file') : ''
        }
    },
    },
    {
      tableName: 'vaultFiles'
    });
};
