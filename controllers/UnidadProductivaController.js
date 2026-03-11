const UnidadProductiva = require('../models/UnidadProductiva');
const Caserio = require('../models/Caserio');
const Comite = require('../models/Comite');
const AltitudCat = require('../models/AltitudCat');
const Corredor = require('../models/Corredor');
const CuencaHidrografica = require('../models/CuencaHidrografica');
const Productor = require('../models/Productor');
const Sello = require('../models/Sello');
const Zona = require('../models/Zona');
const Extensionista = require('../models/Extensionista');
const Promotor = require('../models/Promotor');

const Campanha = require('../models/Campanha');
const CampanhaVariedad = require('../models/CampanhaVariedad');
const Usuario = require('../models/Usuario');
const Variedad = require('../models/Variedad');
const ParcelaCafe = require('../models/ParcelaCafe');
const UnidadProductivaCodigoVenta = require('../models/UnidadProductivaCodigoVenta');

const { Op } = require('sequelize');
const sequelize = require('../config/database');

const csv = require('csv-parser');
const fs = require('fs');

const path = require('path');
const Busboy = require('busboy');

const ExcelJS = require('exceljs');

// Obtener todas las unidades productivas
exports.getAllUnidadesProductivas = async (req, res) => {
  
  try {

    var _where = {};
    var _whereProductor = {};

    console.log(req.query);
    if(req.query){
      if('zona_id' in req.query){
        /*
        _where = {        
          'zona_id' : req.query['zona_id']
        }
        */
        _where['zona_id'] = req.query['zona_id']
      }
      if('fecha_creacion' in req.query){
        /*
        _where = {        
          'fecha_creacion' : {
            [Op.gt]: req.query['fecha_creacion']
          }
        }
        */
        //ultima edicion
        /*
        _where['fecha_creacion'] = {
          [Op.gt]: req.query['fecha_creacion']
        }
        */
        //ultima_edicion
      }
      if('auth_user_id' in req.query){
        //_whereProductor['lpa_origen'] = ['INSPECCION 2023', 'INSPECCION 2024'];//ultima edicion
      }
      if('activa' in req.query){
        _where['activa'] = req.query['activa'];
      }
      if('eliminada' in req.query){
        _where['eliminada'] = req.query['eliminada'];
      }
    }

    if(req.session.user){
      
      console.log(req.session.user.zona_id);

      console.log(req.session.user.rol);

      if(req.session.user.rol == 3){
        _where = {
          'zona_id' : req.session.user.zona_id
        }
      }
    }    

    console.log(_where);
    _where['parcela_gid'] = { [Op.not]: null };

    const unidadesProductivas = await UnidadProductiva.findAll({
      include: 
      [
        {model: Caserio},
        {model: Comite},
        {model: AltitudCat},
        {model: Corredor},
        {model: CuencaHidrografica},
        {
          model: Productor,
          //where: _whereProductor,
          include:
          [
            {model: Promotor, as: 'Promotor'},
            {model: Extensionista, as: 'Extensionista'}
          ]
        },
        {model: Sello},
        {
          model: Usuario,
          include: [
            {
              model: Zona
            },
          ],
        },
        {model: Variedad},
        {model: Zona}
        //Caserio, Comite, AltitudCat, Corredor, CuencaHidrografica, Productor, Sello, Zona
      ], //Incluye el modelos en la consulta
      where: _where,
      order: [['parcela_gid', 'DESC']]
    });
    res.json(unidadesProductivas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los caseríos relacionados a las unidades productivas' });
  }
};

// Crear una nueva unidad productiva
exports.createUnidadProductiva = async (req, res) => {
  const { nombre, altitud, altitud_cat_id, comite_id, sello_id, corredor_id, zona_id, ubigeo, caserio_id, cuenca_hidrografica_id, area_ha, productor_codigo, parcela_gid } = req.body;
  try {
    const unidadProductiva = await UnidadProductiva.create({
      nombre,
      altitud,
      altitud_cat_id,
      comite_id,
      sello_id,
      corredor_id,
      zona_id,
      ubigeo,
      caserio_id,
      cuenca_hidrografica_id,
      area_ha,
      productor_codigo,
      parcela_gid,
    });
    res.status(201).json(unidadProductiva);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear la unidad productiva' });
  }
};

// Aprobación masiva de parcelas creadas a partir del app
exports.updateAprobarMasivaUnidadProductiva = async (req, res) => {
  const { where_filtros } = req.body;
  let filtros = JSON.parse(where_filtros);

  // Comprobar y remover comillas de los valores de filtros existentes
  filtros["auth_user_id"] != null ? filtros["auth_user_id"] = eval(filtros["auth_user_id"]) : null;
  
  try {
    const unidadProductiva = await UnidadProductiva.update(
      { activa : "1" },
      { where : filtros }
      );
    res.status(201).json(unidadProductiva);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al aprobar las unidades productivas' });
  }
};


// Actualizar una unidad productiva por su ID
exports.updateUnidadProductiva = async (req, res) => {
  // const { id } = req.params;
  // const { nombre, altitud, altitud_cat_id, comite_id, sello_id, corredor_id, zona_id, ubigeo, caserio_id, cuenca_hidrografica_id, area_ha, productor_codigo, parcela_gid } = req.body;

  try{

    const formData = {};
    let imageFileName = '';

    const busboyInstance = Busboy({ headers: req.headers });

    busboyInstance.on('field', (fieldname, value) => {
      formData[fieldname] = value;
    });

    busboyInstance.on('file', (fieldname, file, filename, encoding, mimetype) => {
      try {
        // Guardar el nombre del archivo para usarlo luego
        imageFileName = filename;

        // Generar un nuevo nombre de archivo si ya existe
        let uniqueFileName = imageFileName.filename;
        let fileIndex = 1;
        const folderPath = path.join(process.cwd(), 'public', 'unidad_productiva', 'fotos');
        while (fs.existsSync(path.join(folderPath, uniqueFileName))) {
          uniqueFileName = `${path.parse(uniqueFileName).name}_${fileIndex}${path.extname(uniqueFileName)}`;
          fileIndex++;
        }

        // Ruta donde se guardará el archivo, utilizando process.cwd()
        //const folderPath = path.join(process.cwd(), 'public', 'productor', 'fotos');
        const filePath = path.join(folderPath, uniqueFileName);

        // Verificar si la carpeta existe, si no, crearla
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath, { recursive: true });
        }

        const writeStream = fs.createWriteStream(filePath);

        // Guardar el archivo en el sistema de archivos
        file.pipe(writeStream);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear la unidad productiva' });
      }
    });

    busboyInstance.on('finish', async () => {

      const { id, nombre, altitud, comite_id, sello_id, corredor_id, zona_id, caserio_id,codigo_venta,altitud_cat_id, area_ha, productor_codigo, nueva, activa, variedad_id, porcentaje_sombra, numero_plantas, eliminada, __i, __j} = formData;

      try {
        const unidadProductiva = await UnidadProductiva.findByPk(id);
        if (unidadProductiva) {

          nombre != null ? unidadProductiva.nombre = nombre : false;
          altitud != null ? unidadProductiva.altitud = altitud : false;
          altitud_cat_id != null ? unidadProductiva.altitud_cat_id = altitud_cat_id : false;
          comite_id != null ? unidadProductiva.comite_id = comite_id : false;
          sello_id != null ? unidadProductiva.sello_id = sello_id : false;
          corredor_id != null ? unidadProductiva.corredor_id = corredor_id : false;
          zona_id != null ? unidadProductiva.zona_id = zona_id : false;
          caserio_id != null ? unidadProductiva.caserio_id = caserio_id : false;
          codigo_venta != null ? unidadProductiva.codigo_venta = codigo_venta : false;
          area_ha != null ? unidadProductiva.area_ha = area_ha : false;
          productor_codigo != null ? unidadProductiva.productor_codigo = productor_codigo : false;
          nueva != null ? unidadProductiva.nueva = nueva : false;
          activa != null ? unidadProductiva.activa = activa : false;
          variedad_id != null ? unidadProductiva.variedad_id = variedad_id : false;
          porcentaje_sombra != null ? unidadProductiva.porcentaje_sombra = porcentaje_sombra : false;
          numero_plantas != null ? unidadProductiva.numero_plantas = numero_plantas : false;
          eliminada != null ? unidadProductiva.eliminada = eliminada : false;
          /*
          unidadProductiva.nombre = nombre;
          unidadProductiva.altitud = altitud;
          // unidadProductiva.altitud_cat_id = altitud_cat_id;
          unidadProductiva.comite_id = comite_id;
          unidadProductiva.sello_id = sello_id;
          unidadProductiva.corredor_id = corredor_id;
          unidadProductiva.zona_id = zona_id;
          // unidadProductiva.ubigeo = ubigeo;
          unidadProductiva.caserio_id = caserio_id;
          // unidadProductiva.cuenca_hidrografica_id = cuenca_hidrografica_id;
          //unidadProductiva.area_ha = area_ha;
          //unidadProductiva.productor_codigo = productor_codigo;
          unidadProductiva.codigo_venta = codigo_venta;
          // unidadProductiva.parcela_gid = parcela_gid;
          */

          // Actualizar la ruta de la imagen en la base de datos si se adjuntó una imagen
          if (imageFileName && 'filename' in imageFileName) {
            unidadProductiva.imagen = path.join('/unidad_productiva', 'fotos', imageFileName.filename);
          }

          await unidadProductiva.save();

          var unidadProductivaJson = unidadProductiva.toJSON();

          __i != null ? unidadProductivaJson["__i"] = __i : false;
          __j != null ? unidadProductivaJson["__j"] = __j : false;

          res.json(unidadProductivaJson);
        } else {
          res.status(404).json({ message: 'Unidad productiva no encontrada' });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar la unidad productiva' });
      }
    })

    // Iniciar el procesamiento de la solicitud
    req.pipe(busboyInstance);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el productor' });
  }
};

