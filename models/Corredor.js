const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Corredor extends Model {}

Corredor.init(
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
    modelName: 'Corredor',
    tableName: 'corredor',
    timestamps: false,
  }
);

module.exports = Corredor;
