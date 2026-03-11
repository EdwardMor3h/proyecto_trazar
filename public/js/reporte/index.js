mostrar_cargando(3000);
setTimeout(function() {
  $('.loader-indices').css("display","none");
  $('#loader').html("");
}, 3000);

//Variables filtros array
var filtros_altitud_array = [];
var filtros_zona_array = [];
var filtros_corredor_array = [];
var filtros_comite_array = [];
var filtros_cuenca_hidrografica_array = [];
var filtros_variedad_array = [];
var filtros_codigo_venta_array = [];

let valores_altitud_string = '';
let valores_zona_string = '';
let valores_corredor_string = '';
let valores_comite_string = '';
let valores_cuenca_hidrografica_string = '';

var query_filtros_dict = {};
var gQueryFiltrosDict = null;

// query_filtros_dict["where"] = {"corredor_id" : "1,2,3"};
// query_filtros_dict["where"]["zona_id"] = "1,2,3";
// query_filtros_dict["where"]["altura_id"] = "1,2,3";

console.log(query_filtros_dict);



//LLenar categorías disponibles por filtro
// $('#select-filtro-altitud')

//LLenar valores de filtros
// $$('#select-filtro-altitud').select2({
//   data: data;
// });

$.ajax({
  url: '/altitud-cat',
  method: 'GET',
  success: function (response) {
    // Trabaja con los datos de los productores en formato JSON
    console.log(response);

    let data_filtros_alt = [];
    
    for (let i = 0; i < response.length; i++) {

      let item = {
        id : response[i].id,
        text : response[i].rango
      }

      data_filtros_alt.push(item);
      
      
      // if (i = 0) {
      //   data_filtros_alt = {"text" : response[0].rango};
      // }
      // else{
      //   data_filtros_alt
      // }
      
    }
    //data_filtros_alt = JSON.stringify(data_filtros_alt)
    console.log(data_filtros_alt);

    // LLenar valores de filtros
    $('#select-filtro-altitud').select2({
      data: data_filtros_alt,
      placeholder: 'Todos los rangos',
      templateResult: formatState
    });

  },
  error: function (error) {
    console.error('Error al obtener los rangos de altitud:', error);
  },
});

$.ajax({
  url: '/zonas',
  method: 'GET',
  success: function (response) {
    // Trabaja con los datos de los productores en formato JSON
    console.log(response);

    let data_filtros_zonas = [];
    
    for (let i = 0; i < response.length; i++) {

      let item = {
        id : response[i].id,
        text : response[i].descripcion
      }

      data_filtros_zonas.push(item);
      
      
      // if (i = 0) {
      //   data_filtros_zonas = {"text" : response[0].rango};
      // }
      // else{
      //   data_filtros_zonas
      // }
      
    }
    //data_filtros_zonas = JSON.stringify(data_filtros_zonas)
    console.log(data_filtros_zonas);

    // LLenar valores de filtros
    $('#select-filtro-zona').select2({
      data: data_filtros_zonas,
      placeholder: 'Todas las zonas',
      templateResult: formatState
    });

  },
  error: function (error) {
    console.error('Error al obtener las zonas:', error);
  },
});

$.ajax({
  url: '/corredores',
  method: 'GET',
  success: function (response) {
    // Trabaja con los datos de los productores en formato JSON
    console.log(response);

    let data_filtros_corredor = [];
    
    for (let i = 0; i < response.length; i++) {

      let item = {
        id : response[i].id,
        text : response[i].descripcion
      }

      data_filtros_corredor.push(item);
      
      
      // if (i = 0) {
      //   data_filtros_corredor = {"text" : response[0].rango};
      // }
      // else{
      //   data_filtros_corredor
      // }
      
    }
    //data_filtros_corredor = JSON.stringify(data_filtros_corredor)
    console.log(data_filtros_corredor);

    // LLenar valores de filtros
    $('#select-filtro-corredor').select2({
      data: data_filtros_corredor,
      placeholder: 'Todos los corredores',
      templateResult: formatState
    });

  },
  error: function (error) {
    console.error('Error al obtener los corredores:', error);
  },
});

$.ajax({
  url: '/variedades',
  method: 'GET',
  success: function (response) {
    // Trabaja con los datos de los productores en formato JSON
    console.log(response);

    let data_filtros_variedad = [];
    
    for (let i = 0; i < response.length; i++) {

      let item = {
        id : response[i].id,
        text : response[i].descripcion
      }

      data_filtros_variedad.push(item);
      
      
      // if (i = 0) {
      //   data_filtros_variedad = {"text" : response[0].rango};
      // }
      // else{
      //   data_filtros_variedad
      // }
      
    }
    //data_filtros_variedad = JSON.stringify(data_filtros_variedad)
    console.log(data_filtros_variedad);

    // LLenar valores de filtros
    $('#select-filtro-variedad').select2({
      data: data_filtros_variedad,
      placeholder: 'Todas las variedades',
      templateResult: formatState
    });

  },
  error: function (error) {
    console.error('Error al obtener las variedades:', error);
  },
});

