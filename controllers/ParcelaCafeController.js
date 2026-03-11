const ParcelaCafe = require('../models/ParcelaCafe');
const Productor = require('../models/Productor');
const UnidadProductiva = require('../models/UnidadProductiva');
const ProcesoPerformance = require('../models/ProcesoPerformance');
const GuardarBackupApp = require('../models/GuardarBackupApp');

const { ee } = require('../utils/earthEngine');
//const shapefile = require('shapefile');
const fs = require('fs');

//Funciones para el cálculo de índices
const calculoNdvi = require('./calculo_indices/calculoNdvi.js');
const calculoEvi = require('./calculo_indices/calculoEvi.js');
const calculoEvi2 = require('./calculo_indices/calculoEvi2.js');
const calculoNdwi = require('./calculo_indices/calculoNdwi.js');
const calculoMcari = require('./calculo_indices/calculoMcari.js');
const calculoReci = require('./calculo_indices/calculoReci.js');
const calculoTemperatura = require('./calculo_indices/calculoTemperatura');
const calculoHumedad = require('./calculo_indices/calculoHumedad');
const calculoPrecipitacion = require('./calculo_indices/calculoPrecipitacion.js');

const { performance } = require('perf_hooks');

const { Worker, isMainThread, parentPort } = require('worker_threads');

let analysisPromise = null;

let worker;

// Obtener todas las parcelas de café
async function obtenerParcelasCafe(req, res) {
  try {
    const parcelasCafe = await ParcelaCafe.findAll();
    res.json(parcelasCafe);
  } catch (error) {
    console.error('Error al obtener las parcelas de café:', error);
    res.status(500).json({ error: 'Ocurrió un error al obtener las parcelas de café' });
  }
}

// Obtener una parcela de café por su ID
async function obtenerParcelaCafePorId(req, res) {
  const { id } = req.params;
  try {
    const parcelaCafe = await ParcelaCafe.findByPk(id);
    if (parcelaCafe) {
      res.json(parcelaCafe);
    } else {
      res.status(404).json({ error: 'Parcela de café no encontrada' });
    }
  } catch (error) {
    console.error('Error al obtener la parcela de café:', error);
    res.status(500).json({ error: 'Ocurrió un error al obtener la parcela de café' });
  }
}

// Crear una nueva parcela de café
async function crearParcelaCafe(req, res) {
  const { objectid, geom } = req.body;
  try {
    const nuevaParcelaCafe = await ParcelaCafe.create({ objectid, geom });
    res.status(201).json(nuevaParcelaCafe);
  } catch (error) {
    console.error('Error al crear la parcela de café:', error);
    res.status(500).json({ error: 'Ocurrió un error al crear la parcela de café' });
  }
}

// Actualizar una parcela de café existente
async function actualizarParcelaCafe(req, res) {
  const { id } = req.params;
  const { objectid, geom } = req.body;
  try {
    const parcelaCafe = await ParcelaCafe.findByPk(id);
    if (parcelaCafe) {
      parcelaCafe.objectid = objectid;
      parcelaCafe.geom = geom;
      await parcelaCafe.save();
      res.json(parcelaCafe);
    } else {
      res.status(404).json({ error: 'Parcela de café no encontrada' });
    }
  } catch (error) {
    console.error('Error al actualizar la parcela de café:', error);
    res.status(500).json({ error: 'Ocurrió un error al actualizar la parcela de café' });
  }
}

// Eliminar una parcela de café existente
async function eliminarParcelaCafe(req, res) {
  const { id } = req.params;
  try {
    const parcelaCafe = await ParcelaCafe.findByPk(id);
    if (parcelaCafe) {
      await parcelaCafe.destroy();
      res.json({ mensaje: 'Parcela de café eliminada correctamente' });
    } else {
      res.status(404).json({ error: 'Parcela de café no encontrada' });
    }
  } catch (error) {
    console.error('Error al eliminar la parcela de café:', error);
    res.status(500).json({ error: 'Ocurrió un error al eliminar la parcela de café' });
  }
}

//Esta funcion no puede hacer distincion entre UP activas o no, ya que es la funcion que utilizan la APP de levantamiento para obtener las parcelas
async function obtenerParcelasCafeGeoJSON(req, res) {

  // Obtener el parámetro "zona_id" de la URL o del cuerpo de la solicitud POST
  const zona_id = req.query.zona_id || req.body.zona_id;
  const fecha_creacion = req.query.fecha_creacion || req.body.fecha_creacion;
  const auth_user_id = req.query.auth_user_id || req.body.auth_user_id;

  const id = req.query.id || req.body.id;
  const ids = req.query.ids || req.body.ids;

  console.log(zona_id);
  console.log(fecha_creacion);

  //var where = ' WHERE u.activa = \'1\' AND u.nueva = \'0\' ';
  var where = ' WHERE u.nueva = \'0\' AND u.eliminada = \'0\' ';

  if (zona_id) {
    // Aquí puedes usar el valor de "zona_id" en tu lógica de negocio

    // Por ejemplo, si necesitas utilizar "zona_id" en la consulta a la base de datos
    // puedes construir la cláusula "WHERE" de esta manera:
    where += ` AND u.zona_id = ${zona_id} `;

    // Luego puedes utilizar la variable "where" en tu consulta para filtrar por zona_id
    // Ejemplo:
    // const resultado = await sequelize.query(`SELECT * FROM parcelas WHERE ${where}`);

    // Aquí continuaría el resto de tu lógica...
  }

  if (fecha_creacion) {
    //where += ` AND u.fecha_creacion > '${fecha_creacion}' `;//ultima edicion
  }

  if (auth_user_id) {
    //where += ` AND u.auth_user_id = '${auth_user_id}' `;
    //where += " AND p.lpa_origen IN ('INSPECCION 2023','INSPECCION 2024') ";//ultima edicion
  }

  if (id) {
    where += ` AND u.id = '${id}' `;
  }

  if (ids) {
    let parcelas = '(';
    for (let i = 0; i < ids.length; i++) {
      // const element = array[i];
      parcelas += ids[i];

      if (i < ids.length - 1) {
        parcelas += ',';
      }
    }
    parcelas += ')';

    where += ` AND u.id IN ${parcelas} `;

  }

  try {
    var query = `
                    SELECT jsonb_build_object(
                        'type', 'FeatureCollection',
                        'features', jsonb_agg(feature)
                    )::text AS geojson
                    FROM (
                        SELECT jsonb_build_object(
                        'type', 'Feature',
                        'properties', (to_jsonb(u) || jsonb_build_object('productor_nombre', p.nombre) || jsonb_build_object('productor_dni', p.dni) || jsonb_build_object('productor_imagen', p.imagen) || jsonb_build_object('variedad_descripcion', v.descripcion) || jsonb_build_object('zona_descripcion', z.descripcion) || jsonb_build_object('unidad_productiva_id', u.id) || jsonb_build_object('area_ha', ROUND(u.area_ha::numeric, 3))),
                        'geometry', ST_AsGeoJSON(geom)::jsonb
                        ) AS feature
                        FROM parcelas_cafe AS t
                        INNER JOIN unidad_productiva u
                        ON t.gid=u.parcela_gid
                        LEFT JOIN productor p
                        ON u.productor_id=p.id
                        LEFT JOIN variedad v
                        ON u.variedad_id=v.id
                        LEFT JOIN zona z
                        ON u.zona_id=z.id
                        ${where}
                    ) AS features;
                    `;

    /*
    query= `
                SELECT jsonb_build_object(
                    'type', 'FeatureCollection',
                    'features', jsonb_agg(feature)
                )::text AS geojson
                FROM (
                    SELECT jsonb_build_object(
                    'type', 'Feature',
                    'properties', (to_jsonb(u)),
                    'geometry', ST_AsGeoJSON(geom)::jsonb
                    ) AS feature
                    FROM parcelas_cafe AS t
                    INNER JOIN unidad_productiva u
                    ON t.gid=u.parcela_gid
                ) AS features;
                `;
    */

    const result = await realizarConsulta(query);

    const geojsonText = result[0].geojson;
    res.json(geojsonText);
  } catch (error) {
    console.error('Error al consultar la base de datos:', error);
    res.status(500).json({ error: 'Ocurrió un error al consultar la base de datos' });
  }
}

