const path = require('path');
const express = require('express');
const cors = require('cors');
const router = express.Router();

const multer = require('multer'); // Middleware para manejo de archivos

//Autenticacion
const crypto = require('crypto');
const SessionTokenController = require('./controllers/SessionTokenController');

// Importar los controladores
const productorController = require('./controllers/ProductorController');
const unidadProductivaController = require('./controllers/UnidadProductivaController');

const campanhaController = require('./controllers/CampanhaController');
const campanhaVariedadController = require('./controllers/CampanhaVariedadController');
const selloController = require('./controllers/SelloController');
const caserioController = require('./controllers/CaserioController');
const comiteController = require('./controllers/ComiteController');
const altitudCatController = require('./controllers/AltitudCatController');
const zonaController = require('./controllers/ZonaController');
const corredorController = require('./controllers/CorredorController');
const variedadController = require('./controllers/VariedadController');
const extensionistaController = require('./controllers/ExtensionistaController');
const promotorController = require('./controllers/PromotorController');
const cuencaHidrograficaController = require('./controllers/CuencaHidrograficaController');
const generalController = require('./controllers/GeneralController');
const historialIndiceParcelaCafeController = require('./controllers/HistorialIndiceParcelaCafeController');
const sexoController = require('./controllers/SexoController');
const usuarioController = require('./controllers/UsuarioController');
const texturaSueloController = require('./controllers/TexturaSueloController');
const estudioSueloController = require('./controllers/EstudioSueloController');
const guardarBackupAppController = require('./controllers/GuardarBackupAppController');

const parcelaCafeController = require('./controllers/ParcelaCafeController');

const unidadProductivaCodigoVentaController = require('./controllers/UnidadProductivaCodigoVentaController');

const Usuario = require('./models/Usuario');
const Rol = require('./models/Rol');
const Zona = require('./models/Zona');

const port = 3000;

const app = express();

// initialize Google Earth Engine once at startup per updated platform policies
const { initializeEarthEngine } = require('./utils/earthEngine');
initializeEarthEngine().catch(err => {
    console.error('Earth Engine initialization failed at startup:', err);
});

app.use(cors());

var session = require('express-session');

app.set('view engine', 'ejs');

app.use( session( {
    /* Aquí irían los atributos de nuestra sesión, como claves,
        * cómo se guarda, tiempo de expiración, etc...
        */
    secret : 'fñdklsaj90($=")#($=)fkldsjflku234',
    resave: false,
    saveUninitialized: false
}));

// Aumentar el timeout del servidor a 5 minutos (300000 ms)
app.use((req, res, next) => {
    req.setTimeout(3600000);  // 60 minutos
    //req.setTimeout(5000);
    next();
  });

var bodyParser = require('body-parser');
const UnidadProductivaCodigoVenta = require('./models/UnidadProductivaCodigoVenta');

app.use(bodyParser.urlencoded({
    extended: true    
}));

app.use(bodyParser.json({limit: '50mb'}));

/*
const busboyBodyParser = require('busboy-body-parser'); // Agrega esta línea
// Utiliza busboy-body-parser para solicitudes multipart/form-data
app.use(busboyBodyParser()); // Agrega esta línea
*/

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

//app.use(express.json());

/*
app.get('/', (req, res) => {

    //res.send('Hola mundo');
    res.sendFile(path.join(__dirname, '/views/mapa-indices.html'));

});
*/

// Configuración de multer para guardar el archivo en el servidor
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); // Carpeta donde se guardarán los archivos
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
  });
  
const upload = multer({ storage: storage });

app.post('/cargar-csv-unidad-productiva', upload.single('csvFile'), unidadProductivaController.cargarCSVUnidadProductiva);
app.post('/cargar-csv-eliminar-unidad-productiva', upload.single('csvFile'), unidadProductivaController.cargarCSVEliminarUnidadProductiva);
app.post('/cargar-csv-productor', upload.single('csvFile'), productorController.cargarCSVProductor);
app.post('/cargar-csv-crear-unidad-productiva', upload.single('csvFile'), unidadProductivaController.cargarCSVCrearUnidadProductiva);

app.post('/cargar-csv-crear-caserio', upload.single('csvFile'), caserioController.cargarCSVCrearCaserio);
app.post('/cargar-csv-crear-comite', upload.single('csvFile'), comiteController.cargarCSVCrearComite);
app.post('/cargar-csv-crear-codigo-venta-unidad-productiva', upload.single('csvFile'), unidadProductivaCodigoVentaController.cargarCSVCrearUnidadProductivaCodigoVenta);

