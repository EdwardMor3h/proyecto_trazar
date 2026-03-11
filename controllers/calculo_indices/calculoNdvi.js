const { ee } = require('../../utils/earthEngine');
const eeFeatureCollectionToGeojson = require('./featureCollectionToGeojson');

// 1. Determinar NDVI - Indice de diferencia normalizada vegetación
function Calc_NDVI(image){
    var ndvi = image.expression('float(nir - red)/(nir + red)', {
        'nir': image.select('NIR'),
        'red': image.select('RED')
    }); 
    return ndvi.rename("NDVI");
}

function calculoNdvi(Sentinel2Amedian,roi,roi_original){

    //NDVI      
    //******************************************************************************************************************************************************   

    var ndvi_S2A = Calc_NDVI(Sentinel2Amedian);
    //---------------------------------------------------------------------------------------------------------------------------------------------  
    // Clasificación Indice
    var ndvi_S2A_clas = ee.Image(0).where(ndvi_S2A.lt(0),1)
                            .where(ndvi_S2A.gte(0),2)
                            .where(ndvi_S2A.gte(0.2),3)
                            .where(ndvi_S2A.gte(0.4),4)
                            .where(ndvi_S2A.gte(0.66),5).clip(roi);
                        
    var viz_clas = {
        'palette': ["#FF0000",'#FF9300',"#F7FF00", '#55EE0D','#3B8917'],
        'min': 1,
        'max': 5
    };
    //---------------------------------------------------------------------------------------------------------------------------------------------  
    // Conversion a vector
    var vector_ndvi_S2A_clas = ndvi_S2A_clas.updateMask(ndvi_S2A_clas) 
                                    .reduceToVectors({geometry: roi,
                                            crs:ndvi_S2A_clas.projection(),
                                            scale:10,
                                            geometryType:'polygon',
                                            reducer:ee.Reducer.countEvery(),
                                            eightConnected:false,
                                            labelProperty:'constant',
                                            maxPixels:1e13});
    //---------------------------------------------------------------------------------------------------------------------------------------------  
    // Disolver el shapefile
    var propVals1 = ee.List(vector_ndvi_S2A_clas.aggregate_array('constant')).distinct();

    // then make a feature the union of all features having the same propVal
    var unionByProp1 = ee.FeatureCollection(propVals1.map(function(propVal){
        var tempFC = vector_ndvi_S2A_clas.filter(ee.Filter.eq('constant', propVal));
        var unionFC = tempFC.union(1); // specifying a max error overcomes issues with features of diff projection
        // cast the featureCollection (output union()) to a single feature
        return ee.Feature(unionFC.first()).set('constant', propVal);
    }));

    //---------------------------------------------------------------------------------------------------------------------------------------------  
    // Create a dictionary with unique identifier and values to add to the shapefile
    var data1 = {
        1:  "Suelo sin vegetación",
        2:  "Enferma",
        3:  "Medianamente saludable",
        4:  "Saludable",
        5:  "Muy saludable"
    };

    // Function to add the value from the dictionary to a new field
    var addValue1 = function(feature) {
        var id = feature.get("constant");
        var value = ee.Dictionary(data1).get(id);
        return feature.set("Tipo2", value);
    };

    // Add the new field to the feature collection
    var updatedShapefile1 = unionByProp1.map(addValue1);
    //console.log('updatedShapefile1',updatedShapefile1);

    //console.log('updatedShapefile1',updatedShapefile1.getInfo());

    // Intersectar el ROI con el shapefile
    var intersection = updatedShapefile1.map(function(feature){
        return feature.intersection(roi_original);
    });
    
    updatedShapefile1 = intersection;
  

    //Descarga en shapefile
    var URLDescarga=updatedShapefile1.getDownloadURL({format:"SHP",filename:"Indice_NDVI"});

    //console.log(URLDescarga);

    //CALCULO DE AREAS

    var values = ee.List([1, 2, 3, 4, 5]);
    var labels = ee.List(["1","2","3","4","5"]);
    
    var areas = ee.Image.pixelArea().divide(1e4).addBands(ndvi_S2A_clas)
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
            geojson: eeFeatureCollectionToGeojson(updatedShapefile1),
            areas: areas.getInfo()
        }
    //);
    //return updateShapefile1;

    res
    .status(200)
    .json({ url: url,
            geojson: JSON.stringify(eeFeatureCollectionToGeojson(updatedShapefile1))
        });
}

module.exports = calculoNdvi;