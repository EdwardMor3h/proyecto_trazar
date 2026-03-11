var ip_server = 'https://geofarmsperhusa.com.pe';

if (location.hostname === "localhost" || location.hostname === "127.0.0.1")
{
    ip_server = 'http://127.0.0.1:3000'
}


mostrar_cargando(null);

var height = $(window).height();
height = height - 78;
var objectid_actual;
var gGlobal = [];
var gSeleccionado = null;
var monthlyPrecipitation;
var monthlyTemperature;

var gCapaVisible = null;
var gData = {};

var indice_seleccionado = "ndvi";
var bounds_parcela_seleccionada = [];

var gIndiceSeleccionado = 'ndvi';

var gDatosParcelaActual = null;//guarda los datos de la parcela seleccionada y el periodo elegido

var gAjaxLlamadaProceso = null;

var texto_parcela_seleccionada = 'parcela';
var lpa_tipo_convencional_seleccionado = 'CONVENCIONAL';
var lpa_tipo_organico_seleccionado = 'ORGANICO';


// $('.info-section').height(height);
// $('.map-section').height(height);
// $('#map').height(height);

$('.switch-parcelas-convencionales input').on('change',function(){

  if($(this).is(':checked')){

    lpa_tipo_convencional_seleccionado = 'CONVENCIONAL';

    console.log(lpa_tipo_convencional_seleccionado);
    console.log(lpa_tipo_organico_seleccionado);
        
  }
  else{
    lpa_tipo_convencional_seleccionado = 'QUITAR-CONVENCIONAL'; 
    console.log(lpa_tipo_convencional_seleccionado);
    console.log(lpa_tipo_organico_seleccionado);
  }

  cargarGeojsonSegunBounds();
});

$('.switch-parcelas-organicas input').on('change',function(){

  if($(this).is(':checked')){

    lpa_tipo_organico_seleccionado = 'ORGANICO';
    console.log(lpa_tipo_convencional_seleccionado);
    console.log(lpa_tipo_organico_seleccionado);
        
  }
  else{
    lpa_tipo_organico_seleccionado = 'QUITAR-ORGANICO'; 
    console.log(lpa_tipo_convencional_seleccionado);
    console.log(lpa_tipo_organico_seleccionado);
  }

  cargarGeojsonSegunBounds();
});

$('.table-container').css('display','none');
     
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
            //attribution: ''
            }
        },
        "glyphs": "https://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
        layers: [{
            id: 'osm',
            type: 'raster',
            source: 'osm',
        }]
    }
    ,
    center: [-75.02919564021485, -9.213978200952667],
    zoom: 5
});


map.on('load', function(){
  inicio();
})

map.addControl(new maplibregl.NavigationControl(), 'top-left');

function inicio(){

  //cargarGeojsonSegunBounds();
  ocultar_cargando();
  inicializarBuscadorParcelas();

} // ./inicio()

