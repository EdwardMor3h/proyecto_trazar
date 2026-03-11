var gDetalleUnidadProductiva = null;
var gSwClickStatusGeojsonCargado = false;

var detalle_unidad_productiva;
var data_reporte_dict = [];

data_reporte_dict.push({"codigo_parcela": "1",
"parcela": "1",
"codigo_productor": "1",
"productor": "1",
"variedad": "1",
"altitud": "1",
"sello": "1",
"corredor": "1",
"comite": "1",
"zona": "1",
"cuenca": "1",
"caserio": "1",
"codigo_venta": "1",
"area_ha": "1",
"ints_anp_m2": "1",
"ints_za_m2": "1",
"ints_d14_m2": "1",
"ints_d20_m2": "1"});

$('.switch-capa-datos input').on('change',function(){

    var tableName = $(this).val();

    if($(this).is(':checked')){

        evaluar_agregar_capa_datos(tableName);         
    }
    else{
        
        if(map.getLayer(tableName)){
            map.removeLayer(tableName);

            map.getLayer(tableName + '_labels') ? map.removeLayer(tableName + '_labels') : false;

            map.removeSource(tableName + '_source');

            quitar_leyenda(tableName);
        }
    }
})

function obtener_geojson(tableName){
    return $.ajax({
                url: '/obtener-geojson',
                data: {table_name: tableName},
                dataType: 'json'
            })
}

function agregar_vector(_id, _type, _paint=null, _label=null, _behind='cafe'){
    if(!_paint){
        _paint = {
            'fill-color': '#29A847',
            'fill-opacity': .5
        }
    }

    if(_id.includes('uso_actual_')){
      map.addSource(_id + '_source', {
          type: 'raster',
          tiles: ["https://geofarmsperhusa.com.pe/geoserver/gwc/service/wmts?REQUEST=GetTile&SERVICE=WMTS"+
                  "&VERSION=1.0.0&LAYER=geoespacial:"+ _id +"&STYLE=&TILEMATRIX=EPSG:900913:{z}"+
                  "&TILEMATRIXSET=EPSG:900913&FORMAT=image/png"+
                  "&TILECOL={x}&TILEROW={y}"],
          tileSize: 512
          //tileMethod: 'no-cors'
      })
    }
    else if(_id.includes('parcelas_')){
      map.addSource(_id + '_source', {
        type: 'vector',
        tiles: [
          window.location.origin + '/get-tile-set-' + _id +'/parcelas_cafe/{z}/{x}/{y}.pbf'
        ],
        minzoom: 4,
        maxzoom: 19,
        tileSize: 512  
      });
    }
    else{
      map.addSource(_id + '_source', {
          type: 'vector',
          tiles: [window.location.origin + '/get-tile-set/'+ _id +'/{z}/{x}/{y}.pbf'],
          tileSize: 512
      })
    }

    if(_id.includes('uso_actual_')){
      map.addLayer({
          'id': _id,
          'type': 'raster',
          'source': _id + '_source',
          'minzoom': 10,
          'maxzoom': 22,
          'paint': {
              'raster-opacity': 0.8
          }
      },
        'cafe', 'cafe_labels', 'cafeborde'
      );

      if(!$('.div-alert').is(':visible')){
        $('.div-alert').slideToggle();

        setTimeout(function(){
          $('.div-alert').slideToggle()
        }, 3000)
      }
      

    }
    else{
      map.addLayer({
          id: _id,
          type: _type,
          source: _id + '_source',
          "source-layer": _id,
          paint: _paint
      });
    }    

    agregar_leyenda(_id);

    if(_label){
      console.log(_label);

      'symbol_placement' in _label ? true : _label["symbol_placement"] = "point";

      map.addLayer({
          'id': _id + '_labels',
          'type': 'symbol',
          'source': _id + '_source',
          'source-layer': _id,
          'layout': {
              "symbol-placement": _label.symbol_placement,
              'text-field': ['get', _label.text_field],
              "text-font": ["Open Sans Regular"],
              'text-size': _label.text_size,
              'text-anchor': 'center',
              'text-optional': true
              ///'text-offset': [0, -1.5],
              //'text-allow-overlap': true,
              ///'text-ignore-placement': true,
              //'text-radial-offset': 0.5,
              //'text-justify': 'auto',
              //'icon-image': ['concat', ['get', 'icon'], '-15']
          },
          
          'paint': {
              //"text-field": ['get','capital'],
              "text-color": '#FFF',
              "text-halo-blur": 1.5,
              "text-halo-color": "#03045e",
              "text-halo-width": 1,
          },
          
          'minzoom': 8
          //'layout':{"visibility":"none"}
          }
      );      
    }



    map.on('click', _id, function (e) {
        console.log(e.features);

        var datos;
        var nombre_capa = '';
        
        if(_id=='parcelas_organicas' || _id=='parcelas_convencionales'){

          const gid_seleccionado = e.features[0].properties.gid;

          console.log(gid_seleccionado);

          for(var i=0; i<gGlobal.length; i++){
            if(gid_seleccionado == gGlobal[i].parcela_gid){
              gSeleccionado = gGlobal[i];
            }
          };

          console.log(gSeleccionado);

          renderizarTabla(gSeleccionado);

          let nombre_parcela_seleccionada = gSeleccionado["id"] + ' - ' + gSeleccionado["nombre"];
            $('.input-buscar-parcela').val(nombre_parcela_seleccionada);
            texto_parcela_seleccionada = nombre_parcela_seleccionada;
            
            return
        }

        else if(_id=='red_vial_nacional'){
            datos = {
              "gid" : e.features[0].properties.gid,
              "trayecto" : e.features[0].properties.trayecto,
              "superficie" : e.features[0].properties.superfic_l,
              "estado" : e.features[0].properties.estado_l,
              "eje" : e.features[0].properties.ejeclas_l,
              "ruta" : e.features[0].properties.codruta,
              "corredor" : e.features[0].properties.corlog_l,
              "ancho" : e.features[0].properties.ancho,
              "longitud" : e.features[0].properties.longitud
            }

            nombre_capa = 'Red Vial Nacional';
        }
        else if(_id=='red_vial_departamental'){
            datos = {
                "gid" : e.features[0].properties.gid,
                "trayecto" : e.features[0].properties.trayecto,
                "superficie" : e.features[0].properties.superfic_l,
                "estado" : e.features[0].properties.estado_l,
                "ruta" : e.features[0].properties.codruta,
                "ancho" : e.features[0].properties.ancho,
                "longitud" : e.features[0].properties.longitud
            }

            nombre_capa = 'Red Vial Departamental';
        }
        else if(_id=='red_vial_vecinal'){
            datos = {
                "gid" : e.features[0].properties.gid,
                "trayecto" : e.features[0].properties.trayecto,
                "superficie" : e.features[0].properties.superfic_l,
                "estado" : e.features[0].properties.estado_l,
                "ruta" : e.features[0].properties.codruta,
                "ancho" : e.features[0].properties.ancho,
                "longitud" : e.features[0].properties.longitud
            }

            nombre_capa = 'Red Vial Vecinal';
        }
        else if(_id=='areas_naturales_protegidas'){
            datos = {
                "gid" : e.features[0].properties.gid,
                "codigo" : e.features[0].properties.anp_codi,
                "nombre" : e.features[0].properties.anp_nomb,
                "categoría" : e.features[0].properties.anp_cate,
                "uso" : e.features[0].properties.anp_uicn,
                "fecha creación" : e.features[0].properties.anp_felec,
                "base legal" : e.features[0].properties.anp_balec
                
                
            }

            nombre_capa = 'Areas Naturales Protegidas';
        }

        else if(_id=='zonas_amortiguamiento'){
            datos = {
                "gid" : e.features[0].properties.gid,
                "codigo" : e.features[0].properties.anp_codi,
                "nombre" : e.features[0].properties.anp_nomb,
                "categoría" : e.features[0].properties.c_nomb,
                "observación" : e.features[0].properties.za_obs,
                "fecha creación" : e.features[0].properties.za_felea,
                "base legal" : e.features[0].properties.za_balea
                
            }

            nombre_capa = 'Zonas de Amortigüamiento';
        }

        else if(_id=='cuencas_hidrograficas'){
            datos = {
                "gid" : e.features[0].properties.gid,
                "nombre" : e.features[0].properties.nombre,
                "nivel" : e.features[0].properties.nivel,
                "codigo" : e.features[0].properties.codigo,
                "nivel 01" : e.features[0].properties.nomb_uh_n1,
                "nivel 02" : e.features[0].properties.nomb_uh_n2,
                "nivel 03" : e.features[0].properties.nomb_uh_n3,
                "nivel 04" : e.features[0].properties.nomb_uh_n4,
                "nivel 05" : e.features[0].properties.nomb_uh_n5,
                "area_km2" : e.features[0].properties.area_km2
                
            }

            nombre_capa = 'Cuencas Hidrográficas';
        }

        else if(_id=='rios_quebradas'){
            datos = {
                "gid" : e.features[0].properties.gid,
                "nombre" : e.features[0].properties.nombre,
                "codigo ign" : e.features[0].properties.cod_ign,
                "rasgo principal" : e.features[0].properties.rasgo_prin,
                "rasgo secundario" : e.features[0].properties.rasgo_secu,
                
            }

            nombre_capa = 'Ríos y Quebradas';
        }
        else if(_id=='uso_actual_cajamarca'){
            datos = {
                "nombre" : e.features[0].properties.usos_suelo,   
            }
            nombre_capa = 'Uso de Suelo Cajamarca';
        }
        
        else if(_id=='uso_actual_cusco'){
            datos = {
                "nombre" : e.features[0].properties.usos_suelo,   
            }
            nombre_capa = 'Uso de Suelo Cusco';
        }
        
        else if(_id=='uso_actual_junin'){
            datos = {
                "nombre" : e.features[0].properties.usos_suelo,   
            }
            nombre_capa = 'Uso de Suelo Junin';
        }
        
        else if(_id=='uso_actual_sanmartin'){
            datos = {
                "nombre" : e.features[0].properties.uso_suelo,   
            }
            nombre_capa = 'Uso de Suelo San Martin';
        }
        
        else if(_id=='uso_actual_huanuco'){
            datos = {
                "nombre" : e.features[0].properties.usos_suelo,   
            }
            nombre_capa = 'Uso de Suelo Huanuco';
        }
        
        else if(_id=='uso_actual_amazonas'){
            datos = {
                "nombre" : e.features[0].properties.desc_uso,   
            }
            nombre_capa = 'Uso de Suelo Amazonas';
        }

        /*
        else if(_id=='interseccion_cafe_anp'){
          datos = {
                    "Nombre":  gDetalleUnidadProductiva[0].nombre,
                    "Nombre productor":  gDetalleUnidadProductiva[0].Productor.nombre,
                    "Código productor":  gDetalleUnidadProductiva[0].productor_codigo,
                    "Altitud":  gDetalleUnidadProductiva[0].altitud,
                    "Variedad":  gDetalleUnidadProductiva[0].Campanhas[0].CampanhaVariedades[0].Variedad.descripcion,
                    "Area(HA)":  parseFloat(gDetalleUnidadProductiva[0].area_ha).toFixed(2),
                    "Número de plantas":  gDetalleUnidadProductiva[0].Campanhas[0].numero_plantas,
                    "Porcentaje de sombra":  gDetalleUnidadProductiva[0].Campanhas[0].porcentaje_sombra,
                    "Descripción":  gDetalleUnidadProductiva[0].Sello.descripcion,
          
          }

          nombre_capa = 'Parcelas Café en ANP';
        }
        */

        //Si es la interseccion, ya no generar popup
        if(_id=='interseccion_cafe_anp') return;
        if(_id=='interseccion_cafe_deforestacion_2014') return;
        if(_id=='interseccion_cafe_deforestacion_2020') return;
        if(_id=='deforestacion_2014') return;
        if(_id=='deforestacion_2020') return;

        var _html_body_popup_layer = '';

        for(var key in datos){
            // _html_body_popup_layer += '<h6>'+ datos['campo1'] +'</h6>';

            _html_body_popup_layer += '<li class="item-container-layer-pop-up">\
            <span class="attribute-item-layer-pop-up mb-0">' + key + '</span>\
            <span class="value-item-layer-pop-up mb-0">' + datos[key] + '</span>\
          </li>'
        }

        new maplibregl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(
            '<div class="pop-up-map-container">\
              <div class="pop-up-layers-container">\
                <div class="card mb-0">\
                  <div class="card-header p-4">\
                    <h5 class="name-layer-pop-up mb-0">' + nombre_capa + '</h5>\
                  </div>\
                  <div class="card-body p-4">\
                    <ul class="group-item-container-layer-pop-up">'
                      + _html_body_popup_layer +
                      '</li>\
                    </ul>\
                  </div>\
                </div>\
              </div>\
            </div>'
          )
          .addTo(map);
      });
  
      // Change the cursor to a pointer when the mouse is over the places layer.
      map.on('mouseenter', _id, function () {
        map.getCanvas().style.cursor = 'pointer';
      });
      
      // Change it back to a pointer when it leaves.
      map.on('mouseleave', _id, function () {
        map.getCanvas().style.cursor = '';
      });


}