// Eliminar una unidad productiva por su ID
exports.deleteUnidadProductiva = async (req, res) => {
  const { id } = req.params;
  try {
    const unidadProductiva = await UnidadProductiva.findByPk(id);
    if (unidadProductiva) {
      await unidadProductiva.destroy();
      res.json({ message: 'Unidad productiva eliminada correctamente' });
    } else {
      res.status(404).json({ message: 'Unidad productiva no encontrada' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar la unidad productiva' });
  }
};

// Filtrar unidades productivas por campo y valor
exports.filterUnidadProductivaTablaAtributos = async (req, res) => {
  //const { field, value } = req.params;
  const { field, value, where_filtros } = req.query;
  console.log();

  //Convertir valores de filtros en arreglos
  // let values_filter_altitud = JSON.parse("[" + data_filtros["altitud"][1] + "]");
  // let values_filter_zona = JSON.parse("[" + data_filtros["zona"][1] + "]");
  // let values_filter_corredor = JSON.parse("[" + data_filtros["corredor"][1] + "]");

  let filtros = JSON.parse(where_filtros);
  console.log(filtros);

  // Comprobar y remover comillas de los valores de filtros existentes
  filtros["altitud_cat_id"] != null ? filtros["altitud_cat_id"] = eval(filtros["altitud_cat_id"]) : null;
  filtros["zona_id"] != null ? filtros["zona_id"] = eval(filtros["zona_id"]) : null;
  filtros["corredor_id"] != null ? filtros["corredor_id"] = eval(filtros["corredor_id"]) : null;
  filtros["cuenca_hidrografica_id"] != null ? filtros["cuenca_hidrografica_id"] = eval(filtros["cuenca_hidrografica_id"]) : null;
  filtros["comite_id"] != null ? filtros["comite_id"] = eval(filtros["comite_id"]) : null;
  filtros["codigo_venta"] != null ? filtros["codigo_venta"] = eval(filtros["codigo_venta"]) : null;
  filtros["variedad_id"] != null ? filtros["variedad_id"] = eval(filtros["variedad_id"]) : null;
  filtros["id"] != null ? filtros["id"] = eval(filtros["id"]) : null;

  if(req.session.user.rol == 3){
    filtros["zona_id"] = req.session.user.zona_id;
  }

  if(!('activa' in filtros)){
    filtros["activa"] = '1';
    filtros["eliminada"] = '0';
  }

  filtros['parcela_gid'] = { [Op.not]: null };
  
  var filtro_variedad = {};
  
  // if(filtros["variedad_id"] != null){
  //   filtro_variedad["id"] = eval(filtros["variedad_id"]);
  //   delete filtros["variedad_id"];
  // }
  
  try {
    const unidadesProductivas = await UnidadProductiva.findAll({
      include: 
      [
        {model: Caserio},
        {model: Comite},
        {model: AltitudCat},
        {model: Corredor},
        {model: CuencaHidrografica},
        {model: Variedad},
        {
          model: Productor,
          include:
          [
            {model: Promotor, as: 'Promotor'},
            {model: Extensionista, as: 'Extensionista'}
          ]
        },
        {model: Sello},
        {model: Zona}
        // {
        //   model: Campanha,
        //   include: [
        //     {
        //       model: CampanhaVariedad,
        //       include: [
        //         { 
        //           model: Variedad, 
        //           where: filtro_variedad
        //         }
        //       ],
        //     },
        //   ],
        // }
        //Caserio, Comite, AltitudCat, Corredor, CuencaHidrografica, Productor, Sello, Zona
      ], //Incluye el modelos en la consulta
      // where: {
      //   // [data_filtros["altitud"][0]]: values_filter_altitud,
      //   [field] : value,
      // },
      where: filtros
    });
    res.json(unidadesProductivas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al filtrar las unidades productivas' });
  }
};

exports.filterUnidadesProductivasPaginacionByFieldBackup = async (req, res) => {
  //const { field, value } = req.params;
  var { field, value, where_filtros, page=1, pageSize=10 } = req.query;

  console.log(where_filtros);

  where_filtros === undefined ? where_filtros = "{}" : false;

  //Convertir valores de filtros en arreglos
  // let values_filter_altitud = JSON.parse("[" + data_filtros["altitud"][1] + "]");
  // let values_filter_zona = JSON.parse("[" + data_filtros["zona"][1] + "]");
  // let values_filter_corredor = JSON.parse("[" + data_filtros["corredor"][1] + "]");


  let filtros = JSON.parse(where_filtros);
  console.log(filtros);

  // Comprobar y remover comillas de los valores de filtros existentes
  filtros["altitud_cat_id"] != null ? filtros["altitud_cat_id"] = eval(filtros["altitud_cat_id"]) : null;
  filtros["zona_id"] != null ? filtros["zona_id"] = eval(filtros["zona_id"]) : null;
  filtros["corredor_id"] != null ? filtros["corredor_id"] = eval(filtros["corredor_id"]) : null;
  filtros["cuenca_hidrografica_id"] != null ? filtros["cuenca_hidrografica_id"] = eval(filtros["cuenca_hidrografica_id"]) : null;
  filtros["comite_id"] != null ? filtros["comite_id"] = eval(filtros["comite_id"]) : null;
  filtros["codigo_venta"] != null ? filtros["codigo_venta"] = eval(filtros["codigo_venta"]) : null;
  filtros["variedad_id"] != null ? filtros["variedad_id"] = eval(filtros["variedad_id"]) : null;
  filtros["id"] != null ? filtros["id"] = eval(filtros["id"]) : null;

  if(req.session.user.rol == 3){
    filtros["zona_id"] = req.session.user.zona_id;
  }

  if(!('activa' in filtros)){
    filtros["activa"] = '1';
    filtros["eliminada"] = '0';
  }

  filtros['parcela_gid'] = { [Op.not]: null };

  //Paginación
  const offset = (page - 1) * pageSize;
  
  var filtro_variedad = {};
  
  // if(filtros["variedad_id"] != null){
  //   filtro_variedad["id"] = eval(filtros["variedad_id"]);
  //   delete filtros["variedad_id"];
  // }
  
  try {
    //const unidadesProductivas = await UnidadProductiva.findAll({
    const { count, rows: unidadesProductivas } = await UnidadProductiva.findAndCountAll({
      include: 
      [
        {model: Caserio},
        {model: Comite},
        {model: AltitudCat},
        {model: Corredor},
        {model: CuencaHidrografica},
        {model: Variedad},
        {
          model: Productor,
          include:
          [
            {model: Promotor, as: 'Promotor'},
            {model: Extensionista, as: 'Extensionista'}
          ]
        },
        {model: Sello},
        {model: Zona}
        // {
        //   model: Campanha,
        //   include: [
        //     {
        //       model: CampanhaVariedad,
        //       include: [
        //         { 
        //           model: Variedad, 
        //           where: filtro_variedad
        //         }
        //       ],
        //     },
        //   ],
        // }
        //Caserio, Comite, AltitudCat, Corredor, CuencaHidrografica, Productor, Sello, Zona
      ], //Incluye el modelos en la consulta
      // where: {
      //   // [data_filtros["altitud"][0]]: values_filter_altitud,
      //   [field] : value,
      // },
      where: filtros,
      limit: parseInt(pageSize),
      offset: offset
    });

    //res.json(unidadesProductivas);
    //Paginacion
    res.json({
      unidadesProductivas,
      totalPages: Math.ceil(count / pageSize),
      currentPage: parseInt(page)
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al filtrar las unidades productivas' });
  }
};

exports.filterUnidadesProductivasPaginacionByField = async (req, res) => {
  const { draw, start, length, search, order, columns } = req.body;

  // Obtener los valores necesarios para el filtrado y ordenado
  const searchValue = search.value;
  const orderColumnIndex = order[0].column;
  const orderDir = order[0].dir;
  const orderColumn = columns[orderColumnIndex].data;

  var { extend } = req.body;

  console.log(extend);

  extend = JSON.parse(extend);

  extend = extend["_where_filtros"];

  //extend === undefined ? where_filtros = "{}" : false;
  console.log(extend);

  let filtros = JSON.parse(extend);
  let filtro_codigo_venta = {};

  console.log(filtros);

  // Comprobar y remover comillas de los valores de filtros existentes
  filtros["altitud_cat_id"] != null ? filtros["altitud_cat_id"] = eval(filtros["altitud_cat_id"]) : null;
  filtros["zona_id"] != null ? filtros["zona_id"] = eval(filtros["zona_id"]) : null;
  filtros["corredor_id"] != null ? filtros["corredor_id"] = eval(filtros["corredor_id"]) : null;
  filtros["cuenca_hidrografica_id"] != null ? filtros["cuenca_hidrografica_id"] = eval(filtros["cuenca_hidrografica_id"]) : null;
  filtros["comite_id"] != null ? filtros["comite_id"] = eval(filtros["comite_id"]) : null;
  filtros["codigo_venta"] != null ? filtro_codigo_venta["codigo_venta"] = eval(filtros["codigo_venta"]) : null;
  console.log(filtro_codigo_venta);
  filtros["variedad_id"] != null ? filtros["variedad_id"] = eval(filtros["variedad_id"]) : null;
  filtros["id"] != null ? filtros["id"] = eval(filtros["id"]) : null;

  if(req.session.user.rol == 3){
    filtros["zona_id"] = req.session.user.zona_id;
  }

  if(!('activa' in filtros)){
    filtros["activa"] = '1';
    filtros["eliminada"] = '0';
  }

  filtros['parcela_gid'] = { [Op.not]: null };

  // console.log('=======filtros:');
  // console.log(filtros);
  // console.log('=======filtro_codigo_venta:');
  // console.log(filtro_codigo_venta);

  try {

    let count = 0;
    let unidadesProductivas = [];

    if(filtros["codigo_venta"] != "['Todos']")
    {
      //Borrar filtro "codigo_venta" de la tabla "unidad_productiva"
      delete filtros["codigo_venta"];

      const result = await UnidadProductiva.findAndCountAll({
        include: [
          {
            model: UnidadProductivaCodigoVenta,
            as: 'codigosVenta',
            where: filtro_codigo_venta
          },
          {model: Caserio},
          {model: Comite},
          {model: AltitudCat},
          {model: Corredor},
          {model: CuencaHidrografica},
          {model: Variedad},
          {
            model: Productor,
            include: [
              {model: Promotor, as: 'Promotor'},
              {model: Extensionista, as: 'Extensionista'}
            ]
          },
          {model: Sello},
          {model: Zona}
        ],
        where: filtros,
        order: [[orderColumn, orderDir]],
        limit: parseInt(length),
        offset: parseInt(start)
      });

      console.log('======= result.count:');
      console.log(result.count);
      console.log('======= result.rows:');
      console.log(result.rows);

       // Desestructurar el resultado en count y unidadesProductivas
      count = result.count; // Total de registros
      unidadesProductivas = result.rows; // Registros obtenidos

    }
    else
    {
      delete filtros["codigo_venta"];
      // const { count, rows: unidadesProductivas } = await UnidadProductiva.findAndCountAll({
      const result = await UnidadProductiva.findAndCountAll({
        include: [
          {model: Caserio},
          {model: Comite},
          {model: AltitudCat},
          {model: Corredor},
          {model: CuencaHidrografica},
          {model: Variedad},
          {
            model: Productor,
            include: [
              {model: Promotor, as: 'Promotor'},
              {model: Extensionista, as: 'Extensionista'}
            ]
          },
          {model: Sello},
          {model: Zona}
        ],
        where: filtros,
        order: [[orderColumn, orderDir]],
        limit: parseInt(length),
        offset: parseInt(start)
      });

       // Desestructurar el resultado en count y unidadesProductivas
      count = result.count; // Total de registros
      unidadesProductivas = result.rows; // Registros obtenidos

    }
    

    // Aplanar los datos antes de enviarlos a DataTables
    const data = unidadesProductivas.map(up => ({
      id: up.id,
      nombre: up.nombre,
      productor_codigo: up.productor_codigo ? up.productor_codigo : 'No Data',
      productor_nombre: up.Productor ? up.Productor.nombre : 'No Data',
      variedad_nombre: up.Variedad ? up.Variedad.descripcion : 'No Data',
      altitud_cat_nombre: up.AltitudCat ? up.AltitudCat.descripcion : 'No Data',
      sello_nombre: up.Sello ? up.Sello.descripcion : 'No Data',
      productor_extensionista: up.Productor && up.Productor.Extensionista ? up.Productor.Extensionista.descripcion : 'No Data',
      productor_promotor: up.Productor && up.Productor.Promotor ? up.Productor.Promotor.descripcion : 'No Data',
      corredor_nombre: up.Corredor ? up.Corredor.descripcion : 'No Data',
      comite_nombre: up.Comite ? up.Comite.descripcion : 'No Data',
      zona_nombre: up.Zona ? up.Zona.descripcion : 'No Data',
      cuenca_hidrografica_nombre: up.CuencaHidrografica ? up.CuencaHidrografica.descripcion : 'No Data',
      caserio_nombre: up.Caserio ? up.Caserio.descripcion : 'No Data',
      codigo_venta: up.codigo_venta,
      area_manual: up.area_ha,
      area_calc: up.area_poly_ha,
      ints_anp: up.ints_anp == '1' ?  'Sí' : 'No',
      area_ints_anp_m2: up.area_ints_anp_m2 ? parseFloat(up.area_ints_anp_m2).toFixed(2) : '-',
      porc_ints_anp: ((up.area_ints_anp_m2 / (up.area_poly_ha * 10000) ) * 100).toFixed(2) ,
      ints_za: up.ints_za == '1' ?  'Sí' : 'No',
      area_ints_za_m2: up.area_ints_za_m2 ? parseFloat(up.area_ints_za_m2).toFixed(2) : '-',
      porc_ints_za: ((up.area_ints_za_m2 / (up.area_poly_ha * 10000) ) * 100).toFixed(2),
      ints_deforestacion_2014: up.ints_deforestacion_2014 == '1' ?  'Sí' : 'No',
      area_ints_deforestacion_2014_m2: up.area_ints_deforestacion_2014_m2 ? parseFloat(up.area_ints_deforestacion_2014_m2).toFixed(2) : '-',
      porc_ints_deforestacion_2014: ((up.area_ints_deforestacion_2014_m2 / (up.area_poly_ha * 10000) ) * 100).toFixed(2) ,
      ints_deforestacion_2020: up.ints_deforestacion_2020 == '1' ?  'Sí' : 'No',      
      area_ints_deforestacion_2020_m2: up.area_ints_deforestacion_2020_m2 ? parseFloat(up.area_ints_deforestacion_2020_m2).toFixed(2) : '-',
      porc_deforestacion_2020: ((up.area_ints_deforestacion_2020_m2 / (up.area_poly_ha * 10000) ) * 100).toFixed(2) ,
      ints_parcelas_perhusa: up.ints_parcelas_perhusa == '1' ?  'Sí' : 'No',
      area_ints_parcelas_perhusa_m2: up.area_ints_parcelas_perhusa_m2 ? parseFloat(up.area_ints_parcelas_perhusa_m2).toFixed(2) : '-',
      porc_ints_parcelas_perhusa: ((up.area_ints_parcelas_perhusa_m2 / (up.area_poly_ha * 10000) ) * 100).toFixed(2) ,
    }));
    

    res.json({
      draw: parseInt(draw),
      recordsTotal: count,
      recordsFiltered: count,
      data: data
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al filtrar las unidades productivas' });
  }
};

exports.exportarExcelBackEnd = async (req, res) => {

  const { field, value, where_filtros } = req.query;
  console.log(where_filtros);

  var filtros = {};
  var filtro_codigo_venta = {};
  if(where_filtros){
    filtros = JSON.parse(where_filtros);
  }
  
  console.log(filtros);

  if(filtros){
    // Comprobar y remover comillas de los valores de filtros existentes
    filtros["altitud_cat_id"] != null ? filtros["altitud_cat_id"] = eval(filtros["altitud_cat_id"]) : null;
    filtros["zona_id"] != null ? filtros["zona_id"] = eval(filtros["zona_id"]) : null;
    filtros["corredor_id"] != null ? filtros["corredor_id"] = eval(filtros["corredor_id"]) : null;
    filtros["cuenca_hidrografica_id"] != null ? filtros["cuenca_hidrografica_id"] = eval(filtros["cuenca_hidrografica_id"]) : null;
    filtros["comite_id"] != null ? filtros["comite_id"] = eval(filtros["comite_id"]) : null;
    filtros["codigo_venta"] != null ? filtro_codigo_venta["codigo_venta"] = eval(filtros["codigo_venta"]) : null;
    filtros["variedad_id"] != null ? filtros["variedad_id"] = eval(filtros["variedad_id"]) : null;
    filtros["id"] != null ? filtros["id"] = eval(filtros["id"]) : null;

    //if(!('activa' in filtros)){
      //filtros["activa"] = '1';
      //filtros["eliminada"] = '0';
    //}
  
    filtros['parcela_gid'] = { [Op.not]: null };
  }

  if(req.session.user.rol == 3){
    filtros["zona_id"] = req.session.user.zona_id;
  }  
  

  filtros["activa"] = '1';
  filtros["eliminada"] = '0';

  console.log('=======filtros:');
  console.log(filtros);
  console.log('=======filtro_codigo_venta:');
  console.log(filtro_codigo_venta);

  try {

    let unidadesProductivas = [];

    if(filtros["codigo_venta"] != "['Todos']")
    {
      //Borrar filtro "codigo_venta" de la tabla "unidad_productiva"
      delete filtros["codigo_venta"];

      unidadesProductivas = await UnidadProductiva.findAll({
      include: 
      [
        {
          model: UnidadProductivaCodigoVenta,
          as: 'codigosVenta',
          where:  filtro_codigo_venta// Filtrando por codigo_venta
        },
        {model: Caserio},
        {model: Comite},
        {model: AltitudCat},
        {model: Corredor},
        {model: CuencaHidrografica},
        {model: Variedad},
        {
          model: Productor,
          include:
          [
            {model: Promotor, as: 'Promotor'},
            {model: Extensionista, as: 'Extensionista'}
          ]
        },
        {model: Sello},
        {model: Zona}
        //Caserio, Comite, AltitudCat, Corredor, CuencaHidrografica, Productor, Sello, Zona
      ], //Incluye el modelos en la consulta

      where: filtros
    });

    }
    else
    {
      delete filtros["codigo_venta"];
      unidadesProductivas = await UnidadProductiva.findAll({
        include: 
        [
          {model: Caserio},
          {model: Comite},
          {model: AltitudCat},
          {model: Corredor},
          {model: CuencaHidrografica},
          {model: Variedad},
          {
            model: Productor,
            include:
            [
              {model: Promotor, as: 'Promotor'},
              {model: Extensionista, as: 'Extensionista'}
            ]
          },
          {model: Sello},
          {model: Zona}
          //Caserio, Comite, AltitudCat, Corredor, CuencaHidrografica, Productor, Sello, Zona
        ], //Incluye el modelos en la consulta
  
        where: filtros
      });
      
    }

    

    // Crear un libro de trabajo de Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Unidades Productivas');

    // Agregar encabezados de columnas
    worksheet.columns = [
        { header: 'Código Parcela', key: 'codigo_parcela', width: 10 },
        { header: 'LPA Tipo', key: 'lpa_tipo', width: 24 },
        { header: 'Parcela', key: 'nombre', width: 24 },
        { header: 'Código Productor', key: 'codigo_productor', width: 24 },
        { header: 'Productor', key: 'productor', width: 24 },
        { header: 'Variedad', key: 'variedad', width: 24 },
        { header: 'Altitud', key: 'altitud', width: 24 },
        { header: 'Sello', key: 'sello', width: 24 },
        { header: 'Extensionista', key: 'extensionista', width: 24 },
        { header: 'Promotor', key: 'promotor', width: 24 },
        { header: 'Corredor', key: 'corredor', width: 24 },
        { header: 'Comite', key: 'comite', width: 24 },
        { header: 'Zona', key: 'zona', width: 24 },
        { header: 'Cuenca', key: 'cuenca', width: 24 },
        { header: 'Caserío', key: 'caserio', width: 24 },
        { header: 'Código Venta', key: 'codigo_venta', width: 10 },
        { header: 'Área ha Manual', key: 'area_ha', width: 10 },
        { header: 'Área ha Calc', key: 'area_poly_ha', width: 10 },
        { header: 'ANP', key: 'anp', width: 10 },
        { header: 'ANP m2', key: 'anp_m2', width: 10 },
        { header: 'ANP %', key: 'anp_porcentaje', width: 10 },
        { header: 'Zona Amort.', key: 'za', width: 10 },
        { header: 'ZA m2', key: 'za_m2', width: 10 },
        { header: 'ZA %', key: 'za_porcentaje', width: 10 },
        { header: 'DEF. 2014', key: 'def_2014', width: 10 },
        { header: 'DEF14 m2', key: 'def_2014_m2', width: 10 },
        { header: 'DEF14 %', key: 'def_2014_porcentaje', width: 10 },
        { header: 'DEF. 2020', key: 'def_2020', width: 10 },
        { header: 'DEF20 m2', key: 'def_2020_m2', width: 10 },
        { header: 'DEF20 %', key: 'def_2020_porcentaje', width: 10 },
        { header: 'Ints. Parcela', key: 'intersect_parcela', width: 10 },
        { header: 'Ints. Parcela m2', key: 'intersect_parcela_m2', width: 10 },
        { header: 'Ints. Parcela %', key: 'intersect_parcela_porcentaje', width: 10 },
        // Agrega más encabezados según tus campos
    ];

    // Agregar filas
    unidadesProductivas.forEach((unidad_productiva) => {

      // Asignando atributos en variables
      let parcela_nombre = unidad_productiva.nombre;
      let parcela_altitud = unidad_productiva.altitud;
      let parcela_codigo_venta = unidad_productiva.codigo_venta;

      let productor_codigo;
      let productor_nombre;
      let productor_f_nacimiento;
      let extensionista;
      let promotor;

      var productor_lpa_tipo;                           
      
      productor_codigo = unidad_productiva.productor_codigo;

      if(unidad_productiva.Productor != null)
      {
        //productor_codigo = unidad_productiva.Productor.codigo;
        
        productor_nombre = unidad_productiva.Productor.nombre;
        productor_f_nacimiento = unidad_productiva.Productor.f_nacimiento;
        extensionista = unidad_productiva.Productor.Extensionista;
        promotor = unidad_productiva.Productor.Promotor;
        productor_lpa_tipo = unidad_productiva.Productor.lpa_tipo;
      }
      
      let sello = unidad_productiva.Sello;
      let corredor = unidad_productiva.Corredor;
      let comite = unidad_productiva.Comite;
      let zona = unidad_productiva.Zona;
      let cuenca = unidad_productiva.CuencaHidrografica;
      let caserio = unidad_productiva.Caserio;
      let variedad = unidad_productiva.Variedad;

      //let parcela_area = unidad_productiva.area_ha;
      let parcela_area = unidad_productiva.area_ha;
      let parcela_area_poly = unidad_productiva.area_poly_ha;

      let parcela_area_m2;

      let ints_anp = unidad_productiva.ints_anp;
      let ints_za = unidad_productiva.ints_za;
      let ints_deforestacion_2014 = unidad_productiva.ints_deforestacion_2014;
      let ints_deforestacion_2020 = unidad_productiva.ints_deforestacion_2020;
      let ints_parcelas = unidad_productiva.ints_parcelas_perhusa;
      
      let area_ints_anp_m2 = unidad_productiva.area_ints_anp_m2;
      let area_ints_anp_percent;
      let html_measure_inst_anp;
      let area_ints_za_m2 = unidad_productiva.area_ints_za_m2;
      let area_ints_za_percent;
      let html_measure_inst_za;
      let area_ints_deforestacion_2014_m2 = unidad_productiva.area_ints_deforestacion_2014_m2;
      let area_ints_deforestacion_2014_percent;
      let html_measure_inst_deforestacion_2014;
      let area_ints_deforestacion_2020_m2 = unidad_productiva.area_ints_deforestacion_2020_m2;
      let area_ints_deforestacion_2020_percent;
      let html_measure_inst_deforestacion_2020;
      let area_ints_parcelas_m2 = unidad_productiva.area_ints_parcelas_perhusa_m2;
      let area_ints_parcelas_percent;

      // Comprobar Valores - Parcela - Nombre
      parcela_nombre != null ? parcela_nombre = parcela_nombre : parcela_nombre = 'No Data';
      // console.log(parcela_nombre);

      // Comprobar Valores - Parcela - Altitud
      parcela_altitud != null ? parcela_altitud = parcela_altitud  : parcela_altitud = 'No Data';
      // console.log(parcela_altitud);

      // Comprobar Valores - Parcela - Codigo Venta
      parcela_codigo_venta != null ? parcela_codigo_venta = parcela_codigo_venta  : parcela_codigo_venta = 'No Data';
      // console.log(parcela_codigo_venta);

      // Comprobar Valores - Productor - Codigo
      productor_codigo != null ? productor_codigo = productor_codigo : productor_codigo = 'No Data';
      // console.log(productor_codigo);

      // Comprobar Valores - Productor - Nombre
      productor_nombre != null ? productor_nombre != "" ? productor_nombre = productor_nombre : productor_nombre = "No Data" : productor_nombre = 'No Data';
      // console.log(productor_nombre);

      // Comprobar Valores - Productor - Fecha de Nacimiento
      productor_f_nacimiento != null ? productor_f_nacimiento : 'No Data';
      // console.log(productor_f_nacimiento);

      // Comprobar Valores - Productor - LPA Tipo
      productor_lpa_tipo != null ? productor_lpa_tipo = productor_lpa_tipo : productor_lpa_tipo = 'No Data';
      // console.log(productor_lpa_tipo);

      // Comprobar Valores - Sello
      sello != null ? sello = sello.descripcion : sello = 'No Data';
      // console.log(sello);

      // Comprobar Valores - Extensionista
      extensionista != null ? extensionista = extensionista.descripcion : extensionista = 'No Data';
      // console.log(extensionista);

      // Comprobar Valores - Promotor
      promotor != null ? promotor = promotor.descripcion : promotor = 'No Data';
      // console.log(promotor);

      // Comprobar Valores - Corredor
      corredor != null ? corredor = corredor.descripcion : corredor = 'No Data';
      // console.log(corredor);

      // Comprobar Valores - Comite
      comite != null ? comite = comite.descripcion : comite = 'No Data';
      // console.log(comite);

      // Comprobar Valores - Zona
      zona != null ? zona = zona.descripcion : zona = 'No Data';
      // console.log(zona);

      // Comprobar Valores - Cuenca Hidrografica
      cuenca != null ? cuenca = cuenca.descripcion : cuenca = 'No Data';
      // console.log(cuenca);

      // Comprobar Valores - Caserio
      caserio != null ? caserio = caserio.descripcion : caserio = 'No Data';
      // console.log(caserio);

      // Comprobar Valores - Variedad
      variedad != null ? variedad = variedad.descripcion : variedad = 'No Data';
      // console.log(caserio);

      // Comprobar Valores - Area
      if (parcela_area != null) 
      {
        
        //parcela_area = parcela_area * 10000;
        parcela_area = parseFloat(parcela_area).toFixed(2);
        parcela_area_m2 = parcela_area*10000;
        parcela_area = numberWithCommas(parcela_area);
      }
      else
      {
        parcela_area = 'No Data'
      }

      // Comprobar Valores - Area poly
      if (parcela_area_poly != null) 
        {
          
          //parcela_area_poly = parcela_area_poly * 10000;
          parcela_area_poly = parseFloat(parcela_area_poly).toFixed(2);
          parcela_area_poly_m2 = parcela_area_poly*10000;
          parcela_area_poly = numberWithCommas(parcela_area_poly);
        }
        else
        {
          parcela_area_poly = 'No Data'
        }
      // console.log(parcela_area);

      // Comprobar Valores - Intersección ANP
      if (ints_anp == '1') 
      {
        ints_anp = 'Sí'
        area_ints_anp_m2 = parseFloat(area_ints_anp_m2).toFixed(2);
        area_ints_anp_percent = area_ints_anp_m2 / parcela_area_m2 * 100;
        area_ints_anp_percent = area_ints_anp_percent.toFixed(2);
        area_ints_anp_m2 = numberWithCommas(area_ints_anp_m2);

        html_measure_inst_anp = area_ints_anp_m2 + '<br> ' + area_ints_anp_percent + ' %';
        
      }
      else
      {
        ints_anp = 'No';
        area_ints_anp_m2 = '-';
        area_ints_anp_percent = '-';
        html_measure_inst_anp = '-';
      }

      // Comprobar Valores - Intersección ZA
      if (ints_za == '1') 
      {
        ints_za = 'Sí'
        area_ints_za_m2 = parseFloat(area_ints_za_m2).toFixed(2);
        area_ints_za_percent = area_ints_za_m2 / parcela_area_m2 * 100;
        area_ints_za_percent = area_ints_za_percent.toFixed(2);
        area_ints_za_m2 = numberWithCommas(area_ints_za_m2);

        html_measure_inst_za = area_ints_za_m2 + '<br> ' + area_ints_za_percent + ' %';
      }
      else
      {
        ints_za = 'No';
        area_ints_za_m2 = '-';
        area_ints_za_percent = '-';
        html_measure_inst_za = '-';
      }

      // Comprobar Valores - Intersección Deforestacion 2014
      if (ints_deforestacion_2014 == '1') 
      {
        ints_deforestacion_2014 = 'Sí'
        area_ints_deforestacion_2014_m2 = parseFloat(area_ints_deforestacion_2014_m2).toFixed(0);
        area_ints_deforestacion_2014_percent = area_ints_deforestacion_2014_m2 / parcela_area_m2 * 100;
        area_ints_deforestacion_2014_percent = area_ints_deforestacion_2014_percent.toFixed(2);
        area_ints_deforestacion_2014_m2 = numberWithCommas(area_ints_deforestacion_2014_m2);

        html_measure_inst_deforestacion_2014 = area_ints_deforestacion_2014_m2 + '<br> ' + area_ints_deforestacion_2014_percent + ' %';
        
      }
      else
      {
        ints_deforestacion_2014 = 'No';
        area_ints_deforestacion_2014_m2 = '-';
        area_ints_deforestacion_2014_percent = '-';
        html_measure_inst_deforestacion_2014 = '-';
      }

      // Comprobar Valores - Intersección Deforestacion 2020
      if (ints_deforestacion_2020 == '1') 
      {
        ints_deforestacion_2020 = 'Sí'  
        area_ints_deforestacion_2020_m2 = parseFloat(area_ints_deforestacion_2020_m2).toFixed(0);
        area_ints_deforestacion_2020_percent = area_ints_deforestacion_2020_m2 / parcela_area_m2 * 100;
        area_ints_deforestacion_2020_percent = area_ints_deforestacion_2020_percent.toFixed(2);
        area_ints_deforestacion_2020_m2 = numberWithCommas(area_ints_deforestacion_2020_m2);

        html_measure_inst_deforestacion_2020 = area_ints_deforestacion_2020_m2 + '<br> ' + area_ints_deforestacion_2020_percent + ' %';
      }
      else
      {
        ints_deforestacion_2020 = 'No';
        area_ints_deforestacion_2020_m2 = '-';
        area_ints_deforestacion_2020_percent = '-';
        html_measure_inst_deforestacion_2020 = '-';
      }

      // Comprobar Valores - Intersección Parcelas
      if (ints_parcelas == '1') 
      {
        ints_parcelas = 'Sí'
        area_ints_parcelas_m2 = parseFloat(area_ints_parcelas_m2).toFixed(2);
        area_ints_parcelas_percent = area_ints_parcelas_m2 / parcela_area_m2 * 100;
        area_ints_parcelas_percent = area_ints_parcelas_percent.toFixed(2);
        area_ints_parcelas_m2 = numberWithCommas(area_ints_parcelas_m2);

        html_measure_inst_anp = area_ints_parcelas_m2 + '<br> ' + area_ints_parcelas_percent + ' %';
        
      }
      else
      {
        ints_anp = 'No';
        area_ints_anp_m2 = '-';
        area_ints_anp_percent = '-';
        html_measure_inst_anp = '-';
      }
            
      //console.log(unidad_productiva);
      worksheet.addRow({
          codigo_parcela: unidad_productiva.id,
          lpa_tipo: productor_lpa_tipo,
          nombre: parcela_nombre,
          codigo_productor: productor_codigo,
          productor: productor_nombre,
          variedad: variedad,
          altitud: parcela_altitud,
          sello: sello,
          extensionista: extensionista,
          promotor: promotor,
          corredor: corredor,
          comite: comite,
          zona: zona,
          cuenca: cuenca,
          caserio: caserio,
          codigo_venta: parcela_codigo_venta,
          area_ha: parcela_area,
          area_poly_ha: parcela_area_poly,
          anp: ints_anp,
          anp_m2: area_ints_anp_m2,
          anp_porcentaje: area_ints_anp_percent,
          za: ints_za,
          za_m2: area_ints_za_m2,
          za_porcentaje: area_ints_za_percent,
          def_2014: ints_deforestacion_2014,
          def_2014_m2: area_ints_deforestacion_2014_m2,
          def_2014_porcentaje: area_ints_deforestacion_2014_percent,
          def_2020: ints_deforestacion_2020,
          def_2020_m2: area_ints_deforestacion_2020_m2,
          def_2020_porcentaje: area_ints_deforestacion_2020_percent,
          intersect_parcela: ints_parcelas,
          intersect_parcela_m2: area_ints_parcelas_m2,
          intersect_parcela_porcentaje: area_ints_parcelas_percent
        });
    });

    // Enviar el archivo Excel como respuesta
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=unidades_productivas.xlsx');

    await workbook.xlsx.write(res);

    res.end();

    //res.json(unidadesProductivas);   

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al filtrar las unidades productivas' });
  }
};

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


exports.getUnidadProductivaByVariedad = async (req, res) => {
  try {
    const variedadId = req.query.variedadId; // Obtén el ID de la variedad desde la solicitud
    const unidadProductivas = await UnidadProductiva.findAll({
      include: [
        {
          model: Campanha,
          required: true,
          include: [
            {
              model: CampanhaVariedad,
              required: true,
              include: [{ model: Variedad, where: { id: variedadId } }],
            },
          ],
        }
      ],
      where: { activa: '1', eliminada: '0', parcela_gid: { [Op.not]: null }}
    });
    res.json(unidadProductivas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener las unidades productivas' });
  }
};

// Obtener todos los códigos de venta únicos
exports.getAllCodigoVenta = async (req, res) => {
  try {
    const uniqueCodigosVenta = await UnidadProductiva.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('codigo_venta')), 'codigo_venta']],
      raw: true,
      where: {
        codigo_venta: {
          [Op.ne]: null, // Solo obtiene los valores que no son nulos
        },
      },
    });

    // La variable uniqueCodigosVenta contendrá un array de objetos con la propiedad 'codigo_venta'
    // Solo para simplificar la respuesta, vamos a transformar el array de objetos en un array de códigos de venta únicos.
    const codigosVentaUnicos = uniqueCodigosVenta.map((unidadProductiva) => unidadProductiva.codigo_venta);

    res.json(codigosVentaUnicos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los códigos de venta' });
  }
};

exports.cargarCSVUnidadProductiva = async (req, res) => {
  const filePath = req.file.path; // Ruta al archivo CSV subido (debe ser manejado por un middleware que maneje los archivos)

  const results = [];

  fs.createReadStream(filePath)
    .pipe(csv({ separator: ';' }))
    .on('data', (data) => {
      results.push(data);
    })
    .on('end', async () => {
      try {
        for (const row of results) {
          console.log(row);
          const id = row.id; // Obtenemos el valor del id
          
          // Crear un objeto con las columnas a actualizar
          const updateFields = {};
          for (const column in row) {
            if (column !== 'id') {
              if(row[column] == '') updateFields[column] = null;
              else updateFields[column] = row[column];
            }
          }

          console.log(updateFields);
  
          // Realizar la actualización
          await UnidadProductiva.update(updateFields, { where: { id } });
        }
        
        res.status(200).json({ message: 'Actualización exitosa' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al cargar y actualizar desde el archivo CSV' });
      } finally {
        // Borra el archivo CSV temporal después de procesarlo
        fs.unlinkSync(filePath);
      }
    });
};

exports.cargarCSVEliminarUnidadProductiva = async (req, res) => {
  const filePath = req.file.path; // Ruta al archivo CSV subido (debe ser manejado por un middleware que maneje los archivos)

  const results = [];

  fs.createReadStream(filePath)
    .pipe(csv({ separator: ';' }))
    .on('data', (data) => {
      results.push(data);
    })
    .on('end', async () => {
      try {
        for (const row of results) {
          console.log(row);
          const id = row.id; // Obtenemos el valor del id
          
          // Crear un objeto con las columnas a actualizar
          const updateFields = {};
          for (const column in row) {
            if (column !== 'id') {
              if(row[column] == '') updateFields[column] = null;
              else updateFields[column] = row[column];
            }
          }

          console.log(updateFields);
  
          // Realizar la actualización
          await UnidadProductiva.update(
            { 
              activa: 0,
              eliminada: 1
            }
            , { where: { id } });
        }
        
        res.status(200).json({ message: 'Actualización exitosa' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al cargar y actualizar desde el archivo CSV' });
      } finally {
        // Borra el archivo CSV temporal después de procesarlo
        fs.unlinkSync(filePath);
      }
    });
};

exports.cargarCSVCrearUnidadProductiva = async (req, res) => {
  const filePath = req.file.path; // Ruta al archivo CSV subido (debe ser manejado por un middleware que maneje los archivos)

  const results = [];

  fs.createReadStream(filePath)
    .pipe(csv({ separator: ';' }))
    .on('data', (data) => {
      results.push(data);
    })
    .on('end', async () => {
      try {
        for (const row of results) {
          console.log(row);

          const maxGid = await ParcelaCafe.max('gid'); // Encuentra el valor máximo actual de gid
          const newGid = maxGid + 1;

          //const id = row.id; // Obtenemos el valor del id
          if (row.hasOwnProperty('WKT')){
            var geom = row['WKT'];
            console.log(geom);

            var gid_parcela = await ParcelaCafe.create({
              gid: newGid,
              geom: sequelize.literal('ST_GeomFromText(\''+ geom +'\',4326)'),
            });
            console.log("GID_PARCELA");
            console.log(gid_parcela);
            console.log(gid_parcela.gid);
          }
          else if (row.hasOwnProperty('X') && row.hasOwnProperty('Y')) {
            const x = parseFloat(row['X']);
            const y = parseFloat(row['Y']);
            let bufferArea = 10000; // 1 hectare in square meters
    
            if (row.hasOwnProperty('area_ha')) {
              const area_ha = parseFloat(row['area_ha']);
              if (!isNaN(area_ha) && area_ha > 0) {
                bufferArea = area_ha * 10000; // Convert hectares to square meters
              }
            }

            // Calculate the radius for the buffer in meters
            const bufferRadius = Math.sqrt(bufferArea / Math.PI);
    
            geom = `POINT(${x} ${y})`;
    
            var gid_parcela = await ParcelaCafe.create({
              gid: newGid,
              geom: sequelize.literal(`
                                        ST_Multi(
                                          ST_Transform(
                                            ST_Buffer(
                                              ST_Transform(
                                                ST_SetSRID(ST_MakePoint(${x}, ${y}), 4326),
                                                32718
                                              ),
                                              ${bufferRadius}
                                            ),
                                            4326
                                          )
                                        )
                                        `)
            });
          } else {
            console.log('No valid geometry information found in the row.');
            res.status(500).json({ message: 'No existe información para las geometrías en el CSV' });
            return;
          }

          gid_parcela = gid_parcela.gid;

          // Crear UnidadProductiva
          const unidadProductiva = await UnidadProductiva.create({
            parcela_gid: gid_parcela
          })
          
          // Crear un objeto con las columnas a actualizar
          const updateFields = {};
          for (const column in row) {
            if (column !== 'id' && column !== 'geom') {
              if(row[column] == ''){
                updateFields[column] = null;
              }
              else{
                updateFields[column] = row[column];
              }              
            }
          }

          // Verificar si existe la columna 'productor_codigo' y crear el productor si existe
          if (row.hasOwnProperty('productor_codigo')) {
            const productorCodigo = row['productor_codigo'];

            // Buscar si ya existe un productor con el 'productor_codigo'
            let productor = await Productor.findOne({
              where: { codigo: productorCodigo }
            });

            // Si no existe, crear uno nuevo
            if (!productor) {
              if (row.hasOwnProperty('WKT')){
                productor = await Productor.create({
                  codigo: productorCodigo
                  // Puedes agregar otros campos necesarios aquí
                });
              }
              else if (row.hasOwnProperty('X') && row.hasOwnProperty('Y')){
                productor = await Productor.create({
                  codigo: productorCodigo,
                  lpa_tipo: 'CONVENCIONAL'
                  // Puedes agregar otros campos necesarios aquí
                });
              }
            }

            // Actualizar UnidadProductiva con el id del Productor
            await UnidadProductiva.update(
              { 
                productor_id: productor.id,
                productor_codigo: productorCodigo
              },
              { where: { parcela_gid: gid_parcela } }
            );
          }

          

          //Actualizar area_poly_ha e Intersecciones
          var query = `UPDATE unidad_productiva
          SET area_poly_ha = ST_Area(ST_Transform(q.geom, 32718))/10000
          FROM(
              SELECT gid, geom
              FROM parcelas_cafe
              WHERE gid = ${gid_parcela}
          ) as q
          WHERE parcela_gid = ${gid_parcela};`

          await ParcelaCafe.sequelize.query(query, {
            type: ParcelaCafe.sequelize.QueryTypes.UPDATE,
          });

          //TODO
          //Mejorar esta funcionalidad, intersecta en todas las parcelas
          /*
          query = `SELECT funcion_calcular_intersecciones();`

          await ParcelaCafe.sequelize.query(query, {
            type: ParcelaCafe.sequelize.QueryTypes.SELECT,
          });
          */

          updateFields['nueva'] = '0';
          console.log(updateFields);
  
          // Realizar la actualización
          await UnidadProductiva.update(updateFields, { where: { 'parcela_gid' : gid_parcela } });
        }
        
        res.status(200).json({ message: 'Actualización exitosa' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al cargar y actualizar desde el archivo CSV' });
      } finally {
        // Borra el archivo CSV temporal después de procesarlo
        try {
          await fs.unlink(filePath);
        } catch (unlinkError) {
          console.error(`Error al borrar el archivo: ${unlinkError.message}`);
        }
      }
    });
};

exports.calcularInterseccion = async (req, res) =>{
  const startTime = new Date();

    try {
        const query = `SELECT funcion_calcular_intersecciones();`;
        await ParcelaCafe.sequelize.query(query, {
            type: ParcelaCafe.sequelize.QueryTypes.SELECT,
        });

        const endTime = new Date();
        const executionTime = endTime - startTime; // Tiempo en milisegundos

        res.json({ success: true, executionTime });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
}

exports.getDataDashboard = async (req, res) => {
  
  try {

    var _where = {};

    console.log(req.query);
    if(req.query){

      if('k' in req.query){
        if(req.query['k'] != '1f5b71446a6c225955a5c251a2156e5c'){
          return res.json({"message":"error"});
        }
      }
      else{
        return res.json({"message":"error"});
      }

      if('zona_id' in req.query){
        /*
        _where = {        
          'zona_id' : req.query['zona_id']
        }
        */
        _where['zona_id'] = req.query['zona_id']
      }
      if('fecha_creacion' in req.query){
        /*
        _where = {        
          'fecha_creacion' : {
            [Op.gt]: req.query['fecha_creacion']
          }
        }
        */
        _where['fecha_creacion'] = {
          [Op.gt]: req.query['fecha_creacion']
        }
      }
      if('auth_user_id' in req.query){
        /*
        _where = {        
          'auth_user_id' : req.query['auth_user_id']
        }
        */
        _where['auth_user_id'] = req.query['auth_user_id']
      }
      if('activa' in req.query){
        _where['activa'] = req.query['activa'];
      }
      if('eliminada' in req.query){
        _where['eliminada'] = req.query['eliminada'];
      }
    }

    if(req.session.user){
      
      console.log(req.session.user.zona_id);

      console.log(req.session.user.rol);

      if(req.session.user.rol == 3){
        _where = {
          'zona_id' : req.session.user.zona_id
        }
      }
    }

    _where['parcela_gid'] = { [Op.not]: null };

    console.log(_where);

    const unidadesProductivas = await UnidadProductiva.findAll({
      include: 
      [        
        {
          model: Productor,
        },
        {model: Zona}
        //Caserio, Comite, AltitudCat, Corredor, CuencaHidrografica, Productor, Sello, Zona
      ], //Incluye el modelos en la consulta
      where: _where,
      order: [['id', 'DESC']]
    });

    // Modificar la estructura de fecha_creacion
    const unidadesProductivasConFechaModificada = unidadesProductivas.map((unidad) => {
      // Obtener la fecha y hora de fecha_creacion
      const fechaHoraString = unidad.fecha_creacion;
      const fechaHora = new Date(fechaHoraString);

      // Restar 5 horas
      fechaHora.setHours(fechaHora.getHours() - 10);

      // Obtener la fecha en formato YYYY-MM-DD
      const fechaFormateada = fechaHora.toISOString().split("T")[0];

      // Obtener la hora en formato HH:MM:SS
      const horaFormateada = fechaHora.toISOString().split("T")[1].substring(0, 8);

      // Crear un nuevo objeto con la propiedad fecha y hora
      const unidadModificada = {
        ...unidad.toJSON(), // Copiar todas las propiedades existentes
        fecha: fechaFormateada, // Obtener la fecha
        hora: horaFormateada // Obtener la hora
      };

      // Eliminar la propiedad fecha_creacion si es necesario
      delete unidadModificada.fecha_creacion;

      return unidadModificada;
    });

    return res.json(unidadesProductivasConFechaModificada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los caseríos relacionados a las unidades productivas' });
  }
};

module.exports = exports;
