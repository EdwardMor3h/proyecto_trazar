const Sello = require('../models/Sello');

// Obtener todos los sellos
exports.getAllSellos = async (req, res) => {
  try {
    const sellos = await Sello.findAll({order: ['descripcion']});
    res.json(sellos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los sellos' });
  }
};

// Crear un nuevo sello
exports.createSello = async (req, res) => {
  const { descripcion } = req.body;
  try {
    const sello = await Sello.create({
      descripcion,
    });
    res.status(201).json(sello);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el sello' });
  }
};

// Actualizar un sello por su ID
exports.updateSello = async (req, res) => {

  console.log("UPDATE");
  console.log(req.body);

  const { id, descripcion } = req.body;
  //const { descripcion } = req.body.descripcion;
  console.log("ID : " + id);


  try {
    const sello = await Sello.findByPk(id);
    if (sello) {
      sello.descripcion = descripcion;
      await sello.save();
      res.json(sello);
    } else {
      res.status(404).json({ message: 'Sello no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el sello' });
  }
};

// Eliminar un sello por su ID
exports.deleteSello = async (req, res) => {
  const { id } = req.params;
  try {
    const sello = await Sello.findByPk(id);
    if (sello) {
      await sello.destroy();
      res.json({ message: 'Sello eliminado correctamente' });
    } else {
      res.status(404).json({ message: 'Sello no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el sello' });
  }
};

// Filtrar sellos por campo y valor
exports.filterSellosByField = async (req, res) => {
  const { field, value } = req.params;
  try {
    const sellos = await Sello.findAll({
      where: {
        [field]: value,
      },
    });
    res.json(sellos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al filtrar los sellos' });
  }
};

module.exports = exports;
