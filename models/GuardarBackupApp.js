const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class GuardarBackupApp extends Model {}

GuardarBackupApp.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    fecha_modificacion: {
      type: DataTypes.DATE,
    },
    auth_user_id: {
      type: DataTypes.INTEGER,
    },
    json: {
      type: DataTypes.JSONB,
    },
    estado: {
      type: DataTypes.CHAR
    }
  },
  {
    sequelize,
    modelName: 'GuardarBackupApp',
    tableName: 'guardar_backup_app',
    timestamps: false,
  }
);

module.exports = GuardarBackupApp;