$.ajax({
  url: '/comites',
  method: 'GET',
  success: function (response) {
    // Trabaja con los datos de los productores en formato JSON
    console.log(response);

    let data_filtros_alt = [];
    
    for (let i = 0; i < response.length; i++) {

      let item = {
        id : response[i].id,
        text : response[i].descripcion
      }

      data_filtros_alt.push(item);
      
      
      // if (i = 0) {
      //   data_filtros_alt = {"text" : response[0].descripcion};
      // }
      // else{
      //   data_filtros_alt
      // }
      
    }
    //data_filtros_alt = JSON.stringify(data_filtros_alt)
    console.log(data_filtros_alt);

    // LLenar valores de filtros
    $('#select-filtro-comite').select2({
      data: data_filtros_alt,
      placeholder: 'Todos los comités',
      templateResult: formatState
    });

  },
  error: function (error) {
    console.error('Error al obtener los comites:', error);
  },
});$

$.ajax({
  url: '/cuencas_hidrograficas',
  method: 'GET',
  success: function (response) {
    // Trabaja con los datos de los productores en formato JSON
    console.log(response);

    let data_filtros_alt = [];
    
    for (let i = 0; i < response.length; i++) {

      let item = {
        id : response[i].id,
        text : response[i].descripcion
      }

      data_filtros_alt.push(item);
      
      
      // if (i = 0) {
      //   data_filtros_alt = {"text" : response[0].descripcion};
      // }
      // else{
      //   data_filtros_alt
      // }
      
    }
    //data_filtros_alt = JSON.stringify(data_filtros_alt)
    console.log(data_filtros_alt);

    // LLenar valores de filtros
    $('#select-filtro-cuenca-hidrografica').select2({
      data: data_filtros_alt,
      placeholder: 'Todas las cuencas',
      templateResult: formatState
    });

  },
  error: function (error) {
    console.error('Error al obtener las cuencas hidrograficas:', error);
  },
});$

// $.ajax({
//   url: '/codigos_venta',
//   method: 'GET',
//   success: function (response) {
//     // Trabaja con los datos de los productores en formato JSON
//     console.log(response);

//     let data_filtros_codigos = [];
    
//     for (let i = 0; i < response.length; i++) {

//       let item = {
//         id : response[i],
//         text : response[i]
//       }

//       data_filtros_codigos.push(item);
//     }

//     console.log(data_filtros_codigos);

//     // LLenar valores de filtros
//     $('#select-filtro-codigo-venta').select2({
//       data: data_filtros_codigos,
//       placeholder: 'Todos los códigos de venta',
//       templateResult: formatState
//     });

//   },
//   error: function (error) {
//     console.error('Error al obtener los códigos de venta:', error);
//   },
// });

$.ajax({
  url: '/filtrar-codigo-venta-unico',
  method: 'GET',
  success: function (response) {
    // Trabaja con los datos de los productores en formato JSON
    // console.log(response);

    let data_filtros_codigos = [
      {
        id : 'Todos',
        text : 'Todos'
      }
    ];
    
    for (let i = 0; i < response.length; i++) {

      let item = {
        id : response[i].codigo_venta,
        text : response[i].codigo_venta + ' (' + response[i].cantidad + ')'
      }

      data_filtros_codigos.push(item);
    }

    if(data_filtros_codigos.length != 0)
      {
        // LLenar valores de filtros
        $('#select-filtro-codigo-venta').select2({
          data: data_filtros_codigos,
          placeholder: 'Todos'
        });
      }
    else{
      $('#select-filtro-codigo-venta').select2({
        placeholder: 'No Data',
      });
    }

    
  },
  error: function (error) {
    console.error('Error al obtener las unidad_productiva_codigo_ventas:', error);
  },
});

