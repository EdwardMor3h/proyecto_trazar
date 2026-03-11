const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class TexturaSuelo extends Model {}

TexturaSuelo.init(
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
    modelName: 'TexturaSuelo',
    tableName: 'textura_suelo',
    timestamps: false,
  }
);

module.exports = TexturaSuelo;
