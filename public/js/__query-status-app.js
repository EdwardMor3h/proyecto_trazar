
var dict_zonas = {};
var dict_usuarios = {};
var gGeojson = null;
var gSetviewActualParcela = null;

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
            attribution: ''
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
    center: [-74.09,-12.505],
    zoom: 9
});

map.on('load', async function(){
    dict_zonas = await obtener_zonas();
    dict_usuarios = await obtener_usuarios();
    obtener_data();

    setInterval(function(){
      obtener_data()
    },5000);
})

function __obtener_data(){
   

    var geojson = {
        "type": "FeatureCollection",
        "features": []
    }

    $.ajax({
        url: '/backups-app',
        method: 'GET',
        success: function (response) {
          
          console.log(response);          

          $('#table-actualizar-datos tbody').html('');
                          
          for (let i = 0; i < response.length; i++) {

            if (!("CafeUnidadProductiva" in response[i].json)) {                

                if (response[i].json.length > 0) {

                    for (let j = 0; j < response[i].json.length; j++) {

                        if (response[i].json[j].length > 0) {

                            for (let k = 0; k < response[i].json[j].length; k++) {

                                let zona = buscar_zona(response[i].json[j][k][0].data.zona_id);
                                let usuario = buscar_usuario(response[i].json[j][k][0].data.auth_user_id);

                                let descripcion_zona = '';
                                zona ? descripcion_zona = zona.descripcion : false;
                                usuario ? descripcion_usuario = usuario.username : false;
      
                                let tr = '<tr>\
                                        <td>'
                                            + response[i].json[j][k][0].id + 
                                        '</td>\
                                        <td>\
                                            ' + response[i].json[j][k][0].type + '\
                                        </td>\
                                        <td>\
                                            ' + response[i].json[j][k][0].data.nombre + '\
                                        </td>\
                                        <td>\
                                            ' + response[i].json[j][k][0].data.informacion_productor + '\
                                        </td>\
                                        <td>\
                                            ' + response[i].json[j][k][0].data.dni + '\
                                        </td>\
                                        <td>\
                                            ' + descripcion_zona + '\
                                        </td>\
                                        <td>\
                                            ' + descripcion_usuario + '\
                                        </td>\
                                        <td class="' + response[i].json[j][k][1] + '">\
                                            ' + response[i].json[j][k][1] + '\
                                        </td>\
                                        <td>\
                                            ' + response[i].fecha_creacion + '\
                                        </td>\
                                        <td class="options">\
                                            <a class="btn btn-complementary btn-ver-parcela" data-id="'+ response[i].json[j][k][0].id +'">\
                                            <i class="fa fa-map me-2"></i>\
                                            Mapa\
                                            </a>\
                                            <a class="btn btn-complementary btn-aprobar-parcela" data-id="'+ response[i].json[j][k][0].id +'">\
                                            <i class="fa fa-check me-2"></i>\
                                            Aprobar\
                                            </a>\
                                        </td>\
                                    </tr>'

                                $('#table-actualizar-datos tbody').append(tr);

                                if(j==0){
                                    geojson.features.push({
                                        "type": "Feature",
                                        "geometry": response[i].json[j][k][0].data.geom,
                                        "properties":{
                                            "id" : response[i].json[j][k][0].id
                                        }
                                    })
                                }                                
                                
                            }
                            
                        }

                        
                    }
 
                }

                
                
            }

            
          }

          agregarGeojson(geojson);          
          //cambiarEstiloParcelaSeleccionada(49);
          gGeojson = geojson;
          
          //*/*/-/-/-/-/-/-/-/-/
          var zona_id = $('meta[name="zona-id"]').attr('content');
            var rol_id = $('meta[name="rol-id"]').attr('content');
            var _data = {};

            if(rol_id == '3'){
            _data = {
                zona_id: zona_id
            }
            }

          $.ajax({
            url: '/get-shapefile',
            //url: '/get-nuevas-parcelas-shapefile',
            type: 'GET',
            dataType: 'json',
            data: _data,
            success: function(geojson) {
    
              //ocultar_cargando();
    
              //delete geojson["bbox"];
    
              console.log(geojson); // Aquí puedes hacer algo con el GeoJSON devuelto
              geojson = JSON.parse(geojson);

              agregar_geojson('cafe','fill',geojson, _paint=null, {'text_field':'nombre', 'text_size': 20});
            }
          })
          //*/*/-/-/-/-/-/-/-/-/
      
        },
        error: function (error) {
          console.error('Error al obtener los registros:', error);
        },
      });
    
    console.log('data actualizada');
}

