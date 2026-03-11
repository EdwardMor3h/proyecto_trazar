// worker.js
const { parentPort, workerData } = require('worker_threads');

//Librerias necesarias
const { performance } = require('perf_hooks');
const ParcelaCafe = require('../models/ParcelaCafe');
const ProcesoPerformance = require('../models/ProcesoPerformance');
const { ee, initializeEarthEngine } = require('../utils/earthEngine');
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

// Acceder a los datos enviados al worker
const data = workerData;

// Escuchar mensajes del hilo principal
parentPort.on('message', async (message) => {
    if (message.command === 'startAnalysis') {
        try {
            // Aquí va el código de la función analisisSegunFecha
            // Puedes copiar y pegar tu código aquí

            // Utilizar los datos del workerData
            console.log(data);
            const fecha_calculada = data.fecha_calculada;
            const fecha_inicio = data.fecha_inicio;
            const fecha_fin = data.fecha_fin;
            const identificador_parcela = data.identificador_parcela;
            // privateKey is not needed; initialization logic handles credentials
            const fecha_filtro = workerData.fecha_filtro;

            // ensure earth engine is initialized before running
            await initializeEarthEngine();
            // now perform analysis directly

                    // ... Tu código ...
                    const inicio = performance.now();

                    parentPort.postMessage({ type: 'control', message: 'Este es un mensaje de control' });
                
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
                                        WHERE t.gid = ${identificador_parcela}
                                    ) AS features;
                                    `;
                
                    realizarConsulta(query)
                    .then(async (result) => {
                        // Manejar el resultado de la consulta exitosa aquí

                        var geojson = result[0].geojson;

                        //console.log(geojson);

                        geojson = JSON.parse(geojson);

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

                        dict_indices = await calcularAreaGeoJSON(dict_indices);
                        guardarGeoJSON(dict_indices, identificador_parcela, 'unico', date);

                        //Calculo tiempo de la consulta a GEE
                        const fin = performance.now();
                        var tiempoTranscurrido = fin - inicio;
                        //A segundos:
                        tiempoTranscurrido = parseInt(tiempoTranscurrido/1000);
                        console.log(`Tiempo transcurrido: ${tiempoTranscurrido} ms`);

                        try {
                            const procesoPerformance = ProcesoPerformance.create({
                                nombre : 'indice',
                                tiempo : tiempoTranscurrido,
                        }).then(()=>{
                            console.log('guardado');
                        })
                            console.log(procesoPerformance);

                        } catch (error) {
                            console.error(error);
                        }

                        //return dict_indices;
                        // Cuando el análisis esté completo, envía los resultados al hilo principal
                        parentPort.postMessage({ command: 'analysisResult', result: dict_indices });
                        
                        /*
                        res
                        .status(200)
                        .json(dict_indices);
                        */

                    })
                    .catch((error) => {
                        // Manejar el error de la consulta a la base de datos aquí
                        //console.error(error);
                        // Manejar errores
                        parentPort.postMessage({ command: 'error', error: error.message });
                    });
                })
            }

            // Authenticate using a service account.
            ee.data.authenticateViaPrivateKey(privateKey, runAnalysis, function(e) {
                console.error('Authentication error: ' + e);
            });

        } catch (error) {
            // Manejar errores
            parentPort.postMessage({ command: 'error', error: error.message });
        }
    }
});

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
    var qa = image.select('MSK_CLDPRB');

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
    
    console.log(formattedQuery);

    await realizarConsulta(formattedQuery);

    console.log('GeoJSON guardado exitosamente');
  } catch (error) {
    console.error('Error al guardar el GeoJSON:', error);
  }
}

async function calcularAreaGeoJSON(geojson){
  var query = null;
  var area = null;
  var dict_area_local = {};
  var tmp_area = null;

  console.log('calcularAreaGeoJSON');

  try {

    var array_indices = ['ndvi','evi','evi2','ndwi','mcari','reci'];

    for(var key in geojson){
      if(array_indices.includes(key) && 'geojson' in geojson[key]){
        if("features" in geojson[key]['geojson']){
          if(geojson[key]['geojson']['features'].length > 0){
            for(var i=0; i<geojson[key]['geojson']['features'].length; i++){
              if("geometry" in geojson[key]['geojson']['features'][i]){

                query = "SELECT ST_Area(ST_Transform(ST_SetSRID(ST_GeomFromGeoJSON('" + JSON.stringify(geojson[key]['geojson']['features'][i]['geometry']) + "'), 4326), 32718))/10000 AS \"st_area\"";
                console.log(query);

                area = await realizarConsulta(query);//[ { st_area: 1.0751482949492832 } ]
                area ? area = area[0]["st_area"] : area = 0;
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
  } catch (error) {
    console.error('Error al calcular el area:', error, area);
  }
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