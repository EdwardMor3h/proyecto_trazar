function graficaHumedad(data, dataTemperatura){
    console.log('grafica');    

    //data = data.map(element => element[1] = element[1] * 100);

    for(var i=0; i<data.length; i++){
        data[i][1] = data[i][1] * 100;
    }

    console.log(data);
    console.log(dataTemperatura);
    
    var series = [
        {
            name: 'Humedad',
            data: data
        },
        {
            name: 'Temperatura',
            data: dataTemperatura
        }    
    ]

    var options = {
        chart: {
            type: 'line',
            height: '100%'
        },
        series: series,
        colors: ['#004080', '#00A8E8'],
        stroke: {
            width: 1.5
        },
        xaxis: {
            type: 'datetime'
        },
        yaxis: [
            {            
                labels: {
                    formatter: function(val) {
                        return val.toFixed(2);
                    }
                },            
                title: {
                    text: 'Humedad'
                }
            },
            {
                opposite: true,
                labels: {
                    formatter: function(val) {
                        return val.toFixed(0);
                    }
                },
                title: {
                    text: 'Temperatura'
                }
            }
        ],
        title: {
            text: 'Humedad histórica'
        }
    }

    if(1==1){
        gGraficaAreas ? gGraficaAreas.destroy() : false;

        gGraficaAreas = new ApexCharts(document.querySelector("#grafica-parametros"), options);

        gGraficaAreas.render();
    }
}