app.get('/status', function(req, res) {

    const user = req.session.user;

    if (user && user.id) {
        // El usuario ha iniciado sesión, renderizar la página de perfil
        res.render('status_envios_app', { user });
    } else {
        // El usuario no ha iniciado sesión o la sesión no está establecida
        // Redirigirlo a la página de inicio de sesión
        res.redirect('/');
    }

    // Renderizar la vista 'perfil.ejs' y pasar los datos del usuario
    

    //res.sendFile(path.join(__dirname, '/views/mapa-indices.html'));

});


const sequelize = require("./config/database");

sequelize.authenticate()
.then(() => {
    console.log("✅ Conectado a PostgreSQL");
})
.catch(err => {
    console.error("❌ Error de conexión:", err);
});

app.get('/visor', function(req, res) {

    const user = req.session.user;

    if (user && user.id) {
        // El usuario ha iniciado sesión, renderizar la página de perfil
        res.render('mapa-indices', { user });
    } else {
        // El usuario no ha iniciado sesión o la sesión no está establecida
        // Redirigirlo a la página de inicio de sesión
        res.redirect('/');
    }

    // Renderizar la vista 'perfil.ejs' y pasar los datos del usuario
    

    //res.sendFile(path.join(__dirname, '/views/mapa-indices.html'));

});

app.get('/reportes', function(req, res) {

    const user = req.session.user;

    if (user && user.id) {
        // El usuario ha iniciado sesión, renderizar la página de perfil
        res.render('reportes', { user });
    } else {
        // El usuario no ha iniciado sesión o la sesión no está establecida
        // Redirigirlo a la página de inicio de sesión
        res.redirect('/');
    }

});

app.get('/admin_datos/agregar_parcela', function(req, res) {

    //res.sendFile(path.join(__dirname, '/views/admin_datos_agregar_parcela.html'));
    const user = req.session.user;

    if (user && user.id) {
        // El usuario ha iniciado sesión, renderizar la página de perfil
        res.render('admin_datos_agregar_parcela', { user });
    } else {
        // El usuario no ha iniciado sesión o la sesión no está establecida
        // Redirigirlo a la página de inicio de sesión
        res.redirect('/');
    }

});

app.get('/admin_datos/actualizar_parcela', function(req, res) {

    //res.sendFile(path.join(__dirname, '/views/admin_datos_actualizar_parcela.html'));
    const user = req.session.user;

    if (user && user.id) {
        // El usuario ha iniciado sesión, renderizar la página de perfil
        res.render('admin_datos_actualizar_parcela', { user });
    } else {
        // El usuario no ha iniciado sesión o la sesión no está establecida
        // Redirigirlo a la página de inicio de sesión
        res.redirect('/');
    }

});

app.get('/admin_datos/actualizar_productor', function(req, res) {

    //res.sendFile(path.join(__dirname, '/views/admin_datos_actualizar_productor.html'));
    const user = req.session.user;

    if (user && user.id) {
        // El usuario ha iniciado sesión, renderizar la página de perfil
        res.render('admin_datos_actualizar_productor', { user });
    } else {
        // El usuario no ha iniciado sesión o la sesión no está establecida
        // Redirigirlo a la página de inicio de sesión
        res.redirect('/');
    }

});

app.get('/admin_datos/actualizar_campanha', function(req, res) {

    //res.sendFile(path.join(__dirname, '/views/admin_datos_actualizar_campanha.html'));
    const user = req.session.user;

    if (user && user.id) {
        // El usuario ha iniciado sesión, renderizar la página de perfil
        res.render('admin_datos_actualizar_campanha', { user });
    } else {
        // El usuario no ha iniciado sesión o la sesión no está establecida
        // Redirigirlo a la página de inicio de sesión
        res.redirect('/');
    }

});

app.get('/admin_datos/actualizar_estudio_suelo', function(req, res) {

    //res.sendFile(path.join(__dirname, '/views/admin_datos_actualizar_estudio_suelo.html'));
    const user = req.session.user;

    if (user && user.id) {
        // El usuario ha iniciado sesión, renderizar la página de perfil
        res.render('admin_datos_actualizar_estudio_suelo', { user });
    } else {
        // El usuario no ha iniciado sesión o la sesión no está establecida
        // Redirigirlo a la página de inicio de sesión
        res.redirect('/');
    }

});

