const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Extensionista = require('./Extensionista');
const Promotor = require('./Promotor');

class Productor extends Model{}

Productor.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    codigo: {
      type: DataTypes.STRING,
    },
    nombre: {
      type: DataTypes.STRING,
    },
    dni: {
      type: DataTypes.STRING(11),
    },
    sexo_id: {
      type: DataTypes.INTEGER,
    },
    f_nacimiento: {
      type: DataTypes.DATE,
    },
    extensionista_id: {
      type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: Extensionista,
          key: 'id'
        },
    },
    promotor_id: {
      type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: Promotor,
          key: 'id'
        },
    },
    imagen: {
      type:DataTypes.STRING
    },
    lpa_anho: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    lpa_tipo: {
      type: DataTypes.CHAR,
      allowNull: true
    },
    lpa_origen: {
      type: DataTypes.CHAR,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'Productor',
    tableName: 'productor',
    timestamps: false,
  }
);

Productor.belongsTo(Extensionista, {as: 'Extensionista', foreignKey: 'extensionista_id' });
Productor.belongsTo(Promotor, {as: 'Promotor', foreignKey: 'promotor_id' });

module.exports = Productor;