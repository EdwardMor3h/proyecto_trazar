const GuardarBackupApp = require('../models/GuardarBackupApp');

// Obtener todos los comités
exports.getAllElementos = async (req, res) => {
  try {
    const elementos = await GuardarBackupApp.findAll({order: [['fecha_creacion', 'DESC']]});
    res.json(elementos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los comités' });
  }
};

// Actualizar un comité por su ID
exports.updateElemento = async (req, res) => {

  console.log("UPDATE");
  console.log(req.body);
  console.log(req.query);
  console.log(req.params);

  const { id, estado } = req.body;

  try {
    const elemento = await GuardarBackupApp.findByPk(id);
    if (elemento) {
      elemento.estado = estado;
      await elemento.save();
      res.json(elemento);
    } else {
      res.status(404).json({ message: 'Comité no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el comité' });
  }
};

// Eliminar un comité por su ID
exports.deleteElemento = async (req, res) => {
  const { id } = req.params;
  try {
    const elemento = await GuardarBackupApp.findByPk(id);
    if (elemento) {
      await elemento.destroy();
      res.json({ message: 'Elemento eliminado correctamente' });
    } else {
      res.status(404).json({ message: 'Elemento no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el Elemento' });
  }
};

// Filtrar comités por campo y valor
exports.filterElementoByField = async (req, res) => {
  const { field, value } = req.params;
  try {
    const elemento = await GuardarBackupApp.findAll({
      where: {
        [field]: value,
      },
    });
    res.json(elemento);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al filtrar los comités' });
  }
};

module.exports = exports;