function agregar_geojson(_id, _type, _geojson, _paint=null, _label=null){

    var minZoom = 22;
    _id == 'cafe' ? minZoom = 10 : false;

    if(!_paint){
        _paint = {
            'fill-color': '#29A847',
            'fill-opacity': .5
        }
    }    
    /*
    map.getLayer(_id) ? map.removeLayer(_id) : false;
    map.getLayer(_id + '_labels') ? map.removeLayer(_id + '_labels') : false;
    map.getLayer(_id + '_borde') ? map.removeLayer(_id + '_borde') : false;
    map.getSource(_id + '_source') ? map.removeSource(_id + '_source') : false;
    */

    if (map.getSource(_id + '_source')) {
      // Si la fuente ya existe, actualiza los datos
      map.getSource(_id + '_source').setData(_geojson);
  } else {

        map.addSource(_id + '_source', {
          type: 'geojson',
          data: _geojson,
          'promoteId': true
      })

      var layer1 = map.addLayer({
          id: _id,
          type: _type,
          source: _id + '_source',
          paint: _paint,
          minzoom: minZoom
      });

      agregar_leyenda(_id);

      if(_label){
        console.log(_label);

        var _layout = {
                          "symbol-placement": "point",
                          'text-field': ['get', _label.text_field],
                          "text-font": ["Open Sans Regular"],
                          'text-size': _label.text_size,
                          'text-anchor': 'center',
                          'text-optional': true
                          ///'text-offset': [0, -1.5],
                          //'text-allow-overlap': true,
                          ///'text-ignore-placement': true,
                          //'text-radial-offset': 0.5,
                          //'text-justify': 'auto',
                          //'icon-image': ['concat', ['get', 'icon'], '-15']
                      }

        if(_id == 'cafe'){
          _layout = {
                          "symbol-placement": "point",
                          'text-field': [
                            'concat',
                            ['get', 'nombre'], '\n',
                            ['case', ['has', 'productor_nombre'], ['get', 'productor_nombre'], ''],
                            ['case', ['all', ['has', 'productor_nombre'], ['has', 'productor_codigo']], ' - ', ''],
                            ['case', ['has', 'productor_codigo'], ['get', 'productor_codigo'], ''],
                            '\n',
                            /*
                            ['case', ['has', 'area_ha'], ['concat',
                              [
                                'number-format',
                                ['get', 'area_ha'],
                                { 'min-fraction-digits': 2, 'max-fraction-digits': 2 }
                              ], ' Ha'], ''],
                            */
                            ['case', ['has', 'area_poly_ha'], ['concat',
                              [
                                'number-format',
                                ['get', 'area_poly_ha'],
                                { 'min-fraction-digits': 2, 'max-fraction-digits': 2 }
                              ], ' Ha'], '']
                          ],
                          "text-font": ["Open Sans Regular"],
                          'text-size': [
                            'case',
                            ['has', 'nombre'],
                            16, // Tamaño de fuente para el campo 'nombre'
                            ['case', ['has', 'productor_nombre'], 12, 10] // Tamaño de fuente para 'productor_nombre' y 'area_ha'
                        ],
                          'text-anchor': 'center',
                          'text-optional': true
                      }
        }

        map.addLayer({
            'id': _id + '_labels',
            'type': 'symbol',
            'source': _id + '_source',
            //'source-layer': _id,
            'layout': _layout,
            
            'paint': {
                //"text-field": ['get','capital'],
                "text-color": '#fff',
                // "text-halo-blur": 1,
                "text-halo-color": "#181F26",
                "text-halo-width": 1
            },
            
            'minzoom': 16
            //'layout':{"visibility":"none"}
            },
        //'lotes_zonificacion'
        );
      }

      console.log(1);
      const bounds = layer1.getBounds();
      console.log(bounds);

      /*
      map.fitBounds(bounds, {
          padding: 1 // Esto es opcional, pero te permite agregar un poco de espacio alrededor de la capa cuando se ajusta el mapa
      });
      */    

      if(gSwClickStatusGeojsonCargado){      
        return;
      }

      map.on('click', 'cafe', async function (e) {

        console.log(e.features);
        
        detalle_unidad_productiva = await $.ajax({
                                                  url: '/filtrar-unidad-productiva-tabla-atributos',
                                                  data: {
                                                    where_filtros: JSON.stringify({"id" : [e.features[0].properties.id]})
                                                  },
                                                  method: 'GET',
                                                  error: function (error) {
                                                    console.error('Error al obtener las unidades productivas:', error);
                                                  },
                                                });
        
        console.log(detalle_unidad_productiva);

        objectid_actual = detalle_unidad_productiva[0].parcela_gid;
        console.log(objectid_actual);

        for(var i=0; i<gGlobal.features.length; i++){
          if(objectid_actual == gGlobal.features[i].properties.parcela_gid){
            gSeleccionado = gGlobal.features[i];
          }
        }

        console.log(gSeleccionado);
        cambiar_parcela_seleccionada(gSeleccionado.properties);

        gDetalleUnidadProductiva = detalle_unidad_productiva;

        //Mostrar atributos de parcela seleccionada en Tabla de Atributos
        ///$('.table-container tbody').find('tr').hide();
        // let td_seleccionado = $('.table-container tbody').find(detalle_unidad_productiva[0].id.toString()).show();
        ///$('.table-container tbody').find("tr."+detalle_unidad_productiva[0].id).show();
        
        renderizarTabla([gSeleccionado]);

        // let zona = detalle_unidad_productiva[0].Zona;
        // // Comprobar Valores - Zona
        // zona != null ? zona = zona.descripcion : zona = 'ND';
        // // console.log(zona);

        // let nombre_productor = detalle_unidad_productiva[0].Productor;
        // // Comprobar Valores - Productor
        // nombre_productor != null ? nombre_productor = nombre_productor.nombre : nombre_productor = 'ND';
        // // console.log(nombre_productor);

        // let parcela_plantas = detalle_unidad_productiva[0].numero_plantas;
        // // Comprobar Valores - Parcela - Plantas
        // parcela_plantas != null ? parcela_plantas = parcela_plantas  : parcela_plantas = 'ND';
        // // console.log(parcela_plantas);

        // let parcela_altitud = detalle_unidad_productiva[0].altitud;
        // // Comprobar Valores - Parcela - Altitud
        // parcela_altitud != null ? parcela_altitud = parcela_altitud  : parcela_altitud = 'ND';
        // // console.log(parcela_altitud);

        // let parcela_porcentaje_sombra = detalle_unidad_productiva[0].porcentaje_sombra;
        // // Comprobar Valores - Parcela - Porcentaje Sombrea
        // parcela_porcentaje_sombra != null ? parcela_porcentaje_sombra = parcela_porcentaje_sombra  : parcela_porcentaje_sombra = 'ND';
        // // console.log(parcela_porcentaje_sombra);

        // let parcela_area = detalle_unidad_productiva[0].area_ha;
        // // Comprobar Valores - Parcela - Area
        // parcela_area != null ? parcela_area = parcela_area  : parcela_area = 'ND';
        // // console.log(parcela_area);
        // if(parcela_area != null)
        // {
        //   parcela_area = parseFloat(parcela_area).toFixed(2);
        // }

        // let parcela_poly_area = detalle_unidad_productiva[0].area_poly_ha;
        // // Comprobar Valores - Parcela - Area
        // parcela_poly_area != null ? parcela_poly_area = parcela_poly_area  : parcela_poly_area = 'ND';
        // // console.log(parcela_poly_area);
        // if(parcela_poly_area != null)
        // {
        //   parcela_poly_area = parseFloat(parcela_poly_area).toFixed(2);
        // }

        // let variedad = detalle_unidad_productiva[0].Variedad;
        // // Comprobar Valores - Variedad
        // variedad != null ? variedad = variedad.descripcion : variedad = 'ND';
        // // console.log(sello);

        // let sello = detalle_unidad_productiva[0].Sello;
        // // Comprobar Valores - Sello
        // sello != null ? sello = sello.descripcion : sello = 'ND';
        // // console.log(sello);

        // let ints_anp = detalle_unidad_productiva[0].ints_anp;
        // let area_ints_anp_m2 = detalle_unidad_productiva[0].area_ints_anp_m2;
        
        // // Comprobar Valores - area_ints_anp_m2
        // if (ints_anp == '1') 
        // {
        //   area_ints_anp_m2 = parseFloat(area_ints_anp_m2).toFixed(2);
        //   area_ints_anp_m2 = numberWithCommas(area_ints_anp_m2); 
        // }
        // else
        // {
        //   area_ints_anp_m2 = '0';
        // }

        // let ints_za = detalle_unidad_productiva[0].ints_za;
        // let area_ints_za_m2 = detalle_unidad_productiva[0].area_ints_za_m2;
        // // Comprobar Valores - ints_za
        // if (ints_za == '1') 
        // {
        //   area_ints_za_m2 = parseFloat(area_ints_za_m2).toFixed(2);
        //   area_ints_za_m2 = numberWithCommas(area_ints_za_m2); 
        // }
        // else
        // {
        //   area_ints_za_m2 = '0';
        // }

        // let ints_deforestacion_2014 = detalle_unidad_productiva[0].ints_deforestacion_2014;
        // let area_ints_deforestacion_2014_m2 = detalle_unidad_productiva[0].area_ints_deforestacion_2014_m2;
        // // Comprobar Valores - ints_deforestacion_2014
        // if (ints_deforestacion_2014 == '1') 
        // {
        //   area_ints_deforestacion_2014_m2 = parseFloat(area_ints_deforestacion_2014_m2).toFixed(2);
        //   area_ints_deforestacion_2014_m2 = numberWithCommas(area_ints_deforestacion_2014_m2); 
        // }
        // else
        // {
        //   area_ints_deforestacion_2014_m2 = '0';
        // }
        
        

        // let ints_deforestacion_2020 = detalle_unidad_productiva[0].ints_deforestacion_2020;
        // let area_ints_deforestacion_2020_m2 = detalle_unidad_productiva[0].area_ints_deforestacion_2020_m2;
        // // Comprobar Valores - ints_deforestacion_2020
        // if (ints_deforestacion_2020 == '1') 
        // {
        //   area_ints_deforestacion_2020_m2 = parseFloat(area_ints_deforestacion_2020_m2).toFixed(2);
        //   area_ints_deforestacion_2020_m2 = numberWithCommas(area_ints_deforestacion_2020_m2); 
        // }
        // else
        // {
        //   area_ints_deforestacion_2020_m2 = '0';
        // }
        

        // var url_img = 'https://cdn.www.gob.pe/uploads/document/file/1464052/standard_FOTO_WEB_CAFE-1536x1024.jpg';

        // if(detalle_unidad_productiva[0].imagen){
        //   url_img = '/' + detalle_unidad_productiva[0].imagen;
        // }

      //   new maplibregl.Popup()
      //     .setLngLat(e.lngLat)
      //     .setHTML(
      //       '<div class="pop-up-map-container">\
      //       <div class="pop-up-container">\
      //         <div class="img-container">\
      //           <img src="'+ url_img +'" alt="">\
      //           <div class="zona-container">\
      //             <span>Zona: ' + zona + '</span>\
      //           </div>\
      //         </div>\
      // \
      //         <div class="atributos-container">\
      //           <div class="header-atributos">\
      //             <h6>' + detalle_unidad_productiva[0].nombre + ' - ' + detalle_unidad_productiva[0].id + '</h6>\
      //             <span>' + nombre_productor + '</span>\
      // \
      //           </div>\
      // \
      //           <div class="body-atributos mt-2">\
      //             <div class="atributos-group mb-3">\
      //             <div class="atributo-items-container">\
      //               <i class="fa-solid fa-coffee"></i>\
      //               <span class="atributo-title">Area ha</span>\
      //               <span class="atributo-value">' + parcela_area + '</span>\
      //             </div>\
      //             <div class="atributo-items-container">\
      //                 <i class="fa-solid fa-coffee"></i>\
      //                 <span class="atributo-title">Area ha C</span>\
      //                 <span class="atributo-value">' + parcela_poly_area + '</span>\
      //             </div>\
      //           </div>\
      //             <div class="atributos-group mb-3">\
      //             \
      //               <div class="atributo-items-container">\
      //                 <i class="fa-solid fa-coffee"></i>\
      //                 <span class="atributo-title">ANP m2</span>\
      //                 <span class="atributo-value">' + area_ints_anp_m2 + '</span>\
      // \
      //               </div>\
      // \
      //               <div class="atributo-items-container">\
      //                 <i class="fa-solid fa-coffee"></i>\
      //                 <span class="atributo-title">ZA m2</span>\
      //                 <span class="atributo-value">' + area_ints_za_m2 + '</span>\
      // \
      //               </div>\
      // \
      //             </div>\
      // \
      //             <div class="atributos-group mb-3">\
      //               <div class="atributo-items-container">\
      //                 <i class="fa-solid fa-coffee"></i>\
      //                 <span class="atributo-title">D14 m2</span>\
      //                 <span class="atributo-value">' + area_ints_deforestacion_2014_m2 + '</span>\
      //               </div>\
      //               <div class="atributo-items-container">\
      //                   <i class="fa-solid fa-coffee"></i>\
      //                   <span class="atributo-title">D20 m2</span>\
      //                   <span class="atributo-value">' + area_ints_deforestacion_2020_m2 + '</span>\
      //               </div>\
      //             </div>\
      //             <div class="atributos-group mb-3">\
      //               <div class="atributo-items-container">\
      //                 <i class="fa-solid fa-coffee"></i>\
      //                 <span class="atributo-title">Altitud</span>\
      //                 <span class="atributo-value">' + parcela_altitud + '</span>\
      //               </div>\
      // \
      //               <div class="atributo-items-container">\
      //                 <i class="fa-solid fa-coffee"></i>\
      //                 <span class="atributo-title">Variedad</span>\
      //                 <span class="atributo-value">' + variedad + '</span>\
      //               </div>\
      //             </div>\
      //             <div class="atributos-group">\
      //               <div class="atributo-items-container">\
      //                 <i class="fa-solid fa-coffee"></i>\
      //                 <span class="atributo-title">Plantas</span>\
      //                 <span class="atributo-value">' + parcela_plantas + '</span>\
      // \
      //               </div>\
      // \
      //               <div class="atributo-items-container">\
      //                 <i class="fa-solid fa-coffee"></i>\
      //                 <span class="atributo-title">Sombra</span>\
      //                 <span class="atributo-value">' + parcela_porcentaje_sombra + '</span>\
      // \
      //               </div>\
      //             </div>\
      //             <div class="atributos-group" style="margin-top: 1rem;">\
      //                 <button class="btn btn-sm btn-primary btn-consultar-periodo" type="button">Reporte</button>\
      //             </div>\
      // \
      //           </div>\
      //           <div class="footer-atributos" style="margin-top: 1rem; display: flex; justify-content: center">\
      //             <button class="btn btn-back btn-sm btn-descargar-reporte-parcela" type="button" style="font-size: 0.75rem; padding: 0.4rem 1.9rem; font-weight: 500;">Descargar</button>\
      //           </div>\
      // \
      //         </div>\
      // \
      //       </div>\
      // \
      //     </div>'
      //     )
      //     .addTo(map);

      });

      // Change the cursor to a pointer when the mouse is over the places layer.
      map.on('mouseenter', 'cafe', function () {
        map.getCanvas().style.cursor = 'pointer';
      });
      
      // Change it back to a pointer when it leaves.
      map.on('mouseleave', 'cafe', function () {
        map.getCanvas().style.cursor = '';
      });

      gSwClickStatusGeojsonCargado = true;

  }    

}