//Obtener unidades productivas filtradas por uno o más campos
$('.btn-previsualizar-reporte').click(function(){

  //mostrar_cargando(5000);
  mostrar_cargando_no_porcentaje();

  filtros_altitud_array = $('#select-filtro-altitud').select2('data');
  filtros_zona_array = $('#select-filtro-zona').select2('data');
  filtros_corredor_array = $('#select-filtro-corredor').select2('data');
  filtros_comite_array = $('#select-filtro-comite').select2('data');
  filtros_cuenca_hidrografica_array = $('#select-filtro-cuenca-hidrografica').select2('data');

  filtros_variedad_array = $('#select-filtro-variedad').select2('data');

  filtros_codigo_venta_array = $('#select-filtro-codigo-venta').select2('data');
  
  // Reiniciar filtros
  query_filtros_dict = [];

  // Manejando filtro - Altitud
    if (filtros_altitud_array.length > 0) 
    {
      // Reiniciar valores de filtro - Altitud
      valores_altitud_string = '';
      for (let i = 0; i < filtros_altitud_array.length; i++)
      {
        valores_altitud_string += filtros_altitud_array[i].id.toString();
        i < (filtros_altitud_array.length - 1) ? valores_altitud_string += ',' : null; 
      }

      //Añadir corchetes al inicio y fin de la cadena
      valores_altitud_string = '[' + valores_altitud_string + ']';

      // Agregar campo y valor al dict filtros - Altitud

      query_filtros_dict["where"] != null ? query_filtros_dict["where"]["altitud_cat_id"] = valores_altitud_string : query_filtros_dict["where"] = {"altitud_cat_id" : valores_altitud_string};


      console.log(valores_altitud_string);
      console.log(query_filtros_dict);
    }
    else
    {
      console.log("no filtrar por altitud");
    }

  // Manejando filtro - Zona
    if (filtros_zona_array && filtros_zona_array.length > 0) 
    {
      // Reiniciar valores de filtro - Zona
      valores_zona_string = '';
      for (let i = 0; i < filtros_zona_array.length; i++)
      {
        valores_zona_string += filtros_zona_array[i].id.toString();
        i < (filtros_zona_array.length - 1) ? valores_zona_string += ',' : null; 
      }
      //Añadir corchetes al inicio y fin de la cadena
      valores_zona_string = '[' + valores_zona_string + ']';

      // Agregar campo y valor al dict filtros - Zona
      query_filtros_dict["where"] != null ? query_filtros_dict["where"]["zona_id"] = valores_zona_string : query_filtros_dict["where"] = {"zona_id" : valores_zona_string};
      console.log(query_filtros_dict);
    }
    else
    {
      console.log("no filtrar por zona");
    }
    
  // Manejando filtro - Variedad
    if (filtros_variedad_array.length > 0) 
    {
      // Reiniciar valores de filtro - Variedad
      valores_variedad_string = '';
      for (let i = 0; i < filtros_variedad_array.length; i++)
      {
        valores_variedad_string += filtros_variedad_array[i].id.toString();
        i < (filtros_variedad_array.length - 1) ? valores_variedad_string += ',' : null; 
      }

      //Añadir corchetes al inicio y fin de la cadena
      valores_variedad_string = '[' + valores_variedad_string + ']';

      // Agregar campo y valor al dict filtros - Variedad

      query_filtros_dict["where"] != null ? query_filtros_dict["where"]["variedad_id"] = valores_variedad_string : query_filtros_dict["where"] = {"variedad_id" : valores_variedad_string};


      console.log(valores_variedad_string);
      console.log(query_filtros_dict);
    }
    // Manejando filtro - Codigo Venta
    if (filtros_codigo_venta_array.length > 0) 
    {
      // Reiniciar valores de filtro - Variedad
      valores_codigo_venta_string = '';
      for (let i = 0; i < filtros_codigo_venta_array.length; i++)
      {
        valores_codigo_venta_string += filtros_codigo_venta_array[i].id.toString();
        i < (filtros_codigo_venta_array.length - 1) ? valores_codigo_venta_string += '\',\'' : null; 
      }

      //Añadir corchetes al inicio y fin de la cadena
      valores_codigo_venta_string = '[\'' + valores_codigo_venta_string + '\']';

      // Agregar campo y valor al dict filtros - Codigo Venta

      query_filtros_dict["where"] != null ? query_filtros_dict["where"]["codigo_venta"] = valores_codigo_venta_string : query_filtros_dict["where"] = {"codigo_venta" : valores_codigo_venta_string};


      console.log(valores_codigo_venta_string);
      console.log(query_filtros_dict);
    }
    else
    {
      console.log("no filtrar por codigo_venta");
    }

  // Manejando filtro - Corredor
    if (filtros_corredor_array.length > 0) 
    {
      // Reiniciar valores de filtro - Corredor
      valores_corredor_string = '';
      for (let i = 0; i < filtros_corredor_array.length; i++)
      {
        valores_corredor_string += filtros_corredor_array[i].id.toString();
        i < (filtros_corredor_array.length - 1) ? valores_corredor_string += ',' : null; 
      }
      //Añadir corchetes al inicio y fin de la cadena
      valores_corredor_string = '[' + valores_corredor_string + ']';

      // Agregar campo y valor al dict filtros - Corredor
      query_filtros_dict["where"] != null ? query_filtros_dict["where"]["corredor_id"] = valores_corredor_string : query_filtros_dict["where"] = {"corredor_id" : valores_corredor_string};
      console.log(query_filtros_dict);
    }
    else
    {
      console.log("no filtrar por corredor");
    }
  
  // Manejando filtro - Comite
  if (filtros_comite_array.length > 0) 
  {
    // Reiniciar valores de filtro - Comite
    valores_comite_string = '';
    for (let i = 0; i < filtros_comite_array.length; i++)
    {
      valores_comite_string += filtros_comite_array[i].id.toString();
      i < (filtros_comite_array.length - 1) ? valores_comite_string += ',' : null; 
    }
    //Añadir corchetes al inicio y fin de la cadena
    valores_comite_string = '[' + valores_comite_string + ']';

    // Agregar campo y valor al dict filtros - Comite
    query_filtros_dict["where"] != null ? query_filtros_dict["where"]["comite_id"] = valores_comite_string : query_filtros_dict["where"] = {"comite_id" : valores_comite_string};
    console.log(query_filtros_dict);
  }
  else
  {
    console.log("no filtrar por comite");
  }

  // Manejando filtro - Cuenca Hidrografica
  if (filtros_cuenca_hidrografica_array.length > 0) 
  {
    // Reiniciar valores de filtro - Cuenca Hidrografica
    valores_cuenca_hidrografica_string = '';
    for (let i = 0; i < filtros_cuenca_hidrografica_array.length; i++)
    {
      valores_cuenca_hidrografica_string += filtros_cuenca_hidrografica_array[i].id.toString();
      i < (filtros_cuenca_hidrografica_array.length - 1) ? valores_cuenca_hidrografica_string += ',' : null; 
    }
    //Añadir corchetes al inicio y fin de la cadena
    valores_cuenca_hidrografica_string = '[' + valores_cuenca_hidrografica_string + ']';

    // Agregar campo y valor al dict filtros - Cuenca Hidrografica
    query_filtros_dict["where"] != null ? query_filtros_dict["where"]["cuenca_hidrografica_id"] = valores_cuenca_hidrografica_string : query_filtros_dict["where"] = {"cuenca_hidrografica_id" : valores_cuenca_hidrografica_string};
    console.log(query_filtros_dict);
  }
  else
  {
    console.log("no filtrar por cuenca hidrografica");
  }

   
  // Convertir diccionario en cadena de texto
    query_filtros_dict = JSON.stringify(query_filtros_dict["where"]);
    console.log(query_filtros_dict);
    if (query_filtros_dict != null) {

      //filtrar_unidades_productivas(query_filtros_dict);
      gQueryFiltrosDict = query_filtros_dict;
      cargar_data_parcelas(query_filtros_dict);
    }
    else{
      //consultar_unidades_productivas();

      //filtrar_unidades_productivas({});
      cargar_data_parcelas("{}");
    }

});



