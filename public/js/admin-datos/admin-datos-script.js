// =============================================
// ADMIN DATOS SCRIPT — corregido
// Todos los listeners dentro de $(document).ready
// para garantizar que DOM y jQuery estén listos
// =============================================

function obtener_data(){
    $.ajax({
        url: '/' + data_model,
        method: 'GET',
        success: function (response) {
          console.log(response);

          $('#table-actualizar-datos tbody').html('');
                          
          for (let i = 0; i < response.length; i++) {

            let tr = '<tr>\
                    <td>'
                        + response[i].id +
                    '</td>\
                    <td>\
                        <form class="form-inline w-100">\
                        <div class="form-group d-flex mb-0 w-100 ui search">\
                            <i class="fa fa-lemon"></i>\
                            <input class="form-control-plaintext form-control input-registro" type="text" data-language="en" placeholder="Insertar Valor" value="' + response[i].descripcion + '" prev-value="' + response[i].descripcion + '" disabled>\
                        </div>\
                        </form>\
                    </td>\
                    <td data-url="' + data_model + '" data-id="' + response[i].id + '">\
                        <a class="btn btn-complementary btn-editar-registro">\
                        <i class="fa fa-pen me-2"></i>\
                        Editar\
                        </a>\
                        <a class="btn btn-graysoft btn-guardar-registro">\
                        <i class="fa fa-check me-2"></i>\
                        Aceptar\
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

// =============================================
// Todo lo demás dentro de ready — seguro
// =============================================
$(document).ready(function(){

    // Editar Registro
    $('#table-actualizar-datos').on('click', '.btn-editar-registro', function(){
        console.log($(this).parent().attr('data-url'));
        console.log($(this).parent().attr('data-id'));
        $(this).parent().prev().find('.input-registro').attr('disabled', false);
        $(this).next().css('display', 'inline-block');
        $(this).css('display', 'none');
    });

    // Actualizar Registro
    $('#table-actualizar-datos').on('click', '.btn-guardar-registro', function(){
        console.log($(this).parent().attr('data-url'));
        console.log($(this).parent().attr('data-id'));

        let id_registro   = $(this).parent().attr('data-id');
        let data_url      = $(this).parent().attr('data-url');
        let valor_registro = $(this).parent().prev().find('.input-registro').val();

        if (valor_registro != $(this).parent().prev().find('.input-registro').attr('prev-value')) {
            console.log($(this).parent().prev().find('.input-registro').val());
            $(this).parent().prev().find('.input-registro').attr('prev-value', valor_registro);

            $.ajax({
                url: '/update_' + data_url,
                method: 'PUT',
                data: {
                    "id": id_registro,
                    "descripcion": valor_registro
                },
                success: function(response) {
                    console.log(response);
                    Swal.fire({
                        title: 'Cambios realizados',
                        text: 'Se actualizaron las ' + data_url + ' en la base de datos',
                        icon: 'success',
                        showConfirmButton: false,
                        timer: 1500
                    });
                },
                error: function(error) {
                    console.error('Error al actualizar:', error);
                }
            });
        }

        $(this).parent().prev().find('.input-registro').attr('disabled', true);
        $(this).prev().css('display', 'inline-block');
        $(this).css('display', 'none');
    });

    // Crear Registro — botón agregar
    $('.btn-agregar-registro').click(function(){
        if (!$('#table-actualizar-datos tbody tr:nth-child(1)').hasClass('nuevo-registro')) {
            let tr = '<tr class="nuevo-registro">\
            <td class="identificador">#</td>\
            <td>\
            <form class="form-inline w-100">\
                <div class="form-group d-flex mb-0 w-100 ui search">\
                <i class="fa fa-lemon"></i>\
                <input class="form-control-plaintext form-control input-registro" type="text" data-language="en" placeholder="Insertar Valor">\
                </div>\
            </form>\
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
        }
    });

    // Confirmar creación
    $('#table-actualizar-datos').on('click', '.btn-crear-registro', function(){
        let data_url      = $(this).parent().attr('data-url');
        let valor_registro = $(this).parent().prev().find('.input-registro').val();
        let nuevo_id;

        $.ajax({
            url: '/' + data_url,
            method: 'POST',
            data: { "descripcion": valor_registro },
            success: function(response) {
                console.log(response);
                nuevo_id = response.id;

                $('tr.nuevo-registro td.btn-options').html('');

                let td = '<a class="btn btn-complementary btn-editar-registro">\
                <i class="fa fa-pen me-2"></i>Editar\
                </a>\
                <a class="btn btn-graysoft btn-guardar-registro">\
                <i class="fa fa-check me-2"></i>Aceptar\
                </a>';

                $('tr.nuevo-registro td.btn-options').append(td);
                $('tr.nuevo-registro td.btn-options').attr('data-id', nuevo_id);
                $('tr.nuevo-registro td.identificador').html(nuevo_id);
                $('tr.nuevo-registro .input-registro').attr('disabled', true);
                $('tr.nuevo-registro').removeClass('nuevo-registro');

                Swal.fire({
                    title: 'Cambios realizados',
                    text: 'Se agregaron nuevas ' + data_url + ' en la base de datos',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 1500
                });
            },
            error: function(error) {
                console.error('Error al crear registro:', error);
            }
        });
    });

    // Cancelar creación
    $('#table-actualizar-datos').on('click', '.btn-cancelar-registro', function(){
        $(this).parent().parent().remove();
    });

    // =============================================
    // Marcar item activo en menú lateral
    // =============================================
    $('.buscador-periodo-ie-section a').removeClass('active');

    const currentUrl  = window.location.href;
    const matchResult = currentUrl.match(/\/([a-zA-Z0-9_]+)(?:\?|$)/);

    if (matchResult) {
        const lastPartUrl = matchResult[1];
        console.log('URL actual:', lastPartUrl);

        $('.buscador-periodo-ie-section a').each(function(){
            var href = $(this).attr('href');
            if (href && href !== '#') {
                var hrefMatch = href.match(/\/([^/]+)\/?$/);
                if (hrefMatch) {
                    hrefMatch[1] == lastPartUrl ? $(this).addClass('active') : false;
                }
            }
        });
    }

}); // fin document.ready