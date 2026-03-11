const Sexo = require('../models/Sexo');

// Obtener todos los sexos
exports.getAllSexos = async (req, res) => {
  try {
    const sexos = await Sexo.findAll({order: ['descripcion']});
    res.json(sexos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los sexos' });
  }
};

// Crear un nuevo sexo
exports.createSexo = async (req, res) => {
  const { descripcion } = req.body;
  try {
    const sexo = await Sexo.create({
      descripcion,
    });
    res.status(201).json(sexo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el sexo' });
  }
};

// Actualizar un sexo por su ID
exports.updateSexo = async (req, res) => {
  console.log("UPDATE");
  console.log(req.body);
  console.log(req.query);
  console.log(req.params);

  const { id, descripcion } = req.body;
  //const { descripcion } = req.body.descripcion;



  console.log("ID : " + id);
  
  try {
    const sexo = await Sexo.findByPk(id);
    if (sexo) {
      sexo.descripcion = descripcion;
      await sexo.save();
      res.json(sexo);
    } else {
      res.status(404).json({ message: 'Sexo no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el sexo' });
  }
};

// Eliminar un sexo por su ID
exports.deleteSexo = async (req, res) => {
  const { id } = req.params;
  try {
    const sexo = await Sexo.findByPk(id);
    if (sexo) {
      await sexo.destroy();
      res.json({ message: 'Sexo eliminado correctamente' });
    } else {
      res.status(404).json({ message: 'Sexo no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el sexo' });
  }
};

// Filtrar sexos por campo y valor
exports.filterSexosByField = async (req, res) => {
  const { field, value } = req.params;
  try {
    const sexos = await Sexo.findAll({
      where: {
        [field]: value,
      },
    });
    res.json(sexos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al filtrar los sexos' });
  }
};

module.exports = exports;