app.get('/admin_datos/actualizar_variedad', function(req, res) {

    //res.sendFile(path.join(__dirname, '/views/admin_datos_actualizar_variedad.html'));
    const user = req.session.user;

    if (user && user.id) {
        // El usuario ha iniciado sesión, renderizar la página de perfil
        res.render('admin_datos_actualizar_variedad', { user });
    } else {
        // El usuario no ha iniciado sesión o la sesión no está establecida
        // Redirigirlo a la página de inicio de sesión
        res.redirect('/');
    }

});

app.get('/admin_datos/actualizar_corredor', function(req, res) {

    //res.sendFile(path.join(__dirname, '/views/admin_datos_actualizar_corredor.html'));
    const user = req.session.user;

    if (user && user.id) {
        // El usuario ha iniciado sesión, renderizar la página de perfil
        res.render('admin_datos_actualizar_corredor', { user });
    } else {
        // El usuario no ha iniciado sesión o la sesión no está establecida
        // Redirigirlo a la página de inicio de sesión
        res.redirect('/');
    }

});

app.get('/admin_datos/actualizar_zona', function(req, res) {

    //res.sendFile(path.join(__dirname, '/views/admin_datos_actualizar_zona.html'));
    const user = req.session.user;

    if (user && user.id) {
        // El usuario ha iniciado sesión, renderizar la página de perfil
        res.render('admin_datos_actualizar_zona', { user });
    } else {
        // El usuario no ha iniciado sesión o la sesión no está establecida
        // Redirigirlo a la página de inicio de sesión
        res.redirect('/');
    }

});

app.get('/admin_datos/actualizar_promotor', function(req, res) {

    //res.sendFile(path.join(__dirname, '/views/admin_datos_actualizar_promotor.html'));
    const user = req.session.user;

    if (user && user.id) {
        // El usuario ha iniciado sesión, renderizar la página de perfil
        res.render('admin_datos_actualizar_promotor', { user });
    } else {
        // El usuario no ha iniciado sesión o la sesión no está establecida
        // Redirigirlo a la página de inicio de sesión
        res.redirect('/');
    }

});

app.get('/admin_datos/actualizar_extensionista', function(req, res) {

    //res.sendFile(path.join(__dirname, '/views/admin_datos_actualizar_extensionista.html'));
    const user = req.session.user;

    if (user && user.id) {
        // El usuario ha iniciado sesión, renderizar la página de perfil
        res.render('admin_datos_actualizar_extensionista', { user });
    } else {
        // El usuario no ha iniciado sesión o la sesión no está establecida
        // Redirigirlo a la página de inicio de sesión
        res.redirect('/');
    }

});

app.get('/admin_datos/actualizar_sello', function(req, res) {

    //res.sendFile(path.join(__dirname, '/views/admin_datos_actualizar_sello.html'));
    const user = req.session.user;

    if (user && user.id) {
        // El usuario ha iniciado sesión, renderizar la página de perfil
        res.render('admin_datos_actualizar_sello', { user });
    } else {
        // El usuario no ha iniciado sesión o la sesión no está establecida
        // Redirigirlo a la página de inicio de sesión
        res.redirect('/');
    }

});

app.get('/admin_datos/actualizar_cuenca_hidrografica', function(req, res) {

    //res.sendFile(path.join(__dirname, '/views/admin_datos_actualizar_sello.html'));
    const user = req.session.user;

    if (user && user.id) {
        // El usuario ha iniciado sesión, renderizar la página de perfil
        res.render('admin_datos_actualizar_cuenca_hidrografica', { user });
    } else {
        // El usuario no ha iniciado sesión o la sesión no está establecida
        // Redirigirlo a la página de inicio de sesión
        res.redirect('/');
    }

});

app.get('/admin_datos/actualizar_caserio', function(req, res) {

    //res.sendFile(path.join(__dirname, '/views/admin_datos_actualizar_caserio.html'));
    const user = req.session.user;

    if (user && user.id) {
        // El usuario ha iniciado sesión, renderizar la página de perfil
        res.render('admin_datos_actualizar_caserio', { user });
    } else {
        // El usuario no ha iniciado sesión o la sesión no está establecida
        // Redirigirlo a la página de inicio de sesión
        res.redirect('/');
    }

});

app.get('/admin_datos/actualizar_comite', function(req, res) {

    //res.sendFile(path.join(__dirname, '/views/admin_datos_actualizar_comite.html'));
    const user = req.session.user;

    if (user && user.id) {
        // El usuario ha iniciado sesión, renderizar la página de perfil
        res.render('admin_datos_actualizar_comite', { user });
    } else {
        // El usuario no ha iniciado sesión o la sesión no está establecida
        // Redirigirlo a la página de inicio de sesión
        res.redirect('/');
    }

});

