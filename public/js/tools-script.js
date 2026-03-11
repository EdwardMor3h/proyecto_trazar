// ========================== Mostar / Ocultar Barra de Menu ====================

$('.a-open-menu').click(function(){
    $('.page-body-wrapper div.sidebar-wrapper').css('left','0px');
    console.log('mostrar menu');
})

$('.a-close-menu').click(function(){
    $('.page-body-wrapper div.sidebar-wrapper').css('left','-320px');
});

//Seguridad
function checkTokenValidity() {
    $.ajax({
        url: '/check_token', // Ruta en el backend para verificar el token
        method: 'GET',
        success: function(response) {
            if (response === 'invalid') {
                // Token inválido o revocado, cerrar sesión
                window.location.href = '/logout'; // Redirige a la página de cierre de sesión
            }
            else{
                console.log('activo');
            }
        },
        error: function(error) {
        console.error('Error al verificar el token:', error);
        }
    });
}

// Llama a la función cada 10 segundos
setInterval(checkTokenValidity, 10000); // 10000 milisegundos = 10 segundos

//Cambiar foto de perfil
$('.a-foto-usuario').click(function(e){
    $('.input-foto-usuario').click();
})

$('.input-foto-usuario').on('change',function(){
    // Obtener el archivo de imagen seleccionado
    let selectedImage = $('.input-foto-usuario')[0].files[0];

    // Crear un objeto FormData para enviar los datos, incluida la imagen
    let formData = new FormData();
    formData.append("id", $(this).attr('data-id'));
    formData.append("imagen", selectedImage);

    $.ajax({
        url: '/update_usuarios',
        method: 'PUT',
        //contentType: 'application/json',
        processData: false, // Evita que jQuery procese el formData automáticamente
        contentType: false, // Evita que jQuery establezca el tipo de contenido
        data: formData,
        success: function(response) {
            // Manejar la respuesta exitosa
            console.log(response);

            $('.profile-media img').attr('src', response.imagen)

            Swal.fire({
            title: 'Cambios realizados',
            text: 'Se actualizó la foto de perfil de usuario',
            icon: 'success',
            showConfirmButton: false,
            timer: 1500
            })
        },
        error: function(error) {
            Swal.fire({
            title: 'Error',
            text: 'No se pudo actualizar el usuario en la base de datos',
            icon: 'error',
            showConfirmButton: false,
            timer: 1500
            })
        }
    });

})

$('.table-tool-section').click(function(){
    //$(".row-table").slideToggle("slow");
    //$('.table-responsive').slideToggle('slow');
    $('.table-container').slideToggle('slow');
})

/*Tmp---*/



dict_usuarios = obtener_usuarios();

$.ajax({
  url: '/filtrar-codigo-venta-unico',
  method: 'GET',
  success: function (response) {
    // Trabaja con los datos de los productores en formato JSON
    // console.log(response);

    let data_filtros_codigos = [];
    
    for (let i = 0; i < response.length; i++) {

      let item = {
        id : response[i].codigo_venta,
        text : response[i].codigo_venta + ' (' + response[i].cantidad + ')'
      }

      data_filtros_codigos.push(item);
    }

    // console.log(data_filtros_codigos);

    if(data_filtros_codigos.length != 0)
      {
        // LLenar valores de filtros
        $('#select-filtro-codigo-venta-grupo').select2({
          data: data_filtros_codigos,
          placeholder: 'Seleccionar',
          templateResult: formatState
        });
      }
    else{
      $('#select-filtro-codigo-venta-grupo').select2({
        placeholder: 'No Data',
      });
    }

    
  },
  error: function (error) {
    console.error('Error al obtener las unidad_productiva_codigo_ventas:', error);
  },
});

$('.btn-generar-reporte-grupo').click(function(){
  let codigo_venta = $('#select-filtro-codigo-venta-grupo').val();
  if (codigo_venta) {
    console.log('Codigo de venta seleccionado: ' + codigo_venta);
    generar_reporte_agrupado(codigo_venta);
  }
  else{
    Swal.fire({
      icon: 'error',
      title: 'Error en la consulta',
      text: 'Debe seleccionar un código de venta',
      showConfirmButton: false,
      timer: 2000
    });
  }
});

