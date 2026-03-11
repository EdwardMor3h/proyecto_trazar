const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Campanha = require('./Campanha');
const Variedad = require('./Variedad');

class CampanhaVariedad extends Model {}

CampanhaVariedad.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    campanha_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Campanha,
        key: 'id',
      },
    },
    // otras columnas de CampanhaVariedad
    variedad_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Variedad,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'CampanhaVariedad',
    tableName: 'campanha_variedad',
    timestamps: false,
  }
);

//CampanhaVariedad.belongsTo(Campanha, { foreignKey: 'campanha_id' });
CampanhaVariedad.belongsTo(Variedad, {  foreignKey: 'variedad_id' });

module.exports = CampanhaVariedad;
