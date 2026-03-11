var map = new maplibregl.Map({
    container: 'map',
    style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            //tiles: ["https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png"],
            //tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            //tiles: ["https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"],
            //tiles: ["https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"],           
            tiles: ["https://mts1.google.com/vt/lyrs=y@186112443&hl=x-local&src=app&x={x}&y={y}&z={z}&s=Galile"],
            tileSize: 256,
            attribution: 'Map tiles by <a target="_top" rel="noopener" href="https://tile.openstreetmap.org/">OpenStreetMap tile servers</a>, under the <a target="_top" rel="noopener" href="https://operations.osmfoundation.org/policies/tiles/">tile usage policy</a>. Data by <a target="_top" rel="noopener" href="http://openstreetmap.org">OpenStreetMap</a>'
            }
        }
        ,
        layers: [{
            id: 'osm',
            type: 'raster',
            source: 'osm',
        }]
    }
    ,
    center: [-74.5, 40],
    zoom: 9
});
    
/*
document.getElementById('fit').addEventListener('click', function () {

    map.fitBounds([
        [32.958984, -5.353521],
        [43.50585, 5.615985]
    ]);
});
*/



map.on('load', () => {
    
    (function get_tile(){
        $.ajax({
            url:'analisis',
            type:'GET',
            success: function(data){
                
                /*
                map.addSource('radar', {
                        'type': 'image',
                        'url': data.url,
                        'coordinates': [
                        [-80.425, 46.437],
                        [-71.516, 46.437],
                        [-71.516, 37.936],
                        [-80.425, 37.936]
                        ]
                });
                map.addLayer({
                        id: 'radar-layer',
                        'type': 'raster',
                        'source': 'radar',
                        'paint': {
                        'raster-fade-duration': 0
                    }
                });   
                */

                var fc = JSON.parse(data.geojson);
                console.log(fc);

                // agregar la capa al mapa
                map.addSource('features', {
                    type: 'geojson',
                    data: fc
                });

                map.addLayer({
                    id: 'features',
                    type: 'fill',
                    source: 'features',
                    /*
                    paint: {
                        'fill-color': '#088',
                        'fill-opacity': 0.8
                    }
                    */
                   paint: {
                    'fill-color' : [
                        'match',
                        ['get', 'constant'],
                        1,
                        '#FF0000',
                        2,
                        '#FF9300',
                        3,
                        '#F7FF00',
                        4,
                        '#55EE0D',
                        5,
                        '#3B8917',
                        'white'
                    ]
                   }
                });

                var coordinates = fc.features[0].geometry.coordinates;

                console.log(coordinates);

                /*
                var bounds = coordinates.reduce(function (bounds, coord) {
                    return bounds.extend(coord);
                }, new maplibregl.LngLatBounds({lng: coordinates[0], lat:coordinates[0]}));
                
                map.fitBounds(bounds, {
                    padding: 20
                });
                */

                //map.setCenter([-78.7025454,-6.1683226]);                
                var bbox = turf.bbox(fc);
                map.fitBounds(bbox);
                
    
            }
        })
    })();



});