const ProcesoPerformance = require('../models/ProcesoPerformance');

// Obtener todos los procesos de performance
exports.getAllProcesosPerformance = async (req, res) => {
  try {
    const procesosPerformance = await ProcesoPerformance.findAll();
    res.json(procesosPerformance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los procesos de performance' });
  }
};

// Crear un nuevo proceso de performance
exports.createProcesoPerformance = async (req, res) => {
  const { nombre, tiempo } = req.body;
  console.log("req.body:");
  console.log(nombre);
  console.log(tiempo);
  try {
    const procesoPerformance = await ProcesoPerformance.create({
      nombre,
      tiempo,
    });
    console.log(procesoPerformance);
    res.status(201).json(procesoPerformance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el proceso de performance' });
  }
};

// Actualizar un proceso de performance por su ID
exports.updateProcesoPerformance = async (req, res) => {
  const { id, nombre, tiempo } = req.body;
  try {
    const procesoPerformance = await ProcesoPerformance.findByPk(id);
    if (procesoPerformance) {
      procesoPerformance.nombre = nombre;
      procesoPerformance.tiempo = tiempo;
      await procesoPerformance.save();
      res.json(procesoPerformance);
    } else {
      res.status(404).json({ message: 'Proceso de performance no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el proceso de performance' });
  }
};

// Eliminar un proceso de performance por su ID
exports.deleteProcesoPerformance = async (req, res) => {
  const { id } = req.params;
  try {
    const procesoPerformance = await ProcesoPerformance.findByPk(id);
    if (procesoPerformance) {
      await procesoPerformance.destroy();
      res.json({ message: 'Proceso de performance eliminado correctamente' });
    } else {
      res.status(404).json({ message: 'Proceso de performance no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el proceso de performance' });
  }
};

// Filtrar procesos de performance por campo y valor
exports.filterProcesosPerformanceByField = async (req, res) => {
  const { field, value } = req.params;
  try {
    const procesosPerformance = await ProcesoPerformance.findAll({
      where: {
        [field]: value,
      },
    });
    res.json(procesosPerformance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al filtrar los procesos de performance' });
  }
};

module.exports = exports;