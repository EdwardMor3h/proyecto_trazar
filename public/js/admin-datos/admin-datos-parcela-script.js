var select_array = [];
var query_filtros_dict = {};
var unidad_productiva_id;
obtener_parcelas();

function obtener_parcelas()
{
    $.ajax({
        url: '/unidades-productivas',
        method: 'GET',
        success: function (response) {

          $('.input-buscar-parcela').on('keyup focus',function(){

        
            var buscado = $(this).val().trim().toUpperCase();
            var data = "";

            // Get the Multidimensional Array first
            //console.log(response);
            if ( buscado.length >= 0 ){                

                data = $.grep(response, function (e) {
                  //console.log(e);
                 
                  e.productor_codigo ? true : e.productor_codigo = '';
                  e.nombre ? true : e.nombre = '';
                  e.parcela_gid ? true : e.parcela_gid = '';

                  //if(e.productor_codigo.toUpperCase().indexOf(buscado) != -1 || e.nombre.toUpperCase().indexOf(buscado) != -1 || (e.parcela_gid).toString().indexOf(buscado) != -1 || e.productor.nombre.toUpperCase().indexOf(buscado) != -1 || e.productor['dni'].indexOf(buscado) != -1)
                  if(e.productor_codigo.toUpperCase().indexOf(buscado) != -1 || e.nombre.toUpperCase().indexOf(buscado) != -1 || (e.id).toString().indexOf(buscado) != -1)
                  {
                      return e;
                  }
                });                  
            }

            console.log(data);
        
            if ( data != "" ){
                $(this).parent().find(".dropdown-content").show();
        
                // actualizar_datos_lista_parcelas(data,this);
                
                var sug = "";
        
                for(i=0; i<data.length; i++){

                    var _productor = "";

                    if('Productor' in data[i] && data[i].Productor){
                      if('nombre' in data[i].Productor && 'productor_codigo' in data[i].Productor && 'dni' in data[i].Productor){
                        _productor = '<p>' + data[i].Productor.nombre + ' - ' + data[i].productor_codigo + ' - ' + data[i].Productor.dni + '</p>';
                      }
                    }
        
                    sug += '<li class="list-group-item a_producto p-bus" data-id="'+ data[i].id+'">\
                            <div class="d-flex">\
                                <img class="img-fluid" src="https://cdn.www.gob.pe/uploads/document/file/1464052/standard_FOTO_WEB_CAFE-1536x1024.jpg" alt="">\
                                <div class="flex-grow-1">\
                                    <a>\
                                    <h6>' + data[i].id + ' - ' + data[i].nombre + '</h6>\
                                    </a>'
                                    + _productor +
                                '</div>\
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
        });; 
          
      
         
      
        },
        error: function (error) {
          console.error('Error al obtener los registros:', error);
        },
    });
};

$('.dropdown-content').on('click', '.a_producto.p-bus', function(){

  // Ocultar sugerencias
  $('.dropdown-content').hide();

  // Capturar identificador de la unidad productiva seleccionada
  unidad_productiva_id = $(this).data('id');

  query_filtros_dict ? true : query_filtros_dict = {};

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

    // Limpiar input Imagen
    $('.input-cargar-foto').val("");
    console.log($unidad_productiva);

    //  Mostrar en input "Buscador de Parcelas" el nombre de la parcela seleccionada
    let nombre_parcela_seleccionada = $unidad_productiva[0]["id"] + ' - ' + $unidad_productiva[0]["nombre"];

    if('Productor' in $unidad_productiva[0] && $unidad_productiva[0].Productor){
      nombre_parcela_seleccionada += ' (' + $unidad_productiva[0].Productor.nombre + ')'
    }

    // let nombre_parcela_seleccionada = $(this).data('id') + ' - ' + $(this).data('parcela-nombre') + ' (' + $(this).data('productor-nombre') + ')' ;
    $('.input-buscar-parcela').val(nombre_parcela_seleccionada);
   
  // ============= LLenar Inputs ========================
  // Imagen de unidad_productiva
  var url_img = 'https://cdn.www.gob.pe/uploads/document/file/1464052/standard_FOTO_WEB_CAFE-1536x1024.jpg';
  if("imagen" in $unidad_productiva[0] && $unidad_productiva[0]["imagen"] != null){
    url_img = '/' + $unidad_productiva[0]["imagen"];
  }
  $('.img-productor').fadeOut(function(){      
    $(this).attr('src', url_img).fadeIn();
  });

  // Nombre de Parcela
  $('.input-nombre-actualizar-parcela').fadeOut(function(){
    //$(this).val($["features"][objectid_actual]unidad_productiva[0]["NOM_PARC"]).fadeIn();
    $(this).val($unidad_productiva[0]["nombre"]).fadeIn();
  });

  // Altitud
  $('.input-altitud-actualizar-parcela').fadeOut(function(){
    //$(this).val($["features"][objectid_actual]unidad_productiva[0]["NOM_PARC"]).fadeIn();
    $(this).val($unidad_productiva[0]["altitud"]).fadeIn();
  });

  // Area
  $('.input-area-actualizar-parcela').fadeOut(function(){
    //$(this).val($["features"][objectid_actual]unidad_productiva[0]["NOM_PARC"]).fadeIn();
    $(this).val($unidad_productiva[0]["area_ha"]).fadeIn();
  });

  // Codigo de Venta
  $('.input-codigo-venta-actualizar-parcela').fadeOut(function(){
    //$(this).val($["features"][objectid_actual]unidad_productiva[0]["NOM_PARC"]).fadeIn();
    $(this).val($unidad_productiva[0]["codigo_venta"]).fadeIn();
  });

  // ID Sello
  $('#select-input-sello-actualizar-parcela').attr('data-id', $unidad_productiva[0]["sello_id"]);
  
  // ID Caserio
  $('#select-input-caserio-actualizar-parcela').attr('data-id', $unidad_productiva[0]["caserio_id"]);

  // ID Comite
  $('#select-input-comite-actualizar-parcela').attr('data-id', $unidad_productiva[0]["comite_id"]);

  // ID Corredor
  $('#select-input-corredor-actualizar-parcela').attr('data-id', $unidad_productiva[0]["corredor_id"]);

  // ID Zona
  $('#select-input-zona-actualizar-parcela').attr('data-id', $unidad_productiva[0]["zona_id"]);

  // ID Productor
  $('#select-input-productor-actualizar-parcela').attr('data-id', $unidad_productiva[0]["productor_codigo"]);

  // ID Variedad
  $('#select-input-variedad-actualizar-parcela').attr('data-id', $unidad_productiva[0]["variedad_id"]);
  

  // let defaultZonaId = '"' + $unidad_productiva[0].Zona.id + '"';

  if('Zona' in $unidad_productiva[0] && $unidad_productiva[0]['Zona']){
    let defaultZonaId = $unidad_productiva[0].Zona.id;
    console.log(defaultZonaId);
  }  

  // Llenar Inputs tipo select
  //llenar_atributos_select($unidad_productiva[0]["id"])


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
  $('.btn-actualizar-parcela').prop("disabled",false);

  
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
      console.error('Error al obtener los caserios:', error);
    },
  });
}

