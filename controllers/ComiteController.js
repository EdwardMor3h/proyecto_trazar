const { Op } = require('sequelize');
const sequelize = require('../config/database');

const csv = require('csv-parser');
const fs = require('fs');

const path = require('path');
const Busboy = require('busboy');
const Comite = require('../models/Comite');

// Obtener todos los comités
exports.getAllComites = async (req, res) => {
  try {
    const comites = await Comite.findAll({order: ['descripcion']});
    res.json(comites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los comités' });
  }
};

// Crear un nuevo comité
exports.createComite = async (req, res) => {
  const { descripcion } = req.body;
  try {
    const comite = await Comite.create({
      descripcion,
    });
    res.status(201).json(comite);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el comité' });
  }
};

// Actualizar un comité por su ID
exports.updateComite = async (req, res) => {

  console.log("UPDATE");
  console.log(req.body);
  console.log(req.query);
  console.log(req.params);

  const { id, descripcion } = req.body;

  try {
    const comite = await Comite.findByPk(id);
    if (comite) {
      comite.descripcion = descripcion;
      await comite.save();
      res.json(comite);
    } else {
      res.status(404).json({ message: 'Comité no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el comité' });
  }
};

// Eliminar un comité por su ID
exports.deleteComite = async (req, res) => {
  const { id } = req.params;
  try {
    const comite = await Comite.findByPk(id);
    if (comite) {
      await comite.destroy();
      res.json({ message: 'Comité eliminado correctamente' });
    } else {
      res.status(404).json({ message: 'Comité no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el comité' });
  }
};

// Filtrar comités por campo y valor
exports.filterComitesByField = async (req, res) => {
  const { field, value } = req.params;
  try {
    const comites = await Comite.findAll({
      where: {
        [field]: value,
      },
    });
    res.json(comites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al filtrar los comités' });
  }
};

// Insertar nuevos registros por CSV
exports.cargarCSVCrearComite = async (req, res) => {
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

          // Obtenemos el valor de 'descripcion'
          var value_descripcion = row['descripcion'];
          console.log("DESCRIPCION");
          console.log(value_descripcion);

          await Comite.create({
            descripcion: value_descripcion
          });
                  
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
