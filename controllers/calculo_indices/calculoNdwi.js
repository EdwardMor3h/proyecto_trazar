const { ee } = require('../../utils/earthEngine');
const eeFeatureCollectionToGeojson = require('./featureCollectionToGeojson');

// 4. Funcion NDWI - Indice de diferencia normalizada agua
function Calc_NDWI_mf(image){
    var ndwi = image.expression("float(green - nir)/(green + nir)", {
        'green': image.select('GREEN'),
        'nir': image.select('NIR')
    });
    return ndwi.rename("NDWI");
}

function calculoNdwi(Sentinel2Amedian, roi, roi_original){
    //******************************************************************************************************************************************************   
    //NDWI
    //******************************************************************************************************************************************************   

    var ndwi_S2A = Calc_NDWI_mf(Sentinel2Amedian);
    //Clasificacion NDWI
        var ndwi_S2A_clas = ee.Image(0).where(ndwi_S2A.lt(0),1)
                            .where(ndwi_S2A.gte(0),2)
                            .where(ndwi_S2A.gte(0.2),3)
                            .where(ndwi_S2A.gte(0.4),4)
                            .where(ndwi_S2A.gte(0.66),5).clip(roi);
                            
        var viz_clas_ndwi = {
        'palette': ["#fff947",'#b9fa3e',"#5ce5d3", '#5172f4','#0D176B'],
        'min': 1,
        'max': 5
    };
    
    
    // Conversion a vector
    var vector_ndwi_S2A_clas = ndwi_S2A_clas.updateMask(ndwi_S2A_clas) 
                                    .reduceToVectors({geometry: roi,
                                            crs:ndwi_S2A_clas.projection(),
                                            scale:10,
                                            geometryType:'polygon',
                                            reducer:ee.Reducer.countEvery(),
                                            eightConnected:false,
                                            labelProperty:'constant',
                                            maxPixels:1e13});
    // Disolver el shapefile
    var propVals4 = ee.List(vector_ndwi_S2A_clas.aggregate_array('constant')).distinct();
    
    // then make a feature the union of all features having the same propVal
    var unionByProp4 = ee.FeatureCollection(propVals4.map(function(propVal){
        var tempFC = vector_ndwi_S2A_clas.filter(ee.Filter.eq('constant', propVal));
        var unionFC = tempFC.union(1); // specifying a max error overcomes issues with features of diff projection
        // cast the featureCollection (output union()) to a single feature
        return ee.Feature(unionFC.first()).set('constant', propVal);
    }));

    
    // Create a dictionary with unique identifier and values to add to the shapefile
    var data4 = {
        1:  "Muy bajo",
        2:  "Bajo",
        3:  "Medio",
        4:  "Alto",
        5:  "Muy alto"
    };
    
    // Function to add the value from the dictionary to a new field
    var addValue4 = function(feature) {
        var id = feature.get("constant");
        var value = ee.Dictionary(data4).get(id);
        return feature.set("Tipo2", value);
    };
    
    // Add the new field to the feature collection
    var updatedShapefile4 = unionByProp4.map(addValue4);

    // Intersectar el ROI con el shapefile
    var intersection = updatedShapefile4.map(function(feature){
        return feature.intersection(roi_original);
    });
    updatedShapefile4 = intersection;

    var values = ee.List([1, 2, 3, 4, 5]);
    var labels = ee.List(["1","2","3", "4","5"]);

    // Compute the area of each class.
    var areas = ee.Image.pixelArea().divide(1e4).addBands(ndwi_S2A_clas)
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
            geojson: eeFeatureCollectionToGeojson(updatedShapefile4),
            areas: areas.getInfo()
        }
    //);

}

module.exports = calculoNdwi;