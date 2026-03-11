const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const UnidadProductiva = require('./UnidadProductiva');

class UnidadProductivaCodigoVenta extends Model {}

UnidadProductivaCodigoVenta.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    unidad_productiva_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'UnidadProductiva',
          key: 'id'
        },
    },
    codigo_venta: {
        type: DataTypes.STRING(50),
    },
  },
  {
    sequelize,
    modelName: 'UnidadProductivaCodigoVenta',
    tableName: 'unidad_productiva_codigo_venta',
    timestamps: false,
  }
);

// UnidadProductivaCodigoVenta.belongsTo(UnidadProductiva, { foreignKey: 'unidad_productiva_id' });

module.exports = UnidadProductivaCodigoVenta;