$('.btn-consultar-coordenada').click(function(){
  let latitud = $('.input-coordenadas-latitud').val();
  let longitud = $('.input-coordenadas-longitud').val();

  if(latitud != '' && longitud != '')
  {
    ubicar_coordenada(latitud,longitud);
  }
  else
  {
    Swal.fire({
      icon: 'error',
      title: 'Error en la consulta',
      text: 'Debe proporcionar la latitud y longitud',
      showConfirmButton: false,
      timer: 2000
    });
  }

});


var data_usuarios_select = [];
//var gGeojson = null;

function obtener_usuarios(){
    return $.ajax({
        url: 'https://agroin.com.pe/get_objects?nombre_clase=AuthUser',
        method: 'GET',
        success: function (response) {
          // Trabaja con los datos de los productores en formato JSON
          dict_usuarios = response;
          // console.log(dict_usuarios);
          let usuarios_array = [];

          
    
          for (let i = 0; i < dict_usuarios.length; i++) {

            let item = {
              id : dict_usuarios[i].id,
              text : dict_usuarios[i].username
            }
            usuarios_array.push(dict_usuarios[i].username);

            if (usuarios_array.indexOf(dict_usuarios[i].username) ) {
              // si el usuario se repite, saltar
            }
            else{
              data_usuarios_select.push(item);  
            }
          }
          // console.log(data_usuarios_select);

          // LLenar valores de filtros
          // $('#select-filtro-altitud').select2({
          //   data: data_usuarios_select,
          //   placeholder: 'Todos los usuarios',
          //   templateResult: formatState
          // });

        },
        error: function (error) {
          console.error('Error al obtener los registros:', error);
        },
      });
}

/*
$.ajax({
    url: '/get-parcelas-shapefile-status',
    //url: '/get-nuevas-parcelas-shapefile',
    type: 'GET',
    dataType: 'json',
    data: {"fecha_creacion" : '2023-09-20'},
    success: function(geojson) {

      //ocultar_cargando();

      //delete geojson["bbox"];

      // Aquí puedes hacer algo con el GeoJSON devuelto
      geojson = JSON.parse(geojson);

      gGeojson = geojson;

      console.log(geojson);      

      llenarTabla(geojson);

    }
  });
*/

function llenarTabla(geojson, itemsPorPagina){

    $('#table-actualizar-datos tbody').html('');
    console.log(geojson);

    $('#pagination').html('');

    // Lógica para dividir los datos en páginas
    const paginas = Math.ceil(geojson.features.length / itemsPorPagina);

    for (let i = 0; i < paginas; i++) {
      const inicio = i * itemsPorPagina;
      const fin = (i + 1) * itemsPorPagina;
      const paginaGeojson = geojson.features.slice(inicio, fin);
  
      // Renderizar la tabla para la página actual
      
      i == 0 ? renderizarTabla(paginaGeojson) : false;
  
      // Crear elementos de paginación
      const listItem = $('<li class="page-item"><a class="page-link" href="#">' + (i + 1) + '</a></li>');
  
      // Agregar evento de clic a cada elemento de paginación
      listItem.click(() => {
        renderizarTabla(paginaGeojson);
      });
  
      $('#pagination').append(listItem);
    }   

};