async function obtenerNuevasParcelasCafeGeoJSON(req, res) {

  // Obtener el parámetro "zona_id" de la URL o del cuerpo de la solicitud POST
  const zona_id = req.query.zona_id || req.body.zona_id;

  console.log(zona_id);

  var where = ' WHERE u.activa = \'1\' AND u.nueva = \'1\' AND geom IS NOT NULL ';

  if (zona_id) {
    // Aquí puedes usar el valor de "zona_id" en tu lógica de negocio

    // Por ejemplo, si necesitas utilizar "zona_id" en la consulta a la base de datos
    // puedes construir la cláusula "WHERE" de esta manera:
    where = ` AND u.zona_id = ${zona_id} `;

    // Luego puedes utilizar la variable "where" en tu consulta para filtrar por zona_id
    // Ejemplo:
    // const resultado = await sequelize.query(`SELECT * FROM parcelas WHERE ${where}`);

    // Aquí continuaría el resto de tu lógica...
  }

  try {
    var query = `
                  SELECT jsonb_build_object(
                      'type', 'FeatureCollection',
                      'features', jsonb_agg(feature)
                  )::text AS geojson
                  FROM (
                      SELECT jsonb_build_object(
                      'type', 'Feature',
                      'properties', (to_jsonb(u)),
                      'geometry', ST_AsGeoJSON(geom)::jsonb
                      ) AS feature
                      FROM parcelas_cafe AS t
                      INNER JOIN unidad_productiva u
                      ON t.gid=u.parcela_gid
                      ${where}
                  ) AS features;
                  `;

    const result = await realizarConsulta(query);

    const geojsonText = result[0].geojson;
    res.json(geojsonText);
  } catch (error) {
    console.error('Error al consultar la base de datos:', error);
    res.status(500).json({ error: 'Ocurrió un error al consultar la base de datos' });
  }
}

async function obtenerParcelasCafeGeoJSONStatus(req, res) {

  // Obtener el parámetro "zona_id" de la URL o del cuerpo de la solicitud POST
  const zona_id = req.query.zona_id || req.body.zona_id;
  const fecha_creacion = req.query.fecha_creacion || req.body.fecha_creacion;
  const auth_user_id = req.query.auth_user_id || req.body.auth_user_id;
  const parcela_gid = req.query.parcela_gid || req.body.parcela_gid;

  const eliminada = req.query.eliminada || req.body.eliminada;

  console.log(zona_id);
  console.log(fecha_creacion);

  //var where = ' WHERE u.activa = \'1\' AND u.nueva = \'0\' ';
  var where = ' WHERE u.nueva = \'0\' AND u.eliminada = \'0\'';

  if (zona_id) {
    where += ` AND u.zona_id = ${zona_id} `;
  }

  if (fecha_creacion) {
    where += ` AND u.fecha_creacion > '${fecha_creacion}' `;
  }

  if (auth_user_id) {
    where += ` AND u.auth_user_id = '${auth_user_id}' `;
  }

  if (parcela_gid) {
    where += ` AND u.parcela_gid = '${parcela_gid}' `;
  }

  /**/
  if (eliminada) {
    where += ` AND u.eliminada = '${auth_user_id}' `;
  }

  try {
    var query = `
                  SELECT jsonb_build_object(
                      'type', 'FeatureCollection',
                      'features', jsonb_agg(feature)
                  )::text AS geojson
                  FROM (
                      SELECT jsonb_build_object(
                      'type', 'Feature',
                      'properties', (to_jsonb(u) || jsonb_build_object('productor_nombre', p.nombre) || jsonb_build_object('productor_dni', p.dni) || jsonb_build_object('productor_imagen', p.imagen) || jsonb_build_object('variedad_descripcion', v.descripcion) || jsonb_build_object('zona_descripcion', z.descripcion) || jsonb_build_object('area_ha', ROUND(u.area_ha::numeric, 3))),
                      'geometry', ST_AsGeoJSON(geom)::jsonb
                      ) AS feature
                      FROM parcelas_cafe AS t
                      INNER JOIN unidad_productiva u
                      ON t.gid=u.parcela_gid
                      LEFT JOIN productor p
                      ON u.productor_id=p.id
                      LEFT JOIN variedad v
                      ON u.variedad_id=v.id
                      LEFT JOIN zona z
                      ON u.zona_id=z.id
                      ${where}
                      ORDER BY u.id DESC
                  ) AS features;
                  `;

    const result = await realizarConsulta(query);

    const geojsonText = result[0].geojson;
    res.json(geojsonText);
  } catch (error) {
    console.error('Error al consultar la base de datos:', error);
    res.status(500).json({ error: 'Ocurrió un error al consultar la base de datos' });
  }
}

async function obtenerParcelasCafeGeoJSONMonitoreo(req, res) {

  // Obtener el parámetro "zona_id" de la URL o del cuerpo de la solicitud POST
  const zona_id = req.query.zona_id || req.body.zona_id;
  const fecha_creacion = req.query.fecha_creacion || req.body.fecha_creacion;
  const auth_user_id = req.query.auth_user_id || req.body.auth_user_id;
  const parcela_gid = req.query.parcela_gid || req.body.parcela_gid;

  const eliminada = req.query.eliminada || req.body.eliminada;

  const minLng = parseFloat(req.query.minLng) || parseFloat(req.body.minLng);
  const minLat = parseFloat(req.query.minLat) || parseFloat(req.body.minLat);
  const maxLng = parseFloat(req.query.maxLng) || parseFloat(req.body.maxLng);
  const maxLat = parseFloat(req.query.maxLat) || parseFloat(req.body.maxLat);

  const lpa_tipo_convencional = req.query.lpa_tipo_convencional || req.body.lpa_tipo_convencional;
  const lpa_tipo_organico = req.query.lpa_tipo_organico || req.body.lpa_tipo_organico;

  console.log(zona_id);
  console.log(fecha_creacion);

  var where = ' WHERE u.activa = \'1\' AND u.nueva = \'0\' AND u.eliminada = \'0\' ';
  //var where = ' WHERE u.nueva = \'0\' ';

  if (zona_id) {
    where += ` AND u.zona_id = ${zona_id} `;
  }

  if (fecha_creacion) {
    where += ` AND u.fecha_creacion > '${fecha_creacion}' `;
  }

  if (auth_user_id) {
    where += ` AND u.auth_user_id = '${auth_user_id}' `;
  }
  /**/
  if (eliminada) {
    where += ` AND u.eliminada = '${eliminada}' `;
  }

  if (parcela_gid) {
    where += ` AND u.parcela_gid = '${parcela_gid}' `;
  }

  if (lpa_tipo_convencional && lpa_tipo_organico) {
    if (lpa_tipo_convencional === 'CONVENCIONAL' && lpa_tipo_organico === 'ORGANICO') {
      where += ` AND p.lpa_tipo IN ('${lpa_tipo_organico}', '${lpa_tipo_convencional}') `;

    }
    else if (lpa_tipo_convencional === 'QUITAR-CONVENCIONAL' && lpa_tipo_organico === 'ORGANICO') {

      where += ` AND p.lpa_tipo = '${lpa_tipo_organico}' `;
    }

    else if (lpa_tipo_convencional === 'CONVENCIONAL' && lpa_tipo_organico === 'QUITAR-ORGANICO') {

      where += ` AND p.lpa_tipo = '${lpa_tipo_convencional}' `;
    }

    else if (lpa_tipo_convencional === 'QUITAR-CONVENCIONAL' && lpa_tipo_organico === 'QUITAR-ORGANICO') {

      where += ` AND p.lpa_tipo is null `;
    }

  }

  if (!isNaN(minLng) && !isNaN(minLat) && !isNaN(maxLng) && !isNaN(maxLat)) {
    where += ` AND ST_Intersects(t.geom, ST_MakeEnvelope(${minLng}, ${minLat}, ${maxLng}, ${maxLat}, 4326)) `;
  }

  try {
    var query = `
                  SELECT jsonb_build_object(
                      'type', 'FeatureCollection',
                      'features', jsonb_agg(feature)
                  )::text AS geojson
                  FROM (
                      SELECT jsonb_build_object(
                      'type', 'Feature',
                      'properties', (to_jsonb(u) || jsonb_build_object('productor_nombre', p.nombre) || jsonb_build_object('productor_dni', p.dni) || jsonb_build_object('productor_imagen', p.imagen) || jsonb_build_object('productor_lpa_anho', p.lpa_anho) || jsonb_build_object('productor_lpa_tipo', p.lpa_tipo) || jsonb_build_object('productor_lpa_origen', p.lpa_origen) || jsonb_build_object('variedad_descripcion', v.descripcion) || jsonb_build_object('zona_descripcion', z.descripcion) || jsonb_build_object('caserio_descripcion', ca.descripcion)  || jsonb_build_object('comite_descripcion', co.descripcion) || jsonb_build_object
                      ('sello_descripcion', s.descripcion) || jsonb_build_object('area_ha', ROUND(u.area_ha::numeric, 3))),
                      'geometry', ST_AsGeoJSON(geom)::jsonb
                      ) AS feature
                      FROM parcelas_cafe AS t
                      INNER JOIN unidad_productiva u
                      ON t.gid=u.parcela_gid
                      LEFT JOIN productor p
                      ON u.productor_id=p.id
                      LEFT JOIN variedad v
                      ON u.variedad_id=v.id
                      LEFT JOIN zona z
                      ON u.zona_id=z.id
                      LEFT JOIN comite co
                      ON u.comite_id=co.id
                      LEFT JOIN caserio ca
                      ON u.caserio_id=ca.id
                      LEFT JOIN sello s
                      ON u.sello_id=s.id
                      ${where}
                      ORDER BY u.id DESC
                  ) AS features;
                  `;

    console.log('-----GEOJSON------');
    console.log(query);

    const result = await realizarConsulta(query);

    const geojsonText = result[0].geojson;
    res.json(geojsonText);
  } catch (error) {
    console.error('Error al consultar la base de datos:', error);
    res.status(500).json({ error: 'Ocurrió un error al consultar la base de datos' });
  }
}