function cargarGeojsonSegunBounds(){
  var zona_id = $('meta[name="zona-id"]').attr('content');
    var rol_id = $('meta[name="rol-id"]').attr('content');
    var _data = {};

    if(rol_id == '3'){
      _data = {
        zona_id: zona_id
      }
    }

    var bounds = map.getBounds();
    _data["minLng"] = bounds.getWest();
    _data["minLat"] = bounds.getSouth();
    _data["maxLng"] = bounds.getEast();
    _data["maxLat"] = bounds.getNorth();
    _data["lpa_tipo_convencional"] = lpa_tipo_convencional_seleccionado;
    _data["lpa_tipo_organico"] = lpa_tipo_organico_seleccionado;
    


    //alert(zona_id);
    $.ajax({
        url: '/get-parcelas-shapefile-monitoreo',
        //url: '/get-nuevas-parcelas-shapefile',
        type: 'GET',
        dataType: 'json',
        data: _data,
        success: function(geojson) {

          ocultar_cargando();

          //delete geojson["bbox"];

          // console.log(geojson); // Aquí puedes hacer algo con el GeoJSON devuelto
          geojson = JSON.parse(geojson);

          gGlobal = geojson;
          console.log(geojson);
          if(geojson.features && geojson.features.length > 0){
            gSeleccionado = geojson.features[0];
            agregar_geojson('cafe','fill',geojson, _paint=null, {'text_field':'nombre', 'text_size': 20});
            //cambiarEstiloParcelaSeleccionada(49);

            agregar_geojson_borde('cafeborde','line',geojson);
          }           

          /*
          gSeleccionado = geojson;
          console.log(gSeleccionado);

          for(var i=0; i<geojson["features"].length; i++){
            var feature = geojson["features"][i];
            //console.log(feature["properties"]["ALTITUD"]);            
          }

          const bounds = new maplibregl.LngLatBounds();
          var coordinates = geojson["features"][0]["geometry"]["coordinates"][0].forEach(coord => bounds.extend(coord));
          console.log(bounds);

          map.fitBounds(bounds, {
            padding: 20
          });
          */
          // console.log(geojson);
          //var firstFeature = geojson.features[0];
          //console.log(firstFeature);
          //var turfMultiPolygon = turf.multiPolygon(firstFeature.geometry.coordinates);
          //var bbox = turf.bbox(turfMultiPolygon);
          //var bounds = [[bbox[0], bbox[1]], [bbox[2], bbox[3]]];
          //map.fitBounds(bounds, { padding: 20 });
                  
          //var matriz = geojson;

          /*
          for(var i=0; i<geojson["features"].length; i++){

            var feature = geojson["features"][i];
            matriz.push(feature["properties"]); 

          }
          */

          // console.log(matriz);

          //llenarTabla(geojson, 200);

            //   ---------------#### Lista de parcelas productivas

            var timeoutId;
            /*
            $('.input-buscar-parcela').on('keyup focus',function(){

                //clearTimeout(timeoutId);

                //timeoutId = setTimeout(function () {

                $(".atributos-up-section").hide();
                // console.log('a');
            
                var buscado = $(this).val().trim().toUpperCase();
                var data = "";
                // Get the Multidimensional Array first
                // console.log(matriz);
                if ( buscado.length >= 0 ){                

                    data = $.grep(matriz, function (e) {
                      // console.log(e);
                      //if(e.COD_PROD.toUpperCase().indexOf(buscado) != -1 || e.NOM_PARC.toUpperCase().indexOf(buscado) != -1 || e.NOM_PARC.toUpperCase().indexOf(buscado) != -1 || e.DNI.toUpperCase().indexOf(buscado) != -1)
                      if(e.productor_codigo==null && e.nombre==null){
                        e.productor_codigo = '';
                        e.nombre = '';
                      }

                      e.id ? true : e.id = '';
                      e.productor_codigo ? true : e.productor_codigo = '';
                      e.nombre ? true : e.nombre = '';
                      e.parcela_gid ? true : e.parcela_gid = '';
                      e.productor_nombre ? true : e.productor_nombre = '';
                      e.productor_dni ? true : e.productor_dni = '';

                      if(e.productor_codigo.toUpperCase().indexOf(buscado) != -1 || 
                      e.nombre.toUpperCase().indexOf(buscado) != -1 || 
                      (e.id).toString().indexOf(buscado) != -1 || 
                      e.productor_nombre.toUpperCase().indexOf(buscado) != -1 || 
                      e.productor_dni.indexOf(buscado) != -1)//|| e.DNI.toUpperCase().indexOf(buscado) != -1)
                          return e;
                    });                  
                }
            
                if ( data != "" ){
                    $(this).parent().find(".dropdown-content").show();
            
                    // actualizar_datos_lista_parcelas(data,this);
                    
                    var sug = "";

                    var url_img = null;
            
                    for(i=0; i<data.length; i++){

                        url_img = 'https://cdn.www.gob.pe/uploads/document/file/1464052/standard_FOTO_WEB_CAFE-1536x1024.jpg';

                        if("productor_imagen" in data[i] && data[i]["productor_imagen"] != null){
                          url_img = '/' + data[i]["productor_imagen"];
                        }
            
                        sug += '<li class="list-group-item a_producto p-bus" data-idg="'+ data[i].parcela_gid +'">\
                                <div class="d-flex">\
                                    <img class="img-fluid" src="'+ url_img +'" alt="">\
                                    <div class="flex-grow-1">\
                                        <a>\
                                        <h6>' + data[i].id + ' - ' + data[i].nombre + '</h6>\
                                        </a>\
                                        <p>' + data[i].productor_nombre + ' - ' + data[i].productor_codigo + ' - ' + data[i].productor_dni + '</p>\
                                    </div>\
                                </div>\
                            </li>'
                        
                      if(i>20) break;
                    }
            
                    //Seleccionar el elemento siguiente (div)
                    $(this).next().find('ul').html(sug);
                }
                else{
                  $(".dropdown-content").hide();
                }
              
              //}, 1000);//./timeout
                
            }).on("focusout", function(){
              setTimeout(function() {
                $(".dropdown-content").hide();
                console.log("se cerro la ventana de parcelas");
              }, 500);
            });
            */

        } // ./success:
      }); // ./ajax:
    
  //Colocar zoom en elemento del map
  $('.div-zoom-info').html('Zoom: ' + map.getZoom());

  //Agregar Capa de datos
  /*
  map.addSource('cafe_source', {
      'type': 'vector',
      'tiles': [
          //ip_server + '/mvt-tiles/1/'+ $table_name +'/{z}/{x}/{y}'
          ip_server + '/get-tile-set/parcelas_cafe/{z}/{x}/{y}.pbf'
      ],

      'minzoom': 4,
      'maxzoom': 19  
  });

  map.addLayer({
    'id': 'cafe',
    'type': 'fill',
    'source': 'cafe_source',
    'source-layer': 'parcelas_cafe',
    'paint': {
                  'fill-color': '#29A847',
                  'fill-opacity':  0,
              }
  });

  map.addLayer({
    'id': 'cafe_labels',
    'type': 'symbol',
    'source': 'cafe_source',
    'source-layer': 'parcelas_cafe',
    'layout': {
                "symbol-placement": "point",
                'text-field': [
                  'concat',
                  ['get', 'nombre'], '\n',
                  ['case', ['has', 'productor_nombre'], ['get', 'productor_nombre'], ''],
                  ['case', ['all', ['has', 'productor_nombre'], ['has', 'productor_codigo']], ' - ', ''],
                  ['case', ['has', 'productor_codigo'], ['get', 'productor_codigo'], ''],
                  '\n',
                  ['case', ['has', 'area_poly_ha'], ['concat',
                    [
                      'number-format',
                      ['get', 'area_poly_ha'],
                      { 'min-fraction-digits': 2, 'max-fraction-digits': 2 }
                    ], ' Ha'], '']
                ],
                "text-font": ["Open Sans Regular"],
                'text-size': [
                  'case',
                  ['has', 'nombre'],
                  16, // Tamaño de fuente para el campo 'nombre'
                  ['case', ['has', 'productor_nombre'], 12, 10] // Tamaño de fuente para 'productor_nombre' y 'area_ha'
              ],
                'text-anchor': 'center',
                'text-optional': true
            },    
    'paint': {
        //"text-field": ['get','capital'],
        "text-color": '#fff',
        // "text-halo-blur": 1,
        "text-halo-color": "#181F26",
        "text-halo-width": 1
    },
    
    'minzoom': 16
    //'layout':{"visibility":"none"}
    },
  //'lotes_zonificacion'
  );

  map.addLayer({
      id: 'cafe_borde',
      type: 'line',
      source: 'cafe_source',
      'source-layer': 'parcelas_cafe',
      paint: {
          'line-color': '#ffffff',
          'line-width': 2
      }
  })
  */
}

map.on('moveend', function() {
  if (map.getZoom() > 10) {
    cargarGeojsonSegunBounds();
  }
});

map.on('zoomend', function() {
  if (map.getZoom() > 10) {
    cargarGeojsonSegunBounds();
  }
});

function inicializarBuscadorParcelas(){
  let timeout = null;

  document.querySelector('.input-buscar-parcela').addEventListener('input', function() {
    clearTimeout(timeout);

    const query = this.value;
    console.log(query);

    timeout = setTimeout(() => {
      if (query.length > 0) {
        buscarParcelas(query);
      }
      else{
        buscarParcelas("");
      }
    }, 1000);
  });

  // Manejador de eventos para cuando el input recibe el foco
  document.querySelector('.input-buscar-parcela').addEventListener('focus', function() {
    const query = this.value;
    if (!query) {
      buscarParcelas(""); // Llamar a la función con una consulta vacía para obtener los primeros 1000 resultados
    }
  });

  function buscarParcelas(query) {

    // Mostrar el spinner
    document.querySelector('.spinner').style.display = 'block';

    $.ajax({
      url: '/get-parcelas-json-monitoreo',
      type: 'GET',
      dataType: 'json',
      data: { query: query },
      success: function(result) {
        console.log(result); // Aquí puedes manejar los resultados de la búsqueda
        mostrarListaDesplegable(result);
      },
      error: function(xhr, status, error) {
        console.error('Error al buscar parcelas:', error);
      },
      complete: function() {
        // Ocultar el spinner
        document.querySelector('.spinner').style.display = 'none';
      }
    });
  }
}

