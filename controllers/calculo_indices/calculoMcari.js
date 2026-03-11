const { ee } = require('../../utils/earthEngine');
const eeFeatureCollectionToGeojson = require('./featureCollectionToGeojson');

// 5. Funcion MCARI Indice de reflectancia de absorcion modificada clorofila
function Calc_MCARI(image){
    var mcari = image.expression("(float(nir -red)- 0.2*(nir - green))*(nir / red)", {
          'green': image.select('GREEN'),
          'nir': image.select('NIR'),
          'red': image.select('RED')
      });
      return mcari.rename("MCARI");
  }

function calculoMcari(Sentinel2Amedian, roi, roi_original){
    //******************************************************************************************************************************************************   
    //MCARI
    //******************************************************************************************************************************************************   

    var mcari_S2A = Calc_MCARI(Sentinel2Amedian);
    //Clasificacion MCARI
        var mcari_S2A_clas = ee.Image(0).where(mcari_S2A.lt(0),1)
                            .where(mcari_S2A.gte(0),2)
                            .where(mcari_S2A.gte(0.2),3)
                            .where(mcari_S2A.gte(0.4),4)
                            .where(mcari_S2A.gte(0.66),5).clip(roi);
                            
    
    
    // Conversion a vector
    var vector_mcari_S2A_clas = mcari_S2A_clas.updateMask(mcari_S2A_clas) 
                                    .reduceToVectors({geometry: roi,
                                            crs:mcari_S2A_clas.projection(),
                                            scale:10,
                                            geometryType:'polygon',
                                            reducer:ee.Reducer.countEvery(),
                                            eightConnected:false,
                                            labelProperty:'constant',
                                            maxPixels:1e13});
    // Disolver el shapefile
    var propVals5 = ee.List(vector_mcari_S2A_clas.aggregate_array('constant')).distinct();
    
    // then make a feature the union of all features having the same propVal
    var unionByProp5 = ee.FeatureCollection(propVals5.map(function(propVal){
        var tempFC = vector_mcari_S2A_clas.filter(ee.Filter.eq('constant', propVal));
        var unionFC = tempFC.union(1); // specifying a max error overcomes issues with features of diff projection
        // cast the featureCollection (output union()) to a single feature
        return ee.Feature(unionFC.first()).set('constant', propVal);
    }));

    
    // Create a dictionary with unique identifier and values to add to the shapefile
    var data5 = {
        1:  "Muy baja absorción",
        2:  "Baja absorción",
        3:  "Media absorción",
        4:  "Alta absorción",
        5:  "Muy alta absorción"
    };
    
    // Function to add the value from the dictionary to a new field
    var addValue5 = function(feature) {
        var id = feature.get("constant");
        var value = ee.Dictionary(data5).get(id);
        return feature.set("Tipo2", value);
    };
    
    // Add the new field to the feature collection
    var updatedShapefile5 = unionByProp5.map(addValue5);

    // Intersectar el ROI con el shapefile
    var intersection = updatedShapefile5.map(function(feature){
        return feature.intersection(roi_original);
    });
    updatedShapefile5 = intersection;

    var values = ee.List([1, 2, 3, 4, 5]);
    var labels = ee.List(["1","2","3","4","5"]);

    // Compute the area of each class.
    var areas = ee.Image.pixelArea().divide(1e4).addBands(mcari_S2A_clas)
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
            geojson: eeFeatureCollectionToGeojson(updatedShapefile5),
            areas: areas.getInfo()
        }
    //);
}

module.exports = calculoMcari;