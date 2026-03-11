const { ee } = require('../../utils/earthEngine');

function calculoTemperatura(fecha_PP, roi3){
    //COLECCION
    /*
    var PP = ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY")
    .filterDate(fecha_PP[0], fecha_PP[1])
    .filterBounds(roi3);
    */

    console.log('"""""""""""""""""""""""""""""""""""""""""""""""""""');
    console.log(fecha_PP);

    //var precipCollection = ee.ImageCollection("NCEP_RE/surface_temp")
    var precipCollection = ee.ImageCollection("ECMWF/ERA5_LAND/DAILY_AGGR")
        .filterDate(fecha_PP[0], fecha_PP[1])
        //.filterDate('2022-01-01', '2023-07-01')
        .filterBounds(roi3)
        //.select('air')
        .select(['temperature_2m', 'temperature_2m_max', 'temperature_2m_min'])
        .limit(4000);
    
            
    console.log("Cantidad de imágenes para AIR: " + precipCollection.size().getInfo());

    var reduceRegions = function(image) {
        var stats = image.reduceRegion({
            reducer: ee.Reducer.mean(),
            geometry: roi3,
            scale: 2000
        });

        var meanTemperature = stats.get('temperature_2m'); // Obtener la media de temperatura en Kelvin

        var meanTemperature2mMax = stats.get('temperature_2m_max');

        var meanTemperature2mMin = stats.get('temperature_2m_min');

        return ee.Feature(null, { air: meanTemperature, temperature_2m_max: meanTemperature2mMax, temperature_2m_min:meanTemperature2mMin });
    };

    var features = precipCollection.map(reduceRegions);

    // Obtener los datos como un objeto JSON
    var featuresJSON = features.getInfo();

    console.log("featuresJSON===========");
    //console.log(featuresJSON);

    // Obtener todos los features y sus precipitaciones en local
    var featuresLocal = [];

    var arrTmpMax = [];
    var arrTmpMin = [];

    var featuresArray = featuresJSON.features;
    for (var i = 0; i < featuresArray.length; i++) {
        var feature = featuresArray[i];
        var cadena = feature.id; // air_sig995_2022112312
        var fecha = cadena.substring(cadena.lastIndexOf('_') + 1, cadena.lastIndexOf('_') + 9);
        //console.log(feature);
        //console.log(feature.properties);
        var precipitation = feature.properties.air;
        var fecha_formateada = fecha.substring(0, 4) + "-" + fecha.substring(4, 6) + "-" + fecha.substring(6, 8);
        //featuresLocal.push({feature: feature, precipitation: precipitation});

        //Diccionario:
        //featuresLocal.push({fecha: fecha_formateada, precipitation: precipitation});
        //Apexchart:
        featuresLocal.push([fecha_formateada, precipitation-273.15]);

        arrTmpMax.push([fecha_formateada, feature.properties.temperature_2m_max - 273.15]);
        arrTmpMin.push([fecha_formateada, feature.properties.temperature_2m_min - 273.15]);
    }

    // Consultar el objeto local
    console.log("temperatura");
    console.log(featuresLocal[0]);
    console.log(featuresLocal[1]);
    console.log(featuresLocal[2]);

    featuresLocal = fechasUnicas(featuresLocal);

    //console.log(featuresLocal);

    resultado = {
        "featuresLocal" : featuresLocal,
        "arrTmpMax" : arrTmpMax,
        "arrTmpMin" : arrTmpMin
    }

    return resultado;
    //return featuresLocal;
}

function fechasUnicas(data){
    var uniqueDates = [];
    var uniqueData = [];

    for (var i = 0; i < data.length; i++) {
        var fecha = data[i][0];
        
        if (!uniqueDates.includes(fecha)) {
            uniqueDates.push(fecha);
            uniqueData.push(data[i]);
        }
    }

    return uniqueData;
}

module.exports = calculoTemperatura;