function mostrarListaDesplegable(data){
  if ( data.length > 0){
      var _input = $('.input-buscar-parcela')

      _input.parent().find(".dropdown-content").show();

      // actualizar_datos_lista_parcelas(data,this);
      
      var sug = "";

      var url_img = null;

      for(i=0; i<data.length; i++){

          url_img = 'https://cdn.www.gob.pe/uploads/document/file/1464052/standard_FOTO_WEB_CAFE-1536x1024.jpg';

          if("productor_imagen" in data[i] && data[i]["productor_imagen"] != null){
            url_img = '/' + data[i]["productor_imagen"];
          }

          sug += '<li class="list-group-item a_producto p-bus" data-idg="'+ data[i].parcela_gid +'">\
                  <div class="d-flex">\
                      <img class="img-fluid" src="'+ url_img +'" alt="">\
                      <div class="flex-grow-1">\
                          <a>\
                          <h6>' + data[i].id + ' - ' + data[i].nombre + '</h6>\
                          </a>\
                          <p>' + data[i].productor_nombre + ' - ' + data[i].productor_codigo + ' - ' + data[i].productor_dni + '</p>\
                      </div>\
                  </div>\
              </li>'
          
        if(i>20) break;
      }

      //Seleccionar el elemento siguiente (div)
      _input.next().find('ul').html(sug);
  }
  else{
    $(".dropdown-content").hide();
  }
}

map.on('zoom', function(){
  $('.div-zoom-info').html('Zoom: ' + parseInt(map.getZoom()));
});

map.on('click', 'cafe', (e) => {
  /*
  const gid_seleccionado = e.features[0].properties.gid;

  console.log(gid_seleccionado);

  for(var i=0; i<gGlobal.length; i++){
    if(gid_seleccionado == gGlobal[i].parcela_gid){
      gSeleccionado = gGlobal[i];
    }
  };

  console.log(gSeleccionado);

  renderizarTabla(gSeleccionado);

  let nombre_parcela_seleccionada = gSeleccionado["id"] + ' - ' + gSeleccionado["nombre"];
    $('.input-buscar-parcela').val(nombre_parcela_seleccionada);
    texto_parcela_seleccionada = nombre_parcela_seleccionada;
  */
  // Ensure that if the map is zoomed out such that multiple
  // copies of the feature are visible, the popup appears
  // over the copy being pointed to.
  // while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
  //     coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
  // }

  // new maplibregl.Popup()
  //     .setLngLat(coordinates)
  //     .setHTML(description)
  //     .addTo(map);
});

    function consultar_periodo_gee(_objectid,_periodoUno,_periodoDos){

        gDatosParcelaActual = {
            identificador_parcela : _objectid,
            fecha_inicio : _periodoUno,
            fecha_fin : _periodoDos
        }

        gAjaxLlamadaProceso = $.ajax({
            url:'consultar-periodo-gee',
            type:'GET',
            data: gDatosParcelaActual,
            success: async function(data){

                // Ocultar Vista "Cargando Indices"
                $('.loader-indices').css("display","none");
                $('#loader').html("");
                $('.div-btn-cancelar-proceso').css("display","none");

                var fechas_disponibles = await consultarFechasDisponiblesBD({
                      gid: _objectid,
                      fecha_inicio: _periodoUno,
                      fecha_fin: _periodoDos
                    })               
                
                console.log(fechas_disponibles);

                const valoresUnicos = [...new Set(fechas_disponibles.map((elemento) => elemento.fecha_indice))];

                var arrayCombinado = combinar_fechas_local_gee(valoresUnicos, data.formattedDates);

                llenar_fechas(arrayCombinado);
              
            },
            error: function (jqXHR, textStatus, errorThrown) {
               alert('No se encontraron resultados para este período');
               console.log('No se encontraron resultados para este período');
               
               $('.btn-volver-fechas').click();
               ocultarVistaCargando();
            }
        })
    };
    
    function consultarFechasDisponiblesBD(data){
      return $.ajax({
                url: 'get-fechas-indice', // Reemplaza con la ruta correspondiente en tu aplicación
                method: 'GET',
                data: data,
                error: function (error) {
                  // Manejo de errores
                  console.error('Error en la solicitud:', error);
                },
              });
    }

    //Seleccionar periodo en el modal
    $('button.seleccionar-fecha').click(function(){
      

    })

    $('.list-item-indice .item-indice').click(function(){

      var id_capa = $(this).attr('data-indice');
      gIndiceSeleccionado = id_capa;

      console.log(id_capa);

      // Obtener capa por id
      const capaBuscada = map.getLayer(id_capa);

      gCapaVisible ? map.setLayoutProperty(gCapaVisible.id, 'visibility', 'none') : false;

      if (capaBuscada) {
        // Establecer la visibilidad de la capa en true
        map.setLayoutProperty(capaBuscada.id, 'visibility', 'visible');
        llenarLeyenda(id_capa);
        gCapaVisible = capaBuscada;
        //Graficar áreas
        if ($(".switch-parametro-climatico").find("input[value='grafica_area']").attr("checked")) {
          graficaAreas(gData[id_capa].areas_local);
        }
        //graficaAreas(gData[id_capa].areas);
      }

      $('.span-indice-seleccionado').html($(this).find("span").html());
      indice_seleccionado = $(this).attr('data-indice');
      

    });

    function cargar_geojson_indices(data){

      var array_indices = ['ndvi','evi','evi2','ndwi','mcari','reci'];
      //array_indices = ['ndvi'];

      for(var i=0; i<array_indices.length; i++){

        var _visibility = 'none';

        array_indices[i] == 'ndvi' ? _visibility = 'visible' : false;

        console.log(i);
        console.log(_visibility);


        if (map.getSource('source_' + array_indices[i])) {
            console.log('El source existe en el mapa');
            map.removeLayer(array_indices[i]);
            map.removeSource('source_' + array_indices[i]);
        } else {
            console.log('El source no existe en el mapa');
        }

        // agregar la capa al mapa
        map.addSource('source_' + array_indices[i], {
            type: 'geojson',
            data: data[array_indices[i]]["geojson"]
        });

        var _paint = {
          'fill-opacity': 0.6,
          'fill-color' : [
            'match',
            ['get', 'constant']
          ]
        }

        for(var j=0; j < gDataLegend[array_indices[i]]["palette"].length; j++){
          _paint["fill-color"].push(j+1);
          _paint["fill-color"].push(gDataLegend[array_indices[i]]["palette"][j]);
        }

        _paint["fill-color"].push('white');

        map.addLayer({
            id: array_indices[i],
            type: 'fill',
            source: 'source_' + array_indices[i],
            
            paint: _paint,
            layout: {
              // Make the layer visible by default.
              'visibility': _visibility
            }
        });
      }//.for

      $('.indice-select').change();

      $('.list-item-indice .item-indice[data-indice="ndvi"]').click();

      console.log(map.getStyle().layers);

    }