function agregar_geojson_borde(_id, _type, _geojson){

  /*
  map.getLayer(_id) ? map.removeLayer(_id) : false;
  map.getSource(_id) ? map.removeSource(_id) : false;
  */
  var minZoom = 22;
  if (_id == 'cafeborde') {
      minZoom = 10;
  }
  
  if (map.getSource(_id)) {
    // Si la fuente ya existe, actualiza los datos
    map.getSource(_id).setData(_geojson);
  } else {
      // Si la fuente no existe, créala junto con la capa
      map.addSource(_id, {
          type: 'geojson',
          data: _geojson
      });

      map.addLayer({
          id: _id,
          type: _type,
          source: _id,
          paint: {
              'line-color': '#ffffff',
              'line-width': 4
          },
          minzoom: minZoom
      });
  }

  console.log(1);

  // Puedes obtener los límites del geojson usando turf.js
  //var bbox = turf.bbox(_geojson);
  //console.log(bbox);

  /*
  map.fitBounds(bbox, {
      padding: 1 // Esto es opcional, pero te permite agregar un poco de espacio alrededor de la capa cuando se ajusta el mapa
  });
  */

}

function evaluar_agregar_capa_datos(tableName){

    var paint;

    switch(tableName) {
        case 'parcelas_organicas':

            paint = {
                        'fill-color': 'purple',
                        'fill-opacity': .5
                    }

            agregar_vector(tableName, 'fill', paint);

            break;
        case 'parcelas_convencionales':

            paint = {
                        'fill-color': 'purple',
                        'fill-opacity': .5
                    }

            agregar_vector(tableName, 'fill', paint);

            break;
        case 'red_vial_nacional':

            paint = {
                        'line-color': 'gold',
                        'line-opacity': 0.75,
                        'line-width': 8
                    }

            _label = {
              'text_field':'superfic_l', 
              'text_size': 20,
              'symbol_placement': 'line' //point, line, line-center
            }

            agregar_vector(tableName, 'line', paint, _label);

            break;
        case 'red_vial_departamental':

            paint = {
                'line-color': 'orange',
                'line-opacity': 0.75,
                'line-width': 3
            }
            
            agregar_vector(tableName, 'line', paint);

            break;
        case 'red_vial_vecinal':

            paint = {
                'line-color': 'red',
                'line-opacity': 0.75,
                'line-width': 2
            }

            agregar_vector(tableName, 'line', paint);

            break;
        case 'areas_naturales_protegidas':

            paint = {
                        'fill-color': 'purple',
                        'fill-opacity': .5
                    }

            agregar_vector(tableName, 'fill', paint);

            break;
        case 'zonas_amortiguamiento':

            paint = {
                        'fill-color': 'brown',
                        'fill-opacity': .5
                    }

            agregar_vector(tableName, 'fill', paint);

            break;
        case 'deforestacion_2014':

          paint = {
              'fill-color': 'yellow',
              'fill-opacity': 0.75,
              //'line-width': 2
          }

          agregar_vector(tableName, 'fill', paint);

          break;
        case 'deforestacion_2020':

          paint = {
              'fill-color': 'pink',
              'fill-opacity': 0.75,
              //'line-width': 2
          }

          agregar_vector(tableName, 'fill', paint);

          break;
        case 'cuencas_hidrograficas':

            paint = {
                        'fill-color': 'lightblue',
                        'fill-opacity': .5
                    }

            agregar_vector(tableName, 'fill', paint);

            break;
        case 'rios_quebradas':

            paint = {
                'line-color': 'blue',
                'line-opacity': 0.75,
                'line-width': 2
            }

            agregar_vector(tableName, 'line', paint);

            break;
          
        case 'interseccion_cafe_anp':

            paint = {
                'fill-color': '#FF0000',
                'fill-opacity': 0.75,
                //'line-width': 2
            }

            agregar_vector(tableName, 'fill', paint, null, 'cafe_labels');

            break;

        case 'interseccion_cafe_za':

          paint = {
              'fill-color': '#FFA500',
              'fill-opacity': 0.75,
              //'line-width': 2
          }

          agregar_vector(tableName, 'fill', paint, null, 'cafe_labels');

          break;

        case 'interseccion_cafe_deforestacion_2014':

          paint = {
              'fill-color': '#d6ff00',
              'fill-opacity': 0.75,
              //'line-width': 2
          }

          agregar_vector(tableName, 'fill', paint, null, 'cafe_labels');

          break;

        case 'interseccion_cafe_deforestacion_2020':

          paint = {
              'fill-color': '#7df9ff',
              'fill-opacity': 0.75,
              //'line-width': 2
          }

          agregar_vector(tableName, 'fill', paint, null, 'cafe_labels');

          break;
        
        case 'uso_actual_cajamarca':

          paint = {
              'fill-color': [ "match", ["get", "usos_suelo"],
                                  "Cuerpo de agua",
                                  "#2acfb6",
                                  "Otros usos",
                                  "#9bd977",
                                  "Uso agricola",
                                  "#d59463",
                                  "Uso agro industrial",
                                  "#da1eae",
                                  "Uso agropecuario",
                                  "#aa2a10",
                                  "Uso forestal",
                                  "#63ee83",
                                  "Uso minero",
                                  "#4e063d",
                                  "Uso pecuario",
                                  "#a249d6",
                                  "Uso urbano",
                                  "#d6da67",
                                  "#FFFFFF"
                              ],
              'fill-opacity':  0.5,
          }

          agregar_vector(tableName, 'fill', paint, null, 'cafe_labels');

          break;
        
        case 'uso_actual_cusco':

          paint = {
              'fill-color': [ "match", ["get", "usos_suelo"],
                                  "Areas de protección de bosque",
                                  "#24e631",
                                  "Areas de uso agrícola",
                                  "#d59463",
                                  "Areas de uso comunal tradicional",
                                  "#6939c8",
                                  "Areas de uso forestal",
                                  "#63ee83",
                                  "Areas de uso pastoreo",
                                  "#a249d6",
                                  "Areas naturales protegidas",
                                  "#008009",
                                  "Areas nivales",
                                  "#4183df",
                                  "#FFFFFF"
                              ],
              'fill-opacity':  0.5,
          }

          agregar_vector(tableName, 'fill', paint, null, 'cafe_labels');

          break;

        case 'uso_actual_junin':

          paint = {
              'fill-color': [ "match", ["get", "usos_suelo"],
                                  "Areas urbanas y/o instalaciones gubernamentales y privadas",
                                  "#5e5e5e",
                                  "Terrenos con bosques",
                                  "#63ee83",
                                  "Terrenos con cultivos extensivos (papa, camote, yuca, etc)",
                                  "#d59463",
                                  "Terrenos con hortalizas",
                                  "#aa2a10",
                                  "Terrenos con huertos de frutales y otros cultivos perennes",
                                  "#ff7a5f",
                                  "Terrenos sin uso y/o improductivos",
                                  "#d6da67",
                                  "Zonas de praderas naturales",
                                  "#a249d6",
                                  "#FFFFFF"
                              ],
              'fill-opacity':  0.5,
          }

          agregar_vector(tableName, 'fill', paint, null, 'cafe_labels');

          break;
        
        case 'uso_actual_huanuco':

          paint = {
              'fill-color': [ "match", ["get", "usos_suelo"],
                                  "Aeropuertos",
                                  "#646464",
                                  "Afloramientos rocosos",
                                  "#797878",
                                  "Áreas quemadas",
                                  "#e74346",
                                  "Bosque de galería y ripario",
                                  "#00b40c",
                                  "Bosque denso alto",
                                  "#00900a",
                                  "Bosque fragmentado",
                                  "#539858",
                                  "Cereales",
                                  "#e1c422",
                                  "Cultivos Agroforestales",
                                  "#00d870",
                                  "Cultivos Permanentes Arbustivos",
                                  "#03a959",
                                  "Cultivos Permanentes Herbáceos",
                                  "#017330",
                                  "Herbazal / área intervenida",
                                  "#eb7b8b",
                                  "Herbazal abierto",
                                  "#e65a0f",
                                  "Lagunas, lagos y ciénagas naturales permanentes",
                                  "#5c11e6",
                                  "Mosaico de cultivos, pastos y espacios naturales",
                                  "#d87ca1",
                                  "Oleaginosas y leguminosas",
                                  "#e39725",
                                  "Ríos",
                                  "#5c11e6",
                                  "Tejido urbano continuo",
                                  "#646464",
                                  "Tejido urbano discontinuo",
                                  "#646464",
                                  "Tierras desnudas",
                                  "#c66d00",
                                  "Tubérculos",
                                  "#f05c00",
                                  "Turberas",
                                  "#cb58bf",
                                  "Vegetación arbustiva / herbácea",
                                  "#2db865",
                                  "#FFFFFF"
                              ],
              'fill-opacity':  0.5,
          }

          agregar_vector(tableName, 'fill', paint, null, 'cafe_labels');

          break;
        
        case 'uso_actual_amazonas':

          paint = {
              'fill-color': [ "match", ["get", "desc_uso"],
                                  "Area de conservación Privada Abra Patricia",
                                  "#128510",
                                  "Area de Conservación Privada Huiquilla",
                                  "#128510",
                                  "Bosque de Protección Alto Mayo",
                                  "#13e813",
                                  "Centros Poblados",
                                  "#727173",
                                  "Cuerpos de Agua",
                                  "#19caca",
                                  "Frente de Conservación de Tierras de Protección",
                                  "#cbcb77",
                                  "Frente Productivo de Predominio Arrocero",
                                  "#edb23b",
                                  "Frente Productivo de Predominio Cafetalero",
                                  "#946810",
                                  "Frente Productivo de predominio de Agricultura de Subsistencia de Clima Tropical Subhúmedo a muy Húmedo",
                                  "#f58326",
                                  "Frente Productivo de Predominio de Agricultura de Subsistencia de Sistemas Intermontañosos",
                                  "#c46822",
                                  "Frente Productivo de Predominio de Cultivos Andinos",
                                  "#da8c51",
                                  "Frente Productivo de Predominio Ganadero",
                                  "#d28549",
                                  "Parque Nacional Ichighat Muja - Cordillera del Condor",
                                  "#13e813",
                                  "Reserva Comunal Tutanain",
                                  "#27e667",
                                  "Reserva Municipal de la Cuenca del Río Huamanpata",
                                  "#edb23b",
                                  "Zona Reservada Cordillera de Colan",
                                  "#db57dd",
                                  "Zona Reservada Santiago Comaina",
                                  "#db57dd",
                                  "#FFFFFF"
                              ],
              'fill-opacity':  0.5,
          }

          agregar_vector(tableName, 'fill', paint, null, 'cafe_labels');

          break;
        
        default:

          paint = {
              'fill-color': 'blue',
              'fill-opacity': 0.75,
              //'line-width': 2
          }

          agregar_vector(tableName, 'fill', paint, null, 'cafe_labels');
    }
    
}

