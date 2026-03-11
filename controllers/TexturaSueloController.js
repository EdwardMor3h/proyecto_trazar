const TexturaSuelo = require('../models/TexturaSuelo');

// Obtener todos los texturaSuelos
exports.getAllTexturaSuelos = async (req, res) => {
  try {
    const texturaSuelos = await TexturaSuelo.findAll({order: ['descripcion']});
    res.json(texturaSuelos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener las texturaSuelos' });
  }
};

// Crear un nuevo texturaSuelo
exports.createTexturaSuelo = async (req, res) => {
  const { descripcion } = req.body;
  try {
    const texturaSuelo = await TexturaSuelo.create({
      descripcion,
    });
    res.status(201).json(texturaSuelo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el texturaSuelo' });
  }
};

// Actualizar un texturaSuelo por su ID
exports.updateTexturaSuelo = async (req, res) => {

    console.log("UPDATE");
  console.log(req.body);

  const { id, descripcion } = req.body;
  //const { descripcion } = req.body.descripcion;
  console.log("ID : " + id);
  
  try {
    const texturaSuelo = await TexturaSuelo.findByPk(id);
    if (texturaSuelo) {
      texturaSuelo.descripcion = descripcion;
      await texturaSuelo.save();
      res.json(texturaSuelo);
    } else {
      res.status(404).json({ message: 'TexturaSuelo no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el texturaSuelo' });
  }
};

// Eliminar un texturaSuelo por su ID
exports.deleteTexturaSuelo = async (req, res) => {
  const { id } = req.params;
  try {
    const texturaSuelo = await TexturaSuelo.findByPk(id);
    if (texturaSuelo) {
      await texturaSuelo.destroy();
      res.json({ message: 'TexturaSuelo eliminado correctamente' });
    } else {
      res.status(404).json({ message: 'TexturaSuelo no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el texturaSuelo' });
  }
};

// Filtrar texturaSuelos por campo y valor
exports.filterTexturaSuelosByField = async (req, res) => {
  const { field, value } = req.params;
  try {
    const texturaSuelos = await TexturaSuelo.findAll({
      where: {
        [field]: value,
      },
    });
    res.json(texturaSuelos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al filtrar las texturaSuelos' });
  }
};

module.exports = exports;
