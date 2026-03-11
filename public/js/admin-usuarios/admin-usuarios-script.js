var query_filtros_dict = {};

function obtener_data(){
    query_filtros_dict["where"] = {"rol_id" : data_rol_id};
    query_filtros_dict = JSON.stringify(query_filtros_dict["where"])

    $.ajax({
        url: '/filtrar-' + data_model,
        data : {
            where_filtros: query_filtros_dict
        },
        method: 'GET',
        success: function (response) {
          // Trabaja con los datos de los productores en formato JSON
          console.log(response);

          $('#table-actualizar-datos tbody').html('');
                          
          for (let i = 0; i < response.length; i++) {

            let user_img = response[i].imagen;
            user_img != '' ? user_img = response[i].imagen : user_img = 'https://cdn.www.gob.pe/uploads/document/file/1464052/standard_FOTO_WEB_CAFE-1536x1024.jpg';

            let img_type = user_img.substring(0, 9);

            console.log(img_type);

            img_type == 'productor' ? user_img = response[i].imagen : false;
      
            let tr = '<tr>\
                    <td>'
                        + (i+1) + 
                    '</td>\
                    <td>\
                        <form class="form-inline w-100">\
                        <div class="form-group d-flex mb-0 w-100 ui search">\
                            <i class="fa fa-user"></i>\
                            <input class="form-control-plaintext form-control input-registro input-usuario-actualizar-usuario" type="text" data-language="en" placeholder="Insertar Usuario" value="' + response[i].usuario + '" disabled>\
                        </div>\
                        </form>\
                    </td>\
                    <td>\
                        <form class="form-inline w-100">\
                        <div class="form-group d-flex mb-0 w-100 ui search">\
                            <i class="fa fa-user"></i>\
                            <input class="form-control-plaintext form-control input-registro input-contrasena-actualizar-usuario" type="password" data-language="en" placeholder="Insertar Contraseña" value="' + response[i].contrasena + '" prev-value="' + response[i].contrasena + '" disabled>\
                        </div>\
                        </form>\
                    </td>\
                    <td>\
                        <form class="form-inline w-100">\
                        <div class="form-group d-flex mb-0 w-100 ui search">\
                            <i class="fa fa-user"></i>\
                            <input class="form-control-plaintext form-control input-registro input-nombre-actualizar-usuario" type="text" data-language="en" placeholder="Insertar Nombre" value="' + response[i].nombre + '" disabled>\
                        </div>\
                        </form>\
                    </td>\
                    <td>\
                        <form class="form-inline w-100">\
                        <div class="form-group d-flex mb-0 w-100 ui search">\
                            <i class="fa fa-user"></i>\
                            <input class="form-control-plaintext form-control input-registro input-dni-actualizar-usuario" type="number" data-language="en" placeholder="Insertar DNI" value="' + response[i].dni + '" disabled>\
                        </div>\
                        </form>\
                    </td>\
                    <td>\
                        <div class="img-container">\
                            <img class="img-user" src="' + user_img + '" alt="">\
                            <input class="input-cargar-foto input-registro" type="file" style="display:none" disabled/>\
                        </div>\
                    </td>\
                    <td class="btn-group-edit" data-url="' + data_model + '" data-id="' + response[i].id + '">\
                        <a class="btn btn-complementary btn-editar-registro" style="margin-left:10%">\
                        <i class="fa fa-pen me-2"></i>\
                        Editar\
                        </a>\
                        <a class="btn btn-graysoft btn-guardar-registro" style="margin-left:10%">\
                        <i class="fa fa-check me-2"></i>\
                        Aceptar\
                        </a>\
                    </td>\
                    <td class="btn-group-edit" data-url="' + data_model + '" data-id="' + response[i].id + '">\
                        <a class="btn btn-complementary btn-eliminar-registro">\
                        <i class="fa fa-trash me-2"></i>\
                        Eliminar\
                        </a>\
                    </td>\
                </tr>'

            $('#table-actualizar-datos tbody').append(tr);
          }


      
         
      
        },
        error: function (error) {
          console.error('Error al obtener los registros:', error);
        },
      });
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