function graficaTemperatura(data){
    console.log('grafica temperatura');
    console.log(data);

    // Variable para sumar los valores del índice 1
    let sumMax = 0;

    // Recorremos el array de arrays y sumamos los valores del índice 1
    for (let i = 0; i < data['arrTmpMax'].length; i++) {
        sumMax += data['arrTmpMax'][i][1];
    }

    // Calculamos el promedio dividiendo la suma entre la cantidad de elementos
    const umbralMax = sumMax / data['arrTmpMax'].length;

    //Nueva serie Umbral Maximo
    serMax = [];

    for (let i = 0; i < data['arrTmpMax'].length; i++) {
        serMax.push([data['arrTmpMax'][i][0], umbralMax]);
    }
    //-------------------------------------------------------------------------
    // Variable para sumar los valores del índice 1
    let sumMin = 0;

    // Recorremos el array de arrays y sumamos los valores del índice 1
    for (let i = 0; i < data['arrTmpMin'].length; i++) {
        sumMin += data['arrTmpMin'][i][1];
    }

    // Calculamos el promedio dividiendo la suma entre la cantidad de elementos
    const umbralMin = sumMin / data['arrTmpMin'].length;

    //Nueva serie Umbral Mínimo
    serMin = [];

    for (let i = 0; i < data['arrTmpMin'].length; i++) {
        serMin.push([data['arrTmpMin'][i][0], umbralMin]);
    }
    
    var series = [{
        name: 'Temperatura',
        data: data.featuresLocal
    },
    {
        name: 'Máximo',
        data: data.arrTmpMax
    },
    {
        name: 'Mínimo',
        data: data.arrTmpMin
    },
    {
        name: 'Umbral superior',
        data: serMax
    },
    {
        name: 'Umbral inferior',
        data: serMin
    }]

    var options = {
        chart: {
            type: 'line',
            height: '100%'
        },
        series: series,
        colors: ['#ff7f0e','#ff6363','#2ca02c', '#02576C', '#02576C'],
        stroke: {
            //width: [3,1.5,1.5],
            //dashArray: [0,3,3]
            width: [1.5,1.5,1.5,2, 2],
            dashArray: [0, 0, 0, 3, 3]
        },
        xaxis: {
            type: 'datetime'
        },
        yaxis: {
            labels: {
                formatter: function(val) {
                    return Math.round(val);
                }
            },
            title: {
                text: '°C'
            }
        },
        title: {
            text: 'Temperatura histórica'
        },
        /*
        annotations: {
            yaxis: [{
                y: umbralMax,
                y2: umbralMax + 1,
                borderColor: '#191D88',
                label: {
                    borderColor: '#191D88',
                    style: {
                        color: '#fff',
                        background: '#191D88'
                    },
                    text: umbralMax
                }
            }]
        }
        */
    }

    if(1==1){
        gGraficaAreas ? gGraficaAreas.destroy() : false;

        gGraficaAreas = new ApexCharts(document.querySelector("#grafica-parametros"), options);

        gGraficaAreas.render();

        //$('.apexcharts-legend-series[rel="4"]').hide();
        //$('.apexcharts-legend-series[rel="5"]').hide();
    }
}