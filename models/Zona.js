const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Zona extends Model {}

Zona.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    descripcion: {
      type: DataTypes.STRING(100),
    },
  },
  {
    sequelize,
    modelName: 'Zona',
    tableName: 'zona',
    timestamps: false,
  }
);

module.exports = Zona;
