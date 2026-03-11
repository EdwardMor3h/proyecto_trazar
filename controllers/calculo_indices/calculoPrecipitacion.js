const { ee } = require('../../utils/earthEngine');

function calculoPrecipitacion(fecha_PP, roi3){
    //COLECCION
    /*
    var PP = ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY")
    .filterDate(fecha_PP[0], fecha_PP[1])
    .filterBounds(roi3);
    */

    var precipCollection = ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY")
        //.limit(1000)
        .filterDate(fecha_PP[0], fecha_PP[1])
        .filterBounds(roi3)
        .select('precipitation');        
    
    console.log("Cantidad de imágenes para PRECIPITACION: " + precipCollection.size().getInfo());

    var reduceRegions = function(image) {
        var stats = image.reduceRegion({
            reducer: ee.Reducer.mean(),
            geometry: roi3,
            scale: 2000
        });

        var meanPrecipitation = stats.get('precipitation'); // Obtener la media de precipitación

        return ee.Feature(null, { precipitation: meanPrecipitation});
    };

    var features = precipCollection.map(reduceRegions);

    // Obtener los datos como un objeto JSON
    var featuresJSON = features.getInfo();

    console.log("featuresJSON===========");
    //console.log(featuresJSON);

    // Obtener todos los features y sus precipitaciones en local
    var featuresLocal = [];
    var featuresArray = featuresJSON.features;
    for (var i = 0; i < featuresArray.length; i++) {
        var feature = featuresArray[i];
        var fecha = feature.id;
        //console.log(feature.properties);
        var precipitation = feature.properties.precipitation;
        var fecha_formateada = fecha.substring(0, 4) + "-" + fecha.substring(4, 6) + "-" + fecha.substring(6, 8);
        //featuresLocal.push({feature: feature, precipitation: precipitation});

        //Diccionario:
        //featuresLocal.push({fecha: fecha_formateada, precipitation: precipitation});
        //Apexchart:
        featuresLocal.push([fecha_formateada, precipitation]);
    }

    // Consultar el objeto local
    console.log("precipitacioooon");
    console.log(featuresLocal[0]);
    console.log(featuresLocal[1]);
    console.log(featuresLocal[2]);

    return featuresLocal;
}

module.exports = calculoPrecipitacion;