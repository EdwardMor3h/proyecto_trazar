const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class ParcelaCafe extends Model {}

ParcelaCafe.init(
  {
    gid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },    
    geom: {
      type: DataTypes.GEOMETRY('MULTIPOLYGON', 4326),
    },
    
  },
  {
    sequelize,
    modelName: 'ParcelaCafe',
    tableName: 'parcelas_cafe',
    timestamps: false,
  }
);

module.exports = ParcelaCafe;