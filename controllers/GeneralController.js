const ParcelaCafe = require('../models/ParcelaCafe');

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

const calculoPrecipitacion = require('./calculo_indices/calculoPrecipitacion.js');

async function obtenerBoundsInterseccion(req, res) {
    try {
      
      const query= `select * from bounds_interseccion_cafe_anp;`;
  
        const result = await realizarConsulta(query);

        //const geojsonText = result[0].geojson;
        res.json(result);
    } catch (error) {
        console.error('Error al consultar la base de datos:', error);
        res.status(500).json({ error: 'Ocurrió un error al consultar la base de datos' });
    }
}

async function obtenerBoundsInterseccionZonasAmortiguamiento(req, res) {
    try {
      
      const query= `select * from bounds_interseccion_cafe_za;`;
  
        const result = await realizarConsulta(query);

        //const geojsonText = result[0].geojson;
        res.json(result);
    } catch (error) {
        console.error('Error al consultar la base de datos:', error);
        res.status(500).json({ error: 'Ocurrió un error al consultar la base de datos' });
    }
}

async function obtenerBoundsInterseccionDeforestacion2014(req, res) {
    try {
      
      const query= `select * from bounds_interseccion_cafe_deforestacion_2014;`;
  
        const result = await realizarConsulta(query);

        //const geojsonText = result[0].geojson;
        res.json(result);
    } catch (error) {
        console.error('Error al consultar la base de datos:', error);
        res.status(500).json({ error: 'Ocurrió un error al consultar la base de datos' });
    }
}

async function obtenerBoundsInterseccionDeforestacion2020(req, res) {
    try {
      
      const query= `select * from bounds_interseccion_cafe_deforestacion_2020;`;
  
        const result = await realizarConsulta(query);

        //const geojsonText = result[0].geojson;
        res.json(result);
    } catch (error) {
        console.error('Error al consultar la base de datos:', error);
        res.status(500).json({ error: 'Ocurrió un error al consultar la base de datos' });
    }
}

