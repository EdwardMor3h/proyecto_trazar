const Corredor = require('../models/Corredor');

// Obtener todos los corredores
exports.getAllCorredores = async (req, res) => {
  try {
    const corredores = await Corredor.findAll({order: ['descripcion']});
    res.json(corredores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los corredores' });
  }
};

// Crear un nuevo corredor
exports.createCorredor = async (req, res) => {
  const { descripcion } = req.body;
  try {
    const corredor = await Corredor.create({
      descripcion,
    });
    res.status(201).json(corredor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el corredor' });
  }
};

// Actualizar un corredor por su ID
exports.updateCorredor = async (req, res) => {
  
  console.log("UPDATE");
  console.log(req.body);
  console.log(req.query);
  console.log(req.params);

  const { id, descripcion } = req.body;
  //const { descripcion } = req.body.descripcion;



  console.log("ID : " + id);

  try {
    const corredor = await Corredor.findByPk(id);
    if (corredor) {
      corredor.descripcion = descripcion;
      await corredor.save();
      res.json(corredor);
    } else {
      res.status(404).json({ message: 'Corredor no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el corredor' });
  }
};

// Eliminar un corredor por su ID
exports.deleteCorredor = async (req, res) => {
  const { id } = req.params;
  try {
    const corredor = await Corredor.findByPk(id);
    if (corredor) {
      await corredor.destroy();
      res.json({ message: 'Corredor eliminado correctamente' });
    } else {
      res.status(404).json({ message: 'Corredor no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el corredor' });
  }
};

// Filtrar corredores por campo y valor
exports.filterCorredoresByField = async (req, res) => {
  const { field, value } = req.params;
  try {
    const corredores = await Corredor.findAll({
      where: {
        [field]: value,
      },
    });
    res.json(corredores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al filtrar los corredores' });
  }
};

module.exports = exports;
