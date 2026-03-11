function graficaPrecipitacion(dataDiaria, dataMensual){
    console.log('grafica');
    console.log(dataDiaria);
    
    // var series = [{
    //     name: 'Precipitación',
    //     data: data
    // }]

    // var options = {
    //     chart: {
    //         type: 'line',
    //         height: $('.contenedor-grafica').height()
    //     },
    //     series: series,
    //     colors: ['#29A847'],
    //     stroke: {
    //         width: 1.5
    //     },
    //     xaxis: {
    //         type: 'datetime'
    //     },
    //     yaxis: {
    //         labels: {
    //             formatter: function(val) {
    //                 return Math.round(val);
    //             }
    //         },
    //         title: {
    //             text: 'Precipitación (mm)'
    //         }
    //     },
    //     title: {
    //         text: 'Precipitación histórica'
    //     }
    // }

    var dailySeries = [{
        name: 'Precipitación diaria',
        type: 'line',
        data: dataDiaria, // Reemplaza dailyData con tus datos diarios
        yAxisID: 'y-axis-2', // Asigna un ID al eje Y para la serie diaria
        lineWidth: 0.1 // Ajusta el grosor de la línea según tus preferencias
    }];
    
    var monthlySeries = [{
        name: 'Precipitación mensual',
        type: 'line',
        data: dataMensual, // Reemplaza monthlyPrecipitation con tus datos mensuales
        yAxisID: 'y-axis-1', // Asigna un ID diferente al eje Y para la serie mensual
        lineWidth: 0.1 // Ajusta el grosor de la línea según tus preferencias
    }];

    console.log(dataMensual);

    var annotationsArray = dataMensual.map(point => {
        return {
            x: new Date(point[0]).getTime(), // Usa point[0] para acceder a la fecha
            y: point[1], // Usa point[1] para acceder al valor de precipitación
            label: {
                borderColor: '#ddd',
                offsetY: 0,
                style: {
                    color: '#000',
                    background: '#fff',
                },
                text: 'Mes : ' + point[1].toFixed(1), // Usa toFixed(2) para formatear el número con dos decimales
            }
        };
    });

    
    
    var options = {
        chart: {
            height: '100%',
            type: 'line'
        },
        series: monthlySeries.concat(dailySeries), // Combina las series diarias y mensuales
        colors: ['#004080', '#00A8E8'], // Asigna colores diferentes a las series
        stroke: {
            width: 1.1, // Ancho de la línea por defecto
            showMarkers: true // Habilitar los marcadores
        },
        markers: {
            size: 2, // Tamaño de los marcadores
            colors: ['#004080', '#00A8E8'], // Color de los marcadores
            strokeWidth: 0, // Ancho del borde del marcador
        },
        xaxis: {
            type: 'datetime',
        },
        annotations: {
            points: annotationsArray
        },
        yaxis: [
            {
                id: 'y-axis-1', // ID del primer eje Y para la serie diaria
                labels: {
                    formatter: function(val) {
                        return Math.round(val);
                    }
                },
                title: {
                    text: 'Precipitación mensual (mm)',
                }
            },
            {
                id: 'y-axis-2', // ID del segundo eje Y para la serie mensual
                opposite: true, // Muestra el eje en el lado derecho
                labels: {
                    formatter: function(val) {
                        return Math.round(val);
                    }
                },
                title: {
                    text: 'Precipitación diaria (mm)',
                }
            }
        ],
        title: {
            text: 'Precipitación histórica',
        }
    };


    if(1==1){
        gGraficaAreas ? gGraficaAreas.destroy() : false;

        gGraficaAreas = new ApexCharts(document.querySelector("#grafica-parametros"), options);

        gGraficaAreas.render();
    }
}