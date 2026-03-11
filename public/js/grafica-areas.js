gGraficaAreas = null;

function graficaAreas(data){
    console.log('grafica');

    //Convertir data
    //En este caso, el arreglo de valores para todos los índices es de longitud 5
    var _valores = [1,2,3,4,5];
    var _categories = gDataLegend[gIndiceSeleccionado]["names"];
    
    var _data_series = [];
    
    for(var i=0; i<_valores.length; i++){
        _valores[i] in data ? _data_series.push(data[_valores[i]]) : _data_series.push(0);

        /*
        if(_valores[i] in data){
            var tmp_dict = {
                x : _valores[i],
                y : data[_valores[i]],
                fillColor : gDataLegend[$('.indice-select').val()]["palette"][i]
            }
            _data_series.push(tmp_dict);
        }
        else{
            var tmp_dict = {
                x : _valores[i],
                y : 0,
                fillColor : gDataLegend[$('.indice-select').val()]["palette"][i]
            }
            _data_series.push(tmp_dict);
        }
        */
    }
    
    console.log(_data_series);
    
    var series = [{
        name: 'Área Ha',
        data: _data_series,
        //colors: gDataLegend[$('.indice-select').val()]["palette"]
    }]

    //series = _data_series;

    console.log(gDataLegend[gIndiceSeleccionado]["palette"]);

    var options = {
        chart: {
            type: 'bar',
            height: '100%'
        },
        colors: gDataLegend[gIndiceSeleccionado]["palette"],
        plotOptions: {
            bar: {
              //horizontal: true,
              distributed: true,
            }
        },
        series: series,        
        xaxis: {
            //type: 'datetime'
            categories : _categories
        },
        yaxis: {
            labels: {
                formatter: function(val) {
                    return Math.round(val);
                }
            },
            title: {
                text: 'Área Ha'
            }
        },
        title: {
            text: 'Distribución del Area (ha) por categoría'
        },
        dataLabels: {
            enabled: true,
            formatter: function (val) {
              return val.toFixed(2);
            },
            offsetY: -20,
            style: {
              fontSize: '12px',
              colors: ["#304758"]
            }
          }
    }

    console.log(options);

    //if($('#grafica-parametros').attr('data-modo')=='grafico'){
    if(1==1){
        gGraficaAreas ? gGraficaAreas.destroy() : false;

        gGraficaAreas = new ApexCharts(document.querySelector("#grafica-parametros"), options);

        gGraficaAreas.render();

        if ($(".switch-parametro-climatico").find("input[value='grafica_area']").attr("checked")) {
            //gGraficaAreas.render();
        }
    }

    //var chart = new ApexCharts(document.querySelector("#grafica-parametros"), options);
    //chart.render();
}