var viz_clas = {
    'palette': ["#FF0000",'#FF9300',"#F7FF00", '#55EE0D','#3B8917'],
    'min': 1,
    'max': 5
};

var data1 = {
    1:  "Suelo sin vegetación",
    2:  "Enferma",
    3: "Medianamente saludable",
    4:  "Saludable",
    5: "Muy saludable"
};


$('.btn-actualizar-periodo').click(function(){
    
});   


$('.dropdown-content').on('click', '.a_producto.p-bus', function(){

    //Recupera el objeto segun la posicion en el arreglo global de productos}
    var objectid = $(this).data('idg'); //Asignando el valor "OBJECTID" a una variable

    // cambiarEstiloParcelaSeleccionada(objectid);

    //objectid_actual = objectid-1; //Restamos 01 para apuntar a la parcela correcta, considerando su ubicación en el arreglo de parcelas, el cual inicia en "0", a diferencia del "OBJECTID", que inicia en "1"
    objectid_actual = objectid;
    console.log(objectid_actual);
    // console.log(gSeleccionado);
    // console.log(gGlobal);

    /*
    for(var i=0; i<gGlobal.features.length; i++){
      if(objectid_actual == gGlobal.features[i].properties.parcela_gid){
        gSeleccionado = gGlobal.features[i];
      }
    }
    
    for(var i=0; i<gGlobal.length; i++){
      if(objectid_actual == gGlobal[i].parcela_gid){
        gSeleccionado = gGlobal[i];
      }
    }
    */

    // Mostrar en consola campos del objeto seleccionado
    // console.log(gSeleccionado);
    //let gid_buscado = gSeleccionado.parcela_gid.toString();
    let gid_buscado = $(this).attr('data-idg');
    zoomToFeatureByIdg(gid_buscado);

    /*
    var turfMultiPolygon = turf.multiPolygon(gSeleccionado.geometry.coordinates);
    var bbox = turf.bbox(turfMultiPolygon);
    bounds_parcela_seleccionada = [[bbox[0], bbox[1]], [bbox[2], bbox[3]]];
    map.fitBounds(bounds_parcela_seleccionada, { padding: 20 });
    */

    // Ocultar sugerencias
    $('.dropdown-content').hide();

    $.ajax({
      url: '/get-parcelas-json-monitoreo',
      //url: '/get-nuevas-parcelas-shapefile',
      type: 'GET',
      dataType: 'json',
      data: {parcela_gid : gid_buscado},
      success: function(data) {
        
        gSeleccionado = data[0];
        console.log(gSeleccionado);
        
        // Llenar el input buscador y los atributos de la sección resultados
        cambiar_parcela_seleccionada(gSeleccionado);
      }
    })

    
  });

  function cambiar_parcela_seleccionada(_gSeleccionado){
    // Pintar parcela seleccionada
    console.log(_gSeleccionado);
    cambiarEstiloParcelaSeleccionada(_gSeleccionado["id"]);
    //  Mostrar en input "Buscador de Parcelas" el nombre de la parcela seleccionada
    let nombre_parcela_seleccionada = _gSeleccionado["id"] + ' - ' + _gSeleccionado["nombre"];
    $('.input-buscar-parcela').val(nombre_parcela_seleccionada);
    texto_parcela_seleccionada = nombre_parcela_seleccionada;
  }

  // Función para buscar una geometría por su idg en la capa parcelas_cafe y hacer zoom en ella
  function zoomToFeatureByIdg($idg) {

    $.ajax({
      url: '/get-parcelas-shapefile-status',
      //url: '/get-nuevas-parcelas-shapefile',
      type: 'GET',
      dataType: 'json',
      data: {"parcela_gid" : $idg},
      success: function(geojson) {
  
        geojson = JSON.parse(geojson);
        console.log(geojson);

        let turfMultiPolygon = turf.multiPolygon(geojson.features[0].geometry.coordinates);
        let bbox = turf.bbox(turfMultiPolygon);
        let bounds_parcela_seleccionada = [[bbox[0], bbox[1]], [bbox[2], bbox[3]]];
        // console.log(bounds_parcela_seleccionada)
        //map.fitBounds(bounds_parcela_seleccionada, { padding: 12 });
        map.fitBounds(bounds_parcela_seleccionada, { padding: 200 });
        
  
      }
    });
  }

  function llenar_atributos_resultado(_gSeleccionado){

    // ============= LLenar Sección de Atributos========================
    // Imagen de Productor
    var url_img = 'https://cdn.www.gob.pe/uploads/document/file/1464052/standard_FOTO_WEB_CAFE-1536x1024.jpg';
    if("productor_imagen" in _gSeleccionado.properties && _gSeleccionado.properties["productor_imagen"] != null){
      url_img = '/' + _gSeleccionado.properties["productor_imagen"];
    }
    $('.perfil-img-productor').fadeOut(function(){      
      $(this).attr('src', url_img).fadeIn();
    });

    $('.perfil-nombre-parcela').fadeOut(function(){
      $(this).html(_gSeleccionado["properties"]["nombre"]).fadeIn();
    });

      $('.perfil-nombre-productor').fadeOut(function(){
        $(this).html(_gSeleccionado["properties"]["productor_nombre"]).fadeIn();
      });

      $('.perfil-codigo-productor').fadeOut(function(){
        $(this).html(_gSeleccionado["properties"]["productor_codigo"]).fadeIn();
      });

    // Nombre del Distrito
      $('.span-dist').fadeOut(function(){
        $(this).html(_gSeleccionado["properties"]["distrito"]).fadeIn();
      });

    // Nombre de la Provincia
      $('.span-prov').fadeOut(function(){
        $(this).html(_gSeleccionado["properties"]["provincia"]).fadeIn();
      });

    // Nombre del Departamento
      $('.span-dpto').fadeOut(function(){
        $(this).html(_gSeleccionado["properties"]["departamento"]).fadeIn();
      });

    // Nombre del DNI
      $('.span-parcela-dni').fadeOut(function(){
        $(this).html(_gSeleccionado["properties"]["distrito"]).fadeIn();
      });
  }

  function llenarLeyenda(id_capa){

    //palette, names

    var div = '';

    for(var i=0; i < gDataLegend[id_capa]["palette"].length; i++){

      if (i==0) {
        div += '<div class="text-legend" style="text-align: center;font-weight: 600;font-size: 0.75rem;padding: 0.4rem 0.3rem;letter-spacing: 0;">'+ gDataLegend[id_capa]["title"][0] +'</div>';
      }

      div += '<div class="d-flex">';
      div += '<div style="background-color:'+ gDataLegend[id_capa]["palette"][i] +'; width:11px; height:11px;border-radius: 3px;"></div>';
      div += '<div class="text-legend" style="margin-left: 11px">'+ gDataLegend[id_capa]["names"][i] +'</div>';
      div += '</div>';
    }   
    
    $('.legend-section .contenido').html(div);
  }

  function formato_json(data){
    var array_indices = ['ndvi','evi','evi2','ndwi','mcari','reci'];

    for(var i=0; i < array_indices.length; i++){
      data[array_indices[i]] = JSON.parse(data[array_indices[i]]);
    }

    return data;
  }

  // Manejar Boton "Consultar Fechas Disponibles"
  $('.btn-consultar-fechas').click(function(){

    llenar_atributos_resultado(gSeleccionado);

    let input_checked = $('.switch-fechas-disponibles input:checked');
    let fecha_consultada = input_checked.attr("value");
    let tipo_origen = input_checked.attr("data-origen");
    
    //alert(fecha_consultada);    
    mostrar_cargando(130000);
    $('.div-btn-cancelar-proceso').css("display","flex");
    //$('.div-btn-cancelar-proceso').css("display","none");
    

    // Obtener el valor seleccionado del grupo de botones de radio
    //var selectedValue = $('input[name="fecha_filtro"]:checked').val();
    selectedValue = fecha_consultada;

    // Utilizar el valor seleccionado como desees
    console.log(selectedValue);

    $('#modal-fechas-imagenes').modal('hide');

    gDatosParcelaActual["fecha_filtro"] = selectedValue;

    var _url = 'analisis-segun-fecha';
    tipo_origen == 'local' ? _url = 'analisis-local-segun-fecha' : false;


    gAjaxLlamadaProceso = $.ajax({
      url: _url,
      type:'GET',
      data: gDatosParcelaActual,
      success: function(data){
          //data = formato_json(data);          
        
          console.log(data);

          //Si la url consulta al GEE, cambiar el data-origen, ya que se guardó en la bd-local
          if(_url == 'analisis-segun-fecha'){
            input_checked.attr('data-origen','local');
            input_checked.parent().parent().parent().find('label:first').addClass('texto-con-trazo');
          }

          gData = data;

          console.log(gData);

          var fc = data.ndvi.geojson;
          console.log(fc);

          cargar_geojson_indices(data);

          if(fc.features[0].geometry != null){
            var coordinates = fc.features[0].geometry.coordinates;

            console.log(coordinates);
            
            var bbox = turf.bbox(fc);

            map.fitBounds(bbox);

          }
          else{
            Swal.fire({
              icon: 'info',
              title: '',
              text: 'El índice no tiene información',
              showConfirmButton: false,
              timer: 2000
            });
          }

          $('.loader-indices').css("display","none");
          $('#loader').html("");
          $('.div-btn-cancelar-proceso').css("display","none");
      },
      error: function (jqXHR, textStatus, errorThrown) {
         alert('No se encontraron resultados para este período');
         console.log('No se encontraron resultados para este período');
         
         $('.btn-volver-resultados').click();
         ocultarVistaCargando();
      }
    })    
    
    $('.perfil-fecha-consultada span').fadeOut(function(){
      //$(this).html(gSeleccionado["features"][objectid_actual]["properties"]["NOM_PARC"]).fadeIn();
      $(this).html(fecha_consultada).fadeIn();
    });

    $('.fechas-disponibles-ie-section').css('display','none');
    $('.resultados-ie-section').css('display','block');

    indice_seleccionado = 'ndvi';
    gIndiceSeleccionado = 'ndvi';
    //26AGO24
    //graficaAreas(gData[indice_seleccionado].areas_local);
    $('.span-indice-seleccionado').html('NDVI - Normalized difference vegetation index');
    
    llenarLeyenda(indice_seleccionado);
    

  });


  // Manejar Boton "Consultar Fechas Disponibles"
  $('.items-fechas-section').on("change", ".switch-fechas-disponibles", function(){

    //let state = $(this).parent().prev().attr("value");

    if (!$(this).find("input").attr("checked")) {

      $('.switch-fechas-disponibles input:checkbox').each(function() {
          this.checked = false;                       
          $(this).attr("checked",false);
          $(this).find('input:checkbox').attr("checked",false);
      });

      $(this).find('input:checkbox').each(function() {
          this.checked = true;
      });

      $(this).find('input:checkbox').attr("checked",true);
    }

    


  });

  // Habilitación de selección única de los switch - Parámetros Climáticos
  $('.items-parametros-section').on("change", ".switch-parametro-climatico", function(){

    //alert(1);
    $('.contenedor-grafica').show();

    //let state = $(this).parent().prev().attr("value");

    if (!$(this).find("input").attr("checked")) {

      $('.switch-parametro-climatico input:checkbox').each(function() {
          this.checked = false;                       
          $(this).attr("checked",false);
          $(this).find('input:checkbox').attr("checked",false);
      });

      $(this).find('input:checkbox').each(function() {
          this.checked = true;
      });

      $(this).find('input:checkbox').attr("checked",true);
    }

    console.log($('input[name="input_parametro_climatico"]:checked').val());


    if ($(this).find("input[value='grafica_precipitacion']").attr("checked")) {

      $('#map').attr('style','height:65%');

      $('.contenedor-grafica').css('height','33%');
      $('.legend-section').css('bottom', '38%');
      $('.btn-descargar-data-xls').show();
      $('.btn-descargar-data-xls').attr('data-parametro', 'precipitacion');

      map.resize();

      // Mensualizar precipitacion
      monthlyPrecipitation = sumParametroByMonth(gData["precipitacion"]);

      // Imprime los resultados
      console.log(monthlyPrecipitation);

      // Generar grafica estadistica de precipitacion
      graficaPrecipitacion(gData["precipitacion"], monthlyPrecipitation);
      

    }

    if ($(this).find("input[value='grafica_temperatura']").attr("checked")) {

      $('#map').attr('style','height:65%');

      $('.contenedor-grafica').css('height','33%');
      $('.legend-section').css('bottom', '38%');
      $('.btn-descargar-data-xls').show();
      $('.btn-descargar-data-xls').attr('data-parametro', 'temperatura');

      map.resize();

      // Mensualizar temperatura
      monthlyTemperature = avgTemperatureByMonth(gData["temperatura"]["featuresLocal"]);
      // console.log(gData["temperatura"]["featuresLocal"]);
      // console.log(monthlyTemperature);

      graficaTemperatura(gData["temperatura"]);

    }

    if ($(this).find("input[value='grafica_humedad']").attr("checked")) {

      $('#map').attr('style','height:65%');

      $('.contenedor-grafica').css('height','33%');
      $('.legend-section').css('bottom', '38%');
      $('.btn-descargar-data-xls').hide();

      map.resize();

      graficaHumedad(gData["humedad"], gData["temperatura"].featuresLocal);

    }

    if ($(this).find("input[value='grafica_area']").attr("checked")) {

      $('#map').attr('style','height:65%');

      $('.contenedor-grafica').css('height','33%');
      $('.legend-section').css('bottom', '38%');
      $('.btn-descargar-data-xls').hide();

      map.resize();

      //alert(indice_seleccionado);
      graficaAreas(gData[indice_seleccionado].areas_local);
    }

    if( !$(this).find("input[value='grafica_precipitacion']").is(':checked') && 
        !$(this).find("input[value='grafica_temperatura']").is(':checked') &&
        !$(this).find("input[value='grafica_humedad']").is(':checked') &&
        !$(this).find("input[value='grafica_area']").is(':checked')){
          
          $('#map').attr('style','height:100%');

          $('.contenedor-grafica').css('height','0%');
          $('.legend-section').css('bottom', '3%');

          map.resize();

        }


  });

  // Volver a la Sección Principal
  $('.btn-volver-fechas').click(function(){

    $('.fechas-disponibles-ie-section').css('display','none');
    $('.buscador-periodo-ie-section').css('display','block');


  });

  $('.btn-volver-resultados').click(function(){

    let grafica_height = $('.contenedor-grafica').css('height');
    console.log(grafica_height);

    if (grafica_height != '0px') 
    {
      console.log("Ocultar gráficas estadísticas");
      // $(".switch-parametro-climatico").find("input").attr("checked",false);
      $('.switch-parametro-climatico input:checkbox').each(function() {
        this.checked = false;                       
        $(this).attr("checked",false);
        $(this).find('input:checkbox').attr("checked",false);
      });

      $('#map').attr('style','height:100%');
      $('.contenedor-grafica').css('height','0%');
      $('.legend-section').css('bottom', '3%');
      map.resize();
      
    };

    $('.resultados-ie-section').css('display','none');
    $('.fechas-disponibles-ie-section').css('display','block');

    var array_indices = ['ndvi','evi','evi2','ndwi','mcari','reci'];
    //array_indices = ['ndvi'];

    for(var i=0; i<array_indices.length; i++){
      map.removeLayer(array_indices[i]);
      map.removeSource('source_' + array_indices[i]);
    }

    $('.legend-section .contenido').html('');

    


  });

  $('.btn-nueva-consulta').click(function(){

    let grafica_height = $('.contenedor-grafica').css('height');
    console.log(grafica_height);

    if (grafica_height != '0px') 
    {
      console.log("Ocultar gráficas estadísticas");
      // $(".switch-parametro-climatico").find("input").attr("checked",false);
      $('.switch-parametro-climatico input:checkbox').each(function() {
        this.checked = false;                       
        $(this).attr("checked",false);
        $(this).find('input:checkbox').attr("checked",false);
      });

      $('#map').attr('style','height:100%');
      $('.contenedor-grafica').css('height','0%');
      $('.legend-section').css('bottom', '3%');
      map.resize();
      
    };

    var array_indices = ['ndvi','evi','evi2','ndwi','mcari','reci'];
    for(var i=0; i<array_indices.length; i++){
      map.removeLayer(array_indices[i]);
      map.removeSource('source_' + array_indices[i]);
    }

    $('.legend-section .contenido').html('');

    $('.resultados-ie-section').css('display','none');
    $('.buscador-periodo-ie-section').css('display','block');
    $('.input-buscar-parcela').val('');


  });

  // Ir a la Sección de Fechas Disponibles
  $('.btn-consultar-periodo').click(function(){

    let valor_input_buscar_parcela = $('.input-buscar-parcela').val();
    console.log(valor_input_buscar_parcela);
    console.log(gSeleccionado);
    console.log(texto_parcela_seleccionada);
    if (gSeleccionado && valor_input_buscar_parcela != '')
    {
      if (valor_input_buscar_parcela === texto_parcela_seleccionada)
      {
        console.log("el objeto existe");
      }
      else
      {
        Swal.fire({
          icon: 'error',
          title: 'Error en la consulta',
          text: 'Debe seleccionar una parcela correcta',
          showConfirmButton: false,
          timer: 2000
        });
        return;

      }
      
    }
    else
    {
      Swal.fire({
        icon: 'info',
        title: 'No se ha seleccionado parcela',
        text: 'Debe seleccionar una parcela en el buscador de parcelas',
        showConfirmButton: false,
        timer: 2000
      });

      return;
    }

    if(!validarPeriodo())
    {
      return;
    }

    consultar_periodo();

  });

  function validarPeriodo(){
    //<p id="errorMensaje" style="color: red; display: none;">El formato de fecha es incorrecto. Debe ser: dd/mm/yyyy - dd/mm/yyyy</p>

    const regex = /^\d{2}\/\d{2}\/\d{4}\s-\s\d{2}\/\d{2}\/\d{4}$/;
    const fecha = $('.input-periodo').val();

    //if($('.input-buscar-parcela').val().trim() == ""){
    if(1==2){
      alert('Debe seleccionar una parcela');
      return false;
    }
    else if(!regex.test(fecha)){
      // alert('La fecha no tiene el formato correcto: dd/mm/yyyy - dd/mm/yyyy');
      Swal.fire({
        icon: 'error',
        title: 'No se pudo realizar la consulta',
        text: 'La fecha no tiene el formato correcto: dd/mm/yyyy - dd/mm/yyyy',
        showConfirmButton: false,
        // timer: 1500
      });
      $('body.swal2-height-auto').css('cssText','height: 100% !important;');
      return false;
    }

    return true;
  }

  function consultar_periodo(){
    var periodo = $('.input-periodo').val();
    console.log(periodo);

    if (periodo != '') {

      // Ejemplo: "09/05/2022-10/05/2023";
      // Separar el período en las dos fechas
      const [fechaUno, fechaDos] = periodo.split("-");

      // Separar los elementos de la primera fecha y eliminar espacios en blanco alrededor de cada número
      const [periodo_uno_dia, periodo_uno_mes, periodo_uno_año] = fechaUno.split("/").map(elemento => elemento.trim());

      // Separar los elementos de la segunda fecha y eliminar espacios en blanco alrededor de cada número
      const [periodo_dos_dia, periodo_dos_mes, periodo_dos_año] = fechaDos.split("/").map(elemento => elemento.trim());

      console.log(periodo_uno_dia);    // Resultado: 09
      console.log(periodo_uno_mes);    // Resultado: 05
      console.log(periodo_uno_año);    // Resultado: 2022
      console.log(periodo_dos_dia);    // Resultado: 10
      console.log(periodo_dos_mes);    // Resultado: 05
      console.log(periodo_dos_año);    // Resultado: 2023

   
      var periodo_uno = periodo_uno_año + '-' + periodo_uno_mes + '-' + periodo_uno_dia;
      var periodo_dos = periodo_dos_año + '-' + periodo_dos_mes + '-' + periodo_dos_dia;

      console.log(periodo_dos);
      console.log("parametros enviados: " + objectid_actual + "," + periodo_uno + "," + periodo_dos);

      let objectid_gee = objectid_actual;

      $('.span-periodo').fadeOut(function(){
          $(this).html(periodo).fadeIn();
        });

      mostrar_cargando(10000);
      //$('.div-btn-cancelar-proceso').css("display","flex");

      consultar_periodo_gee(objectid_gee,periodo_uno,periodo_dos);
      
      $('.buscador-periodo-ie-section').css('display','none');
      $('.fechas-disponibles-ie-section').css('display','block');

    }
    else{
      alert('Debe seleccionar el período');
    }
  }

  function llenar_fechas(data){
    
      var rb_html = '';

      var fechas_disponibles = data;
      console.log(fechas_disponibles);

      //for(var i=0; i<fechas_disponibles.dates.length; i++){
      for(var i=0; i<fechas_disponibles.length; i++){
        /*
        rb_html += '<div>\
                      <input type="radio" id="rb_' + i +'" name="fecha_filtro" value="'+
                      //fechas_disponibles.dates[i] +'"\
                      fechas_disponibles.formattedDates[i] +'"\
                            checked>\
                      <label for="rb_' + i +'">'+ fechas_disponibles.formattedDates[i] +'</label>\
                    </div>';
        */

          var textoConTrazo = "";

          fechas_disponibles[i].origen == 'local' ? textoConTrazo = 'texto-con-trazo' : false;

          rb_html += '<div class="d-flex mb-4">\
                      <label class="col-form-label m-r-10 '+ textoConTrazo +'" >\
                        <i class="fa fa-satellite"></i> &nbsp\
                        '+ fechas_disponibles[i].fecha_indice +'</label>\
                      <div class="flex-grow-1 text-end icon-state">\
                        <label class="switch switch-fechas-disponibles">\
                          <input type="checkbox" value="'+ fechas_disponibles[i].fecha_indice +'" data-origen="'+ fechas_disponibles[i].origen +'"><span class="switch-state"></span>\
                        </label>\
                      </div>\
                    </div>';
      }

      $('.items-fechas-section').html(rb_html);
  }

 
  $('.home-tool-section').click(function(){

    map.fitBounds(bounds_parcela_seleccionada, { padding: 20 });

  });

  $('.btn-periodo-predefinido-01').click(function(){

    var now = new Date();
    var duedate = new Date(now);
    duedate.setDate(now.getDate() - 365);

    let now_year = now.getFullYear();
    let duedate_year = duedate.getFullYear();

    let now_month = now.getMonth() + 1;
    if (now_month < 10) {
      now_month = "0" + now_month.toString();
    }
    else{
      now_month = now_month.toString();
    }
    let duedate_month = duedate.getMonth() + 1;
    if (duedate_month < 10) {
      duedate_month = "0" + duedate_month.toString();
    }
    else{
      duedate_month = duedate_month.toString();
    }

    let now_day = now.getDate();
    if (now_day < 10) {
      now_day = "0" + now_day.toString();
    }
    else{
      now_day = now_day.toString();
    }
    
    let duedate_day = duedate.getDate();
    if (duedate_day < 10) {
      duedate_day = "0" + duedate_day.toString();
    }
    else{
      duedate_day = duedate_day.toString();
    }

    let periodo_uam = duedate_day + '/' + duedate_month + '/' + duedate_year.toString() + ' - ' + now_day + '/' + now_month + '/' + now_year.toString();

    console.log(periodo_uam);

    $('.input-periodo').val(periodo_uam);

  });

  $('.btn-periodo-predefinido-02').click(function(){

    $('.input-periodo').val('01/01/2021 - 31/12/2021');

  });

  $('.btn-periodo-predefinido-03').click(function(){

    $('.input-periodo').val('01/01/2020 - 31/12/2020');

  });

  function combinar_fechas_local_gee(arreglo_1, arreglo_2){
    console.log(arreglo_1, arreglo_2);

    const resultado = [];

    // Recorrer arreglo_1
    arreglo_1.forEach((fecha) => {
      const indiceEnArreglo2 = arreglo_2.findIndex((f) => f === fecha);

      if (indiceEnArreglo2 !== -1) {
        resultado.push({ origen: 'local', fecha_indice: fecha });
        arreglo_2.splice(indiceEnArreglo2, 1);
      } else {
        resultado.push({ fecha_indice: fecha });
      }
    });

    // Recorrer arreglo_2 y agregar las fechas restantes
    arreglo_2.forEach((fecha) => {
      resultado.push({ origen: 'gee', fecha_indice: fecha });
    });

    // Ordenar resultado en orden cronológico
    resultado.sort((a, b) => (a.fecha_indice > b.fecha_indice ? 1 : -1));

    console.log(resultado);

    return resultado;
  }

  function cambiarEstiloParcelaSeleccionada(id){
    /**/
    //Dar color a la parcela seleccionada
    var filter = ['==', ['get', 'id'], id];
    if (map.getLayer('cafe')) {
      map.setPaintProperty('cafe', 'fill-color', [
          'case',
          ['all', filter],
          '#FFFF00',
          '#29A847'
      ]);
    } else {
        console.error("La capa 'cafe' no existe.");
    }
  }

  $('.btn-cancelar-proceso').click(function(){
    gAjaxLlamadaProceso ? gAjaxLlamadaProceso.abort() : false;
    console.log("cancelar");

    stopWorker().then(function(data){
      console.log(data);
    })

  })

  function ocultarVistaCargando(){
    // Ocultar Vista "Cargando Indices"
    $('.loader-indices').css("display","none");
    $('#loader').html("");
    $('.div-btn-cancelar-proceso').css("display","none");
  }

  function stopWorker(){
    return $.ajax({
      url: 'stop-worker',
      type: 'post'
    })
  }

  function mostrar_cargando($duration)
  {
    // Mostrar Vista "Cargando Indices"
    $('.loader-indices').css("display","flex");

    //Asegurar visibilidad de #loader
    $('#loader').css('display','flex');    

    var bar = new ProgressBar.Circle(loader, {
      color: '#181F26',
      // This has to be the same size as the maximum width to
      // prevent clipping
      strokeWidth: 0,
      trailWidth: 0,
      easing: 'easeInOut',
      duration: $duration,
      text: {
        autoStyleContainer: false
      },
      from: { color: 'rgba(255,255,255,0)', width: 0 },
      to: { color: 'rgba(255,255,255,0)', width: 0 },
      // Set default step function for all animate calls
      step: function(state, circle) {
        circle.path.setAttribute('stroke', state.color);
        circle.path.setAttribute('stroke-width', state.width);
    
        var value = Math.round(circle.value() * 100);
        if (value === 0) {
          circle.setText('');
        } else {
          circle.setText(value + '%');
        }
    
      }
    });
    // bar.text.style.fontFamily = 'Lobster', cursive;
    bar.text.style.fontSize = '2.5rem';
    bar.animate(1.0);  // Number from 0.0 to 1.0
    
    //Si $duration es null, ocultar #loader
    $duration ? true : $('#loader').css('display','none');

  }

  function ocultar_cargando(){
    $('.loader-indices').css("display","none");
    $('#loader').html("");
  }

  (function window_resize(){
    window.addEventListener('resize', function(event){
      //$('.apexcharts-legend-series[rel="4"]').hide();
      //$('.apexcharts-legend-series[rel="5"]').hide();
    });
  })();

  $('.btn-descargar-data-xls').click(function(){
    
    
    if($(this).attr("data-parametro") === 'precipitacion'){
      console.log('precipitacion');
      exportar_excel(monthlyPrecipitation,"precipitacion");
    }

    else if($(this).attr("data-parametro") === 'temperatura'){
      console.log('temperatura');
      exportar_excel(monthlyTemperature, "temperatura");
    }

    
    
  });
  
