const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Caserio = require('./Caserio');
const Comite = require('./Comite');
const AltitudCat = require('./AltitudCat');
const Corredor = require('./Corredor');
const CuencaHidrografica = require('./CuencaHidrografica');
const Productor = require('./Productor');
const Sello = require('./Sello');
const Zona = require('./Zona');
const Variedad = require('./Variedad');
const Usuario = require('./Usuario');

const Campanha = require('./Campanha');
const ParcelaCafe = require('./ParcelaCafe');
const UnidadProductivaCodigoVenta = require('./UnidadProductivaCodigoVenta');

class UnidadProductiva extends Model {}

UnidadProductiva.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING,
    },
    altitud: {
      type: DataTypes.INTEGER,
    },
    altitud_cat_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: AltitudCat,
        key: 'id'
      },
    },
    comite_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Comite,
        key: 'id'

      },
    },
    sello_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Sello,
        key: 'id'
      },
    },
    corredor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Corredor,
        key: 'id'
      },
    },
    zona_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Zona,
        key: 'id'
      },
    },
    ubigeo: {
      type: DataTypes.INTEGER,
    },
    caserio_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Caserio,
        key: 'id'
      },
    },
    cuenca_hidrografica_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: CuencaHidrografica,
        key: 'id'
      },
    },
    area_ha: {
      type: DataTypes.NUMERIC,
    },
    area_poly_ha: {
      type: DataTypes.NUMERIC,
    },
    productor_codigo: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: Productor,
        key: 'codigo'
      },
    },
    parcela_gid: {
      type: DataTypes.INTEGER,
    },
    //
    codigo_venta: {
      type: DataTypes.STRING
    },
    ints_anp: {
      type: DataTypes.CHAR
    },
    area_ints_anp_m2: {
      type: DataTypes.DECIMAL
    },
    ints_za: {
      type: DataTypes.CHAR
    },
    area_ints_za_m2: {
      type: DataTypes.DECIMAL
    },
    ints_deforestacion_2014: {
      type: DataTypes.CHAR
    },
    area_ints_deforestacion_2014_m2: {
      type: DataTypes.DECIMAL
    },
    ints_deforestacion_2020: {
      type: DataTypes.CHAR
    },
    area_ints_deforestacion_2020_m2: {
      type: DataTypes.DECIMAL
    },
    ints_parcelas_perhusa: {
      type: DataTypes.CHAR
    },
    area_ints_parcelas_perhusa_m2: {
      type: DataTypes.DECIMAL
    },
    nueva: {
      type: DataTypes.CHAR
    },
    activa: {
      type: DataTypes.CHAR
    },
    variedad_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Variedad,
        key: 'id'
      },
    },
    numero_plantas: {
      type: DataTypes.INTEGER,
    },
    porcentaje_sombra: {
      type: DataTypes.NUMERIC,
    },
    imagen: {
      type:DataTypes.STRING
    },
    productor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Productor,
        key: 'id'
      },
    },
    auth_user_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    eliminada: {
      type: DataTypes.CHAR,
      allowNull: true
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'UnidadProductiva',
    tableName: 'unidad_productiva',
    timestamps: false,
  }
);

UnidadProductiva.belongsTo(Caserio, { foreignKey: 'caserio_id' });
UnidadProductiva.belongsTo(Comite, { foreignKey: 'comite_id' });
UnidadProductiva.belongsTo(AltitudCat, { foreignKey: 'altitud_cat_id' });
UnidadProductiva.belongsTo(Corredor, { foreignKey: 'corredor_id' });
UnidadProductiva.belongsTo(CuencaHidrografica, { foreignKey: 'cuenca_hidrografica_id' });
UnidadProductiva.belongsTo(Productor, { foreignKey: 'productor_codigo' , targetKey: 'codigo'});
UnidadProductiva.belongsTo(Sello, { foreignKey: 'sello_id' });
UnidadProductiva.belongsTo(Zona, { foreignKey: 'zona_id' });
UnidadProductiva.belongsTo(Usuario, { foreignKey: 'zona_id'});
UnidadProductiva.belongsTo(Variedad, { foreignKey: 'variedad_id' });
UnidadProductiva.belongsTo(Productor, { foreignKey: 'productor_id' });
UnidadProductiva.belongsTo(ParcelaCafe, { foreignKey: 'parcela_gid' });

UnidadProductiva.hasMany(Campanha, { foreignKey: 'unidad_productiva_id' });
UnidadProductiva.hasMany(UnidadProductivaCodigoVenta, { foreignKey: 'unidad_productiva_id',
  as: 'codigosVenta'
 });
// UnidadProductiva.hasMany(UnidadProductivaCodigoVenta, { foreignKey: 'unidad_productiva_id' });

//  UnidadProductivaCodigoVenta.belongsTo(UnidadProductiva, { foreignKey: 'unidad_productiva_id' });

module.exports = UnidadProductiva;
