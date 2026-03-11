const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Sello extends Model {}

Sello.init(
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
    modelName: 'Sello',
    tableName: 'sello',
    timestamps: false,
  }
);

module.exports = Sello;