// Consultar y Cargar las unidades productivas según filtros
function filtrar_unidades_productivas($dict_filtros)
{

  $.ajax({
    url: '/filtrar-unidades-productivas',
    data: {
      field: 'cuenca_hidrografica_id',
      value: [1],
      where_filtros: $dict_filtros,
      //Modificación paginación
      page: 1, // Página actual
      pageSize: 10 // Número de registros por página
    },
    method: 'GET',
    success: function (response) {
      // Trabaja con los datos de los productores en formato JSON
      console.log(response);
      previsualizar_tabla(response);
    },
    error: function (error) {
      console.error('Error al obtener las unidades productivas:', error);
    },
  });

}

// Consultar y Cargar todas las unidades productivas al iniciar el módulo
function consultar_unidades_productivas()
{
  $.ajax({
    url: '/unidades-productivas',
    data: {
      "activa" : "1",
      "eliminada" : "0"
    },
    method: 'GET',
    success: function (response) {
      // Trabaja con los datos de los productores en formato JSON
      console.log(response);
      previsualizar_tabla(response);
    },
    error: function (error) {
      console.error('Error al obtener las unidades productivas:', error);
    },
  });
}


function previsualizar_tabla($unidades_productivas)
{

  //Esta modificacion es por el cambio de paginacion, no entrega directamente un array sino un diccionario que incluye las llaves currentPage y totalPages
  $unidades_productivas = $unidades_productivas.unidadesProductivas;

  console.log($unidades_productivas);

  if ($unidades_productivas.length > 0) {

    //$('#table-previsualizacion').DataTable().clear().draw();

    // Eliminar contenido actual de la tabla
    
    if(tableParcelas){
      $('#table-previsualizacion tbody').empty();
      tableParcelas.destroy();
    }

    $('#table-previsualizacion tbody').html(' ');

  let array_tr = [];

  // LLenar tabla de previsualizacion de reporte
  for(var j=0; j < $unidades_productivas.length; j++)
  {
    // Asignando atributos en variables
    let parcela_nombre = $unidades_productivas[j].nombre;
    let parcela_altitud = $unidades_productivas[j].altitud;
    let parcela_codigo_venta = $unidades_productivas[j].codigo_venta;

    let productor_codigo;
    let productor_nombre;
    let productor_f_nacimiento;
    let extensionista;
    let promotor;
    
    if($unidades_productivas[j].Productor != null)
    {
      productor_codigo = $unidades_productivas[j].Productor.codigo;
      productor_nombre = $unidades_productivas[j].Productor.nombre;
      productor_f_nacimiento = $unidades_productivas[j].Productor.f_nacimiento;
      extensionista = $unidades_productivas[j].Productor.Extensionista;
      promotor = $unidades_productivas[j].Productor.Promotor;
    }
    
    let sello = $unidades_productivas[j].Sello;
    let corredor = $unidades_productivas[j].Corredor;
    let comite = $unidades_productivas[j].Comite;
    let zona = $unidades_productivas[j].Zona;
    let cuenca = $unidades_productivas[j].CuencaHidrografica;
    let caserio = $unidades_productivas[j].Caserio;
    let variedad = $unidades_productivas[j].Variedad;

    //let parcela_area = $unidades_productivas[j].area_ha;
    let parcela_area = $unidades_productivas[j].area_poly_ha;

    let parcela_area_m2;

    let ints_anp = $unidades_productivas[j].ints_anp;
    let ints_za = $unidades_productivas[j].ints_za;
    let ints_deforestacion_2014 = $unidades_productivas[j].ints_deforestacion_2014;
    let ints_deforestacion_2020 = $unidades_productivas[j].ints_deforestacion_2020;
    
    let area_ints_anp_m2 = $unidades_productivas[j].area_ints_anp_m2;
    let area_ints_anp_percent;
    let html_measure_inst_anp;
    let area_ints_za_m2 = $unidades_productivas[j].area_ints_za_m2;
    let area_ints_za_percent;
    let html_measure_inst_za;
    let area_ints_deforestacion_2014_m2 = $unidades_productivas[j].area_ints_deforestacion_2014_m2;
    let area_ints_deforestacion_2014_percent;
    let html_measure_inst_deforestacion_2014;
    let area_ints_deforestacion_2020_m2 = $unidades_productivas[j].area_ints_deforestacion_2020_m2;
    let area_ints_deforestacion_2020_percent;
    let html_measure_inst_deforestacion_2020;

    // Comprobar Valores - Parcela - Nombre
    parcela_nombre != null ? parcela_nombre = parcela_nombre : parcela_nombre = 'No Data';
    // console.log(parcela_nombre);

    // Comprobar Valores - Parcela - Altitud
    parcela_altitud != null ? parcela_altitud = parcela_altitud  : parcela_altitud = 'No Data';
    // console.log(parcela_altitud);

    // Comprobar Valores - Parcela - Codigo Venta
    parcela_codigo_venta != null ? parcela_codigo_venta = parcela_codigo_venta  : parcela_codigo_venta = 'No Data';
    // console.log(parcela_codigo_venta);

    // Comprobar Valores - Productor - Codigo
    productor_codigo != null ? productor_codigo = productor_codigo : productor_codigo = 'No Data';
    // console.log(productor_codigo);

    // Comprobar Valores - Productor - Nombre
    productor_nombre != null ? productor_nombre != "" ? productor_nombre = productor_nombre : productor_nombre = "No Data" : productor_nombre = 'No Data';
    // console.log(productor_nombre);

    // Comprobar Valores - Productor - Fecha de Nacimiento
    productor_f_nacimiento != null ? productor_f_nacimiento : 'No Data';
    // console.log(productor_f_nacimiento);

    // Comprobar Valores - Sello
    sello != null ? sello = sello.descripcion : sello = 'No Data';
    // console.log(sello);

    // Comprobar Valores - Extensionista
    extensionista != null ? extensionista = extensionista.descripcion : extensionista = 'No Data';
    // console.log(extensionista);

    // Comprobar Valores - Promotor
    promotor != null ? promotor = promotor.descripcion : promotor = 'No Data';
    // console.log(promotor);

    // Comprobar Valores - Corredor
    corredor != null ? corredor = corredor.descripcion : corredor = 'No Data';
    // console.log(corredor);

    // Comprobar Valores - Comite
    comite != null ? comite = comite.descripcion : comite = 'No Data';
    // console.log(comite);

    // Comprobar Valores - Zona
    zona != null ? zona = zona.descripcion : zona = 'No Data';
    // console.log(zona);

    // Comprobar Valores - Cuenca Hidrografica
    cuenca != null ? cuenca = cuenca.descripcion : cuenca = 'No Data';
    // console.log(cuenca);

    // Comprobar Valores - Caserio
    caserio != null ? caserio = caserio.descripcion : caserio = 'No Data';
    // console.log(caserio);

    // Comprobar Valores - Variedad
    variedad != null ? variedad = variedad.descripcion : variedad = 'No Data';
    // console.log(caserio);

    // Comprobar Valores - Area
    if (parcela_area != null) 
    {
      
      //parcela_area = parcela_area * 10000;
      parcela_area = parseFloat(parcela_area).toFixed(2);
      parcela_area_m2 = parcela_area*10000;
      parcela_area = numberWithCommas(parcela_area);
    }
    else
    {
      parcela_area = 'No Data'
    }
    // console.log(parcela_area);

    // Comprobar Valores - Intersección ANP
    if (ints_anp == '1') 
    {
      ints_anp = '<span class="badge badge-light-danger">Sí</span>'
      area_ints_anp_m2 = parseFloat(area_ints_anp_m2).toFixed(2);
      area_ints_anp_percent = area_ints_anp_m2 / parcela_area_m2 * 100;
      area_ints_anp_percent = area_ints_anp_percent.toFixed(0);
      area_ints_anp_m2 = numberWithCommas(area_ints_anp_m2);

      html_measure_inst_anp = area_ints_anp_m2 + '<br> ' + area_ints_anp_percent + ' %';
      
    }
    else
    {
      ints_anp = '<span class="badge badge-light-success">No</span>';
      area_ints_anp_m2 = '-';
      area_ints_anp_percent = '-';
      html_measure_inst_anp = '-';
    }

    // Comprobar Valores - Intersección ZA
    if (ints_za == '1') 
    {
      ints_za = '<span class="badge badge-light-danger">Sí</span>'
      area_ints_za_m2 = parseFloat(area_ints_za_m2).toFixed(2);
      area_ints_za_percent = area_ints_za_m2 / parcela_area_m2 * 100;
      area_ints_za_percent = area_ints_za_percent.toFixed(0);
      area_ints_za_m2 = numberWithCommas(area_ints_za_m2);

      html_measure_inst_za = area_ints_za_m2 + '<br> ' + area_ints_za_percent + ' %';
    }
    else
    {
      ints_za = '<span class="badge badge-light-success">No</span>';
      area_ints_za_m2 = '-';
      area_ints_za_percent = '-';
      html_measure_inst_za = '-';
    }

    // Comprobar Valores - Intersección Deforestacion 2014
    if (ints_deforestacion_2014 == '1') 
    {
      ints_deforestacion_2014 = '<span class="badge badge-light-danger">Sí</span>'
      area_ints_deforestacion_2014_m2 = parseFloat(area_ints_deforestacion_2014_m2).toFixed(0);
      area_ints_deforestacion_2014_percent = area_ints_deforestacion_2014_m2 / parcela_area_m2 * 100;
      area_ints_deforestacion_2014_percent = area_ints_deforestacion_2014_percent.toFixed(0);
      area_ints_deforestacion_2014_m2 = numberWithCommas(area_ints_deforestacion_2014_m2);

      html_measure_inst_deforestacion_2014 = area_ints_deforestacion_2014_m2 + '<br> ' + area_ints_deforestacion_2014_percent + ' %';
      
    }
    else
    {
      ints_deforestacion_2014 = '<span class="badge badge-light-success">No</span>';
      area_ints_deforestacion_2014_m2 = '-';
      area_ints_deforestacion_2014_percent = '-';
      html_measure_inst_deforestacion_2014 = '-';
    }

    // Comprobar Valores - Intersección Deforestacion 2020
    if (ints_deforestacion_2020 == '1') 
    {
      ints_deforestacion_2020 = '<span class="badge badge-light-danger">Sí</span>'  
      area_ints_deforestacion_2020_m2 = parseFloat(area_ints_deforestacion_2020_m2).toFixed(0);
      area_ints_deforestacion_2020_percent = area_ints_deforestacion_2020_m2 / parcela_area_m2 * 100;
      area_ints_deforestacion_2020_percent = area_ints_deforestacion_2020_percent.toFixed(0);
      area_ints_deforestacion_2020_m2 = numberWithCommas(area_ints_deforestacion_2020_m2);

      html_measure_inst_deforestacion_2020 = area_ints_deforestacion_2020_m2 + '<br> ' + area_ints_deforestacion_2020_percent + ' %';
    }
    else
    {
      ints_deforestacion_2020 = '<span class="badge badge-light-success">No</span>';
      area_ints_deforestacion_2020_m2 = '-';
      area_ints_deforestacion_2020_percent = '-';
      html_measure_inst_deforestacion_2020 = '-';
    }
      
    let tr = '<tr>\
                <th scope="row">' + $unidades_productivas[j].id + '</th>\
                <td>' + parcela_nombre + '</td>\
                <td>' + productor_codigo + '</td>\
                <td>' + productor_nombre + '</td>\
                <td>' + variedad + '</td>\
                <td>' + parcela_altitud + '</td>\
                <td>' + sello + '</td>\
                <td>' + extensionista + '</td>\
                <td>' + promotor + '</td>\
                <td>' + corredor + '</td>\
                <td>' + comite + '</td>\
                <td>' + zona + '</td>\
                <td>' + cuenca + '</td>\
                <td>' + caserio + '</td>\
                <td>' + parcela_codigo_venta + '</td>\
                <td>' + parcela_area + '</td>\
                <td>' + ints_anp + '</td>\
                <td>' + area_ints_anp_m2 + '</td>\
                <td>' + area_ints_anp_percent + ' %</td>\
                <td>' + ints_za + '</td>\
                <td>' + area_ints_za_m2 + '</td>\
                <td>' + area_ints_za_percent + ' %</td>\
                <td>' + ints_deforestacion_2014 + '</td>\
                <td>' + area_ints_deforestacion_2014_m2 + '</td>\
                <td>' + area_ints_deforestacion_2014_percent + ' %</td>\
                <td>' + ints_deforestacion_2020 + '</td>\
                <td>' + area_ints_deforestacion_2020_m2 + '</td>\
                <td>' + area_ints_deforestacion_2020_percent + ' %</td>\
              </tr>'

    $('#table-previsualizacion tbody').append(tr);



      // let array_td = [];
      // array_td.push($unidades_productivas[j].id);
      // array_td.push(parcela_nombre);

      // array_tr.push(array_td);
  }

  // console.log(array_tr);


  //tableParcelas != null ? tableParcelas.clear().rows.add(nuevosDatos).draw() : cargar_data_parcelas();

  cargar_data_parcelas();
    
    // let tableParcelas = $('#table-previsualizacion').DataTable({
    //   "destroy": true,
    //   "paging": true
    // });

    
    // let table_previsualizacion = new DataTable('#table-previsualizacion');

    // if (!$('table').hasClass('dataTable')) {

    //   $('#table-previsualizacion').DataTable({
    //     //data: array_tr,
    //     "language": {
    //      "search" : "Buscar"
    //     }
    //   });
    // }

    $('.loader-indices').css("display","none");
    $('#loader').html("");
    
  }
  else{
    console.log('no se encontraron resultados');
    $('.loader-indices').css("display","none");
    $('#loader').html("");
    Swal.fire({
      icon: 'info',
      title: 'No hay resultados',
      text: 'No se encontraron registros para la búsqueda realizada.'
    })
  }
  
}

