var select_array = [];
var query_filtros_dict = {};
var unidad_productiva_id;
var bounds_parcela_seleccionada = [];

var gGlobal = [];
var gSeleccionado = null;


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


map.on('load', function(){
    obtener_parcelas_nuevas();
})

function obtener_parcelas_nuevas()
{
    var _data = {};

    $.ajax({
        url: '/get-nuevas-parcelas-shapefile',
        type: 'GET',
        dataType: 'json',
        data: _data,
        success: function(geojson) {

            //delete geojson["bbox"];
            
            var matriz = [];
            geojson = JSON.parse(geojson);
            console.log(geojson.features); // Aquí puedes hacer algo con el GeoJSON devuelto

            if (geojson.features != null) {

                gGlobal = geojson;
                gSeleccionado = geojson.features[0];

            
                console.log(geojson);
                var firstFeature = geojson.features[0];
                console.log(firstFeature);
                var turfMultiPolygon = turf.multiPolygon(firstFeature.geometry.coordinates);
                var bbox = turf.bbox(turfMultiPolygon);
                var bounds = [[bbox[0], bbox[1]], [bbox[2], bbox[3]]];
                map.fitBounds(bounds, { padding: 20 });

            
                //Comprobar si la fuente y la capa espacial existe
                map.getLayer('cafe') ? map.removeLayer('cafe') : false;
                map.getSource('cafe_source') ? map.removeSource('cafe_source') : false;
                
                //agregar capa al mapa
                agregar_geojson('cafe','fill',geojson, _paint=null);
                agregar_geojson_borde('cafeborde','line',geojson);

                for(var i=0; i<geojson["features"].length; i++){

                    var feature = geojson["features"][i];
                    matriz.push(feature["properties"]); 
    
                }
                
            }

            console.log(matriz);

            //   ---------------#### Lista de Nuevas Parcelas


            $('.input-buscar-parcela').on('keyup focus',function(){

            
                var buscado = $(this).val().trim().toUpperCase();
                var data = "";
                // Get the Multidimensional Array first
                console.log(matriz);
                if ( buscado.length >= 0 ){                

                    data = $.grep(matriz, function (e) {
                      console.log(e);
                      //if(e.COD_PROD.toUpperCase().indexOf(buscado) != -1 || e.NOM_PARC.toUpperCase().indexOf(buscado) != -1 || e.NOM_PARC.toUpperCase().indexOf(buscado) != -1 || e.DNI.toUpperCase().indexOf(buscado) != -1)
                      if(e.productor_codigo==null && e.nombre==null){
                        e.productor_codigo = '';
                        e.nombre = '';
                      }

                      e.productor_codigo ? true : e.productor_codigo = '';
                      e.nombre ? true : e.nombre = '';
                      e.parcela_gid ? true : e.parcela_gid = '';
                      e.productor_nombre ? true : e.productor_nombre = '';
                      e.productor_dni ? true : e.productor_dni = '';

                      if(e.productor_codigo.toUpperCase().indexOf(buscado) != -1 || e.nombre.toUpperCase().indexOf(buscado) != -1 || (e.parcela_gid).toString().indexOf(buscado) != -1 || e.productor_nombre.toUpperCase().indexOf(buscado) != -1 || e.productor_dni.indexOf(buscado) != -1)//|| e.DNI.toUpperCase().indexOf(buscado) != -1)
                          return e;
                    });                  
                }
            
                if ( data != "" ){
                    console.log('data tiene contenido');
                    $(this).parent().find(".dropdown-content").show();
            
                    // actualizar_datos_lista_parcelas(data,this);
                    
                    var sug = "";
            
                    for(i=0; i<data.length; i++){
            
                        sug += '<li class="list-group-item a_producto p-bus" data-idg="' + data[i].parcela_gid + '" data-id="'+ data[i].id +'">\
                                <div class="d-flex">\
                                    <img class="img-fluid" src="https://cdn.www.gob.pe/uploads/document/file/1464052/standard_FOTO_WEB_CAFE-1536x1024.jpg" alt="">\
                                    <div class="flex-grow-1">\
                                        <a>\
                                        <h6>' + data[i].id + ' - Parcela Nueva</h6>\
                                        </a>\
                                        <p>Area ha</p>\
                                    </div>\
                                </div>\
                            </li>'
                        
                      if(i>20) break;
                    }
            
                    //Seleccionar el elemento siguiente (div)
                    $(this).next().find('ul').html(sug);
                }
                else
                {
                    $(this).parent().find(".dropdown-content").show();
                    //$(".dropdown-content").hide();
                    $(this).next().find('ul').html('<li class="list-group-item a_producto p-bus" data-idg="" data-id="">\
                    <div class="d-flex">\
                        <div class="flex-grow-1">\
                            <a>\
                            <h6 style="color: #A8A8A8; margin-bottom: 0px; font-weight: 300 !important">No se registran nuevas parcelas de café</h6>\
                            </a>\
                        </div>\
                    </div>\
                </li>');
                }
              
              //}, 1000);//./timeout
                
            }).on("focusout", function(){
              setTimeout(function() {
                $(".dropdown-content").hide();
                console.log("se cerro la ventana de parcelas");
              }, 500);
            });;          

        }
      });
};

