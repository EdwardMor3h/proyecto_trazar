const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Rol = require('../models/Rol');
const Zona = require('../models/Zona');

class Usuario extends Model {}

Usuario.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
    },
    dni: {
      type: DataTypes.STRING(20),
    },
    zona_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Zona,
        key: 'id'
      }
    },
    email: {
      type: DataTypes.STRING(100),
    },
    rol_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Rol,
        key: 'id'
      }
    },
    usuario: {
      type: DataTypes.STRING(50),
    },
    contrasena: {
      type: DataTypes.STRING(100),
    },
    imagen: {
      type: DataTypes.STRING(255),
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    fecha_modificacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Usuario',
    tableName: 'usuario',
    timestamps: false,
  }
);

// Definir la relación con el modelo Zona
Usuario.belongsTo(Zona, { foreignKey: 'zona_id' });
Usuario.belongsTo(Rol, { foreignKey: 'rol_id' });

module.exports = Usuario;