$('.btn-descargar-reporte').click(function(){  

  if (tableParcelas != null)
  {

    mostrar_cargando_no_porcentaje();

    exportar_excel_backend();
  }
  else
  {
    Swal.fire({
      icon: 'error',
      title: 'No se pudo descargar información',
      text: 'Primero debe realizar una consulta y previsualizar los resultados',
      showConfirmButton: false,
    });
  }



});

function exportar_excel() {
  var table = $('.table')[0];

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
  link.download = 'datos.xlsx';
  link.click();
};

function exportar_excel_backend(){
  $.ajax({
    url: '/exportar-excel-backend',
    data: {
      where_filtros: gQueryFiltrosDict
    },
    method: 'GET',
    xhrFields: {
      responseType: 'blob'
    },
    success: function (data) {
      // Trabaja con los datos de los productores en formato JSON
      //console.log(response);
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'unidades_productivas.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

      console.log('Datos descargados');

      ocultar_cargando_no_porcentaje();

      Swal.fire({
        title: 'Descarga exitosa',
        text: 'Se descargó el archivo xls',
        icon: 'success',
        showConfirmButton: false,
        timer: 2500
      });
    },
    error: function (error) {
      console.error('Error al obtener las unidades productivas:', error);

      Swal.fire({
        icon: 'error',
        title: 'No se pudo generar vista',
        text: 'Primero debe realizar una consulta y previsualizar los resultados',
        showConfirmButton: false,
      });

    },
  });
}

