const CuencaHidrografica = require('../models/CuencaHidrografica');

// Obtener todos los cuencaHidrograficas
exports.getAllCuencaHidrograficas = async (req, res) => {
  try {
    const cuencaHidrograficas = await CuencaHidrografica.findAll({order: ['descripcion']});
    res.json(cuencaHidrograficas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener las cuencaHidrograficas' });
  }
};

// Crear un nuevo cuencaHidrografica
exports.createCuencaHidrografica = async (req, res) => {
  const { descripcion } = req.body;
  try {
    const cuencaHidrografica = await CuencaHidrografica.create({
      descripcion,
    });
    res.status(201).json(cuencaHidrografica);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el cuencaHidrografica' });
  }
};

// Actualizar un cuencaHidrografica por su ID
exports.updateCuencaHidrografica = async (req, res) => {

  console.log("UPDATE");
  console.log(req.body);
  console.log(req.query);
  console.log(req.params);

  const { id, descripcion } = req.body;

  try {
    const cuenca_hidrografica = await CuencaHidrografica.findByPk(id);
    if (cuenca_hidrografica) {
      cuenca_hidrografica.descripcion = descripcion;
      await cuenca_hidrografica.save();
      res.json(cuenca_hidrografica);
    } else {
      res.status(404).json({ message: 'Comité no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el comité' });
  }
};

// Eliminar un cuencaHidrografica por su ID
exports.deleteCuencaHidrografica = async (req, res) => {
  const { id } = req.params;
  try {
    const cuencaHidrografica = await CuencaHidrografica.findByPk(id);
    if (cuencaHidrografica) {
      await cuencaHidrografica.destroy();
      res.json({ message: 'CuencaHidrografica eliminado correctamente' });
    } else {
      res.status(404).json({ message: 'CuencaHidrografica no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el cuencaHidrografica' });
  }
};

// Filtrar cuencaHidrograficas por campo y valor
exports.filterCuencaHidrograficasByField = async (req, res) => {
  const { field, value } = req.params;
  try {
    const cuencaHidrograficas = await CuencaHidrografica.findAll({
      where: {
        [field]: value,
      },
    });
    res.json(cuencaHidrograficas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al filtrar las cuencaHidrograficas' });
  }
};

module.exports = exports;