function formatState (state) {
  if (!state.id) {
    return state.text;
  }
  var $state = $(
    '<span><i class="fa fa-seedling me-2"></i>' + state.text + '</span>'
  );
  return $state;
};

$('.btn-actualizar-parcela').click(function(){

  //filtros_altitud_array = $('#select-filtro-altitud').select2('data');
  console.log($('#select-input-zona-actualizar-parcela').select2('data'));

  
  let value_nombre = $('.input-nombre-actualizar-parcela').val();
  let value_altitud = $('.input-altitud-actualizar-parcela').val();
  let value_codigo_venta = $('.input-codigo-venta-actualizar-parcela').val();
  let data_sello = $('#select-input-sello-actualizar-parcela').select2('data');
  let data_caserio = $('#select-input-caserio-actualizar-parcela').select2('data');
  let data_comite = $('#select-input-comite-actualizar-parcela').select2('data');
  let data_corredor = $('#select-input-corredor-actualizar-parcela').select2('data');
  let data_zona = $('#select-input-zona-actualizar-parcela').select2('data');
  let data_variedad = $('#select-input-variedad-actualizar-parcela').select2('data');  

  // Obtener el archivo de imagen seleccionado
  let selectedImage = $('.input-cargar-foto')[0].files[0];

  // Crear un objeto FormData para enviar los datos, incluida la imagen
  let formData = new FormData();
  formData.append("id", unidad_productiva_id);
  formData.append("codigo_venta", value_codigo_venta);
  formData.append("nombre", value_nombre);
  value_altitud ? formData.append("altitud", value_altitud) : value_altitud=0;
  
  data_sello[0] ? formData.append("sello_id", data_sello[0].id) : false;
  data_caserio[0] ? formData.append("caserio_id", data_caserio[0].id): false;
  data_comite[0] ? formData.append("comite_id", data_comite[0].id): false;
  data_corredor[0] ? formData.append("corredor_id", data_corredor[0].id): false;
  data_zona[0] ? formData.append("zona_id", data_zona[0].id): false;
  data_variedad[0] ? formData.append("variedad_id", data_variedad[0].id): false;
  formData.append("imagen", selectedImage); // Agregar la imagen al formData


  //LLamar Update para Unidades Productivas
  $.ajax({
      url: '/update_unidad_productiva',
      method: 'PUT',
      processData: false, // Evita que jQuery procese el formData automáticamente
      contentType: false, // Evita que jQuery establezca el tipo de contenido
      data: formData,
      success: function(response) {
        // Manejar la respuesta exitosa
        console.log(response);
        Swal.fire({
          title: 'Cambios realizados',
          text: 'Se actualizó la unidad productiva en la base de datos',
          icon: 'success',
          showConfirmButton: false,
          timer: 1500
        })
      },
      error: function(error) {
        Swal.fire({
          title: 'Error',
          text: 'No se pudo actualizar la unidad productiva en la base de datos',
          icon: 'error',
          showConfirmButton: false,
          timer: 1500
        })
      }
  });

});