app.get('/admin_datos/actualizar_codigo_venta', function(req, res) {

    //res.sendFile(path.join(__dirname, '/views/admin_datos_actualizar_comite.html'));
    const user = req.session.user;

    if (user && user.id) {
        // El usuario ha iniciado sesión, renderizar la página de perfil
        res.render('admin_datos_actualizar_codigo_venta', { user });
    } else {
        // El usuario no ha iniciado sesión o la sesión no está establecida
        // Redirigirlo a la página de inicio de sesión
        res.redirect('/');
    }

});

app.get('/admin_cuentas/administrador', function(req, res) {

    const user = req.session.user;

    if (user && user.id) {
        // El usuario ha iniciado sesión, renderizar la página de perfil
        res.render('admin_cuentas_administrador', { user });
    } else {
        // El usuario no ha iniciado sesión o la sesión no está establecida
        // Redirigirlo a la página de inicio de sesión
        res.redirect('/');
    }
});

app.get('/admin_cuentas/extensionista', function(req, res) {

    //res.sendFile(path.join(__dirname, '/views/admin_cuentas_extensionista.html'));
    const user = req.session.user;

    if (user && user.id) {
        // El usuario ha iniciado sesión, renderizar la página de perfil
        res.render('admin_cuentas_extensionista', { user });
    } else {
        // El usuario no ha iniciado sesión o la sesión no está establecida
        // Redirigirlo a la página de inicio de sesión
        res.redirect('/');
    }

});

app.get('/admin_cuentas/gestion', function(req, res) {

    //res.sendFile(path.join(__dirname, '/views/admin_cuentas_gestion.html'));
    const user = req.session.user;

    if (user && user.id) {
        // El usuario ha iniciado sesión, renderizar la página de perfil
        res.render('admin_cuentas_gestion', { user });
    } else {
        // El usuario no ha iniciado sesión o la sesión no está establecida
        // Redirigirlo a la página de inicio de sesión
        res.redirect('/');
    }

});

app.get('/gee', function(req, res) {

    res.sendFile(path.join(__dirname, '/public/temp.html'));

});


const server = app.listen(port, () => {

    console.log(`Servidor iniciado en el puerto ${port}`)

});

// Configurar el tiempo de espera del servidor (ej. 10 minutos)
server.setTimeout(10 * 60 * 1000);

// Rutas para obtener todos los objetos de cada modelo
app.get('/productores', productorController.getAllProductores);
app.get('/unidades-productivas', unidadProductivaController.getAllUnidadesProductivas);
app.get('/campanhas', campanhaController.getAllCampanhas);
app.get('/campanha-variedades', campanhaVariedadController.getAllCampanhaVariedades);
app.get('/caserios', caserioController.getAllCaserios);
app.get('/sellos', selloController.getAllSellos);
app.get('/comites', comiteController.getAllComites);
app.get('/altitud-cat', altitudCatController.getAllAltitudCats);
app.get('/zonas', zonaController.getAllZonas);
app.get('/corredores', corredorController.getAllCorredores);
app.get('/variedades', variedadController.getAllVariedades);
app.get('/extensionistas', extensionistaController.getAllExtensionistas);
app.get('/promotores', promotorController.getAllPromotores);
app.get('/cuencas_hidrograficas', cuencaHidrograficaController.getAllCuencaHidrograficas);
app.get('/sexos', sexoController.getAllSexos);
app.get('/usuarios', usuarioController.getAllUsuarios);

app.get('/codigos_venta', unidadProductivaController.getAllCodigoVenta);
app.get('/texturas-suelo', texturaSueloController.getAllTexturaSuelos);
app.get('/estudios-suelo', estudioSueloController.getAllEstudioSuelos);
app.get('/backups-app', guardarBackupAppController.getAllElementos);
app.get('/unidad_productiva_codigo_ventas', unidadProductivaCodigoVentaController.getAllUnidadProductivaCodigoVentas);
app.get('/filtrar-codigo-venta-unico', unidadProductivaCodigoVentaController.getDistinctCodigoVentas);

app.get('/filtrar-unidad-productiva-tabla-atributos', unidadProductivaController.filterUnidadProductivaTablaAtributos);
//app.get('/filtrar-unidades-productivas', unidadProductivaController.filterUnidadesProductivasPaginacionByField);