async function obtenerParcelasCafeJSONMonitoreo(req, res) {

  // Obtener el parámetro "zona_id" de la URL o del cuerpo de la solicitud POST
  const zona_id = req.query.zona_id || req.body.zona_id;
  const fecha_creacion = req.query.fecha_creacion || req.body.fecha_creacion;
  const auth_user_id = req.query.auth_user_id || req.body.auth_user_id;
  const parcela_gid = req.query.parcela_gid || req.body.parcela_gid;

  const eliminada = req.query.eliminada || req.body.eliminada;
  const searchQuery = req.query.query || req.body.query;

  console.log(zona_id);
  console.log(fecha_creacion);

  var where = ' WHERE u.activa = \'1\' AND u.nueva = \'0\' AND u.eliminada = \'0\' ';
  //var where = ' WHERE u.nueva = \'0\' ';

  var limit = '';

  if (zona_id) {
    where += ` AND u.zona_id = ${zona_id} `;
  }

  if (fecha_creacion) {
    where += ` AND u.fecha_creacion > '${fecha_creacion}' `;
  }

  if (auth_user_id) {
    where += ` AND u.auth_user_id = '${auth_user_id}' `;
  }
  /**/
  if (eliminada) {
    where += ` AND u.eliminada = '${auth_user_id}' `;
  }

  if (parcela_gid) {
    where += ` AND u.parcela_gid = '${parcela_gid}' `;
  }

  if (searchQuery) {
    const queryCondition = `
      (u.id::text LIKE '%${searchQuery}%' OR
       UPPER(u.productor_codigo) LIKE UPPER('%${searchQuery}%') OR
       UPPER(u.nombre) LIKE UPPER('%${searchQuery}%') OR
       u.parcela_gid::text LIKE '%${searchQuery}%' OR
       UPPER(p.nombre) LIKE UPPER('%${searchQuery}%') OR
       p.dni LIKE '%${searchQuery}%')
    `;
    where += ` AND ${queryCondition} `;
  } else {
    // Limitar a los primeros 1000 resultados si no hay búsqueda
    limit += ' LIMIT 1000';
  }

  try {
    var query = `
                    SELECT u.*, p.nombre AS productor_nombre, p.dni AS productor_dni, p.imagen AS productor_imagen, p.lpa_anho AS productor_lpa_anho, p.lpa_tipo AS productor_lpa_tipo, p.lpa_origen AS productor_lpa_origen, v.descripcion AS variedad_descripcion, z.descripcion AS zona_descripcion, ca.descripcion AS caserio_descripcion, co.descripcion AS comite_descripcion, s.descripcion AS sello_descripcion, ROUND(u.area_ha::numeric, 3) AS area_ha
                      FROM parcelas_cafe AS t
                      INNER JOIN unidad_productiva u
                      ON t.gid=u.parcela_gid
                      LEFT JOIN productor p
                      ON u.productor_id=p.id
                      LEFT JOIN variedad v
                      ON u.variedad_id=v.id
                      LEFT JOIN zona z
                      ON u.zona_id=z.id
                      LEFT JOIN comite co
                      ON u.comite_id=co.id
                      LEFT JOIN caserio ca
                      ON u.caserio_id=ca.id
                      LEFT JOIN sello s
                      ON u.sello_id=s.id
                      ${where}
                      ORDER BY u.id DESC
                      ${limit};
                  `;

    const result = await realizarConsulta(query);

    //const geojsonText = result[0].geojson;
    res.json(result);
  } catch (error) {
    console.error('Error al consultar la base de datos:', error);
    res.status(500).json({ error: 'Ocurrió un error al consultar la base de datos' });
  }
}

// Función local para realizar la consulta a la base de datos
async function realizarConsulta(query) {
  try {
    console.log(query);
    const result = await ParcelaCafe.sequelize.query(query, {
      type: ParcelaCafe.sequelize.QueryTypes.SELECT,
    });

    return result;
  } catch (error) {
    throw new Error('Error al realizar la consulta a la base de datos', error);
  }
}

async function consultarPeriodoGEE(req, res) {
  // ensure Earth Engine is ready (initialization happens on startup but
  // calling again is safe and returns immediately if already done)
  const { initializeEarthEngine, ee } = require('../utils/earthEngine');
  await initializeEarthEngine();

  const identificador_parcela = req.query.identificador_parcela;
  const fecha_inicio = req.query.fecha_inicio;//YYYY-MM-DD
  const fecha_fin = req.query.fecha_fin;//YYYY-MM-DD

  try {
    run_analysis(identificador_parcela, fecha_inicio, fecha_fin);
  } catch (error) {
    console.error("Ocurrió un error:", error);
    res.status(500);
  }
}
function run_analysis(identificador_parcela, fecha_inicio, fecha_fin) {


  const query = `
                        SELECT jsonb_build_object(
                            'type', 'FeatureCollection',
                            'features', jsonb_agg(feature)
                        )::text AS geojson
                        FROM (
                            SELECT jsonb_build_object(
                            'type', 'Feature',
                            'properties', to_jsonb(u),
                            'geometry', ST_AsGeoJSON(geom)::jsonb
                            ) AS feature
                            FROM parcelas_cafe AS t
                            INNER JOIN unidad_productiva u
                            ON t.gid=u.parcela_gid
                            WHERE t.gid = ${identificador_parcela}
                        ) AS features;
                        `;

  realizarConsulta(query)
    .then((result) => {
      // Manejar el resultado de la consulta exitosa aquí

      var geojson = result[0].geojson;

      //console.log(geojson);

      geojson = JSON.parse(geojson);
      //console.log(prj);

      //const features = geojson.features.map((feature) => ee.Feature(feature));

      //const featureCollection = ee.FeatureCollection(features).set('crs', 'EPSG:4326');

      //console.log(identificador_parcela);

      //var roi0= featureCollection.filter(ee.Filter.eq('OBJECTID', parseInt(identificador_parcela) )).first();

      const filteredFeatures = geojson.features.filter((feature) => {
        return feature.properties.parcela_gid === parseInt(identificador_parcela);
      });

      const filteredFeatureCollection = ee.FeatureCollection(filteredFeatures).set('crs', 'EPSG:4326');
      const roi0 = filteredFeatureCollection.first();

      console.log(identificador_parcela);
      console.log(typeof identificador_parcela);
      console.log(fecha_inicio);
      console.log(fecha_fin);
      console.log("RESULTADO ROI------------------------");

      var roi1 = ee.Feature(roi0).buffer(20);

      var roi = roi1.geometry();

      //console.log(roi.getInfo());
      //console.log(roi.getInfo().coordinates);
      //Filtro FECHA para colecciones
      var fecha = [];
      fecha1 = fecha_inicio;//YYYY-MM-DD
      fecha2 = fecha_fin;//YYYY-MM-DD

      //fecha1 = '2022-03-10';
      //fecha2 = '2023-03-18';

      fecha.push(fecha1);
      fecha.push(fecha2);


      //SENTINEL 2
      //******************************************************************************************************************************************************   
      console.log("RESULTADO ROI------------------------");

      //Coleccion de imágenes
      //var dataset = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
      var dataset = ee.ImageCollection('COPERNICUS/S2_SR')
        .filterDate(fecha[0], fecha[1])
        //.filterBounds(fc)
        .filterBounds(roi)
        // Pre-filter to get less cloudy granules.
        //.filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE',slider.getValue()));
        .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 25));

      console.log(dataset.getInfo(), 'Sentinel2');

      /*
      for(var x in dataset.getInfo().features){
          console.log(dataset.getInfo().features[x].properties);
      }
      */

      var sortedCollection = dataset
        .sort("system:time_start", true)
        .aggregate_array("system:time_start");

      sortedCollection.evaluate(function (timeStartArray) {

        var formattedDates = timeStartArray.map(function (timestamp) {
          var date = new Date(timestamp);
          var year = date.getFullYear();
          var month = ("0" + (date.getMonth() + 1)).slice(-2);
          var day = ("0" + date.getDate()).slice(-2);
          return year + "-" + month + "-" + day;
        });

        console.log(formattedDates);

        res
          .status(200)
          .json({
            dates: timeStartArray,
            formattedDates: formattedDates
          });

      });

      return;

    })
    .catch((error) => {
      // Manejar el error de la consulta a la base de datos aquí
      console.error(error);
    });
}