function sumParametroByMonth(data) {
  const monthlyData = [];
  const monthlySums = {};
  for (const [date, valor_parametro] of data) {
      const [year, month, day] = date.split("-");
      const key = `${year}-${month}`;
      if (!monthlySums[key]) {
          monthlySums[key] = 0;
      }
      monthlySums[key] += valor_parametro;
  }
  for (const key in monthlySums) {
      monthlyData.push([`${key}-01`, monthlySums[key]]);
  }
  return monthlyData;
};

function avgTemperatureByMonth(data) {
  const monthlyData = [];
  const monthlyAvgs = {};
  for (const [date, valor_parametro] of data) {
      const [year, month, day] = date.split("-");
      const key = `${year}-${month}`;
      if (valor_parametro != 0) {
        if (!monthlyAvgs[key]) {
            monthlyAvgs[key] = valor_parametro;
        }
        
        monthlyAvgs[key] += valor_parametro;
        monthlyAvgs[key] = monthlyAvgs[key]/2;
      }
  }
  for (const key in monthlyAvgs) {
      monthlyData.push([`${key}-01`, monthlyAvgs[key]]);
  }
  return monthlyData;
};


//----------------------------------DESCARGAR PLANTILLA----------------------------
function exportar_excel(dataArray, $parametro) {
  // Crear una nueva hoja de cálculo
  var workbook = XLSX.utils.book_new();
  // var titleColumn = 'Columna';

  // if ($parametro = 'precipitacion'){
  //   titleColumn = 'Precipitacion Mensual';
  // }
  // else if ($parametro = 'temperatura'){
  //   titleColumn = 'Temperatura Mensual';
  // }

  // Transformar el arreglo de datos para que cada elemento sea un objeto
  // donde cada key representa el nombre de una columna en Excel
  var dataForExcel = dataArray.map(function(item) {
      if ($parametro === 'precipitacion'){
        return { "Fecha": item[0], 'precipitacion': item[1] };  
      }
      else{
        return { "Fecha": item[0], 'temperatura': item[1] };  
      }
      
  });

  // Convertir los datos transformados a una hoja de Excel
  var worksheet = XLSX.utils.json_to_sheet(dataForExcel);

  // Agregar la hoja de trabajo al libro con un nombre de hoja 'Datos'
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');

  // Convertir el libro de trabajo a un archivo de Excel binario
  var excelData = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });

  // Función para convertir una cadena binaria en un arreglo de bytes
  function s2ab(s) {
      var buf = new ArrayBuffer(s.length);
      var view = new Uint8Array(buf);
      for (var i = 0; i < s.length; i++) {
          view[i] = s.charCodeAt(i) & 0xFF;
      }
      return buf;
  }

  // Descargar el archivo de Excel
  var blob = new Blob([s2ab(excelData)], { type: 'application/octet-stream' });
  var url = URL.createObjectURL(blob);
  var link = document.createElement('a');
  link.href = url;
  link.download = 'datos_parametros_' + $parametro + '.xlsx';
  link.click();
}