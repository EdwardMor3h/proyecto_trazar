const { ee } = require('../../utils/earthEngine');

function calculoMonoxidoCarbono(fecha_PP, roi3) {
    // COLECCION DE MONÓXIDO DE CARBONO
    var carbonMonoxideCollection = ee.ImageCollection("COPERNICUS/S5P/NRTI/L3_CO")
        .filterDate(fecha_PP[0], fecha_PP[1])
        .filterBounds(roi3)
        .select(['CO_column_number_density']);

    console.log("Cantidad de imágenes para monóxido de carbono: " + carbonMonoxideCollection.size().getInfo());

    var reduceRegionsCarbonMonoxide = function(image) {
        var stats = image.reduceRegion({
            reducer: ee.Reducer.mean(),
            geometry: roi3,
            scale: 2000
        });

        var meanCarbonMonoxide = stats.get('CO_column_number_density'); // Obtener la media de monóxido de carbono

        return ee.Feature(null, { CO_column_number_density: meanCarbonMonoxide });
    };

    var carbonMonoxideFeatures = carbonMonoxideCollection.map(reduceRegionsCarbonMonoxide);

    // Obtener los datos como un objeto JSON
    var carbonMonoxideFeaturesJSON = carbonMonoxideFeatures.getInfo();

    console.log("carbonMonoxideFeaturesJSON===========");
    //console.log(carbonMonoxideFeaturesJSON);

    // Obtener todos los features de monóxido de carbono en local
    var carbonMonoxideFeaturesLocal = [];

    var carbonMonoxideFeaturesArray = carbonMonoxideFeaturesJSON.features;
    for (var i = 0; i < carbonMonoxideFeaturesArray.length; i++) {
        var feature = carbonMonoxideFeaturesArray[i];
        var cadena = feature.id; // CO_column_number_density_2022112312
        var fecha = cadena.substring(cadena.lastIndexOf('_') + 1, cadena.lastIndexOf('_') + 9);
        var fecha_formateada = fecha.substring(0, 4) + "-" + fecha.substring(4, 6) + "-" + fecha.substring(6, 8);

        var carbonMonoxide = feature.properties.CO_column_number_density;

        // Apexchart:
        carbonMonoxideFeaturesLocal.push([fecha_formateada, carbonMonoxide]);
    }

    // Consultar el objeto local
    console.log("monóxido de carbono");
    console.log(carbonMonoxideFeaturesLocal[0]);
    console.log(carbonMonoxideFeaturesLocal[1]);
    console.log(carbonMonoxideFeaturesLocal[2]);

    carbonMonoxideFeaturesLocal = fechasUnicas(carbonMonoxideFeaturesLocal);

    return carbonMonoxideFeaturesLocal;
    //return carbonMonoxideFeaturesLocal;
}

function fechasUnicas(data) {
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

module.exports = calculoMonoxidoCarbono;