function obtener_data(){
   

  var geojson = {
      "type": "FeatureCollection",
      "features": []
  }

  $.ajax({
      url: '/backups-app',
      method: 'GET',
      success: function (response) {
        
        console.log(response);          

        $('#table-actualizar-datos tbody').html('');
                        
        for (let i = 0; i < response.length; i++) {

          if (!("CafeUnidadProductiva" in response[i].json)) {                

              if (response[i].json.length > 0) {

                  for (let j = 0; j < response[i].json.length; j++) {

                      if (response[i].json[j].length > 0) {

                          for (let k = 0; k < response[i].json[j].length; k++) {

                              let zona = buscar_zona(response[i].json[j][k][0].data.zona_id);
                              let usuario = buscar_usuario(response[i].json[j][k][0].data.auth_user_id);

                              let descripcion_zona = '';
                              zona ? descripcion_zona = zona.descripcion : false;
                              usuario ? descripcion_usuario = usuario.username : false;
    
                              let tr = '<tr>\
                                      <td>'
                                          + response[i].json[j][k][0].id + 
                                      '</td>\
                                      <td>\
                                          ' + response[i].json[j][k][0].type + '\
                                      </td>\
                                      <td>\
                                          ' + response[i].json[j][k][0].data.nombre + '\
                                      </td>\
                                      <td>\
                                          ' + response[i].json[j][k][0].data.informacion_productor + '\
                                      </td>\
                                      <td>\
                                          ' + response[i].json[j][k][0].data.dni + '\
                                      </td>\
                                      <td>\
                                          ' + descripcion_zona + '\
                                      </td>\
                                      <td>\
                                          ' + descripcion_usuario + '\
                                      </td>\
                                      <td class="' + response[i].json[j][k][1] + '">\
                                          ' + response[i].json[j][k][1] + '\
                                      </td>\
                                      <td>\
                                          ' + response[i].fecha_creacion + '\
                                      </td>\
                                      <td class="options">\
                                          <a class="btn btn-complementary btn-ver-parcela" data-id="'+ response[i].json[j][k][0].id +'">\
                                          <i class="fa fa-map me-2"></i>\
                                          Mapa\
                                          </a>\
                                          <a class="btn btn-complementary btn-aprobar-parcela" data-id="'+ response[i].json[j][k][0].id +'">\
                                          <i class="fa fa-check me-2"></i>\
                                          Aprobar\
                                          </a>\
                                      </td>\
                                  </tr>'

                              $('#table-actualizar-datos tbody').append(tr);

                              if(j==0){
                                  geojson.features.push({
                                      "type": "Feature",
                                      "geometry": response[i].json[j][k][0].data.geom,
                                      "properties":{
                                          "id" : response[i].json[j][k][0].id
                                      }
                                  })
                              }                                
                              
                          }
                          
                      }

                      
                  }

              }

              
              
          }

          
        }

        agregarGeojson(geojson);          
        //cambiarEstiloParcelaSeleccionada(49);
        gGeojson = geojson;
        
        //*/*/-/-/-/-/-/-/-/-/
        var zona_id = $('meta[name="zona-id"]').attr('content');
          var rol_id = $('meta[name="rol-id"]').attr('content');
          var _data = {};

          if(rol_id == '3'){
          _data = {
              zona_id: zona_id
          }
          }

        $.ajax({
          url: '/get-shapefile',
          //url: '/get-nuevas-parcelas-shapefile',
          type: 'GET',
          dataType: 'json',
          data: _data,
          success: function(geojson) {
  
            //ocultar_cargando();
  
            //delete geojson["bbox"];
  
            console.log(geojson); // Aquí puedes hacer algo con el GeoJSON devuelto
            geojson = JSON.parse(geojson);

            agregar_geojson('cafe','fill',geojson, _paint=null, {'text_field':'nombre', 'text_size': 20});
          }
        })
        //*/*/-/-/-/-/-/-/-/-/
    
      },
      error: function (error) {
        console.error('Error al obtener los registros:', error);
      },
    });
  
  console.log('data actualizada');
}

