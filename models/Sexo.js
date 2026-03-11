const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Sexo extends Model {}

Sexo.init(
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
    modelName: 'Sexo',
    tableName: 'sexo',
    timestamps: false,
  }
);

module.exports = Sexo;
