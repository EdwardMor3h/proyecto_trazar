const { ee } = require('../../utils/earthEngine');

function calculoHumedad(fecha_PP, roi3){
    //COLECCION
    /*
    var PP = ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY")
    .filterDate(fecha_PP[0], fecha_PP[1])
    .filterBounds(roi3);
    */

    console.log('"""""""""""""""""""""""""""""""""""""""""""""""""""');
    console.log(fecha_PP);

    var precipCollection = ee.ImageCollection("NASA/GLDAS/V021/NOAH/G025/T3H")
        .filterDate(fecha_PP[0], fecha_PP[1])        
        //.filterDate('2022-01-01', '2023-07-01')
        .filterBounds(roi3)
        .select('Qair_f_inst')
        .limit(4000);//No puede contener más de 5000 elementos
    
            
    console.log("Cantidad de imágenes para Humedad: " + precipCollection.size().getInfo());

    var reduceRegions = function(image) {
        var stats = image.reduceRegion({
            reducer: ee.Reducer.mean(),
            geometry: roi3,
            scale: 2000
        });

        var meanTemperature = stats.get('Qair_f_inst'); // Obtener la media de temperatura en Kelvin

        return ee.Feature(null, { qair: meanTemperature});
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
        var cadena = feature.id;//'A20230612_2100';
        var fecha = cadena.substring(1, cadena.indexOf('_'));
        //console.log(feature);
        //console.log(feature.properties);
        var precipitation = feature.properties.qair;
        var fecha_formateada = fecha.substring(0, 4) + "-" + fecha.substring(4, 6) + "-" + fecha.substring(6, 8);
        //featuresLocal.push({feature: feature, precipitation: precipitation});

        //Diccionario:
        //featuresLocal.push({fecha: fecha_formateada, precipitation: precipitation});
        //Apexchart:
        featuresLocal.push([fecha_formateada, precipitation]);
    }

    // Consultar el objeto local
    console.log("humedad");
    console.log(featuresLocal[0]);
    console.log(featuresLocal[1]);
    console.log(featuresLocal[2]);

    featuresLocal = fechasUnicas(featuresLocal);

    //console.log(featuresLocal);

    return featuresLocal;
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

module.exports = calculoHumedad;