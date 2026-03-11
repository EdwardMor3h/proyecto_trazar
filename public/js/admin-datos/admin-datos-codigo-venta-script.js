function obtener_data(){
    $.ajax({
        url: '/filtrar-codigo-venta-unico',
        method: 'GET',
        success: function (response) {
          // Trabaja con los datos de los productores en formato JSON
          console.log(response);
          let registros_variedad = [];

          $('#table-actualizar-datos tbody').html('');
                          
          for (let i = 0; i < response.length; i++) {
    

            let tr = '<tr>\
                    <td>'
                        + response[i].codigo_venta +
                    '</td>\
                    <td>'
                        + response[i].cantidad +
                    '</td>\
                    <td data-codigo-venta="' + response[i].codigo_venta + '">\
                        <a class="btn btn-complementary btn-eliminar-codigo-venta">\
                        <i class="fa fa-trash me-2"></i>\
                        Eliminar\
                        </a>\
                    </td>\
                </tr>';

            $('#table-actualizar-datos tbody').append(tr);
          }

        },
        error: function (error) {
          console.error('Error al obtener los registros:', error);
        },
      });
};

$('#table-actualizar-datos').on('click', '.btn-eliminar-codigo-venta', function(){

  
  let codigo_venta = $(this).parent().attr('data-codigo-venta');

  Swal.fire({
    title: "¿Está seguro de eliminar?",
    text: "Eliminará el código de venta " + codigo_venta,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Confirmar"
  }).then((result) => {
    if (result.isConfirmed) {

      //LLamar Update registro
      $.ajax({
        url: '/delete_codigo',
        method: 'POST',
        //contentType: 'application/json',
        data: {
            "descripcion" : codigo_venta
        },
        success: function(response) {
          // Manejar la respuesta exitosa
          console.log(response);

          Swal.fire({
              title: 'Código Eliminado',
              text: 'Se eliminó el código de venta ' + codigo_venta + ' de la base de datos',
              icon: 'success',
              showConfirmButton: false,
              timer: 1500
            });
            $('td[data-codigo-venta="'+ codigo_venta +'"]').parent().remove();
        },
        error: function(error) {
          Swal.fire({
            title: "Error",
            text: "No se pudo eliminar el código de la base de datos",
            icon: "error"
          });
        }
      });

    }
  });

  
  

});

//-------------------------------LLENAR_TABLA_XLS---------------------------------------------
function llenar_tabla_xls(){
    $.ajax({
        url: '/unidad_productiva_codigo_ventas',
        method: 'GET',
        success: function (response) {
          // Trabaja con los datos de los productores en formato JSON
          console.log(response);
          let registros_variedad = [];
  
          $('.tabla-excel tbody').html('');
                          
          for (let i = 0; i < response.length; i++) {
  
            let tr = '<tr>\
                    <td>'
                        // + (i+1) + 
                        + response[i].id +
                    '</td>\
                    <td>'
                        + response[i].unidad_productiva_id +
                    '</td>\
                    <td>'
                        + response[i].codigo_venta +
                    '</td>\
                </tr>';
  
            $('.tabla-excel tbody').append(tr);
          }

        },
        error: function (error) {
          console.error('Error al obtener los registros:', error);
        },
      });
  }
  
  
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
          xhr.open('POST', '/cargar-csv-crear-codigo-venta-unidad-productiva', true);
    
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
  
  
    //----------------------------------DESCARGAR PLANTILLA----------------------------
  
    $('.descargar-data').click(function(){
  
        var table = $('.tabla-excel')[0];
      
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
        link.download = 'codigo_venta_unidad_productiva.xlsx';
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

//Asignar clase "active" a seccion admin_datos activa
$('.buscador-periodo-ie-section a').removeClass('active');


$('.buscador-periodo-ie-section .a-codigo-venta').addClass('active');
