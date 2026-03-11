$(document).ready(function() {
    $('#loginButton').on('click', function() {
      const formData = $('#loginForm').serialize();
      $.ajax({
        url: '/login',
        method: 'POST',
        data: formData,
        success: function(response) {
          // Redireccionar o mostrar un mensaje de éxito
          if(response == '1'){
            window.location.href = '/visor';
          }
          else{
            Swal.fire({
              title: 'Credenciales inválidas',
              text: 'No se pudo ingresar a la plataforma',
              icon: 'error',
              showConfirmButton: false,
              timer: 1500
            })
          }          
          
        },
        error: function(error) {
          // Mostrar mensaje de error en caso de credenciales inválidas
          Swal.fire({
            title: 'Credenciales invalidas',
            text: 'No se pudo ingresar a la plataforma',
            icon: 'error',
            showConfirmButton: false,
            timer: 1500
          })
        }
      });
    });
  });