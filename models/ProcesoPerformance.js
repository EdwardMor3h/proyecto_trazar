const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class ProcesoPerformance extends Model {}

ProcesoPerformance.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
    },
    tiempo: {
      type: DataTypes.INTEGER,
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
  },
  {
    sequelize,
    modelName: 'ProcesoPerformance',
    tableName: 'procesos_performance',
    timestamps: false,
  }
);

module.exports = ProcesoPerformance;