//-------------------------------CARGAR CSV---------------------------------------------
document.addEventListener('DOMContentLoaded', function() {
  const csvForm = document.getElementById('csvForm');
  const csvFileInput = document.getElementById('csvFile');
  const cargarCSVButton = document.getElementById('cargarCSV');
  const progresoSpan = document.getElementById('progreso');

  /*  Cargar CSV - Actualizar Data Parcela  */

  cargarCSVButton.addEventListener('click', function() {
    csvFileInput.click(); // Abre el cuadro de diálogo para seleccionar un archivo
  });

  csvFileInput.addEventListener('change', function(event) {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const formData = new FormData();
      formData.append('csvFile', selectedFile);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/cargar-csv-unidad-productiva', true);

      xhr.upload.onprogress = function(e) {
        if (e.lengthComputable) {
          const porcentaje = (e.loaded / e.total) * 100;
          progresoSpan.textContent = `${porcentaje.toFixed(2)}%`;
        }
      };

      xhr.onload = function() {
        if (xhr.status === 200) {         

          Swal.fire({
            title: 'Carga exitosa',
            text: 'Se cargó el archivo csv a la base de datos',
            icon: 'success',
            showConfirmButton: false,
            timer: 1500
          })

          progresoSpan.textContent = 'Carga completa';
          csvFileInput.value = '';


        } else {         

          Swal.fire({
            title: 'Error',
            text: 'No se pudo cargar el archivo csv a la base de datos',
            icon: 'error',
            showConfirmButton: false,
            timer: 2000
          })

          progresoSpan.textContent = 'Error en la carga';
          csvFileInput.value = '';

        }
      };

      xhr.send(formData);
    }
  });

  /*  Cargar CSV - Eliminar Parcela  */

  const csvFileInputEliminar = document.getElementById('csvFileEliminar');
  const cargarCSVButtonEliminar = document.getElementById('cargarCSVEliminar');
  const progresoSpanEliminar = document.getElementById('progresoEliminar');

  cargarCSVButtonEliminar.addEventListener('click', function() {
    csvFileInputEliminar.click(); // Abre el cuadro de diálogo para seleccionar un archivo
  });

  csvFileInputEliminar.addEventListener('change', function(event) {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const formData = new FormData();
      formData.append('csvFile', selectedFile);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/cargar-csv-eliminar-unidad-productiva', true);

      xhr.upload.onprogress = function(e) {
        if (e.lengthComputable) {
          const porcentaje = (e.loaded / e.total) * 100;
          progresoSpanEliminar.textContent = `${porcentaje.toFixed(2)}%`;
        }
      };

      xhr.onload = function() {
        if (xhr.status === 200) {         

          Swal.fire({
            title: 'Carga exitosa',
            text: 'Se cargó el archivo csv a la base de datos',
            icon: 'success',
            showConfirmButton: false,
            timer: 1500
          })

          progresoSpanEliminar.textContent = 'Carga completa';
          csvFileInput.value = '';


        } else {         

          Swal.fire({
            title: 'Error',
            text: 'No se pudo cargar el archivo csv a la base de datos',
            icon: 'error',
            showConfirmButton: false,
            timer: 2000
          })

          progresoSpanEliminar.textContent = 'Error en la carga';
          csvFileInput.value = '';

        }
      };

      xhr.send(formData);
    }
  });


});

