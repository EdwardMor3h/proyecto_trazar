const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class AltitudCat extends Model {}

AltitudCat.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    descripcion: {
      type: DataTypes.STRING(100),
    },
    rango: {
        type: DataTypes.STRING(100),
      },
  },
  {
    sequelize,
    modelName: 'AltitudCat',
    tableName: 'altitud_cat',
    timestamps: false,
  }
);

module.exports = AltitudCat;