// Función para convertir una cadena binaria en un arreglo de bytes
function s2ab(s) {
  var buf = new ArrayBuffer(s.length);
  var view = new Uint8Array(buf);
  for (var i = 0; i < s.length; i++) {
    view[i] = s.charCodeAt(i) & 0xff;
  }
  return buf;
}


var tableParcelas = null;

function cargar_data_parcelas_Backup(){

  tableParcelas = $('#table-previsualizacion').DataTable({
    "paging":true,
    "language": {
      // "lengthMenu": "Display _MENU_ records per page",
      // "zeroRecords": "Nothing found - sorry",
      // "info": "Showing page _PAGE_ of _PAGES_",
      // "infoEmpty": "No records available",
      "paginate": {
        "first": "Primero",
        "last": "Último",
        "next": "Siguiente",
        "previous": "Anterior"
      },
      "infoFiltered": "(filtrados de _MAX_ registros totales)",
      "search": "Buscar:",
      "info": "Mostrando _TOTAL_ registros"
    },
    //"dom": '<"top"if>rt'
    "dom": '<"top"if>rt<"bottom"p><"clear">'
  });

}

function cargar_data_parcelas(_where_filtros) {

  ocultar_cargando_no_porcentaje();

  if ($.fn.DataTable.isDataTable('#table-previsualizacion')) {
    $('#table-previsualizacion').DataTable().destroy();
  }

  tableParcelas = $('#table-previsualizacion').DataTable({
    "paging": true,
    "serverSide": true,
    "processing": true,
    "ajax": {
      "url": "/filtrar-unidades-productivas",
      "type": "POST",
      "data": function(d) {
        // Agregar cualquier parámetro adicional a la solicitud aquí si es necesario
        return $.extend({}, d, {
          "extend": JSON.stringify({
            // Agregar filtros adicionales aquí si es necesario
            _where_filtros
          })
        });
      }
    },
    "columns": [
      { "data": "id" },
      { "data": "nombre" },
      { "data": "productor_codigo" },
      { "data": "productor_nombre" },
      { "data": "variedad_nombre" },
      { "data": "altitud_cat_nombre" },
      { "data": "sello_nombre" },
      { "data": "productor_extensionista" },
      { "data": "productor_promotor" },
      { "data": "corredor_nombre" },
      { "data": "comite_nombre" },
      { "data": "zona_nombre" },
      { "data": "cuenca_hidrografica_nombre" },
      { "data": "caserio_nombre" },
      { "data": "codigo_venta" },
      { "data": "area_manual" },
      { "data": "area_calc" },
      { "data": "ints_anp" },
      { "data": "area_ints_anp_m2" },
      { "data": "porc_ints_anp" },
      { "data": "ints_za" },
      { "data": "area_ints_za_m2" },
      { "data": "porc_ints_za" },
      { "data": "ints_deforestacion_2014" },
      { "data": "area_ints_deforestacion_2014_m2" },
      { "data": "porc_ints_deforestacion_2014" },
      { "data": "ints_deforestacion_2020" },
      { "data": "area_ints_deforestacion_2020_m2" },
      { "data": "porc_deforestacion_2020" },
      { "data": "ints_parcelas_perhusa" },
      { "data": "area_ints_parcelas_perhusa_m2" },
      { "data": "porc_ints_parcelas_perhusa" }
    ],
    "language": {
      "paginate": {
        "first": "Primero",
        "last": "Último",
        "next": "Siguiente",
        "previous": "Anterior"
      },
      "infoFiltered": "(filtrados de _MAX_ registros totales)",
      "search": "Buscar:",
      "info": "Mostrando _TOTAL_ registros"
    },
    "dom": '<"top"if>rt<"bottom"p><"clear">'
  });
}


