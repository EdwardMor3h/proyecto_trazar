const { ee } = require('../../utils/earthEngine');
const eeFeatureCollectionToGeojson = require('./featureCollectionToGeojson');

// 3. Funcion EVI2 - Indice de vegetacion mejorada 2

function Calc_EVI2(imagen){
    var evi2 = imagen.expression('2.4*float(nir - red)/(nir + red + 1)',{
        'nir' : imagen.select('NIR'),
        'red' : imagen.select('RED')
    });
    return evi2.rename(['EVI2']);
}

function calculoEvi2(Sentinel2Amedian, roi, roi_original){
    //******************************************************************************************************************************************************   
    //EVI 2
    //******************************************************************************************************************************************************   

    var evi2_S2A = Calc_EVI2(Sentinel2Amedian);
    //Clasificacion EVI 2
    var evi2_S2A_clas = ee.Image(0).where(evi2_S2A.lt(0),1)
                        .where(evi2_S2A.gte(0),2)
                        .where(evi2_S2A.gte(0.2),3)
                        .where(evi2_S2A.gte(0.4),4)
                        .where(evi2_S2A.gte(0.66),5).clip(roi);
                        
    //Simbologia

    // Conversion a vector
    var vector_evi2_S2A_clas = evi2_S2A_clas.updateMask(evi2_S2A_clas) 
                                    .reduceToVectors({geometry: roi,
                                        crs:evi2_S2A_clas.projection(),
                                        scale:10,
                                        geometryType:'polygon',
                                        reducer:ee.Reducer.countEvery(),
                                        eightConnected:false,
                                        labelProperty:'constant',
                                        maxPixels:1e13});
    // Disolver el shapefile
    var propVals3 = ee.List(vector_evi2_S2A_clas.aggregate_array('constant')).distinct();

    // then make a feature the union of all features having the same propVal
    var unionByProp3 = ee.FeatureCollection(propVals3.map(function(propVal){
    var tempFC = vector_evi2_S2A_clas.filter(ee.Filter.eq('constant', propVal));
    var unionFC = tempFC.union(1); // specifying a max error overcomes issues with features of diff projection
    // cast the featureCollection (output union()) to a single feature
    return ee.Feature(unionFC.first()).set('constant', propVal);
    }));


    // Create a dictionary with unique identifier and values to add to the shapefile
    var data3 = {
    1:  "Suelo sin vegetación",
    2:  "Enferma",
    3: "Medianamente saludable",
    4:  "Saludable",
    5: "Muy saludable Y"
    };

    // Function to add the value from the dictionary to a new field
    var addValue3 = function(feature) {
    var id = feature.get("constant");
    var value = ee.Dictionary(data3).get(id);
    return feature.set("Tipo2", value);
    };

    // Add the new field to the feature collection
    var updatedShapefile3 = unionByProp3.map(addValue3);

    // Intersectar el ROI con el shapefile
    var intersection = updatedShapefile3.map(function(feature){
        return feature.intersection(roi_original);
    });
    updatedShapefile3 = intersection;

    var values = ee.List([1, 2, 3, 4, 5]);
    var labels = ee.List(["1","2","3","4","5"]);

    // Compute the area of each class.
    var areas = ee.Image.pixelArea().divide(1e4).addBands(evi2_S2A_clas)
    .reduceRegion({
        reducer: ee.Reducer.sum().group(1), 
        geometry: roi, 
        scale: 10
    }).get('groups');

    // Convert the list of group dictionaries into one big dictionary.
    areas = ee.Dictionary(ee.List(areas).map(function(dict) {
    dict = ee.Dictionary(dict);
    var value = dict.getNumber('sum');
    var klass = dict.getNumber('group');
    var index = values.indexOf(klass);
    var label = labels.get(index);
    return [label, value];
    }).flatten());

    //return JSON.stringify(
        return {
            geojson: eeFeatureCollectionToGeojson(updatedShapefile3),
            areas: areas.getInfo()
        }
    //);
}

module.exports = calculoEvi2;