app.post('/filtrar-unidades-productivas', unidadProductivaController.filterUnidadesProductivasPaginacionByField);

app.get('/filtrar-productores', productorController.filterProductoresByField);
app.get('/filtrar-estudios-suelo', estudioSueloController.filterEstudioSuelosByField);
app.get('/filtrar-unidades-productivas-por-variedad', unidadProductivaController.getUnidadProductivaByVariedad);
app.get('/filtrar-usuarios', usuarioController.filterUsuariosByField);
app.get('/filtrar-up-codigo-venta', unidadProductivaCodigoVentaController.filterUnidadProductivaCodigoVentasByField);

app.get('/exportar-excel-backend', unidadProductivaController.exportarExcelBackEnd);


app.get('/get-shapefile', parcelaCafeController.obtenerParcelasCafeGeoJSON);
app.get('/get-nuevas-parcelas-shapefile', parcelaCafeController.obtenerNuevasParcelasCafeGeoJSON);
app.get('/get-parcelas-shapefile-status', parcelaCafeController.obtenerParcelasCafeGeoJSONStatus);
//app.get('/get-parcelas-json-status', parcelaCafeController.obtenerParcelasJSONStatus);
app.get('/get-parcelas-shapefile-monitoreo', parcelaCafeController.obtenerParcelasCafeGeoJSONMonitoreo);
app.get('/get-parcelas-json-monitoreo', parcelaCafeController.obtenerParcelasCafeJSONMonitoreo);

app.get('/consultar-periodo-gee', parcelaCafeController.consultarPeriodoGEE);

app.get('/analisis-segun-fecha', parcelaCafeController.analisisSegunFecha);
app.get('/analisis-segun-fecha-externo', parcelaCafeController.analisisSegunFecha);

app.post('/analisis-consulta-externa', parcelaCafeController.analisisConsultaExterna);

app.get('/analisis-local-segun-fecha', parcelaCafeController.analisisLocalSegunFecha);

app.get('/obtener-geojson', generalController.obtenerGeoJSON)

//app.get('/get-tile-set', generalController.getTileSet)

//app.get('/get-tile-set/:id/:z/:x/:y.pbf', generalController.getTileSet);

app.get('/prueba', generalController.prueba);

