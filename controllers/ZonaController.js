const Zona = require('../models/Zona');

// Obtener todos los zonas
exports.getAllZonas = async (req, res) => {
  try {
    const zonas = await Zona.findAll({order: ['descripcion']});
    res.json(zonas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los zonas' });
  }
};

// Crear un nuevo zona
exports.createZona = async (req, res) => {
  const { descripcion } = req.body;
  try {
    const zona = await Zona.create({
      descripcion,
    });
    res.status(201).json(zona);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el zona' });
  }
};

// Actualizar un zona por su ID
exports.updateZona = async (req, res) => {
  console.log("UPDATE");
  console.log(req.body);
  console.log(req.query);
  console.log(req.params);

  const { id, descripcion } = req.body;
  //const { descripcion } = req.body.descripcion;



  console.log("ID : " + id);
  
  try {
    const zona = await Zona.findByPk(id);
    if (zona) {
      zona.descripcion = descripcion;
      await zona.save();
      res.json(zona);
    } else {
      res.status(404).json({ message: 'Zona no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el zona' });
  }
};

// Eliminar un zona por su ID
exports.deleteZona = async (req, res) => {
  const { id } = req.params;
  try {
    const zona = await Zona.findByPk(id);
    if (zona) {
      await zona.destroy();
      res.json({ message: 'Zona eliminado correctamente' });
    } else {
      res.status(404).json({ message: 'Zona no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el zona' });
  }
};

// Filtrar zonas por campo y valor
exports.filterZonasByField = async (req, res) => {
  const { field, value } = req.params;
  try {
    const zonas = await Zona.findAll({
      where: {
        [field]: value,
      },
    });
    res.json(zonas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al filtrar los zonas' });
  }
};

module.exports = exports;