function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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

var columnsParcela = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27];
var columnsEstudioSuelo = [-1,-2];
var columnsSostenibilidad = [2,3,4,5,6,7,8,9,10,11,12,13];

$('.btn-vista-parcela-reporte').click(function(){

  if (tableParcelas != null) {



    for (let i = 0; i < columnsParcela.length; i++) {
    
      let column = tableParcelas.column(columnsParcela[i]);
  
      // Toggle the visibility
      column.visible(!column.visible());
      
    }
  
    console.log('vista parcela activada');
    
  }
  else
  {
    Swal.fire({
      icon: 'error',
      title: 'No se pudo generar vista',
      text: 'Primero debe realizar una consulta y previsualizar los resultados',
      showConfirmButton: false,
    });
  }

  

});

$('.btn-vista-sostenibilidad-reporte').click(function(){

  mostrar_cargando(3000);
  setTimeout(function() {
    $('.loader-indices').css("display","none");
    $('#loader').html("");
  }, 3000);


  if (tableParcelas != null)
  {

    

    for (let i = 0; i < columnsSostenibilidad.length; i++) {
    
      let column = tableParcelas.column(columnsSostenibilidad[i]);
  
      // Toggle the visibility
      column.visible(!column.visible());
      
    }
  
    console.log('vista sostenibilidad activada');

  }
  else
  {
    Swal.fire({
      icon: 'error',
      title: 'No se pudo generar vista',
      text: 'Primero debe realizar una consulta y previsualizar los resultados',
      showConfirmButton: false,
    });
  }

  

});

function mostrar_cargando($duration)
{
  // Mostrar Vista "Cargando Indices"
  $('.loader-indices').css("display","flex");
  
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

}

function mostrar_cargando_no_porcentaje(){
  $('.loader-indices').css("display","flex");
  $('#loader').addClass('d-none');
}

function ocultar_cargando_no_porcentaje(){
  $('.loader-indices').css("display","none");
  $('#loader').removeClass('d-none');
}