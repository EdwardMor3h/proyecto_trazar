const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Promotor extends Model {}

Promotor.init(
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
    modelName: 'Promotor',
    tableName: 'promotor',
    timestamps: false,
  }
);

module.exports = Promotor;
