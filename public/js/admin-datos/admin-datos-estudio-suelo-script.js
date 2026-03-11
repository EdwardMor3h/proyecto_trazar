var select_array = [];
var query_filtros_dict = {};
var unidad_productiva_id;
var estudio_suelo_id;
var up_con_estudio_suelo_array = [];
listar_up_con_estudio_suelo();
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
        
                    sug += '<li class="list-group-item a_producto p-bus" data-id="'+ data[i].id+'" data-parcela-nombre="' + data[i].nombre + '">\
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
          }, 100);
        });; 
          
      
         
      
        },
        error: function (error) {
          console.error('Error al obtener los registros:', error);
        },
    });
};

$('.dropdown-content').on('click', '.a_producto.p-bus', function(){
  //alert(1);
  // Ocultar sugerencias
  $('.dropdown-content').hide();

    //  Mostrar en input "Buscador de Parcelas" el nombre de la parcela seleccionada
    let nombre_parcela_seleccionada = $(this).data('id') + ' - ' + $(this).data('parcela-nombre') + ' (' + $(this).data('productor-nombre') + ')' ;
    $('.input-buscar-parcela').val(nombre_parcela_seleccionada);

  // Capturar identificador de la unidad productiva seleccionada
  unidad_productiva_id = $(this).data('id');

  if (!up_con_estudio_suelo_array.includes(unidad_productiva_id)) 
  {
    console.log("registro de estudio suelo CREADO");
    $.ajax({
      url: '/estudios-suelo',
      method: 'POST',
      data: {
        "unidad_productiva_id": unidad_productiva_id,
        "textura_suelo_id": 3
      },
      success: function (response) {
        // Trabaja con los datos de los productores en formato JSON
        console.log(response);

        llenar_select_nuevos_registros(response);

        up_con_estudio_suelo_array.push(response.unidad_productiva_id);
        estudio_suelo_id = response.id;
        $('.input-fecha-actualizar-estudio-suelo').val('');
        $('.input-codigo-actualizar-estudio-suelo').val('');
        $('.input-materia-organica-actualizar-estudio-suelo').val('');
        $('.input-ph-actualizar-estudio-suelo').val('');
        $('.input-nitrato-actualizar-estudio-suelo').val('');
        $('.input-fosforo-actualizar-estudio-suelo').val('');
        $('.input-oxido-potasio-actualizar-estudio-suelo').val('');      
      },
      error: function (error) {
        console.error('Error al crear el estudio de suelo:', error);
      },
    });
  }
  else
  {
    console.log("registro de estudio suelo EXISTE");
    query_filtros_dict["where"] = {"unidad_productiva_id" : unidad_productiva_id};
    query_filtros_dict = JSON.stringify(query_filtros_dict["where"])

    $.ajax({
      url: '/filtrar-estudios-suelo',
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
        llenar_atributos_estudio_suelo(response);

        //Dejar vacio la variable que almacena el "where" para la proxima parcela consultada
        query_filtros_dict = {};
        
      },
      error: function (error) {
        console.error('Error al obtener las unidades productivas:', error);
      },
    });

  }

  // Habilitar Boton para actualizar datos del Estudio de Suelo
  $('.btn-actualizar-estudio-suelo').prop("disabled",false);


});

function llenar_atributos_estudio_suelo($estudio_suelo)
{
    estudio_suelo_id = $estudio_suelo[0]["id"];
   
  // ============= LLenar Inputs ========================

  // Fecha
  if ($estudio_suelo[0]["fecha"] != null) {

    let value_fecha_nacimiento = $estudio_suelo[0]["fecha"];

    let [periodo_uno_anho, periodo_uno_mes, periodo_uno_dia] = value_fecha_nacimiento.split("-").map(elemento => elemento.trim());
    
    let value_fnacimiento = periodo_uno_dia + '/' + periodo_uno_mes + '/' + periodo_uno_anho;

    $('.input-fecha-actualizar-estudio-suelo').fadeOut(function(){
      $(this).val(value_fnacimiento).fadeIn();
    });
  }

  else{
    $('.input-fecha-actualizar-estudio-suelo').fadeOut(function(){
      $(this).val("").fadeIn();
    });

  }

  // Codigo
  $('.input-codigo-actualizar-estudio-suelo').fadeOut(function(){
    $(this).val($estudio_suelo[0]["codigo_estudio"]).fadeIn();
  });

  // Materia Organica
  $('.input-materia-organica-actualizar-estudio-suelo').fadeOut(function(){
    $(this).val($estudio_suelo[0]["materia_organica"]).fadeIn();
  });

  // Ph
  $('.input-ph-actualizar-estudio-suelo').fadeOut(function(){
    $(this).val($estudio_suelo[0]["ph"]).fadeIn();
  });

  // Nitrato NO3
  $('.input-nitrato-actualizar-estudio-suelo').fadeOut(function(){
    $(this).val($estudio_suelo[0]["no3_ppm"]).fadeIn();
  });

  // Fosforo
  $('.input-fosforo-actualizar-estudio-suelo').fadeOut(function(){
    $(this).val($estudio_suelo[0]["fosforo"]).fadeIn();
  });

  // Oxido de Potasio
  $('.input-oxido-potasio-actualizar-estudio-suelo').fadeOut(function(){
    $(this).val($estudio_suelo[0]["k2o_ppm"]).fadeIn();
  });

  // ID Textura Suelo
  $('#select-input-textura-suelo-actualizar-estudio-suelo').attr('data-id', $estudio_suelo[0]["textura_suelo_id"]);
  


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

    ajax_data_select(selectId, selectModel, selectSelectedId)

  }
  
}


