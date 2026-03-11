const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Caserio extends Model {}

Caserio.init(
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
    modelName: 'Caserio',
    tableName: 'caserio',
    timestamps: false,
  }
);

module.exports = Caserio;
