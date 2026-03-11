const Promotor = require('../models/Promotor');

// Obtener todos los promotores
exports.getAllPromotores = async (req, res) => {
  try {
    const promotores = await Promotor.findAll({order: ['descripcion']});
    res.json(promotores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los promotores' });
  }
};

// Crear un nuevo promotor
exports.createPromotor = async (req, res) => {
  const { descripcion } = req.body;
  try {
    const promotor = await Promotor.create({
      descripcion,
    });
    res.status(201).json(promotor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el promotor' });
  }
};

// Actualizar un promotor por su ID
exports.updatePromotor = async (req, res) => {

  console.log("UPDATE");
  console.log(req.body);

  const { id, descripcion } = req.body;
  //const { descripcion } = req.body.descripcion;
  console.log("ID : " + id);

  try {
    const promotor = await Promotor.findByPk(id);
    if (promotor) {
      promotor.descripcion = descripcion;
      await promotor.save();
      res.json(promotor);
    } else {
      res.status(404).json({ message: 'Promotor no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el promotor' });
  }
};

// Eliminar un promotor por su ID
exports.deletePromotor = async (req, res) => {
  const { id } = req.params;
  try {
    const promotor = await Promotor.findByPk(id);
    if (promotor) {
      await promotor.destroy();
      res.json({ message: 'Promotor eliminado correctamente' });
    } else {
      res.status(404).json({ message: 'Promotor no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el promotor' });
  }
};

// Filtrar promotores por campo y valor
exports.filterPromotoresByField = async (req, res) => {
  const { field, value } = req.params;
  try {
    const promotores = await Promotor.findAll({
      where: {
        [field]: value,
      },
    });
    res.json(promotores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al filtrar los promotores' });
  }
};

module.exports = exports;