function ajax_data_select($selectId, $selectModel, $selectSelectedId)
{
  $.ajax({
    url: '/' + $selectModel,
    method: 'GET',
    success: function (response) {

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

$('.btn-actualizar-estudio-suelo').click(function(){

  
  let value_codigo_estudio = $('.input-codigo-actualizar-estudio-suelo').val();
  let value_materia_organica = $('.input-materia-organica-actualizar-estudio-suelo').val();
  let value_ph = $('.input-ph-actualizar-estudio-suelo').val();
  let value_no3_ppm = $('.input-nitrato-actualizar-estudio-suelo').val();
  let value_fosforo = $('.input-fosforo-actualizar-estudio-suelo').val();
  let value_k2o_ppm = $('.input-oxido-potasio-actualizar-estudio-suelo').val();
  let data_textura_suelo = $('#select-input-textura-suelo-actualizar-estudio-suelo').select2('data');

  let value_fecha_estudio = $('.input-fecha-actualizar-estudio-suelo').val();
  let value_fecha;
  console.log(value_fecha_estudio);
  if (value_fecha_estudio != '') {

    const [periodo_uno_dia, periodo_uno_mes, periodo_uno_anho] = value_fecha_estudio.split("/").map(elemento => elemento.trim());
    
    value_fecha = periodo_uno_anho + '-' + periodo_uno_mes + '-' + periodo_uno_dia;
  }
  else{
    value_fecha = '2023-01-01';
  }
  console.log(value_fecha);

  //LLamar Update para Unidades Productivas
  $.ajax({
    url: '/update_estudio_suelo',
    method: 'PUT',
    //contentType: 'application/json',
    data: {
        "id" : estudio_suelo_id,
        "codigo_estudio" : value_codigo_estudio,
        "materia_organica" : value_materia_organica,
        "ph" : value_ph,
        "no3_ppm" : value_no3_ppm,
        "fosforo" : value_fosforo,
        "k2o_ppm" : value_k2o_ppm,
        "textura_suelo_id" : data_textura_suelo[0].id,
        "unidad_productiva_id" : unidad_productiva_id,
        "fecha" : value_fecha
    },
    success: function(response) {
      // Manejar la respuesta exitosa
      console.log(response);
      Swal.fire({
        title: 'Cambios realizados',
        text: 'Se actualizó el estudio de suelo en la base de datos',
        icon: 'success',
        showConfirmButton: false,
        timer: 1500
      })
    },
    error: function(error) {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo actualizar el estudio de suelo en la base de datos',
        icon: 'error',
        showConfirmButton: false,
        timer: 1500
      })
    }
});

});

function listar_up_con_estudio_suelo()
{
  $.ajax({
    url: '/estudios-suelo',
    method: 'GET',
    success: function (response) {
      // Trabaja con los datos de los productores en formato JSON
      console.log(response);
      
      for (let i = 0; i < response.length; i++) {
  
        up_con_estudio_suelo_array.push(response[i].unidad_productiva_id);
      }

      console.log(up_con_estudio_suelo_array);
  
    },
    error: function (error) {
      console.error('Error al obtener los estudios de suelos:', error);
    },
  });

};

function llenar_select_nuevos_registros($data)
{
  $.ajax({
    url: '/texturas-suelo',
    method: 'GET',
    success: function (response) {

      // Depositar valores del modelo en un diccionario
      let data_options = [];
      for (let i = 0; i < response.length; i++) {

        let item = {};
        item = {
          id : response[i].id,
          text : response[i].descripcion
        }
        

        data_options.push(item);
      }

      // LLenar select con opciones
      $('#select-input-textura-suelo-actualizar-estudio-suelo').select2({
        data: data_options,
        templateResult: formatState

      });

      $('#select-input-textura-suelo-actualizar-estudio-suelo').val($data.textura_suelo_id).trigger('change');
      
    },
    error: function (error) {
      console.error('Error al obtener los caserios:', error);
    },
  });
};