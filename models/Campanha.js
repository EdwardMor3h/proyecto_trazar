const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Variedad = require('./Variedad');
const CampanhaVariedad = require('./CampanhaVariedad');
const UnidadProductiva = require('./UnidadProductiva');

class Campanha extends Model {}

Campanha.init(
  {
    fecha_siembra: {
      type: DataTypes.DATE,
    },
    porcentaje_sombra: {
      type: DataTypes.NUMERIC,
    },
    numero_plantas: {
      type: DataTypes.INTEGER,
    },
    unidad_productiva_id: {
      type: DataTypes.INTEGER,
    },
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  },
  {
    sequelize,
    modelName: 'Campanha',
    tableName: 'campanha',
    timestamps: false,
  }
);

Campanha.hasMany(CampanhaVariedad, { foreignKey: 'campanha_id' });
//Campanha.belongsTo(UnidadProductiva, { foreignKey: 'unidad_productiva_id' });

module.exports = Campanha;
