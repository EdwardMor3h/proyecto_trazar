const Extensionista = require('../models/Extensionista');

// Obtener todos los extensionistas
exports.getAllExtensionistas = async (req, res) => {
  try {
    const extensionistas = await Extensionista.findAll();
    res.json(extensionistas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los extensionistas' });
  }
};

// Crear un nuevo extensionista
exports.createExtensionista = async (req, res) => {
  const { descripcion } = req.body;
  try {
    const extensionista = await Extensionista.create({
      descripcion,
    });
    res.status(201).json(extensionista);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el extensionista' });
  }
};

// Actualizar un extensionista por su ID
exports.updateExtensionista = async (req, res) => {
  console.log("UPDATE");
  console.log(req.body);
  console.log(req.query);
  console.log(req.params);

  const { id, descripcion } = req.body;
  //const { descripcion } = req.body.descripcion;


  console.log("ID : " + id);
  try {
    const extensionista = await Extensionista.findByPk(id);
    if (extensionista) {
      extensionista.descripcion = descripcion;
      await extensionista.save();
      res.json(extensionista);
    } else {
      res.status(404).json({ message: 'Extensionista no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el extensionista' });
  }
};

// Eliminar un extensionista por su ID
exports.deleteExtensionista = async (req, res) => {
  const { id } = req.params;
  try {
    const extensionista = await Extensionista.findByPk(id);
    if (extensionista) {
      await extensionista.destroy();
      res.json({ message: 'Extensionista eliminado correctamente' });
    } else {
      res.status(404).json({ message: 'Extensionista no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el extensionista' });
  }
};

// Filtrar extensionistas por campo y valor
exports.filterExtensionistasByField = async (req, res) => {
  const { field, value } = req.params;
  try {
    const extensionistas = await Extensionista.findAll({
      where: {
        [field]: value,
      },
    });
    res.json(extensionistas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al filtrar los extensionistas' });
  }
};

module.exports = exports;
