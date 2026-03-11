const AltitudCat = require('../models/AltitudCat');

// Obtener todos los caseríos
exports.getAllAltitudCats = async (req, res) => {
  try {
    const altitudCats = await AltitudCat.findAll({order: ['descripcion']});
    res.json(altitudCats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener las categorías de altitud' });
  }
};

// Crear un nuevo caserío
exports.createAltitudCat = async (req, res) => {
  const { descripcion } = req.body;
  try {
    const altitudCat = await AltitudCat.create({
      descripcion,
    });
    res.status(201).json(altitudCat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear la categoría de altitud' });
  }
};

// Actualizar un caserío por su ID
exports.updateAltitudCat = async (req, res) => {
  const { id } = req.params;
  const { descripcion } = req.body;
  try {
    const altitudCat = await AltitudCat.findByPk(id);
    if (altitudCat) {
        altitudCat.descripcion = descripcion;
      await altitudCat.save();
      res.json(altitudCat);
    } else {
      res.status(404).json({ message: 'Caserío no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar la categoría de altitud' });
  }
};

// Eliminar un caserío por su ID
exports.deleteAltitudCat= async (req, res) => {
  const { id } = req.params;
  try {
    const altitudCat = await AltitudCat.findByPk(id);
    if (altitudCat) {
      await altitudCat.destroy();
      res.json({ message: 'Caserío eliminado correctamente' });
    } else {
      res.status(404).json({ message: 'Caserío no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar la categoría de altitud' });
  }
};

// Filtrar caseríos por campo y valor
exports.filterAltitudCatsByField = async (req, res) => {
  const { field, value } = req.params;
  try {
    const altitudCats = await AltitudCat.findAll({
      where: {
        [field]: value,
      },
    });
    res.json(altitudCats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al filtrar las categoría de altitud' });
  }
};

module.exports = exports;