var diccionarioCapasDatos = {
  parcelas_organicas:
  "Parcelas Orgánicas",

  parcelas_convencionales:
  "Parcelas Convencionales",

  red_vial_nacional:
  "Red Vial Nacional",

  red_vial_departamental:
  "Red Vial Departamental",

  red_vial_vecinal:
  "Red Vial Vecinal",

  areas_naturales_protegidas:
  "Areas Naturales Protegidas",

  zonas_amortiguamiento:
  "Zonas de Amortigüamiento",

  cuencas_hidrograficas:
  "Cuencas Hidrográficas",

  rios_quebradas:
  "Ríos y Quebradas",

  cafe:
  "Parcelas de café",

  interseccion_cafe_anp:
  "Parcelas de café en ANP",

  interseccion_cafe_za:
  "Parcelas de café en Zonas de Amortiguamiento",

  deforestacion_2014:
  "Deforestación 2014",

  deforestacion_2020:
  "Deforestación 2020",

  interseccion_cafe_deforestacion_2014:
  "Parcelas de café en Deforestacion 2014",

  interseccion_cafe_deforestacion_2020:
  "Parcelas de café en Deforestacion 2020",

  uso_actual_amazonas: "Uso Actual Amazonas",
  uso_actual_cajamarca: "Uso Actual Cajamarca",
  uso_actual_cusco: "Uso Actual Cusco",
  uso_actual_junin: "Uso Actual Junín",
  uso_actual_sanmartin: "Uso Actual San Martín",
  uso_actual_huanuco: "Uso Actual Huánuco"
}