$('.dropdown-content').on('click', '.a_producto.p-bus', function(){

  // Ocultar sugerencias
  $('.dropdown-content').hide();

  // Capturar identificador de la unidad productiva seleccionada
  unidad_productiva_id = $(this).data('id');
  let object_id = $(this).data('idg');

  console.log("parcela seleccionada: ", unidad_productiva_id);
  console.log("parcela gid: ", object_id);

  for(var i=0; i<gGlobal.features.length; i++){
        if(object_id == gGlobal.features[i].properties.parcela_gid){
        gSeleccionado = gGlobal.features[i];
        }
    }

    // Mostrar en consola campos del objeto seleccionado
    console.log(gSeleccionado["properties"]);

    var turfMultiPolygon = turf.multiPolygon(gSeleccionado.geometry.coordinates);
    var bbox = turf.bbox(turfMultiPolygon);
    bounds_parcela_seleccionada = [[bbox[0], bbox[1]], [bbox[2], bbox[3]]];
    console.log(bounds_parcela_seleccionada);
    map.fitBounds(bounds_parcela_seleccionada, { padding: 20 });

  query_filtros_dict["where"] = {"id" : unidad_productiva_id};
  query_filtros_dict = JSON.stringify(query_filtros_dict["where"])

  $.ajax({
    url: '/filtrar-unidades-productivas',
    data: {
      field: 'id',
      value: [1],
      where_filtros: query_filtros_dict
    },
    method: 'GET',
    success: function (response) {
      // Trabaja con los datos de los productores en formato JSON
      console.log(response);

      // LLenar inputs con atributos de la unidad_productiva
      llenar_atributos_unidad_productiva(response);

      //Dejar vacio la variable que almacena el "where" para la proxima parcela consultada
      query_filtros_dict = {};
      
    },
    error: function (error) {
      console.error('Error al obtener las unidades productivas:', error);
    },
  });


});

function llenar_atributos_unidad_productiva($unidad_productiva)
{

    //  Mostrar en input "Buscador de Parcelas" el nombre de la parcela seleccionada
    let nombre_parcela_seleccionada = $unidad_productiva[0]["id"];
    $('.input-buscar-parcela').val(nombre_parcela_seleccionada);
  
  // Depositar todos los select en un arreglo
  select_array = $('.input-select');
  console.log(select_array);
  let selectId;
  let selectModel;
  let selectSelectedId;
  let data_options = [];

  


  for (let i = 0; i < select_array.length; i++) 
  {
    selectId = select_array[i]["attributes"][0]["value"];
    selectModel = select_array[i]["attributes"][2]["value"];
    selectSelectedId = select_array[i]["attributes"][3]["value"];
    console.log(selectId);
    console.log(selectModel);
    console.log(selectSelectedId);

    ajax_data_select(selectId, selectModel, selectSelectedId)

  }

  // Habilitar Boton para actualizar datos de la Unidad Productiva
  $('.btn-agregar-parcela').prop("disabled",false);

  
}


function ajax_data_select($selectId, $selectModel, $selectSelectedId)
{
  $.ajax({
    url: '/' + $selectModel,
    method: 'GET',
    success: function (response) {

      console.log(response);

      // Depositar valores del modelo en un diccionario
      let data_options = [];
      for (let i = 0; i < response.length; i++) {

        let item = {};

        if ($selectModel == 'productores') {

          item = {
            id : response[i].codigo,
            text : response[i].nombre + ' - ' + response[i].codigo,
            // selected: true
          }
          
        }
        else
        {
          item = {
            id : response[i].id,
            text : response[i].descripcion
          }
        }

        data_options.push(item);
      }

      console.log(data_options);

      // LLenar select con opciones
      $('#' + $selectId).select2({
        data: data_options,
        templateResult: formatState

      });

      // Establecer valor por defecto
      $('#' + $selectId).val($selectSelectedId).trigger('change');

      console.log('Valor Actual:' + $selectSelectedId);
      console.log('se agrego datos en:' + $selectId);
      
      
      
    },
    error: function (error) {
      console.error('Error al llenar las variables categóricas:', error);
    },
  });
}

function formatState (state) {
  if (!state.id) {
    return state.text;
  }
  var $state = $(
    '<span><i class="fa fa-search"></i> ' + state.text + '</span>'
  );
  return $state;
};