$('.descargar-plantilla-actualizar').click(function(){

  var table = $('<table>\
                <thead>\
                  <tr>\
                    <th>id</th>\
                    <th>nombre</th>\
                    <th>area_ha</th>\
                    <th>zona_id</th>\
                    <th>variedad_id</th>\
                    <th>altitud</th>\
                    <th>codigo_venta</th>\
                    <th>productor_codigo</th>\
                    <th>numero_plantas</th>\
                    <th>porcentaje_sombra</th>\
                    <th>sello_id</th>\
                    <th>corredor_id</th>\
                    <th>comite_id</th>\
                    <th>cuenca_hidrografica_id</th>\
                    <th>caserio_id</th>\
                  </tr>\
                </thead>\
                <tbody>\
                  <tr>\
                    <td>4334</td>\
                    <td>El Cafetal</td>\
                    <td>4.56</td>\
                    <td>3</td>\
                    <td>4</td>\
                    <td>2560</td>\
                    <td>ABC123</td>\
                    <td>TMMI4174</td>\
                    <td>2500</td>\
                    <td>45</td>\
                    <td>1</td>\
                    <td>4</td>\
                    <td>3</td>\
                    <td>5</td>\
                    <td>2</td>\
                  </tr>\
                </tbody>\
              </table>')[0];

  // Crear una nueva hoja de cálculo
  var workbook = XLSX.utils.book_new();

  // Obtener los datos de la tabla
  var worksheet = XLSX.utils.table_to_sheet(table);

  // Agregar la hoja de trabajo al libro
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');

  // Convertir el libro de trabajo a un archivo de Excel binario
  var excelData = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });

  // Descargar el archivo de Excel
  var blob = new Blob([s2ab(excelData)], { type: 'application/octet-stream' });
  var url = URL.createObjectURL(blob);
  var link = document.createElement('a');
  link.href = url;
  link.download = 'plantillaActualizarParcela.xlsx';
  link.click();

});
//-------------------------------CARGAR CSV---------------------------------------------

//Cargar foto
$('.perfil-codigo-productor').click(function(){
  $('.input-cargar-foto').click();
})

// Agregar un evento de cambio al input de tipo file
$('.input-cargar-foto').on('change', function(event) {
  // Obtener el archivo seleccionado
  const selectedFile = event.target.files[0];
  
  if (selectedFile) {
      // Crear un objeto URL para la imagen seleccionada
      const imageUrl = URL.createObjectURL(selectedFile);
      
      // Mostrar la vista previa de la imagen en el elemento img
      $('.img-productor').attr('src', imageUrl);
  } else {
      // Si no se selecciona ningún archivo, borrar la vista previa
      $('#imagePreview').attr('src', '');
  }
});

// Función para convertir una cadena binaria en un arreglo de bytes
function s2ab(s) {
  var buf = new ArrayBuffer(s.length);
  var view = new Uint8Array(buf);
  for (var i = 0; i < s.length; i++) {
    view[i] = s.charCodeAt(i) & 0xff;
  }
  return buf;
};