async function analisisLocalSegunFecha(req, res) {
  const fecha_filtro = req.query.fecha_filtro;
  const identificador_parcela = req.query.identificador_parcela;

  try {
    const query = `
      SELECT geojson
      FROM historial_indice_parcela_cafe
      WHERE fecha_indice = '${fecha_filtro}' AND gid = ${identificador_parcela}
    `;

    const result = await realizarConsulta(query);
    const geojson = result[0].geojson;

    if (geojson) {
      res.status(200).json(geojson);
    } else {
      res.status(404).json({ message: 'No se encontró ningún resultado.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor.' });
  }
}

async function analisisLocalSegunFechaExterno(identificador_parcela, linea_productiva) {
  //const fecha_filtro = req.query.fecha_filtro;
  //const identificador_parcela = req.query.identificador_parcela;

  try {
    const query = `
      SELECT geojson
      FROM externo_historial_indice_parcela_cafe
      WHERE gid = ${identificador_parcela}
      AND linea_productiva = '${linea_productiva}'
    `;

    const result = await realizarConsulta(query);
    const geojson = result[0].geojson;

    if (geojson) {
      //res.status(200).json(geojson);
      return geojson;
    } else {
      //res.status(404).json({ message: 'No se encontró ningún resultado.' });
      return null;
    }
  } catch (error) {
    console.log(error);
    return null;
  }
}

// Controlador para cancelar la llamada a la API
function cancelApiCall(req, res) {
  if (analysisPromise) {
    // Aquí puedes realizar alguna lógica para detener el análisis en curso
    // Por ejemplo, puedes usar variables de control para detenerlo

    // Limpia la promesa ya que se ha cancelado
    analysisPromise = null;

    res.status(200).send("Llamada a la API cancelada");
  } else {
    res.status(400).send("No hay análisis en curso para cancelar");
  }
};

function runAnalysisInWorker(data) {
  return new Promise((resolve, reject) => {
    worker = new Worker('./controllers/worker.js', { workerData: data });

    worker.postMessage({ command: 'startAnalysis' });

    // Manejar mensajes del worker
    worker.on('message', (message) => {
      if (message.command === 'analysisResult') {
        resolve(message.result);
      } else if (message.command === 'error') {
        console.log(message.error);
        reject(new Error(message.error));
      }

      if (message.type === 'control') {
        console.log('Mensaje de control recibido:', message.message);
      }
    });

    // Manejar errores en el worker
    worker.on('error', (error) => {
      reject(error);
    });
  });
}

function runAnalysisInWorkerExterno(data) {
  return new Promise((resolve, reject) => {
    worker = new Worker('./controllers/workerConsultaExterna.js', { workerData: data });

    worker.postMessage({ command: 'startAnalysis' });

    // Manejar mensajes del worker
    worker.on('message', (message) => {
      if (message.command === 'analysisResult') {
        resolve(message.result);
      } else if (message.command === 'error') {
        console.log(message.error);
        reject(new Error(message.error));
      }

      if (message.type === 'control') {
        console.log('Mensaje de control recibido:', message.message);
      }
    });

    // Manejar errores en el worker
    worker.on('error', (error) => {
      reject(error);
    });
  });
}

async function analisisConsultaExterna(req, res) {

  try {

    // Log para depuración
    console.log(req.headers);
    console.log(req.body);


    var datos = req.body;

    console.log(datos);

    const fecha_filtro = getCurrentDate();
    const geojson = datos['geojson'];
    const linea_productiva = datos['linea_productiva'];

    //Buscar en la bd local
    //console.log(JSON.stringify(geojson));
    var _idg = (JSON.parse(geojson)).features[0].properties.idg;

    var geojsonLocal = await analisisLocalSegunFechaExterno(_idg, linea_productiva);
    console.log(geojsonLocal);

    if (geojsonLocal != null) {
      res.status(200).json(geojsonLocal);
      return;
    }
    //./Buscar en la bd local

    // ensure library is initialized (startup already attempts it)
    const { initializeEarthEngine, ee } = require('../utils/earthEngine');
    await initializeEarthEngine();

    // there is no need to handle privateKey here; the util already does.

    //modificado
    var fecha_calculada = getTwoYearDateRangeFromDate(fecha_filtro);//1 año antes y despues
    const fecha_inicio = fecha_calculada.fechaInicial;
    const fecha_fin = fecha_calculada.fechaFinal;

    data = {
      'fecha_calculada': fecha_calculada,
      'fecha_inicio': fecha_inicio,
      'fecha_fin': fecha_fin,
      'geojson': geojson,
      'fecha_filtro': fecha_filtro,
      'linea_productiva': linea_productiva
    }

    try {
      const dict_indices = await runAnalysisInWorkerExterno(data);
      res.status(200).json(dict_indices);
    } catch (error) {
      console.error("Ocurrió un error:", error);
      res.status(500).json({ error: 'Ocurrió un error al obtener la parcela de café' });
    }


  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en la consulta al servidor' });
  }

}

async function analisisSegunFecha(req, res) {
  const fecha_filtro = req.query.fecha_filtro;
  const identificador_parcela = req.query.identificador_parcela;
  const { initializeEarthEngine, ee } = require('../utils/earthEngine');
  await initializeEarthEngine();

  //modificado
  var fecha_calculada = getTwoYearDateRangeFromDate(fecha_filtro);//1 año antes y despues
  const fecha_inicio = fecha_calculada.fechaInicial;
  const fecha_fin = fecha_calculada.fechaFinal;

  data = {
    'fecha_calculada': fecha_calculada,
    'fecha_inicio': fecha_inicio,
    'fecha_fin': fecha_fin,
    'identificador_parcela': identificador_parcela,
    'fecha_filtro': fecha_filtro
  }

  try {
    const dict_indices = await runAnalysisInWorker(data);
    res.status(200).json(dict_indices);
  } catch (error) {
    console.error("Ocurrió un error:", error);

    /*
    res
    .status(500);
    */

    res.status(500).json({ error: 'Ocurrió un error al obtener la parcela de café' });

  }

  console.log("correcto");

}

function run_analysis(identificador_parcela, fecha_inicio, fecha_fin) {

  const inicio = performance.now();

  const query = `
                        SELECT jsonb_build_object(
                            'type', 'FeatureCollection',
                            'features', jsonb_agg(feature)
                        )::text AS geojson
                        FROM (
                            SELECT jsonb_build_object(
                            'type', 'Feature',
                            'properties', to_jsonb(u),
                            'geometry', ST_AsGeoJSON(geom)::jsonb
                            ) AS feature
                            FROM parcelas_cafe AS t
                            INNER JOIN unidad_productiva u
                            ON t.gid=u.parcela_gid
                            WHERE t.gid = ${identificador_parcela}
                        ) AS features;
                        `;

  realizarConsulta(query)
    .then((result) => {
      // Manejar el resultado de la consulta exitosa aquí

      var geojson = result[0].geojson;

      console.log(geojson);

      geojson = JSON.parse(geojson);
      //console.log(prj);

      //const features = geojson.features.map((feature) => ee.Feature(feature));

      //const featureCollection = ee.FeatureCollection(features).set('crs', 'EPSG:4326');

      //console.log(identificador_parcela);

      //var roi0= featureCollection.filter(ee.Filter.eq('OBJECTID', parseInt(identificador_parcela) )).first();

      const filteredFeatures = geojson.features.filter((feature) => {
        return feature.properties.parcela_gid === parseInt(identificador_parcela);
      });

      const filteredFeatureCollection = ee.FeatureCollection(filteredFeatures).set('crs', 'EPSG:4326');
      const roi0 = filteredFeatureCollection.first();

      console.log(identificador_parcela);
      console.log(typeof identificador_parcela);
      console.log(fecha_inicio);
      console.log(fecha_fin);
      console.log("RESULTADO ROI------------------------");

      var roi1 = ee.Feature(roi0).buffer(20);

      var roi = roi1.geometry();

      //console.log(roi.getInfo());
      //console.log(roi.getInfo().coordinates);
      //Filtro FECHA para colecciones
      var fecha = [];
      fecha1 = fecha_inicio;//YYYY-MM-DD
      fecha2 = fecha_fin;//YYYY-MM-DD

      //fecha1 = '2022-03-10';
      //fecha2 = '2023-03-18';

      fecha.push(fecha1);
      fecha.push(fecha2);

      // Convertir fechaInicio y fechaFin a objetos Date
      var fechaInicioObj = new Date(fecha_filtro);
      var fechaFinObj = new Date(fecha_filtro);

      // Restar un día a fechaInicio
      fechaInicioObj.setDate(fechaInicioObj.getDate() - 1);

      // Sumar un día a fechaFin
      fechaFinObj.setDate(fechaFinObj.getDate() + 1);

      // Convertir las fechas modificadas de nuevo a strings en el formato 'yyyy-MM-dd'
      var nuevaFechaInicio = fechaInicioObj.toISOString().slice(0, 10);
      var nuevaFechaFin = fechaFinObj.toISOString().slice(0, 10);

      //SENTINEL 2
      //******************************************************************************************************************************************************   
      console.log("RESULTADO ROI------------------------");
      console.log(nuevaFechaInicio);
      console.log(nuevaFechaFin);

      //Coleccion de imágenes
      //var dataset = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
      var dataset = ee.ImageCollection('COPERNICUS/S2_SR')
        //.filterDate(fecha[0], fecha[1])
        .filterDate(nuevaFechaInicio, nuevaFechaFin)
        //.filterBounds(fc)
        .filterBounds(roi)
        // Pre-filter to get less cloudy granules.
        //.filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE',slider.getValue()));
        .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 25))
      //.filter(ee.Filter.inList('system:time_start', [fecha_filtro]));;



      var sortedCollection = dataset.sort("system:time_start", false);
      //console.log(sortedCollection.getInfo(),'sortedCollection');

      console.log("AAAAAAAAA----------------");

      var count = sortedCollection.size().getInfo();
      //console.log(count,'numero de imágenes');

      console.log("BBBBBBBBBBBB---------------");


      if (count === 0) {
        console.log('N° Imágenes en este rango de fechas: ' + count);
        console.log('Intentar con otro rango de fechas o con un mayor porcentaje de nubosidad.');
      }
      else {
        var date = sortedCollection.first().date().format('YYYY-MM-dd').getInfo();
        console.log('N° Imágenes en este rango de fechas: ' + count);
        console.log('La imagen escogida es de fecha ' + date);
      }

      const firstImage = dataset.first();

      var url = firstImage
        .visualize({ bands: ['B4', 'B3', 'B2'], gamma: 1.5 })
        //.visualize({bands:['B4','B3','B2']})
        .getThumbURL({ dimensions: '1024x1024', format: 'jpg' });

      console.log(url);


      //---------------------------------------------------------------------------------------------------------------------------------------------  
      if (count === 0) {
        console.log('N° Imágenes en este rango de fechas: ' + count);
        console.log('Intentar con otro rango de fechas o con un mayor porcentaje de nubosidad.');

      }
      else {
        var date = sortedCollection.first().date().format('YYYY-MM-dd').getInfo();
        console.log('N° Imágenes en este rango de fechas: ' + count);
        console.log('La imagen escogida es de fecha ' + date);
      }
      //---------------------------------------------------------------------------------------------------------------------------------------------  

      var Sentinel2A = sortedCollection.map(maskS2clouds);
      console.log(Sentinel2A, 'Sentinel2_mask');

      //Renombrando bandas Sentinel2A (No se esta sacando la mediana, se etá tomando la de la utima fecha)

      var Sentinel2Amedian = Sentinel2A.first().clip(roi)
        .select(['B2', 'B3', 'B4', 'B8', 'B11', 'B12']).rename(['BLUE', 'GREEN', 'RED', 'NIR', 'SWIR1', 'SWIR2']);

      // Calcular indices espectral, definir simbologias, conversion a vector, disolver y dar el nombre a la clase

      /*
      res
      .status(200)
      .json({url:url});
      */
      //console.log(calculoPrecipitacion(fecha, roi));

      var dict_indices = {
        url: url,
        ndvi: calculoNdvi(Sentinel2Amedian, roi, roi0),
        evi: calculoEvi(Sentinel2Amedian, roi, roi0),
        evi2: calculoEvi2(Sentinel2Amedian, roi, roi0),
        ndwi: calculoNdwi(Sentinel2Amedian, roi, roi0),
        mcari: calculoMcari(Sentinel2Amedian, roi, roi0),
        reci: calculoReci(Sentinel2Amedian, roi, roi0),
        precipitacion: calculoPrecipitacion(fecha, roi),
        temperatura: calculoTemperatura(fecha, roi),
        humedad: calculoHumedad(fecha, roi)
      }
      /*
      for(var key in dict_indices){
        if (key != "precipitacion"){
          guardarGeoJSON(dict_indices[key], identificador_parcela, key, date);
          dict_indices[key] = JSON.stringify(dict_indices[key]);
        }              
      }
      */

      dict_indices = calcularAreaGeoJSON(dict_indices);
      guardarGeoJSON(dict_indices, identificador_parcela, 'unico', date);

      //Calculo tiempo de la consulta a GEE
      const fin = performance.now();
      var tiempoTranscurrido = fin - inicio;
      //A segundos:
      tiempoTranscurrido = parseInt(tiempoTranscurrido / 1000);
      console.log(`Tiempo transcurrido: ${tiempoTranscurrido} ms`);

      try {
        const procesoPerformance = ProcesoPerformance.create({
          nombre: 'indice',
          tiempo: tiempoTranscurrido,
        }).then(() => {
          console.log('guardado');
        })
        console.log(procesoPerformance);

      } catch (error) {
        console.error(error);
      }

      return dict_indices;

      res
        .status(200)
        .json(dict_indices);

    })
    .catch((error) => {
      // Manejar el error de la consulta a la base de datos aquí
      console.error(error);
    });
}

