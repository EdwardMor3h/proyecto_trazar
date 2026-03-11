function eeFeatureCollectionToGeojson(fc){
    /// Obtener la lista de características como un arreglo
    var features = fc.getInfo().features;

    // Crear un objeto GeoJSON manualmente
    var geoJSON = {
    type: 'FeatureCollection',
    features: []
    };

    for (var i = 0; i < features.length; i++) {
    var feature = features[i];
    var properties = feature.properties;
    var geometry = feature.geometry;

    var geoJSONFeature = {
        type: 'Feature',
        geometry: geometry,
        properties: properties
    };
    
    geoJSON.features.push(geoJSONFeature);
    }

    // Mostrar el JSON en la consola
    console.log(JSON.stringify(geoJSON));
    
    return geoJSON;
}

module.exports = eeFeatureCollectionToGeojson;