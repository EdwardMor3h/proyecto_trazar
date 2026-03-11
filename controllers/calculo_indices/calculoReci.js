const { ee } = require('../../utils/earthEngine');
const eeFeatureCollectionToGeojson = require('./featureCollectionToGeojson');

// 6. Funcion ReCI - Indice de clorofila de borde rojo
function Calc_RECI(image){
    var reci = image.expression("float((nir / red) - 1)", {
          'red': image.select('RED'),
          'nir': image.select('NIR'),
      });
      return reci.rename("RECI");
  }

function calculoReci(Sentinel2Amedian, roi, roi_original){
    //******************************************************************************************************************************************************   
    //RECI
    //******************************************************************************************************************************************************   

    var reci_S2A = Calc_RECI(Sentinel2Amedian);
    //Clasificacion RECI Opcional
    var reci_S2A_clas = ee.Image(0).where(reci_S2A.lt(1),1)
                            .where(reci_S2A.gte(1),2)
                            .where(reci_S2A.gte(2.5),3)
                            .where(reci_S2A.gte(5.5),4)
                            .where(reci_S2A.gte(7.5),5).clip(roi);
    
    
    // Conversion a vector
    var vector_reci_S2A_clas = reci_S2A_clas.updateMask(reci_S2A_clas) 
                                    .reduceToVectors({geometry: roi,
                                            crs:reci_S2A_clas.projection(),
                                            scale:10,
                                            geometryType:'polygon',
                                            reducer:ee.Reducer.countEvery(),
                                            eightConnected:false,
                                            labelProperty:'constant',
                                            maxPixels:1e13});
    // Disolver el shapefile
    var propVals6 = ee.List(vector_reci_S2A_clas.aggregate_array('constant')).distinct();
    
    // then make a feature the union of all features having the same propVal
    var unionByProp6 = ee.FeatureCollection(propVals6.map(function(propVal){
        var tempFC = vector_reci_S2A_clas.filter(ee.Filter.eq('constant', propVal));
        var unionFC = tempFC.union(1); // specifying a max error overcomes issues with features of diff projection
        // cast the featureCollection (output union()) to a single feature
        return ee.Feature(unionFC.first()).set('constant', propVal);
    }));

    
    // Create a dictionary with unique identifier and values to add to the shapefile
    var data6 = {
        1:  "Muy baja actividad fotosintética",
        2:  "Baja actividad fotosintética",
        3:  "Media actividad fotosintética",
        4:  "Alta actividad fotosintética",
        5:  "Muy alta actividad fotosintética"
    };
    
    // Function to add the value from the dictionary to a new field
    var addValue6 = function(feature) {
        var id = feature.get("constant");
        var value = ee.Dictionary(data6).get(id);
        return feature.set("Tipo2", value);
    };
    
    // Add the new field to the feature collection
    var updatedShapefile6 = unionByProp6.map(addValue6);

    // Intersectar el ROI con el shapefile
    var intersection = updatedShapefile6.map(function(feature){
        return feature.intersection(roi_original);
    });
    updatedShapefile6 = intersection;

    var values = ee.List([1, 2, 3, 4, 5]);
    var labels = ee.List(["1","2","3","4","5"]);

    // Compute the area of each class.
    var areas = ee.Image.pixelArea().divide(1e4).addBands(reci_S2A_clas)
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
            geojson: eeFeatureCollectionToGeojson(updatedShapefile6),
            areas: areas.getInfo()
        }
    //);
}

module.exports = calculoReci;