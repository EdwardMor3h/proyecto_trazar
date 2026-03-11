const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class CuencaHidrografica extends Model {}

CuencaHidrografica.init(
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
    modelName: 'CuencaHidrografica',
    tableName: 'cuenca_hidrografica',
    timestamps: false,
  }
);

module.exports = CuencaHidrografica;