function agregarGeojson(geojson){

  if (map.getLayer('parcelas-nuevas-layer')) {
    map.removeLayer('parcelas-nuevas-layer');
  }

  if (map.getLayer('parcelas-nuevas-layer-borde')) {
    map.removeLayer('parcelas-nuevas-layer-borde');
  }

  if (map.getSource('parcelas-nuevas-source')) {
    map.removeSource('parcelas-nuevas-source');
  }

  
    map.addSource('parcelas-nuevas-source', {
        type: 'geojson',
        // Use a URL for the value for the `data` property.
        data: geojson
    });
    
    map.addLayer({
        'id': 'parcelas-nuevas-layer',
        'type': 'fill',
        'source': 'parcelas-nuevas-source',
        'paint': {
            'fill-color': 'green',
            'fill-opacity': 0.5
        }
    });

    map.addLayer({
        'id': 'parcelas-nuevas-layer-borde',
        'type': 'line',
        'source': 'parcelas-nuevas-source',
        'paint': {
            'line-color': 'white',
            'line-width': 2
            //'fill-opacity': 0.5
        }
    });

    //
    // if (gSetviewActualParcela) 
    // {
    //   map.fitBounds(gSetviewActualParcela, { padding: 20 });
      
    // }
    // else
    // {
    //   var turfMultiPolygon = turf.multiPolygon(geojson.features[0].geometry.coordinates);
    //   var bbox = turf.bbox(turfMultiPolygon);
    //   var bounds_parcela_seleccionada = [[bbox[0], bbox[1]], [bbox[2], bbox[3]]];
    //   map.fitBounds(bounds_parcela_seleccionada, { padding: 20 });
    // }
    


}

// Editar Registro
$('#table-actualizar-datos').on('click', '.btn-editar-registro', function(){

    console.log($(this).parent().attr('data-url'));
    console.log($(this).parent().attr('data-id'));
    $(this).parent().siblings().find('.input-registro').attr('disabled',false);
    $(this).next().css('display','inline-block');
    $(this).css('display','none');

});

//Actualizar Registro

$('#table-actualizar-datos').on('click', '.btn-guardar-registro', function(){

    console.log($(this).parent().attr('data-url'));
    console.log($(this).parent().attr('data-id'));

    let id_registro = $(this).parent().attr('data-id');
    let data_url = $(this).parent().attr('data-url');
    let valor_usuario = $(this).parent().parent().find('.input-usuario-actualizar-usuario').val();
    let valor_nombre = $(this).parent().parent().find('.input-nombre-actualizar-usuario').val();
    let valor_dni = $(this).parent().parent().find('.input-dni-actualizar-usuario').val();
    let valor_contrasena = $(this).parent().parent().find('.input-contrasena-actualizar-usuario').val();
    if (valor_contrasena != $(this).parent().parent().find('.input-contrasena-actualizar-usuario').attr('prev-value')) {
        console.log('pass diferente');
        $(this).parent().parent().find('.input-contrasena-actualizar-usuario').attr('prev-value',valor_contrasena);
    }
    else{
        console.log('pass igual');
        valor_contrasena = 'nd'; //Valor para identificar cuando la contraseña es la misma y tiene formato md5
    }

    console.log(valor_usuario);

    // Obtener el archivo de imagen seleccionado
    let selectedImage = $(this).parent().parent().find('.input-cargar-foto')[0].files[0];
    console.log(selectedImage);

    // Crear un objeto FormData para enviar los datos, incluida la imagen
    let formData = new FormData();
    formData.append("id", id_registro);
    formData.append("nombre", valor_nombre);
    formData.append("dni", valor_dni);
    formData.append("usuario", valor_usuario);
    formData.append("contrasena", valor_contrasena);
    formData.append("imagen", selectedImage);

    //LLamar Update registro
    $.ajax({
        url: '/update_' + data_url,
        method: 'PUT',
        //contentType: 'application/json',
        processData: false, // Evita que jQuery procese el formData automáticamente
        contentType: false, // Evita que jQuery establezca el tipo de contenido
        data: formData,
        success: function(response) {
            // Manejar la respuesta exitosa
            console.log(response);
            Swal.fire({
            title: 'Cambios realizados',
            text: 'Se actualizaron los ' + data_url + ' en la base de datos',
            icon: 'success',
            showConfirmButton: false,
            timer: 1500
            })
        },
        error: function(error) {
            // Manejar el error
            Swal.fire({
                title: 'Error',
                text: 'No se pudieron actualizar los ' + data_url + ' en la base de datos',
                icon: 'error',
                showConfirmButton: false,
                timer: 1500
            });
        }
    });
        
    

    $(this).parent().siblings().find('.input-registro').attr('disabled',true);
    $(this).prev().css('display','inline-block');
    $(this).css('display','none');


});

