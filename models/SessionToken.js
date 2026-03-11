const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = require('../models/Usuario'); // Importa el modelo Usuario

class SessionToken extends Model {}

SessionToken.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    token: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    revocado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Usuario,
        key: 'id'
      },
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'SessionToken',
    tableName: 'session_tokens',
    timestamps: false,
  }
);

SessionToken.belongsTo(Usuario, { foreignKey: 'usuario_id' }); // Definir la relación con el modelo Usuario

module.exports = SessionToken;