$('.btn-agregar-parcela').click(function(){

    //filtros_altitud_array = $('#select-filtro-altitud').select2('data');
    console.log($('#select-input-zona-agregar-parcela').select2('data'));

    let value_nombre = $('.input-nombre-agregar-parcela').val();
    let data_productor = $('#select-input-productor-agregar-parcela').select2('data');
    let data_variedad = $('#select-input-variedad-agregar-parcela').select2('data');
    let data_zona = $('#select-input-zona-agregar-parcela').select2('data');
    console.log(value_nombre);
    console.log(data_productor);
    console.log(data_variedad);
    console.log(data_zona);

    //Comprobar si se ha seleccionado alguna Zona, Variedad, Productor y Nombre
    if (data_zona.length == 0 || data_productor.length == 0 || data_variedad.length == 0 || value_nombre == '')
    {
        Swal.fire({
            title: 'Información Incompleta',
            text: 'Por favor, debe llenar todos los campos',
            icon: 'warning',
            showConfirmButton: false,
            timer: 2000
        })
    }

    else
    {
        // Crear un objeto FormData para enviar los datos, incluida la imagen
        let formData = new FormData();
        formData.append("id", unidad_productiva_id);
        formData.append("nombre", value_nombre);
        formData.append("productor_codigo", data_productor[0].id);
        formData.append("variedad_id", data_variedad[0].id);
        formData.append("zona_id", data_zona[0].id);
        formData.append("nueva", '0');
        
        
        //LLamar Update para Unidades Productivas
        $.ajax({
            url: '/update_unidad_productiva',
            method: 'PUT',
            //contentType: 'application/json',
            processData: false, // Evita que jQuery procese el formData automáticamente
            contentType: false, // Evita que jQuery establezca el tipo de contenido
            data: formData,
            success: function(response) {
            // Manejar la respuesta exitosa
            console.log(response);
            $('.input-nombre-agregar-parcela').val("");
            $('.input-buscar-parcela').val("");
            $('.btn-agregar-parcela').prop("disabled",true);
            $(".input-select").val(null).trigger('change');
            Swal.fire({
                title: 'Cambios realizados',
                text: 'Se agregó la nueva unidad productiva en la base de datos',
                icon: 'success',
                showConfirmButton: false,
                timer: 1500
            });

            obtener_parcelas_nuevas();
            },
            error: function(error) {
            Swal.fire({
                title: 'Error',
                text: 'No se pudo agregar la unidad productiva en la base de datos',
                icon: 'error',
                showConfirmButton: false,
                timer: 1500
            })
            }
        });

    }

    

});

//-------------------------------CARGAR CSV---------------------------------------------
document.addEventListener('DOMContentLoaded', function() {
  const csvForm = document.getElementById('csvForm');
  const csvFileInput = document.getElementById('csvFile');
  const cargarCSVButton = document.getElementById('cargarCSV');
  const progresoSpan = document.getElementById('progreso');

  const originalText = cargarCSVButton.innerHTML;

  cargarCSVButton.addEventListener('click', function() {
    csvFileInput.click(); // Abre el cuadro de diálogo para seleccionar un archivo
  });

  csvFileInput.addEventListener('change', function(event) {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const formData = new FormData();
      formData.append('csvFile', selectedFile);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/cargar-csv-crear-unidad-productiva', true);

      xhr.timeout = 3600000;  // 60 minutos
      //xhr.timeout = 5000;

      xhr.upload.onprogress = function(e) {

        //Estado cargando        
        // Mostrar spinner
        cargarCSVButton.innerHTML = '<div class="spinner"></div>';
        cargarCSVButton.disabled = true;
        //./Estado cargando

        if (e.lengthComputable) {
          const porcentaje = (e.loaded / e.total) * 100;
          progresoSpan.textContent = `${porcentaje.toFixed(2)}%`;
        }
      };

      xhr.onload = function() {
        if (xhr.status === 200) {  

          Swal.fire({
            title: 'Carga exitosa',
            text: 'Se actualizó la unidad productiva en la base de datos',
            icon: 'success',
            showConfirmButton: false,
            timer: 1500
          })

          progresoSpan.textContent = 'Carga completa';
          csvFileInput.value = '';

          // Restaurar el texto original
          cargarCSVButton.innerHTML = originalText;
          cargarCSVButton.disabled = false;


        } else {         

          Swal.fire({
            title: 'Error',
            text: 'No se pudo actualizar la unidad productiva en la base de datos',
            icon: 'error',
            showConfirmButton: false,
            timer: 1500
          })

          progresoSpan.textContent = 'Error en la carga';
          csvFileInput.value = '';

          // Restaurar el texto original
          cargarCSVButton.innerHTML = originalText;
          cargarCSVButton.disabled = false;

        }
      };

      xhr.send(formData);
    }
  });
});
//-------------------------------CARGAR CSV---------------------------------------------

$('.btn-calcular-interseccion').click(async function(){
  const button = document.getElementById('btnCalcularInterseccion');
  const originalText = button.innerHTML;

  // Mostrar spinner
  button.innerHTML = '<div class="spinner"></div>';
  button.disabled = true;

  try {
      const response = await fetch('/calcular-interseccion');
      const data = await response.json();

      if (data.success) {
          console.log(`Execution time: ${data.executionTime} ms`);
      } else {
          console.error(`Error: ${data.error}`);
      }
  } catch (error) {
      console.error(`Error: ${error.message}`);
  }

  // Restaurar el texto original
  button.innerHTML = originalText;
  button.disabled = false;
})