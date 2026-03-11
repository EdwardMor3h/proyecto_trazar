const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Extensionista extends Model {}

Extensionista.init(
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
    modelName: 'Extensionista',
    tableName: 'extensionista',
    timestamps: false,
  }
);

module.exports = Extensionista;
