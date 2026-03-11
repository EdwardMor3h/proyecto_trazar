const { Op } = require('sequelize');
const sequelize = require('../config/database');

const csv = require('csv-parser');
const fs = require('fs');

const path = require('path');
const Busboy = require('busboy');
const Caserio = require('../models/Caserio');

// Obtener todos los caseríos
exports.getAllCaserios = async (req, res) => {
  try {
    const caserios = await Caserio.findAll({order: ['descripcion']});
    res.json(caserios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los caseríos' });
  }
};

// Crear un nuevo caserío
exports.createCaserio = async (req, res) => {
  const { descripcion } = req.body;
  try {
    const caserio = await Caserio.create({
      descripcion
    });
    res.status(201).json(caserio);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el caserío' });
  }
};

// Actualizar un caserío por su ID
exports.updateCaserio = async (req, res) => {
  console.log("UPDATE");
  console.log(req.body);
  console.log(req.query);
  console.log(req.params);

  const { id, descripcion } = req.body;
  //const { descripcion } = req.body.descripcion;

  console.log("ID : " + id);
  
  try {
    const caserio = await Caserio.findByPk(id);
    if (caserio) {
      caserio.descripcion = descripcion;
      await caserio.save();
      res.json(caserio);
    } else {
      res.status(404).json({ message: 'Caserío no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el caserío' });
  }
};

// Eliminar un caserío por su ID
exports.deleteCaserio = async (req, res) => {
  const { id } = req.params;
  try {
    const caserio = await Caserio.findByPk(id);
    if (caserio) {
      await caserio.destroy();
      res.json({ message: 'Caserío eliminado correctamente' });
    } else {
      res.status(404).json({ message: 'Caserío no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el caserío' });
  }
};

// Filtrar caseríos por campo y valor
exports.filterCaseriosByField = async (req, res) => {
  const { field, value } = req.params;
  try {
    const caserios = await Caserio.findAll({
      where: {
        [field]: value,
      },
    });
    res.json(caserios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al filtrar los caseríos' });
  }
};

// Insertar nuevos registros por CSV
exports.cargarCSVCrearCaserio = async (req, res) => {
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

          await Caserio.create({
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