$('#table-actualizar-datos').on('click', '.btn-eliminar-registro', function(){
    console.log('eliminar');

    let id_registro = $(this).parent().attr('data-id');
    let data_url = $(this).parent().attr('data-url');
    let valor_activo = '0';

    let formData = new FormData();
    formData.append("id", id_registro);
    formData.append("activo", valor_activo);

    //LLamar Update registro
    $.ajax({
        url: '/update_' + data_url,
        method: 'PUT',
        //contentType: 'application/json',
        processData: false, // Evita que jQuery procese el formData automáticamente
        contentType: false, // Evita que jQuery establezca el tipo de contenido
        data: formData,
        success: function(response) {
            // Manejar la respuesta exitosa
            console.log(response);
            Swal.fire({
            title: 'Cambios realizados',
            text: 'Se actualizaron los ' + data_url + ' en la base de datos',
            icon: 'success',
            showConfirmButton: false,
            timer: 1500
            })
        },
        error: function(error) {
            // Manejar el error
            Swal.fire({
                title: 'Error',
                text: 'No se pudieron actualizar los ' + data_url + ' en la base de datos',
                icon: 'error',
                showConfirmButton: false,
                timer: 1500
            });
        }
    });

})


//Crear Registro
$('.btn-agregar-registro').click(function(){

    if (!$('#table-actualizar-datos tbody tr:nth-child(1)').hasClass('nuevo-registro')) {


        let tr = '<tr class="nuevo-registro">\
            <td class="identificador">\
                #\
            </td>\
            <td>\
                <form class="form-inline w-100">\
                <div class="form-group d-flex mb-0 w-100 ui search">\
                    <i class="fa fa-user"></i>\
                <input class="form-control-plaintext form-control input-registro input-usuario-actualizar-usuario" type="text" data-language="en" placeholder="Insertar Usuario">\
                </div>\
                </form>\
            </td>\
            <td>\
                <form class="form-inline w-100">\
                <div class="form-group d-flex mb-0 w-100 ui search">\
                    <i class="fa fa-user"></i>\
                    <input class="form-control-plaintext form-control input-registro input-contrasena-actualizar-usuario" type="password" data-language="en" placeholder="Insertar Contraseña">\
                </div>\
                </form>\
            </td>\
            <td>\
                <form class="form-inline w-100">\
                <div class="form-group d-flex mb-0 w-100 ui search">\
                    <i class="fa fa-user"></i>\
                    <input class="form-control-plaintext form-control input-registro input-nombre-actualizar-usuario" type="text" data-language="en" placeholder="Insertar Nombre">\
                </div>\
                </form>\
            </td>\
            <td>\
                <form class="form-inline w-100">\
                <div class="form-group d-flex mb-0 w-100 ui search">\
                    <i class="fa fa-user"></i>\
                    <input class="form-control-plaintext form-control input-registro input-dni-actualizar-usuario" type="number" data-language="en" placeholder="Insertar DNI">\
                </div>\
                </form>\
            </td>\
            <td>\
                <div class="img-container">\
                    <img class="img-user" src="https://cdn.www.gob.pe/uploads/document/file/1464052/standard_FOTO_WEB_CAFE-1536x1024.jpg" alt="">\
                    <input class="input-cargar-foto input-registro" type="file" style="display:none"/>\
                </div>\
            </td>\
            <td class="btn-options" data-url="' + data_model + '" data-id="">\
                <a class="btn btn-complementary btn-crear-registro">\
                    <i class="fa fa-check me-2"></i>\
                    Crear\
                </a>\
                <a class="btn btn-graysoft btn-cancelar-registro">\
                    <i class="fa fa-xmark me-2"></i>\
                    Cancelar\
                </a>\
            </td>\
        </tr>';

    
    $('#table-actualizar-datos tbody').prepend(tr);

    $('.btn-crear-registro').next().css('display','inline-block');
    $('.btn-cancelar-registro').next().css('display','inline-block');


    }

});