app.get('/analisis', (req, res) => {
    // Earth Engine helper exposes ee and Buffer as well as an initializer.
    const { ee, Buffer } = require('./utils/earthEngine');
    const shapefile = require('shapefile');
    const fs = require('fs');

    // the library will already be authenticated/initialized by startup code.
    // any errors during initialization will have been logged earlier.

    // by now earthengine has already been initialized, just run.
    // deferring to the session however makes the route much lighter.
    run_analysis();

    function run_analysis(){


        // Cargar los archivos shapefile locales
        const shapefileDir = 'shapefile';
        const shapefileBuffer = {};
        fs.readdirSync(shapefileDir).forEach((fileName) => {
            const filePath = `${shapefileDir}/${fileName}`;
            shapefileBuffer[fileName] = fs.readFileSync(filePath);
        });

        // Convertir los buffers del shapefile a una colección de entidades de Earth Engine
        Promise.all([
            shapefile.read(shapefileBuffer['cafe_wgs84.shp'], shapefileBuffer['cafe_wgs84.dbf']),
            fs.promises.readFile(`${shapefileDir}/cafe_wgs84.prj`, 'utf8')
        ]).then(([geojson, prj]) => {

            console.log(geojson);
            console.log(prj);
            
            const features = geojson.features.map((feature) => ee.Feature(feature));
            //const featureCollection = ee.FeatureCollection(features).set('crs', prj);
            const featureCollection = ee.FeatureCollection(features).set('crs', 'EPSG:4326');
            //console.log(featureCollection.getInfo());

            var roi0= featureCollection.filter(ee.Filter.eq('OBJECTID', 15 )).first();
            console.log("RESULTADO ROI------------------------");

            var roi1 = ee.Feature(roi0).buffer(20);

            var roi = roi1.geometry();

            // Crear el buffer
            roi = Buffer(roi, 20);

            console.log(roi.getInfo());
            console.log(roi.getInfo().coordinates);
            //Filtro FECHA para colecciones
            var fecha = [];
            fecha1 = '2022-03-25';
            fecha2 = '2023-03-27';
            fecha.push(fecha1); 
            fecha.push(fecha2);

            /*
            var fc = ee.FeatureCollection([
                ee.Feature(ee.Geometry.Point(-78.703398,-6.167359), {mountain: 'Mount Shasta'}),
                ee.Feature(ee.Geometry.Point(-78.701566,-6.169346), {mountain: 'Mount Hood'})
              ]);
              */

            //Coleccion de imágenes
            //var dataset = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
            var dataset = ee.ImageCollection('COPERNICUS/S2_SR')
                                .filterDate(fecha[0], fecha[1])
                                //.filterBounds(fc)
                                .filterBounds(roi)
                                // Pre-filter to get less cloudy granules.
                                //.filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE',slider.getValue()));
                                .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE',20));
            //console.log(dataset.getInfo(),'Sentinel2');
            
            var sortedCollection = dataset.sort("system:time_start", false);
            //console.log(sortedCollection.getInfo(),'sortedCollection');
            
            var count = sortedCollection.size().getInfo();
            console.log(count,'numero de imágenes');
            
            
                if (count === 0) {
                    console.log('N° Imágenes en este rango de fechas: '+count);
                    console.log('Intentar con otro rango de fechas o con un mayor porcentaje de nubosidad.');
                }
                else {
                    var date = sortedCollection.first().date().format('YYYY-MM-dd').getInfo();
                    console.log('N° Imágenes en este rango de fechas: '+count);
                    console.log('La imagen escogida es de fecha '+date);
                }

            const firstImage = dataset.first();

            var url = firstImage
                .visualize({bands:['B4','B3','B2'], gamma: 1.5})
                //.visualize({bands:['B4','B3','B2']})
                .getThumbURL({dimensions:'1024x1024', format: 'jpg'});
            
            console.log(url);

            //SENTINEL 2
            //******************************************************************************************************************************************************   

            var dataset = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                                .filterDate(fecha[0], fecha[1])
                                .filterBounds(roi)
                                // Pre-filter to get less cloudy granules.
                                .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 25));
            console.log(dataset,'Sentinel2');
            
            var sortedCollection = dataset.sort("system:time_start", false);
            console.log(sortedCollection,'sortedCollection');
            
            var count = sortedCollection.size().getInfo(); 
            console.log(count,'numero de imágenes');
            
            //---------------------------------------------------------------------------------------------------------------------------------------------  
                if (count === 0) {
                    console.log('N° Imágenes en este rango de fechas: '+count);
                    console.log('Intentar con otro rango de fechas o con un mayor porcentaje de nubosidad.');

                }
                else {
                    var date = sortedCollection.first().date().format('YYYY-MM-dd').getInfo();
                    console.log('N° Imágenes en este rango de fechas: '+count);
                    console.log('La imagen escogida es de fecha '+date);
                }
            //---------------------------------------------------------------------------------------------------------------------------------------------  

            var Sentinel2A = sortedCollection.map(maskS2clouds);
            console.log(Sentinel2A,'Sentinel2_mask');
            
            //Renombrando bandas Sentinel2A (No se esta sacando la mediana, se etá tomando la de la utima fecha)
            
            var Sentinel2Amedian = Sentinel2A.first().clip(roi)
                                    .select(['B2','B3','B4','B8','B11','B12']).rename(['BLUE', 'GREEN', 'RED', 'NIR', 'SWIR1', 'SWIR2']);

            // Calcular indices espectral, definir simbologias, conversion a vector, disolver y dar el nombre a la clase

            calculoNdvi(Sentinel2Amedian);

            res
            .status(200)
            .json({ url: url,
                    geojson1: JSON.stringify(eeFeatureCollectionToGeojson(updatedShapefile1))
                  });


            /*
            const firstFeature = featureCollection.first();
            //console.log(firstFeature);

            const bounds = firstFeature.bounds().getInfo();
            //console.log(bounds);
            //var roi = roi.geometry();

             // Filtrar la colección de imágenes LANDSAT/LC08/C01/T1_TOA por la geometría del primer elemento de la colección de entidades
            const imageCollection = ee.ImageCollection('LANDSAT/LC08/C01/T1_TOA').filterBounds(firstFeature.geometry());

            // Imprimir la primera imagen de la colección de imágenes en la consola
            const firstImage = imageCollection.first();
            */

            // Filtrar la colección de imágenes LANDSAT/LC08/C01/T1_TOA por la geometría del primer elemento de la colección de entidades
            /*
            const imageCollection = ee.ImageCollection('LANDSAT/LC08/C01/T1_TOA')
            .filterBounds(ee.Geometry(_bounds));

            const firstImage = imageCollection.first();

            var url = firstImage
                //.visualize({bands:['B4','B3','B2'], gamma: 1.5})
                .getThumbURL({dimensions:'512', format: 'png', region: ee.Geometry(_bounds), bands: 'B4,B3,B2'});
                console.log(url);
            
            //console.log(roi);
            */



           


        });
    }
})

