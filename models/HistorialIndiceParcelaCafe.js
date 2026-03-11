const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class HistorialIndiceParcelaCafe extends Model {}

HistorialIndiceParcelaCafe.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    gid: {
      type: DataTypes.INTEGER,
    },
    indice: {
      type: DataTypes.STRING(20),
    },
    fecha_indice: {
      type: DataTypes.DATE,
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    fecha_modificacion: {
      type: DataTypes.DATE,
    },
    geojson: {
      type: DataTypes.JSONB,
    },
  },
  {
    sequelize,
    modelName: 'HistorialIndiceParcelaCafe',
    tableName: 'historial_indice_parcela_cafe',
    timestamps: false,
  }
);

module.exports = HistorialIndiceParcelaCafe;
