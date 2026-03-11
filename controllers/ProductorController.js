const Productor = require('../models/Productor');
const Extensionista = require('../models/Extensionista');
const Promotor = require('../models/Promotor');

const path = require('path');
const Busboy = require('busboy');

const csv = require('csv-parser');
const fs = require('fs');
const UnidadProductiva = require('../models/UnidadProductiva');

// Obtener todos los productores
exports.getAllProductores = async (req, res) => {
  try {
    const productores = await Productor.findAll({
      include:
          [
            {model: Promotor, as: 'Promotor'},
            {model: Extensionista, as: 'Extensionista'}
          ]
    });
    res.json(productores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los productores' });
  }
};

// Crear un nuevo productor
exports.createProductor = async (req, res) => {
  const { codigo, nombre, dni, sexo_id, f_nacimiento, extensionista_id, promotor_id } = req.body;
  try {
    const productor = await Productor.create({
      codigo,
      nombre,
      dni,
      sexo_id,
      f_nacimiento,
      extensionista_id,
      promotor_id,
    });
    res.status(201).json(productor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el productor' });
  }
};

exports.createProductorOneField = async (req, res) => {
  const { codigo, unidad_productiva_id } = req.body;
  try {
    const productor = await Productor.create({
      codigo
    });

    const unidadProductiva = await UnidadProductiva.findByPk(unidad_productiva_id)
    unidadProductiva.productor_codigo = productor.codigo;
    await unidadProductiva.save();

    respuesta = {}

    respuesta['productor'] = productor;

    if('__i' in req.body){
      respuesta['__id'] = req.body['__id'];
      respuesta['__i'] = req.body['__i'];
      respuesta['__j'] = req.body['__j'];
      respuesta['__nombre_clase'] = 'ParcelaCafe'
    }

    res.status(201).json(respuesta);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el productor' });
  }
};

// Actualizar un productor por su ID
/*
exports.updateProductor = async (req, res) => {
  console.log(req);
  console.log(req.body);
  const {id, codigo, nombre, dni, sexo_id, f_nacimiento, extensionista_id, promotor_id } = req.body;
  try {
    const productor = await Productor.findByPk(id);
    console.log(id);
    console.log(productor);
    if (productor) {
      productor.codigo = codigo;
      productor.nombre = nombre;
      productor.dni = dni;
      productor.sexo_id = sexo_id;
      productor.f_nacimiento = f_nacimiento;
      productor.extensionista_id = extensionista_id;
      productor.promotor_id = promotor_id;
      await productor.save();

      // Si se seleccionó una imagen, guardarla en la carpeta
      if (req.files && req.files.imagen) {
          const imagen = req.files.imagen;
          const imagePath = path.join(__dirname, 'public', 'productor', 'fotos', imagen.name);
          imagen.mv(imagePath, err => {
              if (err) {
                  console.error(err);
                  return res.status(500).json({ message: 'Error al guardar la imagen' });
              }
              // Actualizar la ruta de la imagen en la base de datos
              productor.imagen = path.join('productor', 'fotos', imagen.name);
              productor.save();
          });
      }

      res.json(productor);
    } else {
      res.status(404).json({ message: 'Productor no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el productor' });
  }
};
*/
exports.updateProductor = async (req, res) => {

  try {

    const formData = {};
    let imageFileName = '';

    const busboyInstance = Busboy({ headers: req.headers });

    busboyInstance.on('field', (fieldname, value) => {
      formData[fieldname] = value;
    });

    busboyInstance.on('file', (fieldname, file, filename, encoding, mimetype) => {
      try {
        // Guardar el nombre del archivo para usarlo luego
        imageFileName = filename;

        // Generar un nuevo nombre de archivo si ya existe
        let uniqueFileName = imageFileName.filename;
        let fileIndex = 1;
        const folderPath = path.join(process.cwd(), 'public', 'productor', 'fotos');
        while (fs.existsSync(path.join(folderPath, uniqueFileName))) {
          uniqueFileName = `${path.parse(uniqueFileName).name}_${fileIndex}${path.extname(uniqueFileName)}`;
          fileIndex++;
        }

        // Ruta donde se guardará el archivo, utilizando process.cwd()
        //const folderPath = path.join(process.cwd(), 'public', 'productor', 'fotos');
        const filePath = path.join(folderPath, uniqueFileName);

        // Verificar si la carpeta existe, si no, crearla
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath, { recursive: true });
        }

        const writeStream = fs.createWriteStream(filePath);

        // Guardar el archivo en el sistema de archivos
        file.pipe(writeStream);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear el productor' });
      }
    });

    busboyInstance.on('finish', async () => {
      try {
        const { id, codigo, nombre, dni, sexo_id, f_nacimiento, extensionista_id, promotor_id, __i, __j } = formData;

        const productor = await Productor.findByPk(id);
        if (productor) {
          productor.codigo = codigo;
          productor.nombre = nombre;
          productor.dni = dni;
          productor.sexo_id = sexo_id;
          productor.f_nacimiento = f_nacimiento;
          productor.extensionista_id = extensionista_id;
          productor.promotor_id = promotor_id;

          // Actualizar la ruta de la imagen en la base de datos si se adjuntó una imagen
          if (imageFileName && 'filename' in imageFileName) {
            productor.imagen = path.join('/productor', 'fotos', imageFileName.filename);
          }

          await productor.save();

          var productorJson = productor.toJSON();

          __i != null ? productorJson["__i"] = __i : false;
          __j != null ? productorJson["__j"] = __j : false;

          res.json(productorJson);
        } else {
          res.status(404).json({ message: 'Productor no encontrado' });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar el productor' });
      }
    });

    // Iniciar el procesamiento de la solicitud
    req.pipe(busboyInstance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el productor' });
  }
};

// Eliminar un productor por su ID
exports.deleteProductor = async (req, res) => {
  const { id } = req.params;
  try {
    const productor = await Productor.findByPk(id);
    if (productor) {
      await productor.destroy();
      res.json({ message: 'Productor eliminado correctamente' });
    } else {
      res.status(404).json({ message: 'Productor no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el productor' });
  }
};

// Filtrar productores por campo y valor
exports.filterProductoresByField = async (req, res) => {
  const { field, value, where_filtros } = req.query;

  let filtros = JSON.parse(where_filtros);
  console.log(filtros);

  // Comprobar y remover comillas de los valores de filtros existentes
  //filtros["codigo"] != null ? filtros["codigo"] = eval(filtros["codigo"]) : null;
  console.log(filtros);


  try {
    const productores = await Productor.findAll({
      where: filtros
    });
    res.json(productores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al filtrar los productores' });
  }
};

// Actualizar Productores por CSV
exports.cargarCSVProductor = async (req, res) => {
  const filePath = req.file.path; // Ruta al archivo CSV subido (debe ser manejado por un middleware que maneje los archivos)

  const results = [];

  fs.createReadStream(filePath)
    .pipe(csv({ separator: ';' }))
    .on('data', (data) => {
      results.push(data);
    })
    .on('end', async () => {
      try {
        for (const row of results) {
          console.log(row);
          const _codigo = row.codigo; // Obtenemos el valor del codigo
          
          // Crear un objeto con las columnas a actualizar
          const updateFields = {};
          for (const column in row) {
            if (column !== 'codigo') {
              if(row[column] == '') updateFields[column] = null;
              else updateFields[column] = row[column];
            }
          }

          console.log(updateFields);
  
          // Realizar la actualización
          await Productor.update(updateFields, { where: { codigo: _codigo.toString() } });
        }
        
        res.status(200).json({ message: 'Actualización exitosa' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al cargar y actualizar desde el archivo CSV' });
      } finally {
        // Borra el archivo CSV temporal después de procesarlo
        fs.unlinkSync(filePath);
      }
    });
};

module.exports = exports;