// Función para detener el worker
function stopWorker(req, res) {
  if (worker) {
    worker.terminate();
    console.log('Worker detenido');
    res.status(200).send("Llamada a la API cancelada");
  } else {
    res.status(400).send("No hay análisis en curso para cancelar");
  }
}

// Define una ruta para la función create_polygon_from_points
//app.post('/create_polygon_from_points', async (req, res) => {
async function createPolygonFromPoints(req, res) {
  try {
    const data = req.body;
    console.log(data);

    // Construye el objeto GeoJSON como una cadena
    //const geojson = JSON.stringify(data.geom.geometry);
    const geojson = JSON.stringify(data.geom);

    // Construye la consulta SQL parametrizada
    /*
    const sql = `
      SELECT * FROM cafe_create_polygon_from_points($1, $2, $3, $4, $5)
    `;
    */

    const values = [
      data.producto_unidad_productiva_id,
      data.nombre,
      geojson,
      data.variedad_id,
      data.zona_id,
    ];

    const query = `
      SELECT * FROM cafe_create_polygon_from_points(${values[0]}, '${values[1]}', '${values[2]}', ${values[3]}, ${values[4]})
    `;

    try {
      var result = await realizarConsulta(query);
      result = result[0];
      console.log('RESULT', result);

      // Procesa los resultados y construye la respuesta
      const respuesta = {
        idg: result.idgnuevo,
        unidad_productiva_id: result.idunidadproductiva
      };

      // Agrega más lógica según sea necesario
      //Productor
      if ('campo_informacion_productor' in data) {
        var productor = null;
        if (data['campo_informacion_productor'] == 'id') {
          productor = await Productor.findByPk(data['informacion_productor']);
        }
        else if (data['campo_informacion_productor'] == 'nombre') {
          productor = await Productor.create({
            nombre: data['informacion_productor'],
            dni: data['dni'],
            lpa_origen: 'INSPECCION 2024'
          });

          respuesta.offline_productor_id = data.offline_productor_id;
          respuesta.productor_id = productor.id;
        }

        console.log(respuesta);
        const unidadProductiva = await UnidadProductiva.findByPk(respuesta.unidad_productiva_id);
        console.log(unidadProductiva);
        try {
          console.log(productor);
          console.log(productor.nombre);
          unidadProductiva.productor_id = productor.id;
          //Auth User Id
          unidadProductiva.auth_user_id = data['auth_user_id'];
          unidadProductiva.activa = '0';
        } catch (e) {
          console.log(e);
          //unidadProductiva.productor_id
        }

        await unidadProductiva.save();

      }

      if ('__uuid' in data) {
        respuesta.__uuid = data.__uuid;
      }

      if ('offline_unidad_productiva_id' in data) {
        respuesta.offline_unidad_productiva_id = data.offline_unidad_productiva_id;
      }

      if ('offline_campanha_id' in data) {
        respuesta.offline_campanha_id = data.offline_campanha_id;
      }

      res.json(respuesta);

      // Maneja el resultado de la consulta aquí
      console.log(result);
    } catch (error) {
      // Maneja los errores aquí
      console.error(error);
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error interno' });
  }
};

async function updatePolygonFromPoints(req, res) {
  try {
    const data = req.body;
    console.log(data);

    const geojson = JSON.stringify(data.geom);

    const values = [
      data.parcela_gid,
      geojson
    ];

    const query = `
      SELECT * FROM cafe_update_polygon_from_points(${values[0]}, '${values[1]}')
    `;

    try {
      const result = await realizarConsulta(query);

      // Procesa los resultados y construye la respuesta
      const respuesta = {
        //parcela_gid_modificada: result.parcela_gid_modificada
        parcela_gid_modificada: data.parcela_gid,
        //UnidadProductiva.id
        id: data.id
      };

      if ('__i' in data) {
        respuesta.__i = data.__i;
      }

      if ('__j' in data) {
        respuesta.__j = data.__j;
      }

      res.json(respuesta);

      // Maneja el resultado de la consulta aquí
      console.log(result);
    } catch (error) {
      // Maneja los errores aquí
      console.error(error);
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error interno' });
  }
};

async function guardarBackupApp(req, res) {
  try {
    const data = req.body;
    console.log(data);

    registro = await GuardarBackupApp.create({
      auth_user_id: data["auth_user_id"],
      json: data["json"]
    });

    res.json(registro);

    return;


    registro = await GuardarBackupApp.create({
      json: data['informacion_productor'],
      dni: data['dni']
    });

    res.json(respuesta);

    // Maneja el resultado de la consulta aquí
    console.log(result);


  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error interno' });
  }
};

async function actualizarInterseccionesParcela(req, res) {
  try {
    var consulta = await realizarConsulta("SELECT * FROM funcion_calcular_intersecciones();");
    res.json(consulta);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error interno' });
  }
}

async function obtenerParcelasCafeKML(req, res) {

  // Obtener el parámetro "zona_id" de la URL o del cuerpo de la solicitud POST
  const zona_id = req.query.zona_id || req.body.zona_id;
  const fecha_creacion = req.query.fecha_creacion || req.body.fecha_creacion;
  const auth_user_id = req.query.auth_user_id || req.body.auth_user_id;

  const id = req.query.id || req.body.id;

  console.log(zona_id);
  console.log(fecha_creacion);

  //var where = ' WHERE u.activa = \'1\' AND u.nueva = \'0\' ';
  var where = ' WHERE u.nueva = \'0\' AND u.eliminada = \'0\' ';

  if (zona_id) {
    // Aquí puedes usar el valor de "zona_id" en tu lógica de negocio

    // Por ejemplo, si necesitas utilizar "zona_id" en la consulta a la base de datos
    // puedes construir la cláusula "WHERE" de esta manera:
    where += ` AND u.zona_id = ${zona_id} `;

    // Luego puedes utilizar la variable "where" en tu consulta para filtrar por zona_id
    // Ejemplo:
    // const resultado = await sequelize.query(`SELECT * FROM parcelas WHERE ${where}`);

    // Aquí continuaría el resto de tu lógica...
  }

  if (fecha_creacion) {
    where += ` AND u.fecha_creacion > '${fecha_creacion}' `;
  }

  if (auth_user_id) {
    //where += ` AND u.auth_user_id = '${auth_user_id}' `;
    where += " AND p.lpa_origen IN ('INSPECCION 2023','INSPECCION 2024') ";
  }

  if (id) {
    where += ` AND u.id = '${id}' `;
  }

  try {
    var query = `
              SELECT 
                pc.gid,
                ST_AsKML(pc.geom) as kml,
                up.*
              FROM 
                parcelas_cafe pc
              JOIN 
                unidad_productiva up
              ON 
                pc.gid = up.parcela_gid
              WHERE up.activa='1' AND up.eliminada='0';
                  `;

    const resultado = await realizarConsulta(query);

    //console.log(res);

    let kmlResult = `<?xml version="1.0" encoding="UTF-8"?>
      <kml xmlns="http://www.opengis.net/kml/2.2">
        <Document>`;

    for (var i = 0; i < resultado.length; i++) {
      /*
      kmlResult += `
        <Placemark>
          <name>${resultado[i].gid}</name>
          <description>${resultado[i].nombre || ''}</description>
          ${resultado[i].kml}
        </Placemark>
      `;
      */
      kmlResult += `
            <Placemark>
                <name>${resultado[i].id}</name>
                <description>
                    <![CDATA[
                        Nombre: ${resultado[i].nombre || ''}<br>
                        Altitud: ${resultado[i].altitud || ''}<br>
                        Departamento: ${resultado[i].departamento || ''}<br>
                        Provincia: ${resultado[i].provincia || ''}<br>
                        Distrito: ${resultado[i].distrito || ''}<br>
                        Ubigeo: ${resultado[i].ubigeo || ''}<br>
                        Área (ha): ${resultado[i].area_ha || ''}<br>
                        Código de venta: ${resultado[i].codigo_venta || ''}<br>
                        INTS ANP: ${resultado[i].ints_anp || ''}<br>
                        Área INTS ANP (m²): ${resultado[i].area_ints_anp_m2 || ''}<br>
                        INTS ZA: ${resultado[i].ints_za || ''}<br>
                        Área INTS ZA (m²): ${resultado[i].area_ints_za_m2 || ''}<br>
                        INTS Deforestación 2014: ${resultado[i].ints_deforestacion_2014 || ''}<br>
                        Área INTS Deforestación 2014 (m²): ${resultado[i].area_ints_deforestacion_2014_m2 || ''}<br>
                        INTS Deforestación 2020: ${resultado[i].ints_deforestacion_2020 || ''}<br>
                        Área INTS Deforestación 2020 (m²): ${resultado[i].area_ints_deforestacion_2020_m2 || ''}<br>
                        Fecha de creación: ${resultado[i].fecha_creacion ? new Date(resultado[i].fecha_creacion).toLocaleDateString() : ''}<br>
                        Fecha de modificación: ${resultado[i].fecha_modificacion ? new Date(resultado[i].fecha_modificacion).toLocaleDateString() : ''}<br>
                        Nueva: ${resultado[i].nueva || ''}<br>
                        Activa: ${resultado[i].activa || ''}<br>
                        Porcentaje de sombra: ${resultado[i].porcentaje_sombra || ''}<br>
                        Número de plantas: ${resultado[i].numero_plantas || ''}<br>
                        Área Polígono (ha): ${resultado[i].area_poly_ha || ''}<br>
                        Eliminada: ${resultado[i].eliminada || ''}<br>
                        Área INTS Parcelas PERHUSA (m²): ${resultado[i].area_ints_parcelas_perhusa_m2 || ''}
                    ]]>
                </description>
                ${resultado[i].kml}
            </Placemark>
        `;
    }

    /*
    res.rows.forEach(row => {
      kmlResult += `
        <Placemark>
          <name>${row.gid}</name>
          <description>${row.nombre || ''}</description>
          ${row.kml}
        </Placemark>
      `;
    });
    */

    kmlResult += `
        </Document>
      </kml>`;

    res.setHeader('Content-Disposition', 'attachment; filename="parcelas.kml"');
    res.set('Content-Type', 'application/vnd.google-earth.kml+xml');
    res.send(kmlResult);

  } catch (error) {
    console.error('Error al consultar la base de datos:', error);
    res.status(500).json({ error: 'Ocurrió un error al consultar la base de datos' });
  }
}

async function mvtTiles(req, res) {
  const { id, table_name, zoom, x, y } = req.params;
  let { centroide, filtro, valor } = req.query;

  try {
    const tableSchema = await getTableInfo(table_name);
    const campos = tableSchema.filter(item => !item.type.startsWith('geometry')).map(item => item.column);
    const select = campos.join(',');
    const tipoGeometria = await getGeometryType(table_name);

    let sql;

    if (filtro) {
      sql = `SELECT ST_AsMVT(tile, '${table_name}') FROM (SELECT ${select}, ST_X(ST_Centroid(geom)) as _x, ST_Y(ST_Centroid(geom)) as _y, ST_AsMVTGeom(geom, TileBBox(${zoom}, ${x}, ${y}, 4326), 4096, 256, false) FROM ${table_name} WHERE ${filtro} = '${valor}') AS tile`;
    } else if (centroide) {
      sql = `SELECT ST_AsMVT(tile, '${table_name}') FROM (SELECT ${select}, ST_AsMVTGeom(ST_Centroid(geom), TileBBox(${zoom}, ${x}, ${y}, 4326), 4096, 256, false) FROM ${table_name}) AS tile`;
    } else {
      if (tipoGeometria === 'POINT') {
        sql = `SELECT ST_AsMVT(tile, '${table_name}') FROM (SELECT ${select}, ST_Simplify(ST_AsMVTGeom(t.geom, TileBBox(${zoom}, ${x}, ${y}, 4326), 4096, 256, false), 5) as geom FROM ${table_name} t, (SELECT ST_Expand(Tilebbox(${zoom}, ${x}, ${y}, 4326), ZRes(${zoom})*${zoom}) AS geom) AS env WHERE ST_Intersects(t.geom, env.geom)) AS tile`;
      } else {
        let idTableName = table_name;
        let extraWhere = '';

        if (table_name === 'palta.parcelas_palta') {
          table_name = 'palta.parcelas_palta pp inner join palta.unidad_productiva pup on pp.idg = pup.idg';
          extraWhere = "pup.estado='1' AND ";
          select = 'pp.gid, pp.__gid, pp.id, pp.nombre, pp.area_ha, pp.perim_mts , pp.idg, pp.x, pp.y';
        }

        sql = `SELECT ST_AsMVT(tile, '${idTableName}') FROM (SELECT ${select}, ST_Simplify(ST_AsMVTGeom(geom, TileBBox(${zoom}, ${x}, ${y}, 4326), 4096, 256, false), 0) as geom FROM ${table_name} WHERE ${extraWhere} ST_Intersects(geom, TileBBox(${zoom}, ${x}, ${y}, 4326))) AS tile`;
      }
    }

    console.log(sql); // Para propósitos de depuración

    const result = await realizarConsulta(sql);
    if (result.length > 0) {
      const tile = result[0].st_asmvt;
      res.setHeader('Content-Type', 'application/x-protobuf');
      res.send(tile);
    } else {
      res.status(404).send('Tile not found');
    }

  } catch (error) {
    console.error('Error executing query', error.stack);
    res.status(500).send('Internal Server Error');
  }
}

async function getTileSet(req, res) {
  try {
    var table_name = req.params.id;
    const z = req.params.z;
    const x = req.params.x;
    const y = req.params.y;

    const table_schema = await getTableInfoDict(table_name);

    const campos = [];
    for (var key in table_schema) {
      //if (!item.type.startsWith('geometry')) {
      campos.push(key);
      //}
    }

    const select = campos.join(',');

    /*
    const query = `SELECT ST_AsMVT(tile, '${table_name}') FROM (SELECT ${select}, ST_Simplify(ST_AsMVTGeom(geom, TileBBox(${z}, ${x}, ${y}, 4326), 4096, 256, false), 0) as geom FROM ${table_name} WHERE ST_Intersects(geom, TileBBox(${z}, ${x}, ${y}, 4326))) AS tile`;
    */

    //table_name: gestion.limite_departamental -> table_name = limite_departamental
    const partes = table_name.split('.');
    const nombreTabla = partes[partes.length - 1];

    where = '';
    inner_join = '';

    if (table_name == 'parcelas_cafe') {
      inner_join = ' INNER JOIN unidad_productiva u ON parcelas_cafe.gid = u.parcela_gid '
      where = ' AND u.activa = \'1\' AND u.nueva = \'0\' AND u.eliminada = \'0\' '
    }


    const query = `
      SELECT ST_AsMVT(tile, '${nombreTabla}')
      FROM (
          SELECT ${select}, ST_AsMVTGeom(ST_Transform(geom, 4326), TileBBox(${z}, ${x}, ${y}, 4326), 4096, 64, true) as geom
          FROM ${table_name} ${inner_join}
          WHERE ST_Intersects(ST_Transform(geom, 4326), TileBBox(${z}, ${x}, ${y}, 4326)) ${where}
      ) AS tile`;

    const result = await realizarConsulta(query);

    const tile = result[0].st_asmvt;

    // Configurar el encabezado Content-Type de la respuesta
    res.set('Content-Type', 'application/x-protobuf');

    // Enviar la respuesta con la tesela
    res.send(tile);

  } catch (error) {
    console.error('Error al generar las teselas:', error);
    res.status(500).json({ error: 'Ocurrió un error al generar las teselas' });
  }
}

async function getTileSetParcelasOrganicas(req, res) {
  try {
    var table_name = req.params.id;
    const z = req.params.z;
    const x = req.params.x;
    const y = req.params.y;

    const table_schema = await getTableInfoDict(table_name);

    const campos = [];
    for (var key in table_schema) {
      //if (!item.type.startsWith('geometry')) {
      campos.push(key);
      //}
    }

    const select = campos.join(',');

    /*
    const query = `SELECT ST_AsMVT(tile, '${table_name}') FROM (SELECT ${select}, ST_Simplify(ST_AsMVTGeom(geom, TileBBox(${z}, ${x}, ${y}, 4326), 4096, 256, false), 0) as geom FROM ${table_name} WHERE ST_Intersects(geom, TileBBox(${z}, ${x}, ${y}, 4326))) AS tile`;
    */

    //table_name: gestion.limite_departamental -> table_name = limite_departamental
    const partes = table_name.split('.');
    const nombreTabla = partes[partes.length - 1];

    const query = `
      SELECT ST_AsMVT(tile, '${nombreTabla}')
      FROM (
          SELECT ${select}, ST_AsMVTGeom(ST_Transform(geom, 4326), TileBBox(${z}, ${x}, ${y}, 4326), 4096, 64, true) as geom
          FROM ${table_name} pc
          INNER JOIN unidad_productiva u
          ON u.parcela_gid = pc.gid
          INNER JOIN productor p
          ON u.productor_codigo = p.codigo
          WHERE ST_Intersects(ST_Transform(geom, 4326), TileBBox(${z}, ${x}, ${y}, 4326))
          AND p.lpa_tipo = 'ORGANICO'
      ) AS tile`;

    const result = await realizarConsulta(query);

    const tile = result[0].st_asmvt;

    // Configurar el encabezado Content-Type de la respuesta
    res.set('Content-Type', 'application/x-protobuf');

    // Enviar la respuesta con la tesela
    res.send(tile);

  } catch (error) {
    console.error('Error al generar las teselas:', error);
    res.status(500).json({ error: 'Ocurrió un error al generar las teselas' });
  }
}

async function getTileSetParcelasConvencionales(req, res) {
  try {
    var table_name = req.params.id;
    const z = req.params.z;
    const x = req.params.x;
    const y = req.params.y;

    const table_schema = await getTableInfoDict(table_name);

    const campos = [];
    for (var key in table_schema) {
      //if (!item.type.startsWith('geometry')) {
      campos.push(key);
      //}
    }

    const select = campos.join(',');

    /*
    const query = `SELECT ST_AsMVT(tile, '${table_name}') FROM (SELECT ${select}, ST_Simplify(ST_AsMVTGeom(geom, TileBBox(${z}, ${x}, ${y}, 4326), 4096, 256, false), 0) as geom FROM ${table_name} WHERE ST_Intersects(geom, TileBBox(${z}, ${x}, ${y}, 4326))) AS tile`;
    */

    //table_name: gestion.limite_departamental -> table_name = limite_departamental
    const partes = table_name.split('.');
    const nombreTabla = partes[partes.length - 1];

    const query = `
      SELECT ST_AsMVT(tile, '${nombreTabla}')
      FROM (
          SELECT ${select}, ST_AsMVTGeom(ST_Transform(geom, 4326), TileBBox(${z}, ${x}, ${y}, 4326), 4096, 64, true) as geom
          FROM ${table_name} pc
          INNER JOIN unidad_productiva u
          ON u.parcela_gid = pc.gid
          INNER JOIN productor p
          ON u.productor_codigo = p.codigo
          WHERE ST_Intersects(ST_Transform(geom, 4326), TileBBox(${z}, ${x}, ${y}, 4326))
          AND p.lpa_tipo = 'CONVENCIONAL'
      ) AS tile`;

    const result = await realizarConsulta(query);

    const tile = result[0].st_asmvt;

    // Configurar el encabezado Content-Type de la respuesta
    res.set('Content-Type', 'application/x-protobuf');

    // Enviar la respuesta con la tesela
    res.send(tile);

  } catch (error) {
    console.error('Error al generar las teselas:', error);
    res.status(500).json({ error: 'Ocurrió un error al generar las teselas' });
  }
}



module.exports = {
  obtenerParcelasCafe,
  obtenerParcelaCafePorId,
  crearParcelaCafe,
  actualizarParcelaCafe,
  eliminarParcelaCafe,
  obtenerParcelasCafeGeoJSON,
  obtenerNuevasParcelasCafeGeoJSON,
  consultarPeriodoGEE,
  analisisSegunFecha,
  analisisLocalSegunFecha,
  analisisLocalSegunFechaExterno,
  stopWorker,
  createPolygonFromPoints,
  updatePolygonFromPoints,
  guardarBackupApp,
  obtenerParcelasCafeGeoJSONStatus,
  obtenerParcelasCafeGeoJSONMonitoreo,
  obtenerParcelasCafeJSONMonitoreo,
  actualizarInterseccionesParcela,
  obtenerParcelasCafeKML,
  mvtTiles,
  getVerticesParcela,
  analisisConsultaExterna,
  getTileSet,
  getTileSetParcelasOrganicas,
  getTileSetParcelasConvencionales
};

async function getTableInfoDict(table_name) {
  try {
    const query = `
      SELECT attnum, attname, 
      pg_catalog.format_type(atttypid, atttypmod) AS type 
      FROM pg_attribute where attrelid = '`+ table_name + `'::regclass 
      AND attnum > 0 
      AND NOT attisdropped ORDER BY attnum
      `;

    //console.log(query);

    const rows = await realizarConsulta(query);
    const schema = {};

    for (let row of rows) {
      const column_type = row.type;
      if (!column_type.startsWith('geometry')) {
        //row.attname = Nombre Columna
        //row.type = Tipo Columna
        schema[row.attname] = row.type;
      }
    }

    return schema;
  } catch (error) {
    console.error('Error al obtener información de la tabla:', error);
    return null;
  }
}


//SIMBOLOGÍA
//******************************************************************************************************************************************************   
//NDVI, EVI, EVI2
var viz = {
  'palette': ['FFFFFF', 'CE7E45', 'DF923D', 'F1B555',
    'FCD163', '99B718', '74A901', '66A000',
    '529400', '3E8601', '207401', '056201',
    '004C00', '023B01', '012E01', '011D01',
    '011301'],
  'min': -0.4,
  'max': 1
};

//Funcion mascara de nubes sentinel
function maskS2clouds(image) {
  var qa = image.select('QA60');

  // Bits 10 and 11 are clouds and cirrus, respectively.
  var cloudBitMask = 1 << 10;
  var cirrusBitMask = 1 << 11;

  // Both flags should be set to zero, indicating clear conditions.
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
    .and(qa.bitwiseAnd(cirrusBitMask).eq(0));

  return image.updateMask(mask).divide(10000);
}

function eeFeatureCollectionToGeojson(fc) {
  /// Obtener la lista de características como un arreglo
  var features = fc.getInfo().features;

  // Crear un objeto GeoJSON manualmente
  var geoJSON = {
    type: 'FeatureCollection',
    features: []
  };

  for (var i = 0; i < features.length; i++) {
    var feature = features[i];
    var properties = feature.properties;
    var geometry = feature.geometry;

    var geoJSONFeature = {
      type: 'Feature',
      geometry: geometry,
      properties: properties
    };

    geoJSON.features.push(geoJSONFeature);
  }

  // Mostrar el JSON en la consola
  console.log(JSON.stringify(geoJSON));

  return geoJSON;
}

// Función para guardar el GeoJSON en la tabla
async function guardarGeoJSON(geojson, gid, indice, fecha_indice) {

  try {
    const query = `
      INSERT INTO historial_indice_parcela_cafe (gid, indice, fecha_indice, geojson)
      VALUES ($1, '$2', '$3', '$4')
    `;

    const values = [
      gid,//geojson.properties.gid,
      indice,//geojson.properties.indice,
      fecha_indice,//geojson.properties.fecha_indice,
      //geojson.properties.fecha_creacion,
      //geojson.properties.fecha_modificacion,
      //JSON.stringify(geojson.geometry),
      JSON.stringify(geojson)
    ];

    const formattedQuery = query.replace(/\$(\d+)/g, (match, index) => {
      return values[index - 1];
    });

    //console.log(formattedQuery);

    await realizarConsulta(formattedQuery);

    console.log('GeoJSON guardado exitosamente');
  } catch (error) {
    console.error('Error al guardar el GeoJSON:', error);
  }
}

async function calcularAreaGeoJSON(geojson) {
  var query = null;
  var area = null;
  var dict_area_local = {};

  console.log('calcularAreaGeoJSON');

  for (var key in geojson) {
    if ('geojson' in geojson[key]) {
      if ('features' in geojson[key]['geojson']) {
        if (geojson[key]['geojson']['features'].length > 0) {
          for (var i = 0; i < geojson[key]['geojson']['features'].length; i++) {
            if ('geometry' in geojson[key]['geojson']['features'][i]) {

              query = "SELECT ST_Area(ST_Transform(ST_SetSRID(ST_GeomFromGeoJSON(" + JSON.stringify(geojson[key]['geojson']['features'][i]['geometry']) + "), 4326), 32718))";
              console.log(query);

              area = await realizarConsulta(query);
              console.log(area);

              dict_area_local[geojson[key]['geojson']['features'][i]['properties']['constant']] = area;

            }
          }
        }
      }
    }
    geojson[key]['areas_local'] = dict_area_local;
    dict_area_local = {};
  }

  return geojson;
}

async function __guardarGeoJSON(geojson, gid, indice, fecha_indice) {
  console.log(geojson);
  try {
    const features = geojson.features;
    for (const feature of features) {
      const query = `
        INSERT INTO historial_indice_parcela_cafe (gid, indice, fecha_indice, geom, properties)
        VALUES ($1, $2, $3, ST_SetSRID(ST_GeomFromGeoJSON($4), 4326), $5)
      `;

      const values = [
        gid,//feature.properties.gid,
        indice,//feature.properties.indice,
        fecha_indice,//feature.properties.fecha_indice,
        //feature.properties.fecha_creacion,
        //feature.properties.fecha_modificacion,
        JSON.stringify(feature.geometry),
        JSON.stringify(feature.properties)
      ];

      const formattedQuery = query.replace(/\$(\d+)/g, (match, index) => {
        return values[index - 1];
      });

      console.log(formattedQuery);

      await realizarConsulta(formattedQuery);

      console.log('GeoJSON guardado exitosamente');
    }
  } catch (error) {
    console.error('Error al guardar el GeoJSON:', error);
  }
}

function getTwoYearDateRangeFromDate(dateBrindada) {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const currentDate = new Date();
  const dateBrindadaObj = new Date(dateBrindada);

  let fechaInicial, fechaFinal;

  // Calcular la cantidad de días entre la fecha brindada y la fecha actual
  const diasDiferencia = Math.round((currentDate - dateBrindadaObj) / millisecondsPerDay);

  // Si la diferencia es mayor o igual a 365 días, el rango es de 2 años
  if (diasDiferencia >= 365) {
    fechaInicial = new Date(dateBrindadaObj);
    fechaInicial.setFullYear(dateBrindadaObj.getFullYear() - 1);

    fechaFinal = new Date(dateBrindadaObj);
    fechaFinal.setFullYear(dateBrindadaObj.getFullYear() + 1);
    fechaFinal.setDate(fechaFinal.getDate() - 1); // Restar 1 día para que no sea mayor que la fecha actual
  } else {
    // Si la diferencia es menor a 365 días, agregar la diferencia a la fecha inicial
    fechaInicial = new Date(currentDate);
    fechaInicial.setDate(currentDate.getDate() - diasDiferencia);
    fechaInicial.setFullYear(fechaInicial.getFullYear() - 1);

    fechaFinal = new Date(currentDate);
    fechaFinal.setDate(currentDate.getDate() - 1); // Restar 1 día para que no sea mayor que la fecha actual
  }

  // Formatear las fechas en el formato YYYY-MM-DD
  const fechaInicialFormatted = fechaInicial.toISOString().slice(0, 10);
  const fechaFinalFormatted = fechaFinal.toISOString().slice(0, 10);

  return {
    fechaInicial: fechaInicialFormatted,
    fechaFinal: fechaFinalFormatted
  };
}

async function getTableInfo(tableName) {
  try {
    const query = `
      SELECT attnum, attname,
             pg_catalog.format_type(atttypid, atttypmod) AS type
      FROM pg_attribute
      WHERE attrelid = '${tableName}'::regclass
        AND attnum > 0
        AND NOT attisdropped
      ORDER BY attnum
    `;

    const rows = await realizarConsulta(query);
    const schema = [];

    rows.forEach(row => {
      const columnType = row.type;
      if (!columnType.startsWith('geometry')) {
        schema.push({
          column: row.attname,
          type: row.type
        });
      }
    });

    return schema;
  } catch (error) {
    console.error('Error fetching table info:', error);
    throw error;
  }
}



async function getGeometryType(tableName) {
  try {
    const query = `
      SELECT type
      FROM geometry_columns
      WHERE f_table_name = '${tableName}'
    `;

    const rows = await realizarConsulta(query);
    const row = rows[0]; // Solo necesitamos una fila

    if (row) {
      return row.type;
    }
  } catch (error) {
    console.error('Error fetching geometry type:', error);
    throw error;
  }
}

async function getVerticesParcela(req, res) {
  const tableName = req.query.table_name || req.body.table_name;
  const idg = req.query.idg || req.body.idg;
  const lpaTipo = req.query.lpa_tipo || req.body.lpa_tipo;

  console.log('Estos son los datos para extraer vertices =================================');
  console.log(tableName);
  console.log(idg);
  console.log(lpaTipo);


  if (lpaTipo == 'ORGANICO') {
    try {
      const query = `
        SELECT gid, ST_X(geom) AS longitud, ST_Y(geom) AS latitud
        FROM (
            SELECT gid, (ST_DumpPoints(geom)).geom AS geom
            FROM ${tableName}
            WHERE gid = ${idg}
        ) AS vertices
      `;


      const result = await realizarConsulta(query);

      // const geojsonText = result[0].geojson;

      res.json(result);
    } catch (error) {
      console.error('Error al consultar la base de datos:', error);
      res.status(500).json({ error: 'Ocurrió un error al consultar la base de datos' });
    }

  }
  else {
    try {
      const query = `
        SELECT gid, ST_X(geom) AS longitud, ST_Y(geom) AS latitud
        FROM (
            SELECT gid, ST_Centroid(geom) AS geom
            FROM ${tableName}
            WHERE gid = ${idg}
        ) AS vertices
      `;

      const result = await realizarConsulta(query);

      // const geojsonText = result[0].geojson;

      res.json(result);
    } catch (error) {
      console.error('Error al consultar la base de datos:', error);
      res.status(500).json({ error: 'Ocurrió un error al consultar la base de datos' });
    }

  }

}

function getCurrentDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Meses empiezan desde 0
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

//console.log(getCurrentDate()); // Salida: YYYY-MM-DD