async function obtenerGeoJSON(req, res) {
    try {

      const table_name = req.query.table_name;
      
      const query= `
                      SELECT jsonb_build_object(
                        'type', 'FeatureCollection',
                        'features', jsonb_agg(feature)
                    )::text AS geojson
                    FROM (
                        SELECT jsonb_build_object(
                            'type', 'Feature',
                            'properties', to_jsonb(t),
                            'geometry', ST_AsGeoJSON(geom)::jsonb
                        ) AS feature
                        FROM `+ table_name + ` AS t
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

async function consultarPeriodoGEE(req, res){
    const {initializeEarthEngine, ee} = require('../utils/earthEngine');
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
    function run_analysis(identificador_parcela,fecha_inicio,fecha_fin){
        
        
        const query= `
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
            
            console.log(dataset.getInfo(),'Sentinel2');

            /*
            for(var x in dataset.getInfo().features){
                console.log(dataset.getInfo().features[x].properties);
            }
            */

            var sortedCollection = dataset
            .sort("system:time_start", true)
            .aggregate_array("system:time_start");

            sortedCollection.evaluate(function(timeStartArray) {

                var formattedDates = timeStartArray.map(function(timestamp) {
                    var date = new Date(timestamp);
                    var year = date.getFullYear();
                    var month = ("0" + (date.getMonth() + 1)).slice(-2);
                    var day = ("0" + date.getDate()).slice(-2);
                    return year + "-" + month + "-" + day;
                });

                console.log(formattedDates);

                res
                .status(200)
                .json({ dates: timeStartArray,
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

async function analisisSegunFecha(req, res){
    const fecha_filtro = req.query.fecha_filtro;
    const identificador_parcela = req.query.identificador_parcela;
    const {initializeEarthEngine, ee} = require('../utils/earthEngine');
    await initializeEarthEngine();

    try {
        // set up date range one year either side
        var fecha_calculada = getTwoYearDateRangeFromDate(fecha_filtro);
        const fecha_inicio = fecha_calculada.fechaInicial;
        const fecha_fin = fecha_calculada.fechaFinal;

        const data = {
            'fecha_calculada': fecha_calculada,
            'fecha_inicio': fecha_inicio,
            'fecha_fin': fecha_fin,
            'identificador_parcela': identificador_parcela,
            'fecha_filtro': fecha_filtro
        };

        const dict_indices = await runAnalysisInWorker(data);
        res.status(200).json(dict_indices);
    } catch (error) {
        console.error("Ocurrió un error:", error);
        res.status(500);
    }
}

    function run_analysis(identificador_parcela,fecha_inicio,fecha_fin){
        
        
        const query= `
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
                    console.log('N° Imágenes en este rango de fechas: '+count);
                    console.log('Intentar con otro rango de fechas o con un mayor porcentaje de nubosidad.');
                }
                else {
                    var date = sortedCollection.first().date().format('YYYY-MM-dd').getInfo();
                    console.log('N° Imágenes en este rango de fechas: '+count);
                    console.log('La imagen escogida es de fecha '+date);
                }

            const firstImage = dataset.first();

            var url = firstImage
                .visualize({bands:['B4','B3','B2'], gamma: 1.5})
                //.visualize({bands:['B4','B3','B2']})
                .getThumbURL({dimensions:'1024x1024', format: 'jpg'});
            
            console.log(url);           

        
            //---------------------------------------------------------------------------------------------------------------------------------------------  
                if (count === 0) {
                    console.log('N° Imágenes en este rango de fechas: '+count);
                    console.log('Intentar con otro rango de fechas o con un mayor porcentaje de nubosidad.');

                }
                else {
                    var date = sortedCollection.first().date().format('YYYY-MM-dd').getInfo();
                    console.log('N° Imágenes en este rango de fechas: '+count);
                    console.log('La imagen escogida es de fecha '+date);
                }
            //---------------------------------------------------------------------------------------------------------------------------------------------  

            var Sentinel2A = sortedCollection.map(maskS2clouds);
            console.log(Sentinel2A,'Sentinel2_mask');
            
            //Renombrando bandas Sentinel2A (No se esta sacando la mediana, se etá tomando la de la utima fecha)
            
            var Sentinel2Amedian = Sentinel2A.first().clip(roi)
                                    .select(['B2','B3','B4','B8','B11','B12']).rename(['BLUE', 'GREEN', 'RED', 'NIR', 'SWIR1', 'SWIR2']);

            // Calcular indices espectral, definir simbologias, conversion a vector, disolver y dar el nombre a la clase

            /*
            res
            .status(200)
            .json({url:url});
            */
            //console.log(calculoPrecipitacion(fecha, roi));
            
            res
            .status(200)
            .json({ url: url,
                    ndvi: calculoNdvi(Sentinel2Amedian,roi, roi0),
                    evi: calculoEvi(Sentinel2Amedian,roi, roi0),
                    evi2: calculoEvi2(Sentinel2Amedian,roi, roi0),
                    ndwi: calculoNdwi(Sentinel2Amedian,roi, roi0),
                    mcari: calculoMcari(Sentinel2Amedian,roi, roi0),
                    reci: calculoReci(Sentinel2Amedian,roi, roi0),
                    precipitacion: calculoPrecipitacion(fecha, roi)
                  });

        })
        .catch((error) => {
            // Manejar el error de la consulta a la base de datos aquí
            console.error(error);
        });
    }

async function getTileSet(req, res) {
    try {
        const table_name = req.params.id;
        const z = req.params.z;
        const x = req.params.x;
        const y = req.params.y;

        const table_schema = await getTableInfoDict(table_name);

        console.log(table_schema);
        
        const campos = [];
        for (var key in table_schema) {
            //if (!item.type.startsWith('geometry')) {
            campos.push(key);
            //}
        }

        const select = campos.join(',');

        const query = `SELECT ST_AsMVT(tile, '${table_name}') FROM (SELECT ${select}, ST_Simplify(ST_AsMVTGeom(geom, TileBBox(${z}, ${x}, ${y}, 4326), 4096, 256, false), 0) as geom FROM ${table_name} WHERE ST_Intersects(geom, TileBBox(${z}, ${x}, ${y}, 4326))) AS tile`;

  
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

async function prueba(req, res) {
    try {

      const table_name = req.query.id;
      
      res.json(getTableInfoDict(table_name));

    } catch (error) {
        console.error('Error al consultar la base de datos:', error);
        res.status(500).json({ error: 'Ocurrió un error al consultar la base de datos' });
    }
}

async function getTableInfoDict(table_name) {
  try {
    const query = `
      SELECT attnum, attname, 
      pg_catalog.format_type(atttypid, atttypmod) AS type 
      FROM pg_attribute where attrelid = '`+table_name+`'::regclass 
      AND attnum > 0 
      AND NOT attisdropped ORDER BY attnum
    `;

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

module.exports = {
  obtenerGeoJSON,
  getTileSet,
  prueba,
  obtenerBoundsInterseccion,
  obtenerBoundsInterseccionZonasAmortiguamiento,
  obtenerBoundsInterseccionDeforestacion2014,
  obtenerBoundsInterseccionDeforestacion2020
};

//SIMBOLOGÍA
//******************************************************************************************************************************************************   
//NDVI, EVI, EVI2
var viz = {
    'palette': ['FFFFFF', 'CE7E45','DF923D', 'F1B555',
                'FCD163', '99B718','74A901', '66A000',
                '529400', '3E8601','207401', '056201',
                '004C00', '023B01','012E01', '011D01',
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

function eeFeatureCollectionToGeojson(fc){
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

// Función local para realizar la consulta a la base de datos
async function realizarConsulta(query) {
  try {
    const result = await ParcelaCafe.sequelize.query(query, {
      type: ParcelaCafe.sequelize.QueryTypes.SELECT,
    });

    return result;
  } catch (error) {
    throw new Error('Error al realizar la consulta a la base de datos');
  }
}