// Ruta para obtener todas las fechas "fecha_indice" por un gid específico
app.get('/get-fechas-indice', historialIndiceParcelaCafeController.obtenerFechaIndicePorGid);

// Ruta para obtener registros por "Gid" y "fecha_indice"
app.get('/get-historial-indices', historialIndiceParcelaCafeController.obtenerRegistrosPorGidYFecha);

//// Ruta para crear nuevos registros
app.post('/variedades', variedadController.createVariedad);
app.post('/corredores', corredorController.createCorredor);
app.post('/zonas', zonaController.createZona);
app.post('/promotores', promotorController.createPromotor);
app.post('/cuencas_hidrograficas', cuencaHidrograficaController.createCuencaHidrografica);
app.post('/extensionistas', extensionistaController.createExtensionista);
app.post('/sellos', selloController.createSello);
app.post('/comites', comiteController.createComite);
app.post('/caserios', caserioController.createCaserio);
app.post('/usuarios', usuarioController.createUsuario);
app.post('/estudios-suelo', estudioSueloController.createEstudioSuelo);

//// Ruta para actualizar registros
app.put('/update_variedades', variedadController.updateVariedad);
app.put('/update_corredores', corredorController.updateCorredor);
app.put('/update_zonas', zonaController.updateZona);
app.put('/update_promotores', promotorController.updatePromotor);
app.put('/update_cuencas_hidrograficas', cuencaHidrograficaController.updateCuencaHidrografica);
app.put('/update_extensionistas', extensionistaController.updateExtensionista);
app.put('/update_sellos', selloController.updateSello);
app.put('/update_comites', comiteController.updateComite);
app.put('/update_caserios', caserioController.updateCaserio);
app.put('/update_unidad_productiva', unidadProductivaController.updateUnidadProductiva);
app.post('/update_unidad_productiva', unidadProductivaController.updateUnidadProductiva);
app.put('/update_productor', productorController.updateProductor);
app.post('/update_productor', productorController.updateProductor);
app.put('/create_productor', productorController.createProductor);
app.post('/create_productor_one_field', productorController.createProductorOneField);
app.put('/update_textura_suelo', texturaSueloController.updateTexturaSuelo);
app.put('/update_estudio_suelo', estudioSueloController.updateEstudioSuelo);
app.put('/update_usuarios', usuarioController.updateUsuario);
app.post('/update_aprobar_masiva_parcelas', unidadProductivaController.updateAprobarMasivaUnidadProductiva);
app.post('/delete_codigo', unidadProductivaCodigoVentaController.deleteUnidadProductivaCodigoVentasByCodigo);

app.get('/bounds-interseccion', generalController.obtenerBoundsInterseccion);

app.get('/bounds-interseccion-za', generalController.obtenerBoundsInterseccionZonasAmortiguamiento);

app.get('/bounds-interseccion-2014', generalController.obtenerBoundsInterseccionDeforestacion2014);

app.get('/bounds-interseccion-2020', generalController.obtenerBoundsInterseccionDeforestacion2020);

//module.exports = router;

//Autenticacion
app.get('/', function(req, res) {

    res.sendFile(path.join(__dirname, '/views/login.html'));

});

