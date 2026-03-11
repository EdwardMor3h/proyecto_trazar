var height = $(window).height();
height = height - 200;


$('.table-previsualizacion').css('height', height);

// $('.filtros-container').css('max-height', height-(height*0.20));
// $('.filtros-container').css('height', height-(height*0.20));






// ================================== Inicializar Select Multiples ========================

// Multi Select Variedad
$(".js-variedad-multiple").select2({
    placeholder: "Seleccionar"
});

// Multi Select Altitud
$(".js-altitud-multiple").select2({
    placeholder: "Seleccionar"
});

// Multi Select Zona
$(".js-zona-multiple").select2({
    placeholder: "Seleccionar"
});

// Multi Select Corredor
$(".js-corredor-multiple").select2({
    placeholder: "Seleccionar"
});

// Multi Select Corredor
$(".js-codigo-venta-multiple").select2({
    placeholder: "Seleccionar"
});