$('#table-actualizar-datos').on('click', '.btn-crear-registro', function(){

    let data_url = $(this).parent().attr('data-url');
    let valor_usuario = $(this).parent().parent().find('.input-usuario-actualizar-usuario').val();
    let valor_nombre = $(this).parent().parent().find('.input-nombre-actualizar-usuario').val();
    let valor_dni = $(this).parent().parent().find('.input-dni-actualizar-usuario').val();
    let valor_contrasena = $(this).parent().parent().find('.input-contrasena-actualizar-usuario').val();

    // Obtener el archivo de imagen seleccionado
    let selectedImage = $(this).parent().parent().find('.input-cargar-foto')[0].files[0];
    console.log(selectedImage);

    // Crear un objeto FormData para enviar los datos, incluida la imagen
    let formData = new FormData();
    formData.append("nombre", valor_nombre);
    formData.append("dni", valor_dni);
    formData.append("usuario", valor_usuario);
    formData.append("contrasenaa", valor_contrasena);
    formData.append("rol_id", data_rol_id);
    formData.append("zona_id", 0);
    formData.append("email", "email.com");
    formData.append("imageen", selectedImage);
    
    let nuevo_id;

    //LLamar Update registro
    $.ajax({
        url: '/' + data_url,
        method: 'POST',
        //contentType: 'application/json',
        processData: false, // Evita que jQuery procese el formData automáticamente
        contentType: false, // Evita que jQuery establezca el tipo de contenido
        data: formData,
        success: function(response) {
          // Manejar la respuesta exitosa
          console.log(response);
          nuevo_id = response.id;
          console.log(nuevo_id);
          

          $('tr.nuevo-registro td.btn-options').html('');
    

            let td = '<a class="btn btn-complementary btn-editar-registro">\
            <i class="fa fa-pen me-2"></i>\
            Editar\
            </a>\
            <a class="btn btn-graysoft btn-guardar-registro">\
            <i class="fa fa-check me-2"></i>\
            Aceptar\
            </a>';

            $('tr.nuevo-registro td.btn-options').append(td);

            $('tr.nuevo-registro td.btn-options').attr('data-id', nuevo_id);

            $('tr.nuevo-registro .input-registro').attr('disabled',true);

            $('tr.nuevo-registro td.identificador').html(nuevo_id);

            $('tr.nuevo-registro').removeClass('nuevo-registro');

            Swal.fire({
                title: 'Cambios realizados',
                text: 'Se agregó el nuevo usuario a la base de datos',
                icon: 'success',
                showConfirmButton: false,
                timer: 1500
              });
        },
        error: function(error) {
          // Manejar el error
          Swal.fire({
            title: 'Error',
            text: 'No se pudo agregar el nuevo usuario a la base de datos',
            icon: 'error',
            showConfirmButton: false,
            timer: 1500
        });
        }
    });

    
    

});

$('#table-actualizar-datos').on('click', '.btn-cancelar-registro', function(){

    $(this).parent().parent().remove();
    

});

//Cargar foto
$('#table-actualizar-datos').on('click', '.img-user', function(){

    // $('.input-cargar-foto').click();
    $(this).next().click();

});
  
// Agregar un evento de cambio al input de tipo file
$('#table-actualizar-datos').on('change', '.input-cargar-foto' ,function(event) {
// Obtener el archivo seleccionado
const selectedFile = event.target.files[0];

if (selectedFile) {
    // Crear un objeto URL para la imagen seleccionada
    const imageUrl = URL.createObjectURL(selectedFile);
    
    // Mostrar la vista previa de la imagen en el elemento img
    $(this).prev().attr('src', imageUrl);
} else {
    // Si no se selecciona ningún archivo, borrar la vista previa
    $('#imagePreview').attr('src', '');
}
});

// Cargar zonas y depositar en variable
function obtener_zonas(){
    return $.ajax({
        url: '/zonas',
        method: 'GET',
        success: function (response) {
          // Trabaja con los datos de los productores en formato JSON
          dict_zonas = response;
          console.log(dict_zonas);

        },
        error: function (error) {
          console.error('Error al obtener los registros:', error);
        },
      });
}

// Cargar usuarios y depositar en variable
function obtener_usuarios(){
    return $.ajax({
        url: 'https://agroin.com.pe/get_objects?nombre_clase=AuthUser',
        method: 'GET',
        success: function (response) {
          // Trabaja con los datos de los productores en formato JSON
          dict_usuarios = response;
          console.log(dict_usuarios);

        },
        error: function (error) {
          console.error('Error al obtener los registros:', error);
        },
      });
}

function buscar_zona($id_zona){
    for (let i = 0; i < dict_zonas.length; i++) {
        if (dict_zonas[i].id == $id_zona) {
            return dict_zonas[i];
        }
        
    }
}

function buscar_usuario($id_usuario){
    for (let i = 0; i < dict_usuarios.length; i++) {
        if (dict_usuarios[i].id == $id_usuario) {
            return dict_usuarios[i];
        }
        
    }
}

