const { ee } = require('../../utils/earthEngine');
const eeFeatureCollectionToGeojson = require('./featureCollectionToGeojson');

// 2. Funcion EVI - Indice de vegetacion mejorada
function Calc_EVI(image){
    var evi = image.expression("(2.5 * float(nir - red)/(nir + 6*red - 7.5*blue + 1))", {
            'blue': image.select('BLUE'),
            'nir': image.select('NIR'),
            'red': image.select('RED')
        });
    return evi.rename("EVI");
}

function calculoEvi(Sentinel2Amedian, roi, roi_original){
    //******************************************************************************************************************************************************   
    //EVI
    //******************************************************************************************************************************************************   

    var evi_S2A = Calc_EVI(Sentinel2Amedian); 
    //Clasificacion EVI
        var evi_S2A_clas = ee.Image(0).where(evi_S2A.lt(0),1)
                            .where(evi_S2A.gte(0),2)
                            .where(evi_S2A.gte(0.2),3)
                            .where(evi_S2A.gte(0.4),4)
                            .where(evi_S2A.gte(0.66),5).clip(roi);
                            
    //Simbologia
    
    
    // Conversion a vector
    var vector_evi_S2A_clas = evi_S2A_clas.updateMask(evi_S2A_clas) 
                                    .reduceToVectors({geometry: roi,
                                            crs:evi_S2A_clas.projection(),
                                            scale:10,
                                            geometryType:'polygon',
                                            reducer:ee.Reducer.countEvery(),
                                            eightConnected:false,
                                            labelProperty:'constant',
                                            maxPixels:1e13});
    // Disolver el shapefile
    var propVals2 = ee.List(vector_evi_S2A_clas.aggregate_array('constant')).distinct();
    
    // then make a feature the union of all features having the same propVal
    var unionByProp2 = ee.FeatureCollection(propVals2.map(function(propVal){
        var tempFC = vector_evi_S2A_clas.filter(ee.Filter.eq('constant', propVal));
        var unionFC = tempFC.union(1); // specifying a max error overcomes issues with features of diff projection
        // cast the featureCollection (output union()) to a single feature
        return ee.Feature(unionFC.first()).set('constant', propVal);
    }));

    
    // Create a dictionary with unique identifier and values to add to the shapefile
    var data2 = {
        1:  "Suelo sin vegetación",
        2:  "Enferma",
        3: "Medianamente saludable",
        4:  "Saludable",
        5: "Muy saludable X"
    };
    
    // Function to add the value from the dictionary to a new field
    var addValue2 = function(feature) {
        var id = feature.get("constant");
        var value = ee.Dictionary(data2).get(id);
        return feature.set("Tipo2", value);
    };
    
    // Add the new field to the feature collection
    var updatedShapefile2 = unionByProp2.map(addValue2);

    // Intersectar el ROI con el shapefile
    var intersection = updatedShapefile2.map(function(feature){
        return feature.intersection(roi_original);
    });
    updatedShapefile2 = intersection;

    var values = ee.List([1, 2, 3, 4, 5]);
    var labels = ee.List(["1","2","3","4","5"]);

    // Compute the area of each class.
    var areas = ee.Image.pixelArea().divide(1e4).addBands(evi_S2A_clas)
    .reduceRegion({
        reducer: ee.Reducer.sum().group(1), 
        geometry: roi, 
        scale: 10
        //scale: 10000
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
            geojson: eeFeatureCollectionToGeojson(updatedShapefile2),
            areas: areas.getInfo()
        }
    //);
}

module.exports = calculoEvi;