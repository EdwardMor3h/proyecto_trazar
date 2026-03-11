const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Variedad extends Model {}

Variedad.init(
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
    modelName: 'Variedad',
    tableName: 'variedad',
    timestamps: false
  }
);

module.exports = Variedad;
