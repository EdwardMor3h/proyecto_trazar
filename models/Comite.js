const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Comite extends Model {}

Comite.init(
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
    modelName: 'Comite',
    tableName: 'comite',
    timestamps: false,
  }
);

module.exports = Comite;