async function agregar_leyenda(table_name){

  if($('.legend-section-capas .contenido').find('.' + table_name).length > 0){
    return;
  }
  
  var capas = map.getStyle().layers;
  console.log(capas);
  console.log(table_name);

  for(var k=0; k<capas.length; k++){

    if(table_name == capas[k].id){

      if('paint' in capas[k]){

        var div = '';

        var backgroundColor = "";

        var cursorPointer = "";

        table_name == 'interseccion_cafe_anp' ? cursorPointer = 'style="cursor:pointer"' : false;

        capas[k].type == 'fill' ? backgroundColor = capas[k].paint["fill-color"] : false;
        capas[k].type == 'line' ? backgroundColor = capas[k].paint["line-color"] : false;
        
        div += '<div class="d-flex '+ table_name +'" '+ cursorPointer +'>';
        // div += '<div style="background-color:'+ backgroundColor +'; width:11px; height:11px;border-radius: 3px;"></div>';

       
        if(table_name == 'interseccion_cafe_anp'){
          div += '<div class="subtitle-legend"><i class="fa-solid fa-chevron-right"></i></div>';
          div += '<div class="text-legend" data-bs-toggle="collapse" data-bs-target="#div-interseccion-anp" aria-expanded="true" style="margin-left: 0.25rem;color: #A8A8A8;">'+ diccionarioCapasDatos[table_name] +'</div>';
        }
        else if(table_name == 'interseccion_cafe_za'){
          div += '<div class="subtitle-legend"><i class="fa-solid fa-chevron-right"></i></div>';
          div += '<div class="text-legend" data-bs-toggle="collapse" data-bs-target="#div-interseccion-za" aria-expanded="true" style="margin-left: 0.25rem;color: #A8A8A8;">'+ diccionarioCapasDatos[table_name] +'</div>';
        }
        else if(table_name == 'interseccion_cafe_deforestacion_2014'){
          div += '<div class="subtitle-legend"><i class="fa-solid fa-chevron-right"></i></div>';
          div += '<div class="text-legend" data-bs-toggle="collapse" data-bs-target="#div-interseccion-2014" aria-expanded="true" style="margin-left: 0.25rem;color: #A8A8A8;">'+ diccionarioCapasDatos[table_name] +'</div>';
        }
        else if(table_name == 'interseccion_cafe_deforestacion_2020'){
          div += '<div class="subtitle-legend"><i class="fa-solid fa-chevron-right"></i></div>';
          div += '<div class="text-legend" data-bs-toggle="collapse" data-bs-target="#div-interseccion-2020" aria-expanded="true" style="margin-left: 0.25rem;color: #A8A8A8;">'+ diccionarioCapasDatos[table_name] +'</div>';
        }
        else if(table_name.includes("uso_actual")){
          div += '<div style="background-color:'+ backgroundColor +'; width:11px; height:11px;border-radius: 3px;"></div>';
          div += '<div class="text-legend" style="margin-left: 11px;margin-right:35px;font-weight:bold">'+ diccionarioCapasDatos[table_name] +'</div>';
        }
        else{
          div += '<div style="background-color:'+ backgroundColor +'; width:11px; height:11px;border-radius: 3px;"></div>';
          div += '<div class="text-legend" style="margin-left: 11px">'+ diccionarioCapasDatos[table_name] +'</div>';
        }

        div += '</div>';

        if(table_name == 'interseccion_cafe_anp' || table_name == 'interseccion_cafe_za' || table_name == 'interseccion_cafe_deforestacion_2014'|| table_name == 'interseccion_cafe_deforestacion_2020'){

          var _url = "";
          var _clase = "";

          if(table_name == "interseccion_cafe_anp"){
            _url = "bounds-interseccion";
            _clase = "anp";
          }
          else if(table_name == "interseccion_cafe_za"){
            _url = "bounds-interseccion-za";
            _clase = "za";
          }
          else if(table_name == "interseccion_cafe_deforestacion_2014"){
            _url = "bounds-interseccion-2014";
            _clase = "2014";
          }
          else if(table_name == "interseccion_cafe_deforestacion_2020"){
            _url = "bounds-interseccion-2020";
            _clase = "2020";
          }

          //Si es la interseccion con las ANP
          var bounds = await $.ajax({
                        url: _url,
                        method: 'GET'
                      })
          
          console.log(bounds);

          bounds = agrupar_por_zona(bounds);

          console.log(bounds);

          div += '<div class="collapse show" id="div-interseccion-'+ _clase +'">';

          for(var i=0; i<bounds.zonas.length; i++){
            div += '<div class="d-flex '+ table_name +'" style="cursor:pointer; margin-left: 1.2rem">';
            // div += '<div style="background-color:'+ backgroundColor +'; width:11px; height:11px;border-radius: 3px;"></div>';
            div += '<div class="subtitle-legend"><i class="fa-solid fa-chevron-right"></i></div>';
            div += '<div class="text-legend" data-bs-toggle="collapse" data-bs-target="#div-interseccion-parcelas-'+ _clase +'-'+ i +'" aria-expanded="false" style="margin-left: 0.25rem;color: #A8A8A8;">'+ bounds.zonas[i] + ' (' + bounds.agrupado[bounds.zonas[i]].length +') </div>';

            div += '</div>';

            div += '<div class="collapse" id="div-interseccion-parcelas-'+ _clase +'-'+ i +'" style="margin-left:11px">';

            for(var j=0; j<bounds.agrupado[bounds.zonas[i]].length; j++){

              var ele = bounds.agrupado[bounds.zonas[i]][j];
              
              div += '<div class="d-flex '+ table_name +'" style="cursor:pointer; margin-left: 11px">';
              div += '<div style="background-color:'+ backgroundColor +'; width:11px; height:11px;border-radius: 3px;"></div>';

              div += '<div class="text-legend legend-parcelas-interseccion" style="margin-left: 11px;" data-max-lat="'+ ele.max_lat +'" data-max-lng="'+ ele.max_lng +'" data-min-lat="'+ ele.min_lat +'" data-min-lng="'+ ele.min_lng +'">'+ ele.nombre + ' - ' + ele.productor_codigo +'</div>';

              div += '</div>';

            }

            div += '</div>'; //div-interseccion-parcelas-anp-i

          }
          
          div += '</div>';

        }
        else if (table_name.includes("uso_actual")){

          console.log(capas[k]);

          div += '<div class="collapse show" id="div-interseccion-'+ _clase +'">';

          //for(var i=0; i<estilosPersonalizadoUsoActual.zonas.length; i++){
          for(var key in estilosPersonalizadoUsoActual[table_name]){
            div += '<div class="d-flex '+ table_name +'" style="cursor:pointer; margin-left: 1.2rem">';
            // div += '<div style="background-color:'+ backgroundColor +'; width:11px; height:11px;border-radius: 3px;"></div>';
            /*
            div += '<div class="subtitle-legend"><i class="fa-solid fa-chevron-right"></i></div>';
            div += '<div class="text-legend" data-bs-toggle="collapse" data-bs-target="#div-'+ table_name +'" aria-expanded="false" style="margin-left: 0.25rem;color: '+ estilosPersonalizadoUsoActual[table_name][key] +';">'+ key + '</div>';
            */

            div += '<div style="background-color:'+ estilosPersonalizadoUsoActual[table_name][key] +'; width:11px; height:11px;border-radius: 3px;"></div>';
            div += '<div class="text-legend" style="margin-left: 11px">'+ key +'</div>';

            div += '</div>';

          }
          
          div += '</div>';

        }

        $('.legend-section-capas .contenido').append(div);

      }

    }   

  }

}

