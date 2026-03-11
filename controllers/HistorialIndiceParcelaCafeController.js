const HistorialIndiceParcelaCafe = require('../models/HistorialIndiceParcelaCafe');
const { Op } = require('sequelize');

// Controlador para crear un nuevo registro
async function crearRegistro(req, res) {
  try {
    const { gid, indice, fecha_indice, fecha_modificacion, geojson } = req.body;
    
    const nuevoRegistro = await HistorialIndiceParcelaCafe.create({
      gid,
      indice,
      fecha_indice,
      fecha_modificacion,
      geojson
    });

    res.status(201).json({ mensaje: 'Registro creado exitosamente', registro: nuevoRegistro });
  } catch (error) {
    console.error('Error al crear el registro:', error);
    res.status(500).json({ error: 'Ocurrió un error al crear el registro' });
  }
}

// Controlador para obtener todos los registros
async function obtenerRegistros(req, res) {
  try {
    const registros = await HistorialIndiceParcelaCafe.findAll();
    res.json(registros);
  } catch (error) {
    console.error('Error al obtener los registros:', error);
    res.status(500).json({ error: 'Ocurrió un error al obtener los registros' });
  }
}

// Controlador para obtener un registro por su ID
async function obtenerRegistroPorId(req, res) {
  const { id } = req.params;
  try {
    const registro = await HistorialIndiceParcelaCafe.findByPk(id);
    if (registro) {
      res.json(registro);
    } else {
      res.status(404).json({ error: 'Registro no encontrado' });
    }
  } catch (error) {
    console.error('Error al obtener el registro:', error);
    res.status(500).json({ error: 'Ocurrió un error al obtener el registro' });
  }
}

// Controlador para actualizar un registro
async function actualizarRegistro(req, res) {
  const { id } = req.params;
  try {
    const { gid, indice, fecha_indice, fecha_modificacion, geojson } = req.body;
    
    const registro = await HistorialIndiceParcelaCafe.findByPk(id);
    if (registro) {
      await registro.update({
        gid,
        indice,
        fecha_indice,
        fecha_modificacion,
        geojson
      });
      res.json({ mensaje: 'Registro actualizado exitosamente', registro });
    } else {
      res.status(404).json({ error: 'Registro no encontrado' });
    }
  } catch (error) {
    console.error('Error al actualizar el registro:', error);
    res.status(500).json({ error: 'Ocurrió un error al actualizar el registro' });
  }
}

// Controlador para eliminar un registro
async function eliminarRegistro(req, res) {
  const { id } = req.params;
  try {
    const registro = await HistorialIndiceParcelaCafe.findByPk(id);
    if (registro) {
      await registro.destroy();
      res.json({ mensaje: 'Registro eliminado exitosamente' });
    } else {
      res.status(404).json({ error: 'Registro no encontrado' });
    }
  } catch (error) {
    console.error('Error al eliminar el registro:', error);
    res.status(500).json({ error: 'Ocurrió un error al eliminar el registro' });
  }
}

// Controlador para obtener registros por "indice" y "fecha_indice"
async function obtenerRegistrosPorGidYFecha(req, res) {
    const { gid, fecha_indice } = req.query;
  
    try {
      const registros = await HistorialIndiceParcelaCafe.findAll({
        where: {
          gid: gid,
          fecha_indice: fecha_indice,
        },
      });
      res.json(registros);
    } catch (error) {
      console.error('Error al obtener los registros:', error);
      res.status(500).json({ error: 'Ocurrió un error al obtener los registros' });
    }
}

// Controlador para obtener el campo "fecha_indice" por "gid"
async function obtenerFechaIndicePorGid(req, res) {
    const { gid, fecha_inicio, fecha_fin } = req.query;
  
    try {
      const registros = await HistorialIndiceParcelaCafe.findAll({
        where: {
          gid: gid,
          fecha_indice: {
            [Op.between]: [fecha_inicio, fecha_fin],
          },
        },
        attributes: ['fecha_indice'],
      });
      res.json(registros);
    } catch (error) {
      console.error('Error al obtener los registros:', error);
      res.status(500).json({ error: 'Ocurrió un error al obtener los registros' });
    }
  }
  

module.exports = {
  crearRegistro,
  obtenerRegistros,
  obtenerRegistroPorId,
  actualizarRegistro,
  eliminarRegistro,
  obtenerRegistrosPorGidYFecha,
  obtenerFechaIndicePorGid
};
