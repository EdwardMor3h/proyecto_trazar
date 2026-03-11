/*
ndvi
mapa-indices.js:232 evi
mapa-indices.js:232 evi2
mapa-indices.js:232 ndwi
mapa-indices.js:232 mcari
mapa-indices.js:232 reci
*/

var gDataLegend = {
    ndvi : {
        title : ['NDVI - Normalized Difference Vegetation Index'],
        palette : ["#FF0000",'#FF9300',"#F7FF00", '#55EE0D','#3B8917'],
        names : ['Suelo sin vegetación','Enferma','Medianamente saludable','Saludable','Muy saludable']
    },
    evi : {
        title : ['EVI 01 - Enhanced Vegetation Index'],
        palette : ["#FF0000",'#FF9300',"#F7FF00", '#55EE0D','#3B8917'],
        names : ['Suelo sin vegetación','Enferma','Medianamente saludable','Saludable','Muy saludable X']
    },
    evi2 : {
        title : ['EVI 02 - Enhanced Vegetation Index'],
        palette : ["#FF0000",'#FF9300',"#F7FF00", '#55EE0D','#3B8917'],
        names : ['Suelo sin vegetación','Enferma','Medianamente saludable','Saludable','Muy saludable Y']
    },
    ndwi : {
        title : ['NDWI - Normalized Difference Water Index'],
        palette : ["#Fff947",'#b9fa3e',"#5ce5d3", '#5172f4','#0D176B'],
        names : ['Muy bajo','Bajo','Medio','Alto','Muy alto']  
    },
    mcari : {
        title : ['MCARI - Modified Chlorophyll Absortion in Reflectance Index'],
        palette : ["#FF0000",'#FF9300',"#F7FF00", '#55EE0D','#3B8917'],
        names : ['Muy baja absorción','Baja absorción','Media absorción','Alta absorción','Muy alta absorción']
    },
    reci : {
        title : ['RECI - Red-Edge Chlorophyll Vegetation Index'],
        palette : ["#FF0000",'#FF9300',"#F7FF00", '#55EE0D','#3B8917'],
        names : ['Muy baja actividad fotosintética','Baja actividad fotosintética','Media actividad fotosintética','Alta actividad fotosintética','Muy alta actividad fotosintética'] 
    }
}