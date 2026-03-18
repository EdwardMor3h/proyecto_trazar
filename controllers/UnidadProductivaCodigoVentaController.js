const { Sequelize, QueryTypes } = require('sequelize');
const sequelize = require('../config/database');

const csv = require('csv-parser');
const fs = require('fs');

const path = require('path');
const Busboy = require('busboy');
const UnidadProductivaCodigoVenta = require('../models/UnidadProductivaCodigoVenta');
const UnidadProductiva = require('../models/UnidadProductiva');

// Obtener todos los unidadProductivaCodigoVentas
exports.getAllUnidadProductivaCodigoVentas = async (req, res) => {
  try {
    const unidadProductivaCodigoVentas = await UnidadProductivaCodigoVenta.findAll({order: ['codigo_venta']});
    res.json(unidadProductivaCodigoVentas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los unidadProductivaCodigoVentas' });
  }
};

// Obtener los codigos de venta únicos
exports.getDistinctCodigoVentas = async (req, res) => {
  try {
    const unidadProductivaCodigoVentas = await sequelize.query(
      `SELECT codigo_venta, COUNT(codigo_venta) as cantidad 
       FROM unidad_productiva_codigo_venta 
       GROUP BY codigo_venta`,
      {
        type: QueryTypes.SELECT
      }
    );

    res.json(unidadProductivaCodigoVentas);

  } catch (error) {
    console.error("🔥 ERROR REAL:", error); // 👈 ESTE ES EL IMPORTANTE
    res.status(500).json({ 
      message: 'Error al obtener los unidadProductivaCodigoVentas',
      error: error.message // 👈 AGREGA ESTO TEMPORAL
    });
  }
};

// Crear un nuevo unidadProductivaCodigoVenta
exports.createUnidadProductivaCodigoVenta = async (req, res) => {
  const { descripcion } = req.body;
  try {
    const unidadProductivaCodigoVenta = await UnidadProductivaCodigoVenta.create({
      descripcion,
    });
    res.status(201).json(unidadProductivaCodigoVenta);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el unidadProductivaCodigoVenta' });
  }
};

// Actualizar un unidadProductivaCodigoVenta por su ID
exports.updateUnidadProductivaCodigoVenta = async (req, res) => {
  console.log("UPDATE");
  console.log(req.body);
  console.log(req.query);
  console.log(req.params);

  const { id, descripcion } = req.body;
  //const { descripcion } = req.body.descripcion;



  console.log("ID : " + id);
  
  try {
    const unidadProductivaCodigoVenta = await UnidadProductivaCodigoVenta.findByPk(id);
    if (unidadProductivaCodigoVenta) {
      unidadProductivaCodigoVenta.descripcion = descripcion;
      await unidadProductivaCodigoVenta.save();
      res.json(unidadProductivaCodigoVenta);
    } else {
      res.status(404).json({ message: 'UnidadProductivaCodigoVenta no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el unidadProductivaCodigoVenta' });
  }
};

// Eliminar un unidadProductivaCodigoVenta por su ID
exports.deleteUnidadProductivaCodigoVenta = async (req, res) => {
  const { id } = req.params;
  try {
    const unidadProductivaCodigoVenta = await UnidadProductivaCodigoVenta.findByPk(id);
    if (unidadProductivaCodigoVenta) {
      await unidadProductivaCodigoVenta.destroy();
      res.json({ message: 'UnidadProductivaCodigoVenta eliminado correctamente' });
    } else {
      res.status(404).json({ message: 'UnidadProductivaCodigoVenta no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el unidadProductivaCodigoVenta' });
  }
};

// Filtrar unidadProductivaCodigoVentas por campo y valor
exports.filterUnidadProductivaCodigoVentasByField = async (req, res) => {
  const {where_filtros} = req.query;
  let filtros = JSON.parse(where_filtros);
  console.log('================== VALOR CODIGO VENTA ===================');
  console.log(filtros);

  try {
    const unidadProductivaCodigoVentas = await UnidadProductiva.findAll({
        include:
        [
          {
            model: UnidadProductivaCodigoVenta,
            as: 'codigosVenta',
            where: filtros
          },
        ],    
    });
    res.json(unidadProductivaCodigoVentas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al filtrar los unidadProductivaCodigoVentas' });
  }
};

// Insertar nuevos registros por CSV
exports.cargarCSVCrearUnidadProductivaCodigoVenta = async (req, res) => {
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
          var value_up_id = row['unidad_productiva_id'];
          var value_codigo_venta = row['codigo_venta'];
          console.log("========UP ID=======");
          console.log(value_up_id);
          console.log("========Codigo Venta=======");
          console.log(value_codigo_venta);

          await UnidadProductivaCodigoVenta.create({
            unidad_productiva_id: value_up_id,
            codigo_venta: value_codigo_venta
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


exports.deleteUnidadProductivaCodigoVentasByCodigo = async (req, res) => {
  console.log("DELETE");
  console.log(req.body);
  console.log(req.query);
  console.log(req.params);

  const { descripcion } = req.body;

  try {
    const registros_codigo = await UnidadProductivaCodigoVenta.findAll({ where: { codigo_venta : descripcion } });

    if (registros_codigo.length > 0) {
      // Iterar sobre cada comité encontrado y eliminarlo
      for (let registro of registros_codigo) {
        await registro.destroy();
      }
      res.json({ message: `Se eliminaron ${registros_codigo.length} códigos correctamente` });
    } else {
      res.status(404).json({ message: 'códigos no encontrados para eliminar' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar los códigos' });
  }
};


module.exports = exports;
