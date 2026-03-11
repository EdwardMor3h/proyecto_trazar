const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const UnidadProductiva = require('./UnidadProductiva');
const TexturaSuelo = require('./TexturaSuelo');

class EstudioSuelo extends Model {}

EstudioSuelo.init(
  {
    fecha: {
      type: DataTypes.DATE,
    },
    codigo_estudio: {
      type: DataTypes.STRING(255),
    },
    ph: {
      type: DataTypes.NUMERIC,
    },
    materia_organica: {
      type: DataTypes.NUMERIC,
    },
    no3_ppm: {
        type: DataTypes.NUMERIC,
    },
    fosforo: {
        type: DataTypes.NUMERIC,
    },
    k2o_ppm: {
        type: DataTypes.NUMERIC,
    },
      
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    textura_suelo_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
        model: TexturaSuelo,
        key: 'id'
        },
    },
    unidad_productiva_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
        model: UnidadProductiva,
        key: 'id'
        },
    },
  },
  {
    sequelize,
    modelName: 'EstudioSuelo',
    tableName: 'estudio_suelo',
    timestamps: false,
  }
);


EstudioSuelo.belongsTo(TexturaSuelo, {as: 'TexturaSuelo', foreignKey: 'textura_suelo_id' });
EstudioSuelo.belongsTo(UnidadProductiva, {as: 'UnidadProductiva', foreignKey: 'unidad_productiva_id' });

module.exports = EstudioSuelo;
