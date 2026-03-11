$("#inline-3").change(function() {
    if ($(this).prop("checked")) {
        console.log("El checkbox está marcado");
        $('#map').attr('style','height:70%');

        $('.contenedor-grafica').css('height','30%');
        $('.legend-section').css('bottom', '33%');

        map.resize();

        graficaPrecipitacion(gData["precipitacion"]);

    } else {
        console.log("El checkbox no está marcado");
        $('#map').attr('style','height:100%');
        $('.contenedor-grafica').css('height','0%');
        $('.legend-section').css('bottom', '3%');
        map.resize();
    }
});

$("#inline-areas").change(function() {
    if ($(this).prop("checked")) {
        console.log("El checkbox está marcado");
        $('#map').attr('style','height:70%');

        $('.contenedor-grafica').css('height','30%');
        $('.legend-section').css('bottom', '33%');

        map.resize();

        //graficaPrecipitacion(gData["precipitacion"]);
        graficaAreas(gData[$('.item-indice').attr('data-indice')].areas)

    } else {
        console.log("El checkbox no está marcado");
        $('#map').attr('style','height:100%');
        $('.contenedor-grafica').css('height','0%');
        $('.legend-section').css('bottom', '3%');
        map.resize();
    }
});