app.post('/login', async (req, res) => {
    console.log("BODY:", req.body); // 👈 DEBUG

    const { username, correo, password } = req.body;

    // 🔥 Soporta ambos nombres (por si el frontend usa "correo")
    const userInput = username || correo;

    // 🚨 VALIDACIÓN IMPORTANTE
    if (!userInput || !password) {
        return res.status(400).send('Faltan datos');
    }

    try {

      const md5Password = crypto.createHash('md5')
        .update(password)
        .digest('hex');

      const user = await Usuario.findOne({
        where: {
          usuario: userInput,
          contrasena: md5Password,
        },
        include: [
          { model: Zona },
          { model: Rol },
        ],
      });

      if (user) {

        await SessionTokenController.revokeAllSessionTokensForUser(user.id);

        const sessionToken = SessionTokenController.generateSessionToken();

        await SessionTokenController.saveSessionToken(user.id, sessionToken);
        
        req.session.userToken = sessionToken;

        req.session.user = {
            id: user.id,
            rol: user.rol_id,
            nombre: user.nombre,
            dni: user.dni,
            zona_id: user.zona_id,
            email: user.email,
            imagen: user.imagen,
            fecha_creacion: user.fecha_creacion,
            fecha_modificacion: user.fecha_modificacion,
            zona_nombre: user.Zona ? user.Zona.nombre : null,
            zona_descripcion: user.Zona ? user.Zona.descripcion : null,
            rol_nombre: user.Rol ? user.Rol.nombre : null,
            rol_descripcion: user.Rol ? user.Rol.descripcion : null,
            usuario: user.usuario
        };

        res.send('1');

      } else {
        res.send('0');
      }

    } catch (error) {
      console.error(error);
      res.status(500).send('Error de servidor');
    }
});
// Middleware para autorización
const requireRole = (role) => async (req, res, next) => {
    try {
      // Verificar si el usuario tiene el rol adecuado utilizando el modelo Usuario
      if (req.session.user) {
        const user = await Usuario.findByPk(req.session.user.id);
        if (user && user.rol_id === role) {
          // El usuario tiene el rol adecuado, continuar con la siguiente ruta
          next();
        } else {
          // El usuario no tiene el rol adecuado, redirigir o mostrar mensaje de error
          res.send('Acceso no autorizado');
        }
      } else {
        // El usuario no ha iniciado sesión, redirigir o mostrar mensaje de error
        res.send('Acceso no autorizado');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Error de servidor');
    }
  };
  

// Ruta de cierre de sesión
app.get('/logout', (req, res) => {

    const sessionToken = req.headers.authorization; // Suponiendo que el token se envía en el encabezado Authorization

    // Marcar el token como revocado en la base de datos
    //await SessionTokenController.revokeSessionToken(sessionToken);

    req.session.destroy();
    res.redirect('/'); // Redirigir a la página de inicio de sesión
});

app.post('/stop-worker', parcelaCafeController.stopWorker);

app.get('/check_token', async (req, res) => {
    const token = req.session.userToken; // Supongamos que el token de usuario se almacena en req.session
  
    // Aquí deberías implementar la lógica para verificar si el token es válido
    const isValid = await SessionTokenController.checkTokenValidity(token); // Implementa esta función según tus necesidades
  
    if (isValid) {
      res.send('valid'); // El token es válido
    } else {
      res.send('invalid'); // El token es inválido o ha sido revocado
    }
  });

app.post('/create_polygon_from_points', parcelaCafeController.createPolygonFromPoints);
app.post('/update_polygon_from_points', parcelaCafeController.updatePolygonFromPoints);
app.post('/guardar-backup-app', parcelaCafeController.guardarBackupApp);

app.get('/actualizar-intersecciones-parcelas', parcelaCafeController.actualizarInterseccionesParcela);

app.get('/getDataDashboard', unidadProductivaController.getDataDashboard);

app.get('/reporte_generado', function(req, res) {

    const user = req.session.user;

    if (user && user.id) {
        // El usuario ha iniciado sesión, renderizar la página de perfil
        res.render('reporte_generado', { user });
    } else {
        // El usuario no ha iniciado sesión o la sesión no está establecida
        // Redirigirlo a la página de inicio de sesión
        res.redirect('/');
    }

});

app.get('/reporte_grupo_generado', function(req, res) {

    const user = req.session.user;

    if (user && user.id) {
        // El usuario ha iniciado sesión, renderizar la página de perfil
        res.render('reporte_grupo_generado', { user });
    } else {
        // El usuario no ha iniciado sesión o la sesión no está establecida
        // Redirigirlo a la página de inicio de sesión
        res.redirect('/');
    }

});

app.get('/obtener_parcelas_cafe_kml', parcelaCafeController.obtenerParcelasCafeKML);

app.get('/mvt_tiles/:id/:table_name/:zoom/:x/:y', parcelaCafeController.mvtTiles);

app.get('/get-vertices-parcela', parcelaCafeController.getVerticesParcela);

app.get('/get-tile-set/:id/:z/:x/:y.pbf', parcelaCafeController.getTileSet);

app.get('/calcular-interseccion', unidadProductivaController.calcularInterseccion);

app.get('/get-tile-set-parcelas_organicas/:id/:z/:x/:y.pbf', parcelaCafeController.getTileSetParcelasOrganicas);

app.get('/get-tile-set-parcelas_convencionales/:id/:z/:x/:y.pbf', parcelaCafeController.getTileSetParcelasConvencionales);