function renderizarTabla(paginaGeojson){

  $('#table-actualizar-datos tbody').html('');

    // var propiedadesGeojson = paginaGeojson[i].properties;
    var propiedadesGeojson = paginaGeojson[0].properties;

    var usuario = buscar_usuario(propiedadesGeojson.auth_user_id);
    console.log(propiedadesGeojson);

    let parcela_nombre = propiedadesGeojson.nombre;
    let parcela_altitud = propiedadesGeojson.altitud;
    let parcela_codigo_venta = propiedadesGeojson.codigo_venta;
    let parcela_porcentaje_sombra = propiedadesGeojson.porcentaje_sombra;

    let productor_codigo = propiedadesGeojson.productor_codigo;
    let productor_nombre = propiedadesGeojson.productor_nombre;
    let productor_dni = propiedadesGeojson.productor_dni;
    let productor_lpa_anho = propiedadesGeojson.productor_lpa_anho;
    let productor_lpa_origen = propiedadesGeojson.productor_lpa_origen;
    let productor_lpa_tipo = propiedadesGeojson.productor_lpa_tipo;
    
    let zona = propiedadesGeojson.zona_descripcion;
    let caserio = propiedadesGeojson.caserio_descripcion;
    let comite = propiedadesGeojson.comite_descripcion;
    let variedad = propiedadesGeojson.variedad_descripcion;
    let sello = propiedadesGeojson.sello_descripcion;
    console.log(sello);

    //Fecha y Hora
    const fechaHoraString = propiedadesGeojson.fecha_creacion;
    const fechaHora = new Date(fechaHoraString);

    // Restar 5 horas
    fechaHora.setHours(fechaHora.getHours() - 10);

    // Obtener la fecha en formato YYYY-MM-DD
    const fechaFormateada = fechaHora.toISOString().split("T")[0];

    // Obtener la hora en formato HH:MM:SS
    const horaFormateada = fechaHora.toISOString().split("T")[1].substring(0, 8);

    //console.log("Fecha formateada:", fechaFormateada);
    //console.log("Hora formateada:", horaFormateada);

    //./Fecha y Hora

    var username = '';
    var firstName = '';

    //console.log(usuario);

    usuario ? username = usuario.username : false;
    usuario ? firstName = usuario.first_name : false;
    // console.log(usuario);

    var ocultarAprobar = '';
    var ocultarAnular = '';

    if(propiedadesGeojson.activa == '1'){
      ocultarAprobar = 'd-none';
    }
    else{
      ocultarAnular = 'd-none';
    }

    var estadoFormateado = '';

    if(propiedadesGeojson.activa == '1'){
      estadoFormateado = 'Sí';
    }
    else{
      estadoFormateado = 'No';
    }

    // Comprobar Valores - Parcela - Nombre
    parcela_nombre != null ? parcela_nombre = parcela_nombre : parcela_nombre = '-';
    // console.log(parcela_nombre);

    // Comprobar Valores - Parcela - Altitud
    parcela_altitud != null ? parcela_altitud = parcela_altitud  : parcela_altitud = '-';
    // console.log(parcela_altitud);

    // Comprobar Valores - Parcela - Codigo Venta
    parcela_codigo_venta != null ? parcela_codigo_venta = parcela_codigo_venta  : parcela_codigo_venta = '-';
    // console.log(parcela_codigo_venta);

    // Comprobar Valores - Parcela - Sombra
    parcela_porcentaje_sombra != null ? parcela_porcentaje_somfbra = parcela_porcentaje_sombra  : parcela_porcentaje_sombra = '-';
    // console.log(parcela_porcentaje_sombra);

    // Comprobar Valores - Productor - Codigo
    productor_codigo != null ? productor_codigo = productor_codigo : productor_codigo = '-';
    // console.log(productor_codigo);

    // Comprobar Valores - Productor - Nombre
    productor_nombre != null ? productor_nombre != "" ? productor_nombre = productor_nombre : productor_nombre = '-' : productor_nombre = '-';
    // console.log(productor_nombre);

    // Comprobar Valores - Productor - DNI
    productor_dni != null ? productor_dni != "" ? productor_dni = productor_dni : productor_dni = '-' : productor_dni = '-';
    // console.log(productor_dni);

    // Comprobar Valores - Productor - LPA AÑO
    productor_lpa_anho != null ? productor_lpa_anho != "" ? productor_lpa_anho = productor_lpa_anho : productor_lpa_anho = '-' : productor_lpa_anho = '-';
    

    // Comprobar Valores - Productor - LPA ORIGEN
    productor_lpa_origen != null ? productor_lpa_origen != "" ? productor_lpa_origen = productor_lpa_origen : productor_lpa_origen = '-' : productor_lpa_origen = '-';

    // Comprobar Valores - Productor - LPA TIPO
    productor_lpa_tipo != null ? productor_lpa_tipo != "" ? productor_lpa_tipo = productor_lpa_tipo : productor_lpa_tipo = '-' : productor_lpa_tipo = '-';

     // Comprobar Valores - Zona
     zona != null ? zona = zona : zona = '-';
     // console.log(zona);

     // Comprobar Valores - Caserio
     caserio != null ? caserio = caserio : caserio = '-';
     // console.log(caserio);

     // Comprobar Valores - Comite
     comite != null ? comite = comite : comite = '-';
     // console.log(comite);

     // Comprobar Valores - Variedad
    variedad != null ? variedad = variedad : variedad = '-';
    // console.log(caserio);

    // Comprobar Valores - Sello
    sello != null ? sello = sello : sello = '-';
    // console.log(caserio);

    let conflicto_sostenibilidad_m2 = (propiedadesGeojson.area_ints_anp_m2/10000 + propiedadesGeojson.area_ints_za_m2/10000 + propiedadesGeojson.area_ints_deforestacion_2014_m2/10000 + propiedadesGeojson.area_ints_deforestacion_2020_m2/10000).toFixed(3);

    let bool_ints_anp;
    let area_ints_anp_m2 = propiedadesGeojson.area_ints_anp_m2;
    if(propiedadesGeojson.ints_anp != null){
      propiedadesGeojson.ints_anp == '1' ? bool_ints_anp = '<span class="badge badge-light-danger">Sí</span>' : bool_ints_anp = '<span class="badge badge-light-success">No</span>';

      if (propiedadesGeojson.ints_anp == '1') 
      {
        area_ints_anp_m2 = parseFloat(area_ints_anp_m2).toFixed(2);
        area_ints_anp_m2 = numberWithCommas(area_ints_anp_m2);
      }
      else
      {
        area_ints_anp_m2 = '-';
      }
    }
    else{
      bool_ints_anp = 'ND'
    }

    let bool_ints_za;
    let area_ints_za_m2 = propiedadesGeojson.area_ints_za_m2;
    if(propiedadesGeojson.ints_za != null){
      propiedadesGeojson.ints_za == '1' ? bool_ints_za = '<span class="badge badge-light-danger">Sí</span>' : bool_ints_za = '<span class="badge badge-light-success">No</span>';

      if (propiedadesGeojson.ints_za == '1') 
      {
        area_ints_za_m2 = parseFloat(area_ints_za_m2).toFixed(2);
        area_ints_za_m2 = numberWithCommas(area_ints_za_m2);
      }
      else
      {
        area_ints_za_m2 = '-';
      }
    }
    else{
      bool_ints_za = 'ND'
    }

    let bool_ints_deforestacion_2014;
    let area_ints_deforestacion_2014_m2 = propiedadesGeojson.area_ints_deforestacion_2014_m2;
    if(propiedadesGeojson.ints_deforestacion_2014 != null){
      propiedadesGeojson.ints_deforestacion_2014 == '1' ? bool_ints_deforestacion_2014 = '<span class="badge badge-light-danger">Sí</span>' : bool_ints_deforestacion_2014 = '<span class="badge badge-light-success">No</span>';

      if (propiedadesGeojson.ints_deforestacion_2014 == '1') 
      {
        area_ints_deforestacion_2014_m2 = parseFloat(area_ints_deforestacion_2014_m2).toFixed(2);
        area_ints_deforestacion_2014_m2 = numberWithCommas(area_ints_deforestacion_2014_m2);
      }
      else
      {
        area_ints_deforestacion_2014_m2 = '-';
      }
    }
    else{
      bool_ints_deforestacion_2014 = 'ND'
    }

    let bool_ints_deforestacion_2020;
    let area_ints_deforestacion_2020_m2 = propiedadesGeojson.area_ints_deforestacion_2020_m2;
    if(propiedadesGeojson.ints_deforestacion_2020 != null){
      propiedadesGeojson.ints_deforestacion_2020 == '1' ? bool_ints_deforestacion_2020 = '<span class="badge badge-light-danger">Sí</span>' : bool_ints_deforestacion_2020 = '<span class="badge badge-light-success">No</span>';

      if (propiedadesGeojson.ints_deforestacion_2020 == '1') 
      {
        area_ints_deforestacion_2020_m2 = parseFloat(area_ints_deforestacion_2020_m2).toFixed(2);
        area_ints_deforestacion_2020_m2 = numberWithCommas(area_ints_deforestacion_2020_m2);
      }
      else
      {
        area_ints_deforestacion_2020_m2 = '-';
      }
    }
    else{
      bool_ints_deforestacion_2020 = 'ND'
    }

    let bool_ints_parcelas_perhusa;
    let area_ints_parcelas_perhusa_m2 = propiedadesGeojson.area_ints_parcelas_perhusa_m2;
    if(propiedadesGeojson.ints_parcelas_perhusa != null){
      propiedadesGeojson.ints_parcelas_perhusa == '1' ? bool_ints_parcelas_perhusa = '<span class="badge badge-light-danger">Sí</span>' : bool_ints_parcelas_perhusa = '<span class="badge badge-light-success">No</span>';

      if (propiedadesGeojson.ints_parcelas_perhusa == '1') 
      {
        area_ints_parcelas_perhusa_m2 = parseFloat(area_ints_parcelas_perhusa_m2).toFixed(2);
        area_ints_parcelas_perhusa_m2 = numberWithCommas(area_ints_parcelas_perhusa_m2);
      }
      else
      {
        area_ints_parcelas_perhusa_m2 = '-';
      }

      
    }
    else{
      bool_ints_parcelas_perhusa = 'Null'
    }


    var tr = '<tr class="' + propiedadesGeojson.id +'">\
                <td>'
                    + propiedadesGeojson.id + 
                '</td>\
                <td>\
                    ' + parcela_nombre + '\
                </td>\
                <td>\
                    ' + variedad + '\
                </td>\
                <td>\
                    ' + parcela_altitud + '\
                </td>\
                <td>\
                    ' + parcela_porcentaje_sombra + '\
                </td>\
                <td>\
                    ' + parcela_codigo_venta + '\
                </td>\
                <td>\
                    ' + sello + '\
                </td>\
                <td>\
                    ' + productor_codigo + '\
                </td>\
                <td>\
                    ' + productor_nombre + '\
                </td>\
                <td>\
                    ' + productor_dni + '\
                </td>\
                <td>\
                    ' + zona + '\
                </td>\
                <td>\
                    ' + caserio + '\
                </td>\
                <td>\
                    ' + comite + '\
                </td>\
                <td>\
                    ' + username + '\
                </td>\
                <td>\
                    ' + propiedadesGeojson.area_ha + '\
                </td>\
                <td>\
                    ' + propiedadesGeojson.area_poly_ha + '\
                </td>\
                <td>\
                    ' + conflicto_sostenibilidad_m2 + '\
                </td>\
                <td>\
                    ' + bool_ints_anp + '\
                </td>\
                <td>\
                    ' + area_ints_anp_m2 + '\
                </td>\
                <td>\
                    ' + bool_ints_za + '\
                </td>\
                <td>\
                    ' + area_ints_za_m2 + '\
                </td>\
                <td>\
                    ' + bool_ints_deforestacion_2014 + '\
                </td>\
                <td>\
                    ' + area_ints_deforestacion_2014_m2 + '\
                </td>\
                <td>\
                    ' + bool_ints_deforestacion_2020 + '\
                </td>\
                <td>\
                    ' + area_ints_deforestacion_2020_m2 + '\
                </td>\
                <td>\
                    ' + bool_ints_parcelas_perhusa + '\
                </td>\
                <td>\
                    ' + area_ints_parcelas_perhusa_m2 + '\
                </td>\
                <td>\
                    ' + productor_lpa_origen + '\
                </td>\
                <td>\
                    ' + productor_lpa_anho + '\
                </td>\
                <td>\
                    ' + productor_lpa_tipo + '\
                </td>\
                <td class="options">\
                    <a class="btn btn-complementary btn-ver-parcela" data-id="'+ propiedadesGeojson.id +'">\
                    <i class="fa fa-map me-2"></i>\
                    Mapa\
                    </a>\
                </td>\
                <td class="options">\
                    <a class="btn btn-complementary btn-generar-reporte" data-id="'+ propiedadesGeojson.id +'" data-idg="'+ propiedadesGeojson.parcela_gid +'" data-lpa-tipo="'+ productor_lpa_tipo + '">\
                    <i class="fa fa-file me-2"></i>\
                    Reporte\
                    </a>\
                </td>\
            </tr>'

    $('#table-actualizar-datos tbody').append(tr);

  

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

    if (typeof gGlobal == 'undefined') {
      gGlobal = gGeojson;
    }

    for(var i=0; i < gGlobal.features.length; i++){
        if(id == gGlobal.features[i].properties.id){
            var turfMultiPolygon = turf.multiPolygon(gGlobal.features[i].geometry.coordinates);
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

$('.table-responsive.table-actualizar-datos').on('click', '.btn-generar-reporte', function(){
  console.log(1);

  var dataId = $(this).attr('data-id');
  var dataIdg = $(this).attr('data-idg');
  var dataLpaTipo = $(this).attr('data-lpa-tipo');

  // Construir la URL con parámetros
  const url = `reporte_generado?dataId=${dataId}&dataIdg=${dataIdg}&dataLpaTipo=${dataLpaTipo}`;//&parametro2=${parametro2}`;


  // Abrir una nueva ventana
  const newWindow = window.open(url, '_blank', 'width=1240,height=1754');


});

$('.reporte-grupo-tool-section').click(function(){
  $('.reporte-grupo-section').toggle();
;})

$('.coordenadas-tool-section').click(function(){
  $('.coordenadas-section').toggle();
;})
// Multi Select Corredor
// $(".js-codigo-venta").select2({
//   placeholder: "Seleccionar"
// });



function generar_reporte_agrupado($codigo_venta)
{
  $('.reporte-grupo-section').toggle();
  console.log(1);

  // Construir la URL con parámetros
  const url = `reporte_grupo_generado?dataCodigoVenta=${$codigo_venta}`;//&parametro2=${parametro2}`;


  // Abrir una nueva ventana
  const newWindow = window.open(url, '_blank', 'width=1240,height=1754');

}

function ubicar_coordenada($latitud, $longitud)
{
  map.flyTo({
    center: [$longitud, $latitud],
    zoom: 17,
    essential: true  // asegura que este sea un movimiento suave
  });

  //-6.782791562572941
  //-78.16139475066709

  // Crear un marcador en las coordenadas especificadas
    var marker = new maplibregl.Marker()
        .setLngLat([$longitud, $latitud])
        .addTo(map);

    // Crear un popup asociado al marcador
    // var popup = new maplibregl.Popup()
    //     .setLngLat([$longitud, $latitud])
    //     .setHTML(`<p>Latitud: ` + parseFloat($latitud).toFixed(4) + `</p><p>Longitud:` + parseFloat($longitud).toFixed(4) + `</p>`)
    //     .addTo(map);

    // // Abrir el popup automáticamente al cargar la página
    // popup.addTo(map);

    // Crear un popup asociado al marcador
    var popup = new maplibregl.Popup({
        offset: 25,  // desplazamiento del popup con respecto al marcador
        className: 'coordenadas-popup'
    })
      .setHTML(`<p>Latitud: ` + parseFloat($latitud).toFixed(4) + `</p><p>Longitud:` + parseFloat($longitud).toFixed(4) + `</p>`);

    // Asociar el popup al marcador
    marker.setPopup(popup);

    // Abrir el popup automáticamente al cargar la página
    popup.addTo(map);
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


function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
