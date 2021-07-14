/* jshint indent: 1 */
const imgUrl = require('../config/main');
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('users', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'firstName'
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'lastName'
    },
    userName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'userName'
    },
    email: {
      type: DataTypes.STRING(250),
      allowNull: false,
      field: 'email'
    },
    password: {
      type: DataTypes.STRING(250),
      allowNull: true,
      field: 'password'
    },
    image: {
      type: DataTypes.STRING(250),
      allowNull: true,
      field: 'image'
    },
    dialCode: {
      type: DataTypes.STRING(250),
      allowNull: true,
      field: 'dialCode'
    },
    phone: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'phone'
    },
    userType: {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      field: 'userType'
    },
    forgotPassword: {
      type: DataTypes.STRING(250),
      allowNull: true,
      field: 'forgotPassword'
    },
    deviceType: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      field: 'deviceType'
    },
    deviceToken: {
      type: DataTypes.STRING(250),
      allowNull: true,
      field: 'deviceToken'
    },
    socialType: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      field: 'socialType'
    },
    socialId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'socialId'
    },
    dob: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'dob'
    },
    gender: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'gender'
    },
    status: {
      type: DataTypes.TEXT(),
      allowNull: true,
      defaultValue: "Active",
      field: 'status'
    },
    about: {
      type: DataTypes.TEXT(),
      allowNull: true,
      field: 'about'
    },
    is_subscription_purchased: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_subscription_purchased'
    },
    subscription_type: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'subscription_type'
    },
    isAlreadyUpdated: {
      type: DataTypes.STRING(100),
      defaultValue: false,
      field: 'isAlreadyUpdated'
    },
    trial_start_date: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'trial_start_date'
    }, 
    trial_end_date: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'trial_end_date'
    },
    pack_purchase_date: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'pack_purchase_date'
    },
    is_on_trial: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_on_trial'
    },
    subscription_due_alert_sent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'subscription_due_alert_sent'
    }
  }, 
  {
    getterMethods: {
        image: function () {
          var userId = this.dataValues.id;
          var imagePath = imgUrl.imageUrl+'profileImages/'+userId;
          return (this.getDataValue('image')!='' && this.getDataValue('image')!= null) ? imagePath+'/'+this.getDataValue('image') : ''
        }
    }, 
  },
    {
    tableName: 'users'
  });
};