$('.table-actualizar-datos').on('click', '.btn-ver-parcela', function(){

    console.log("mostrar parcela en el mapa");

    var id = $(this).attr('data-id');

    for(var i=0; i < gGeojson.features.length; i++){
        if(id == gGeojson.features[i].properties.id){
            var turfMultiPolygon = turf.multiPolygon(gGeojson.features[i].geometry.coordinates);
            var bbox = turf.bbox(turfMultiPolygon);
            var bounds_parcela_seleccionada = [[bbox[0], bbox[1]], [bbox[2], bbox[3]]];
            console.log(bounds_parcela_seleccionada)
            //map.fitBounds(bounds_parcela_seleccionada, { padding: 12 });
            map.fitBounds(bounds_parcela_seleccionada);
            gSetviewActualParcela = bounds_parcela_seleccionada;
            break;
        }
    }

});

function agregar_geojson(_id, _type, _geojson, _paint=null, _label=null){

  if (map.getLayer(_id)) {
    map.removeLayer(_id);
  }

  if (map.getLayer(_id+'_labels')) {
    map.removeLayer(_id+'_labels');
  }

  if (map.getSource(_id+'_source')) {
    map.removeSource(_id+'_source');
  }

    if(!_paint){
        _paint = {
            'fill-color': '#29A847',
            'fill-opacity': 0
        }
    }    

    map.addSource(_id + '_source', {
        type: 'geojson',
        data: _geojson,
        'promoteId': true
    })

    var layer1 = map.addLayer({
        id: _id,
        type: _type,
        source: _id + '_source',
        paint: _paint
    });

    //agregar_leyenda(_id);

    if(_label){
      console.log(_label);

      var _layout = {
                        "symbol-placement": "point",
                        'text-field': ['get', _label.text_field],
                        "text-font": ["Open Sans Regular"],
                        'text-size': _label.text_size,
                        'text-anchor': 'center',
                        'text-optional': true
                        ///'text-offset': [0, -1.5],
                        //'text-allow-overlap': true,
                        ///'text-ignore-placement': true,
                        //'text-radial-offset': 0.5,
                        //'text-justify': 'auto',
                        //'icon-image': ['concat', ['get', 'icon'], '-15']
                    }

      if(_id == 'cafe'){
        _layout = {
                        "symbol-placement": "point",
                        'text-field': ['concat',['get','area_poly_ha'],' Ha']
                        
                          //[ 
                          // 'concat',
                          // ['get', 'nombre'], '\n',
                          // ['case', ['has', 'productor_nombre'], ['get', 'productor_nombre'], ''],
                          // ['case', ['all', ['has', 'productor_nombre'], ['has', 'productor_codigo']], ' - ', ''],
                          // ['case', ['has', 'productor_codigo'], ['get', 'productor_codigo'], ''],
                          // '\n',
                          // ['case', ['has', 'area_ha'], ['concat',
                          //   [
                          //     'number-format',
                          //     ['get', 'area_ha'],
                          //     { 'min-fraction-digits': 2, 'max-fraction-digits': 2 }
                          //   ], ' Ha'], '']
                          //]
                          ,
                        "text-font": ["Open Sans Regular"],
                        'text-size': 17
                        //[
                          //'case',
                          //['has', 'nombre'],
                          //16, // Tamaño de fuente para el campo 'nombre'
                          //['case', ['has', 'productor_nombre'], 12, 10] // Tamaño de fuente para 'productor_nombre' y 'area_ha'
                        //]
                      ,
                        'text-anchor': 'center',
                        'text-optional': true
                    }
      }

      map.addLayer({
          'id': _id + '_labels',
          'type': 'symbol',
          'source': _id + '_source',
          //'source-layer': _id,
          'layout': _layout,
          
          'paint': {
              //"text-field": ['get','capital'],
              "text-color": '#fff',
              // "text-halo-blur": 1,
              "text-halo-color": "#fff",
              "text-halo-width": 1
          },
          
          'minzoom': 16
          //'layout':{"visibility":"none"}
          },
      //'lotes_zonificacion'
      );
    }

    console.log(1);
    const bounds = layer1.getBounds();
    console.log(bounds);

    /*
    map.fitBounds(bounds, {
        padding: 1 // Esto es opcional, pero te permite agregar un poco de espacio alrededor de la capa cuando se ajusta el mapa
    });
    */    


    map.on('click', 'cafe', async function (e) {
      
      var detalle_unidad_productiva = await $.ajax({
                                                url: '/filtrar-unidades-productivas',
                                                data: {
                                                  where_filtros: JSON.stringify({"id" : [e.features[0].properties.id]})
                                                },
                                                method: 'GET',
                                                error: function (error) {
                                                  console.error('Error al obtener las unidades productivas:', error);
                                                },
                                              });
      
      console.log(detalle_unidad_productiva);

      gDetalleUnidadProductiva = detalle_unidad_productiva;

      let zona = detalle_unidad_productiva[0].Zona;
      // Comprobar Valores - Zona
      zona != null ? zona = zona.descripcion : zona = 'ND';
      // console.log(zona);

      let parcela_plantas = detalle_unidad_productiva[0].numero_plantas;
      // Comprobar Valores - Parcela - Plantas
      parcela_plantas != null ? parcela_plantas = parcela_plantas  : parcela_plantas = 'ND';
      // console.log(parcela_plantas);

      let parcela_altitud = detalle_unidad_productiva[0].altitud;
      // Comprobar Valores - Parcela - Altitud
      parcela_altitud != null ? parcela_altitud = parcela_altitud  : parcela_altitud = 'ND';
      // console.log(parcela_altitud);

      let parcela_porcentaje_sombra = detalle_unidad_productiva[0].porcentaje_sombra;
      // Comprobar Valores - Parcela - Porcentaje Sombrea
      parcela_porcentaje_sombra != null ? parcela_porcentaje_sombra = parcela_porcentaje_sombra  : parcela_porcentaje_sombra = 'ND';
      // console.log(parcela_porcentaje_sombra);

      let parcela_area = detalle_unidad_productiva[0].area_ha;
      // Comprobar Valores - Parcela - Area
      parcela_area != null ? parcela_area = parcela_area  : parcela_area = 'ND';
      // console.log(parcela_area);
      if(parcela_area != null)
      {
        parcela_area = parseFloat(parcela_area).toFixed(2);
      }

      let parcela_poly_area = detalle_unidad_productiva[0].area_poly_ha;
      // Comprobar Valores - Parcela - Area
      parcela_poly_area != null ? parcela_poly_area = parcela_poly_area  : parcela_poly_area = 'ND';
      // console.log(parcela_poly_area);
      if(parcela_poly_area != null)
      {
        parcela_poly_area = parseFloat(parcela_poly_area).toFixed(2);
      }

      let variedad = detalle_unidad_productiva[0].Variedad;
      // Comprobar Valores - Variedad
      variedad != null ? variedad = variedad.descripcion : variedad = 'ND';
      // console.log(sello);

      let sello = detalle_unidad_productiva[0].Sello;
      // Comprobar Valores - Sello
      sello != null ? sello = sello.descripcion : sello = 'ND';
      // console.log(sello);

      let ints_anp = detalle_unidad_productiva[0].ints_anp;
      let area_ints_anp_m2 = detalle_unidad_productiva[0].area_ints_anp_m2;
      
      // Comprobar Valores - area_ints_anp_m2
      if (ints_anp == '1') 
      {
        area_ints_anp_m2 = parseFloat(area_ints_anp_m2).toFixed(2);
        area_ints_anp_m2 = numberWithCommas(area_ints_anp_m2); 
      }
      else
      {
        area_ints_anp_m2 = '0';
      }

      let ints_za = detalle_unidad_productiva[0].ints_za;
      let area_ints_za_m2 = detalle_unidad_productiva[0].area_ints_za_m2;
      // Comprobar Valores - ints_za
      if (ints_za == '1') 
      {
        area_ints_za_m2 = parseFloat(area_ints_za_m2).toFixed(2);
        area_ints_za_m2 = numberWithCommas(area_ints_za_m2); 
      }
      else
      {
        area_ints_za_m2 = '0';
      }

      let ints_deforestacion_2014 = detalle_unidad_productiva[0].ints_deforestacion_2014;
      let area_ints_deforestacion_2014_m2 = detalle_unidad_productiva[0].area_ints_deforestacion_2014_m2;
      // Comprobar Valores - ints_deforestacion_2014
      if (ints_deforestacion_2014 == '1') 
      {
        area_ints_deforestacion_2014_m2 = parseFloat(area_ints_deforestacion_2014_m2).toFixed(2);
        area_ints_deforestacion_2014_m2 = numberWithCommas(area_ints_deforestacion_2014_m2); 
      }
      else
      {
        area_ints_deforestacion_2014_m2 = '0';
      }
      
      

      let ints_deforestacion_2020 = detalle_unidad_productiva[0].ints_deforestacion_2020;
      let area_ints_deforestacion_2020_m2 = detalle_unidad_productiva[0].area_ints_deforestacion_2020_m2;
      // Comprobar Valores - ints_deforestacion_2020
      if (ints_deforestacion_2020 == '1') 
      {
        area_ints_deforestacion_2020_m2 = parseFloat(area_ints_deforestacion_2020_m2).toFixed(2);
        area_ints_deforestacion_2020_m2 = numberWithCommas(area_ints_deforestacion_2020_m2); 
      }
      else
      {
        area_ints_deforestacion_2020_m2 = '0';
      }
      

      var url_img = 'https://cdn.www.gob.pe/uploads/document/file/1464052/standard_FOTO_WEB_CAFE-1536x1024.jpg';

      if(detalle_unidad_productiva[0].imagen){
        url_img = '/' + detalle_unidad_productiva[0].imagen;
      }

      new maplibregl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(
          '<div class="pop-up-map-container">\
          <div class="pop-up-container">\
            <div class="img-container">\
              <img src="'+ url_img +'" alt="">\
              <div class="zona-container">\
                <span>Zona: ' + zona + '</span>\
              </div>\
            </div>\
    \
            <div class="atributos-container">\
              <div class="header-atributos">\
                <h6>' + detalle_unidad_productiva[0].nombre + ' - ' + detalle_unidad_productiva[0].parcela_gid + '</h6>\
                <span>' + detalle_unidad_productiva[0].Productor.nombre + ' - ' + detalle_unidad_productiva[0].productor_codigo + '</span>\
    \
              </div>\
    \
              <div class="body-atributos mt-4">\
                <div class="atributos-group mb-3">\
                <div class="atributo-items-container">\
                  <i class="fa-solid fa-coffee"></i>\
                  <span class="atributo-title">Area ha</span>\
                  <span class="atributo-value">' + parcela_area + '</span>\
                </div>\
                <div class="atributo-items-container">\
                    <i class="fa-solid fa-coffee"></i>\
                    <span class="atributo-title">Area ha C</span>\
                    <span class="atributo-value">' + parcela_poly_area + '</span>\
                </div>\
              </div>\
                <div class="atributos-group mb-3">\
                \
                  <div class="atributo-items-container">\
                    <i class="fa-solid fa-coffee"></i>\
                    <span class="atributo-title">ANP m2</span>\
                    <span class="atributo-value">' + area_ints_anp_m2 + '</span>\
    \
                  </div>\
    \
                  <div class="atributo-items-container">\
                    <i class="fa-solid fa-coffee"></i>\
                    <span class="atributo-title">ZA m2</span>\
                    <span class="atributo-value">' + area_ints_za_m2 + '</span>\
    \
                  </div>\
    \
                </div>\
    \
                <div class="atributos-group mb-3">\
                  <div class="atributo-items-container">\
                    <i class="fa-solid fa-coffee"></i>\
                    <span class="atributo-title">D14 m2</span>\
                    <span class="atributo-value">' + area_ints_deforestacion_2014_m2 + '</span>\
                  </div>\
                  <div class="atributo-items-container">\
                      <i class="fa-solid fa-coffee"></i>\
                      <span class="atributo-title">D20 m2</span>\
                      <span class="atributo-value">' + area_ints_deforestacion_2020_m2 + '</span>\
                  </div>\
                </div>\
                <div class="atributos-group mb-3">\
                  <div class="atributo-items-container">\
                    <i class="fa-solid fa-coffee"></i>\
                    <span class="atributo-title">Altitud</span>\
                    <span class="atributo-value">' + parcela_altitud + '</span>\
                  </div>\
    \
                  <div class="atributo-items-container">\
                    <i class="fa-solid fa-coffee"></i>\
                    <span class="atributo-title">Variedad</span>\
                    <span class="atributo-value">' + variedad + '</span>\
                  </div>\
                </div>\
                <div class="atributos-group">\
                  <div class="atributo-items-container">\
                    <i class="fa-solid fa-coffee"></i>\
                    <span class="atributo-title">Plantas</span>\
                    <span class="atributo-value">' + parcela_plantas + '</span>\
    \
                  </div>\
    \
                  <div class="atributo-items-container">\
                    <i class="fa-solid fa-coffee"></i>\
                    <span class="atributo-title">Sombra</span>\
                    <span class="atributo-value">' + parcela_porcentaje_sombra + '</span>\
    \
                  </div>\
                </div>\
    \
              </div>\
    \
            </div>\
    \
          </div>\
    \
        </div>'
        )
        .addTo(map);

    });

    // Change the cursor to a pointer when the mouse is over the places layer.
    map.on('mouseenter', 'cafe', function () {
      map.getCanvas().style.cursor = 'pointer';
    });
    
    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'cafe', function () {
      map.getCanvas().style.cursor = '';
    });

}

$('.table-actualizar-datos').on('click', '.btn-aprobar-parcela', function(){

  console.log("aprobar parcela");



});