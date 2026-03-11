const Variedad = require('../models/Variedad');

// Obtener todos los variedades
exports.getAllVariedades = async (req, res) => {
  try {
    const variedades = (await Variedad.findAll({order: ['descripcion']}));
    res.json(variedades);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los variedades' });
  }
};

// Crear un nuevo variedad
exports.createVariedad = async (req, res) => {
  const { descripcion } = req.body;
  try {
    const variedad = await Variedad.create({
      descripcion,
    });
    res.status(201).json(variedad);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el variedad' });
  }
};

// Actualizar un variedad por su ID
exports.updateVariedad = async (req, res) => {
  console.log("UPDATE");
  console.log(req.body);
  console.log(req.query);
  console.log(req.params);

  const { id, descripcion } = req.body;
  //const { descripcion } = req.body.descripcion;

  console.log("ID : " + id);

  try {
    const variedad = await Variedad.findByPk(id);
    if (variedad) {
      variedad.descripcion = descripcion;
      await variedad.save();
      res.json(variedad);
    } else {
      res.status(404).json({ message: 'Variedad no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el variedad' });
  }
};

// Eliminar un variedad por su ID
exports.deleteVariedad = async (req, res) => {
  const { id } = req.params;
  try {
    const variedad = await Variedad.findByPk(id);
    if (variedad) {
      await variedad.destroy();
      res.json({ message: 'Caserío eliminado correctamente' });
    } else {
      res.status(404).json({ message: 'Caserío no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el variedad' });
  }
};

// Filtrar variedades por campo y valor
exports.filterVariedadesByField = async (req, res) => {
  const { field, value } = req.params;
  try {
    const variedades = await Variedad.findAll({
      where: {
        [field]: value,
      },
    });
    res.json(variedades);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al filtrar los variedades' });
  }
};

module.exports = exports;