function quitar_leyenda(table_name){

  $('.legend-section-capas .contenido').find('.' + table_name).remove();

}

$('.legend-section-capas').on('click', '.legend-parcelas-interseccion', function(){
    var max_lat = $(this).attr('data-max-lat');
    var max_lng = $(this).attr('data-max-lng');
    var min_lat = $(this).attr('data-min-lat');
    var min_lng = $(this).attr('data-min-lng');

    var bounds = [[min_lng, min_lat], [max_lng, max_lat]];
    map.fitBounds(bounds, {padding: 50});

})

/*
$('.legend-section-capas').on('click', '.interseccion_cafe_anp', function(e){
  console.log(1);
  
  if($('.legend-section-capas .legend-parcelas-interseccion').is(':visible')){
    $('.legend-section-capas .legend-parcelas-interseccion').parent().fadeOut();
  }
  else{
    $('.legend-section-capas .legend-parcelas-interseccion').parent().fadeIn();
  }

})
*/

function agrupar_por_zona(data){
  var zonas = [];

  for(var i=0; i<data.length; i++){
    zonas.push(data[i].descripcion)
  }

  // Paso 1: Convertir el arreglo a un Set para eliminar duplicados
  zonas = new Set(zonas);

  // Paso 2: Convertir el Set nuevamente a un arreglo
  zonas = Array.from(zonas);

  // Paso 3: Ordenar alfabéticamente el arreglo
  zonas.sort();

  var dict = {
    zonas : zonas
  }

  var agrupado = {}

  for(var i=0; i<zonas.length; i++){
    agrupado[zonas[i]] = [];
    for(var j=0; j<data.length; j++){
      if(data[j].descripcion == zonas[i])
        agrupado[zonas[i]].push(data[j]);
    }
  }

  dict["agrupado"] = agrupado;

  return dict;
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


$('.maplibregl-map').on('click', '.btn-descargar-reporte-parcela', function(){
  // Llamada a la función con el array de datos
  //alert(1);
  console.log('se descargó el reporte de la parcela');
  //console.log(detalle_unidad_productiva);

  data_reporte_dict[0].codigo_parcela = detalle_unidad_productiva[0].id;
  data_reporte_dict[0].parcela = detalle_unidad_productiva[0].nombre;
  data_reporte_dict[0].codigo_productor = detalle_unidad_productiva[0].productor_codigo;

  detalle_unidad_productiva[0].Productor != null ? data_reporte_dict[0].productor = detalle_unidad_productiva[0].Productor.nombre : data_reporte_dict[0].productor = 'null';
  
  detalle_unidad_productiva[0].Variedad != null ? data_reporte_dict[0].variedad = detalle_unidad_productiva[0].Variedad.descripcion : data_reporte_dict[0].variedad = 'null';
  data_reporte_dict[0].altitud = detalle_unidad_productiva[0].altitud;

  detalle_unidad_productiva[0].Sello != null ? data_reporte_dict[0].sello = detalle_unidad_productiva[0].Sello.descripcion : data_reporte_dict[0].sello = 'null';

  detalle_unidad_productiva[0].Corredor != null ? data_reporte_dict[0].corredor = detalle_unidad_productiva[0].Corredor.descripcion : data_reporte_dict[0].corredor = 'null';

  detalle_unidad_productiva[0].Comite != null ? data_reporte_dict[0].comite = detalle_unidad_productiva[0].Comite.descripcion : data_reporte_dict[0].comite = 'null';

  detalle_unidad_productiva[0].Zona != null ? data_reporte_dict[0].zona = detalle_unidad_productiva[0].Zona.descripcion : data_reporte_dict[0].zona = 'null';
  
  detalle_unidad_productiva[0].CuencaHidrografica != null ? data_reporte_dict[0].cuenca = detalle_unidad_productiva[0].CuencaHidrografica.descripcion : data_reporte_dict[0].cuenca = 'null';

  detalle_unidad_productiva[0].Caserio != null ? data_reporte_dict[0].caserio = detalle_unidad_productiva[0].Caserio.descripcion : data_reporte_dict[0].caserio = 'null';

  data_reporte_dict[0].codigo_venta = detalle_unidad_productiva[0].codigo_venta;
  data_reporte_dict[0].area_ha = detalle_unidad_productiva[0].area_poly_ha;
  data_reporte_dict[0].ints_anp_m2 = detalle_unidad_productiva[0].area_ints_anp_m2;
  data_reporte_dict[0].ints_za_m2 = detalle_unidad_productiva[0].area_ints_za_m2;
  data_reporte_dict[0].ints_d14_m2 = detalle_unidad_productiva[0].area_ints_deforestacion_2014_m2;
  data_reporte_dict[0].ints_d20_m2 = detalle_unidad_productiva[0].area_ints_deforestacion_2020_m2;

  console.log(data_reporte_dict);

  exportar_excel(data_reporte_dict);
  
});


// function exportar_excel(datos) {

//   // Crear una nueva hoja de cálculo
//   var workbook = XLSX.utils.book_new();

//   // Crear una hoja de trabajo
//   var hojaDeTrabajo = XLSX.utils.json_to_sheet(datos);

//   // Definir las columnas que quieres en el archivo Excel
//   var columnas = [
//     { header: "codigo_parcela", key: "codigo_parcela" },
//     { header: "parcela", key: "parcela" },
//     { header: "codigo_productor", key: "codigo_productor" },
//     { header: "productor", key: "productor" },
//     { header: "variedad", key: "variedad" },
//     { header: "altitud", key: "altitud" },
//     { header: "sello", key: "sello" },
//     { header: "corredor", key: "corredor" },
//     { header: "comite", key: "comite" },
//     { header: "zona", key: "zona" },
//     { header: "cuenca", key: "cuenca" },
//     { header: "caserio", key: "caserio" },
//     { header: "codigo_venta", key: "codigo_venta" },
//     { header: "area_ha", key: "area_ha" },
//     { header: "ints_anp_m2", key: "ints_anp_m2" },
//     { header: "ints_za_m2", key: "ints_za_m2" },
//     { header: "ints_d14_m2", key: "ints_d14_m2" },
//     { header: "ints_d20_m2", key: "ints_d20_m2" },
//   ];

//   // Configurar el ancho de las columnas
//   hojaDeTrabajo['!cols'] = columnas.map(columna => ({ width: 15 }));

//   // Sobrescribir la hoja de trabajo en lugar de agregar a la existente
//   XLSX.utils.book_append_sheet(workbook, hojaDeTrabajo, 'Datos');

//   // Convertir el libro de trabajo a un archivo de Excel binario
//   var excelData = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });

//   // Descargar el archivo de Excel
//   var blob = new Blob([s2ab(excelData)], { type: 'application/octet-stream' });
//   var url = URL.createObjectURL(blob);
//   var link = document.createElement('a');
//   link.href = url;
//   link.download = 'datos.xlsx';
//   link.click();
// }

// Función para convertir una cadena de caracteres en un ArrayBuffer
function s2ab(s) {
  var buf = new ArrayBuffer(s.length);
  var view = new Uint8Array(buf);
  for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
  return buf;
}


/*Tmp---*/
var estilosPersonalizadoUsoActual = {
	uso_actual_cajamarca: {
		"Cuerpo de agua":
		  "#2acfb6",
		  "Otros usos":
		  "#9bd977",
		  "Uso agricola":
		  "#d59463",
		  "Uso agro industrial":
		  "#da1eae",
		  "Uso agropecuario":
		  "#aa2a10",
		  "Uso forestal":
		  "#63ee83",
		  "Uso minero":
		  "#4e063d",
		  "Uso pecuario":
		  "#a249d6",
		  "Uso urbano":
		  "#d6da67"
	},
	uso_actual_cusco: {
		"Areas de protección de bosque":
                  "#24e631",
                  "Areas de uso agrícola":
                  "#d59463",
                  "Areas de uso comunal tradicional":
                  "#6939c8",
                  "Areas de uso forestal":
                  "#63ee83",
                  "Areas de uso pastoreo":
                  "#a249d6",
                  "Areas naturales protegidas":
                  "#008009",
                  "Areas nivales":
                  "#4183df"
	},
	uso_actual_junin: {
		"Areas urbanas y/o instalaciones gubernamentales y privadas":
		  "#5e5e5e",
		  "Terrenos con bosques":
		  "#63ee83",
		  "Terrenos con cultivos extensivos (papa, camote, yuca, etc)":
		  "#d59463",
		  "Terrenos con hortalizas":
		  "#aa2a10",
		  "Terrenos con huertos de frutales y otros cultivos perennes":
		  "#ff7a5f",
		  "Terrenos sin uso y/o improductivos":
		  "#d6da67",
		  "Zonas de praderas naturales":
		  "#a249d6"
	},
	uso_actual_huanuco: {
		              "Aeropuertos":
                  "#646464",
                  "Afloramientos rocosos":
                  "#797878",
                  "Áreas quemadas":
                  "#e74346",
                  "Bosque de galería y ripario":
                  "#00b40c",
                  "Bosque denso alto":
                  "#00900a",
                  "Bosque fragmentado":
                  "#539858",
                  "Cereales":
                  "#e1c422",
                  "Cultivos Agroforestales":
                  "#00d870",
                  "Cultivos Permanentes Arbustivos":
                  "#03a959",
                  "Cultivos Permanentes Herbáceos":
                  "#017330",
                  "Herbazal / área intervenida":
                  "#eb7b8b",
                  "Herbazal abierto":
                  "#e65a0f",
                  "Lagunas, lagos y ciénagas naturales permanentes":
                  "#5c11e6",
                  "Mosaico de cultivos, pastos y espacios naturales":
                  "#d87ca1",
                  "Oleaginosas y leguminosas":
                  "#e39725",
                  "Ríos":
                  "#5c11e6",
                  "Tejido urbano continuo":
                  "#646464",
                  "Tejido urbano discontinuo":
                  "#646464",
                  "Tierras desnudas":
                  "#c66d00",
                  "Tubérculos":
                  "#f05c00",
                  "Turberas":
                  "#cb58bf",
                  "Vegetación arbustiva / herbácea":
                  "#2db865"
	},
	uso_actual_amazonas: {
		"Area de conservación Privada Abra Patricia":
		  "#128510",
		  "Area de Conservación Privada Huiquilla":
		  "#128510",
		  "Bosque de Protección Alto Mayo":
		  "#13e813",
		  "Centros Poblados":
		  "#727173",
		  "Cuerpos de Agua":
		  "#19caca",
		  "Frente de Conservación de Tierras de Protección":
		  "#cbcb77",
		  "Frente Productivo de Predominio Arrocero":
		  "#edb23b",
		  "Frente Productivo de Predominio Cafetalero":
		  "#946810",
		  "Frente Productivo de predominio de Agricultura de Subsistencia de Clima Tropical Subhúmedo a muy Húmedo":
		  "#f58326",
		  "Frente Productivo de Predominio de Agricultura de Subsistencia de Sistemas Intermontañosos":
		  "#c46822",
		  "Frente Productivo de Predominio de Cultivos Andinos":
		  "#da8c51",
		  "Frente Productivo de Predominio Ganadero":
		  "#d28549",
		  "Parque Nacional Ichighat Muja - Cordillera del Condor":
		  "#13e813",
		  "Reserva Comunal Tutanain":
		  "#27e667",
		  "Reserva Municipal de la Cuenca del Río Huamanpata":
		  "#edb23b",
		  "Zona Reservada Cordillera de Colan":
		  "#db57dd",
		  "Zona Reservada Santiago Comaina":
		  "#db57dd"
	}
}