const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Rol extends Model {}

Rol.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(50),
    },
  },
  {
    sequelize,
    modelName: 'Rol',
    tableName: 'rol',
    timestamps: false,
  }
);

module.exports = Rol;
