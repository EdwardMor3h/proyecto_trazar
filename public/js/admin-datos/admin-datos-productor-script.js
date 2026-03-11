var select_array = [];
var query_filtros_dict = {};
var productor_id;
obtener_productores();

function obtener_productores()
{
  
    $.ajax({
        url: '/productores',
        method: 'GET',
        success: function (response) {

          $('.input-buscar-productor').on('keyup focus',function(){

        
            var buscado = $(this).val().trim().toUpperCase();
            var data = "";

            // Get the Multidimensional Array first
            //console.log(response);
            if ( buscado.length >= 0 ){                

                data = $.grep(response, function (e) {
                  //console.log(e);
                 
                  e.codigo ? true : e.codigo = '';
                  e.nombre ? true : e.nombre = '';
                  e.dni ? true : e.dni = '';

                  //if(e.productor_codigo.toUpperCase().indexOf(buscado) != -1 || e.nombre.toUpperCase().indexOf(buscado) != -1 || (e.parcela_gid).toString().indexOf(buscado) != -1 || e.productor.nombre.toUpperCase().indexOf(buscado) != -1 || e.productor['dni'].indexOf(buscado) != -1)
                  if(e.codigo.toUpperCase().indexOf(buscado) != -1 || e.nombre.toUpperCase().indexOf(buscado) != -1 || e.dni.toUpperCase().indexOf(buscado) != -1)
                  {
                      return e;
                  }
                });                  
            }
        
            if ( data != "" ){
                $(this).parent().find(".dropdown-content").show();
        
                // actualizar_datos_lista_parcelas(data,this);
                
                var sug = "";
        
                for(i=0; i<data.length; i++){
        
                    sug += '<li class="list-group-item a_producto p-bus" data-id="' + data[i].id + '" data-codigo="'+ data[i].codigo+'">\
                            <div class="d-flex">\
                                <img class="img-fluid" src="https://cdn.www.gob.pe/uploads/document/file/1464052/standard_FOTO_WEB_CAFE-1536x1024.jpg" alt="">\
                                <div class="flex-grow-1">\
                                    <a>\
                                    <h6>' + data[i].codigo + ' - <span style="text-transform: lowercase"> ' + data[i].nombre + '</span></h6>\
                                    </a>\
                                    <p>' + data[i].dni + '</p>\
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
  let productor_codigo = $(this).data('codigo');
  productor_id = $(this).data('id');

  //query_filtros_dict["where"] = {"codigo" : productor_codigo};
  query_filtros_dict["where"] = {"id" : productor_id};
  query_filtros_dict = JSON.stringify(query_filtros_dict["where"])

  $.ajax({
    url: '/filtrar-productores',
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
      llenar_atributos_productor(response);

      //Dejar vacio la variable que almacena el "where" para el proximo productor consultado
      query_filtros_dict = {};
      
    },
    error: function (error) {
      console.error('Error al obtener las unidades productivas:', error);
    },
  });




});

function llenar_atributos_productor($productor)
{

    // Limpiar input Imagen
    $('.input-cargar-foto').val("");

    console.log($productor);
    //  Mostrar en input "Buscador de Productores" el nombre del productor seleccionado
    let nombre_productor_seleccionada = $productor[0]["codigo"] + ' - ' + $productor[0]["nombre"];
    $('.input-buscar-productor').val(nombre_productor_seleccionada);
   
  // ============= LLenar Inputs ========================
  // Imagen de Productor
  var url_img = 'https://cdn.www.gob.pe/uploads/document/file/1464052/standard_FOTO_WEB_CAFE-1536x1024.jpg';
  if("imagen" in $productor[0] && $productor[0]["imagen"] != null){
    url_img = '/' + $productor[0]["imagen"];
  }
  $('.img-productor').fadeOut(function(){      
    $(this).attr('src', url_img).fadeIn();
  });

  // Codigo de Productor
  $('.input-codigo-actualizar-productor').fadeOut(function(){
    
    $(this).val($productor[0]["codigo"]).fadeIn();
  });

  // Nombre de Productor
  $('.input-nombre-actualizar-productor').fadeOut(function(){
    
    $(this).val($productor[0]["nombre"]).fadeIn();
  });

  // DNI
  $('.input-dni-actualizar-productor').fadeOut(function(){
    
    $(this).val($productor[0]["dni"]).fadeIn();
  });

  // Fecha Nacimiento
  if ($productor[0]["f_nacimiento"] != null) {

    let value_fecha_nacimiento = $productor[0]["f_nacimiento"];

    let [periodo_uno_anho, periodo_uno_mes, periodo_uno_dia] = value_fecha_nacimiento.split("-").map(elemento => elemento.trim());
    
    let value_fnacimiento = periodo_uno_dia + '/' + periodo_uno_mes + '/' + periodo_uno_anho;

    $('.input-fecha-nacimiento-actualizar-productor').fadeOut(function(){
      $(this).val(value_fnacimiento).fadeIn();
    });
  }

  else{
    $('.input-fecha-nacimiento-actualizar-productor').fadeOut(function(){
      $(this).val("").fadeIn();
    });

  }

  

  // ID Sexo
  $('#select-input-sexo-actualizar-productor').attr('data-id', $productor[0]["sexo_id"]);
  
  // ID Promotor
  $('#select-input-promotor-actualizar-productor').attr('data-id', $productor[0]["promotor_id"]);

  // ID Extensionista
  $('#select-input-extensionista-actualizar-productor').attr('data-id', $productor[0]["extensionista_id"]);


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
  $('.btn-actualizar-productor').prop("disabled",false);

  
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
      console.error('Error al llenar los select:', error);
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

$('.btn-actualizar-productor').click(function(){

  //filtros_altitud_array = $('#select-filtro-altitud').select2('data');
  console.log($('#select-input-zona-actualizar-productor').select2('data'));

  let value_nombre = $('.input-nombre-actualizar-productor').val();
  let value_dni = $('.input-dni-actualizar-productor').val();
  let value_codigo = $('.input-codigo-actualizar-productor').val();
  let value_fecha_nacimiento = $('.input-fecha-nacimiento-actualizar-productor').val();
  let value_fnacimiento;
  console.log(value_fecha_nacimiento);
  if (value_fecha_nacimiento != '') {

    const [periodo_uno_dia, periodo_uno_mes, periodo_uno_anho] = value_fecha_nacimiento.split("/").map(elemento => elemento.trim());
    
    value_fnacimiento = periodo_uno_anho + '-' + periodo_uno_mes + '-' + periodo_uno_dia;
  }
  else{
    value_fnacimiento = '2023-01-01';
  }
  console.log(value_fnacimiento);

  let data_sexo = $('#select-input-sexo-actualizar-productor').select2('data');
  let data_promotor = $('#select-input-promotor-actualizar-productor').select2('data');
  let data_extensionista = $('#select-input-extensionista-actualizar-productor').select2('data');

  // Obtener el archivo de imagen seleccionado
  let selectedImage = $('.input-cargar-foto')[0].files[0];

  // Crear un objeto FormData para enviar los datos, incluida la imagen
  let formData = new FormData();
  formData.append("id", productor_id);
  formData.append("codigo", value_codigo);
  formData.append("nombre", value_nombre);
  formData.append("dni", value_dni);
  formData.append("f_nacimiento", value_fnacimiento);
  data_sexo[0] ? formData.append("sexo_id", data_sexo[0].id) : false;
  data_promotor[0] ? formData.append("promotor_id", data_promotor[0].id) : false;
  data_extensionista[0] ? formData.append("extensionista_id", data_extensionista[0].id) : false;
  formData.append("imagen", selectedImage); // Agregar la imagen al formData

  //LLamar Update para Unidades Productivas
  $.ajax({
    url: '/update_productor',
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
        text: 'Se actualizó el productor en la base de datos',
        icon: 'success',
        showConfirmButton: false,
        timer: 1500
      })
    },
    error: function(error) {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo actualizar el productor en la base de datos',
        icon: 'error',
        showConfirmButton: false,
        timer: 1500
      })
    }
  });

});

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

//-------------------------------CARGAR CSV---------------------------------------------
document.addEventListener('DOMContentLoaded', function() {
  const csvForm = document.getElementById('csvForm');
  const csvFileInput = document.getElementById('csvFile');
  const cargarCSVButton = document.getElementById('cargarCSV');
  const progresoSpan = document.getElementById('progreso');

  cargarCSVButton.addEventListener('click', function() {
    csvFileInput.click(); // Abre el cuadro de diálogo para seleccionar un archivo
  });

  csvFileInput.addEventListener('change', function(event) {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const formData = new FormData();
      formData.append('csvFile', selectedFile);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/cargar-csv-productor', true);

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
});

$('.descargar-plantilla-actualizar-productor').click(function(){

  var table = $('<table>\
                <thead>\
                  <tr>\
                    <th>codigo</th>\
                    <th>nombre</th>\
                    <th>dni</th>\
                    <th>sexo_id</th>\
                    <th>extensionista_id</th>\
                    <th>promotor_id</th>\
                    <th>lpa_anho</th>\
                    <th>lpa_tipo</th>\
                    <th>lpa_origen</th>\
                  </tr>\
                </thead>\
                <tbody>\
                  <tr>\
                    <td>9OC40</td>\
                    <td>PASAPERA ROMAN JAIME ANTONIO</td>\
                    <td>40919703</td>\
                    <td>2</td>\
                    <td>3</td>\
                    <td>9</td>\
                    <td>2024</td>\
                    <td>ORGANICO</td>\
                    <td>INSPECCION 2024</td>\
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

// Función para convertir una cadena binaria en un arreglo de bytes
function s2ab(s) {
  var buf = new ArrayBuffer(s.length);
  var view = new Uint8Array(buf);
  for (var i = 0; i < s.length; i++) {
    view[i] = s.charCodeAt(i) & 0xff;
  }
  return buf;
};