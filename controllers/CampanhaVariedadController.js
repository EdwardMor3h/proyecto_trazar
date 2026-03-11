const CampanhaVariedad = require('../models/CampanhaVariedad');
const Variedad = require('../models/Variedad');

// Obtener todas las variedades de campañas
exports.getAllCampanhaVariedades = async (req, res) => {
  try {
    const campanhaVariedades = await CampanhaVariedad.findAll({
      include: {
        model: Variedad, // Modelo relacionado
        as: 'variedad', // Alias para la asociación
      }, //Incluye los modelos en la consulta
      //order: ['parcela_gid']
    });

    // Obtener los datos de cada CampanhaVariedad con el objeto completo de Variedad
    const campanhaVariedadesConObjeto = campanhaVariedades.map((cv) => {
      const { id, campanha_id, variedad } = cv;
      return {
        id,
        campanha_id,
        variedad,
      };
    });

    //res.json(campanhaVariedades);
    res.json(campanhaVariedadesConObjeto);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener las variedades de campañas' });
  }
};

// Crear una nueva variedad de campaña
exports.createCampanhaVariedad = async (req, res) => {
  const { campanha_id, variedad_id } = req.body;
  try {
    const campanhaVariedad = await CampanhaVariedad.create({
      campanha_id,
      variedad_id,
    });
    res.status(201).json(campanhaVariedad);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear la variedad de campaña' });
  }
};

// Actualizar una variedad de campaña por su ID
exports.updateCampanhaVariedad = async (req, res) => {
  const { id } = req.params;
  const { campanha_id, variedad_id } = req.body;
  try {
    const campanhaVariedad = await CampanhaVariedad.findByPk(id);
    if (campanhaVariedad) {
      campanhaVariedad.campanha_id = campanha_id;
      campanhaVariedad.variedad_id = variedad_id;
      await campanhaVariedad.save();
      res.json(campanhaVariedad);
    } else {
      res.status(404).json({ message: 'Variedad de campaña no encontrada' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar la variedad de campaña' });
  }
};

// Eliminar una variedad de campaña por su ID
exports.deleteCampanhaVariedad = async (req, res) => {
  const { id } = req.params;
  try {
    const campanhaVariedad = await CampanhaVariedad.findByPk(id);
    if (campanhaVariedad) {
      await campanhaVariedad.destroy();
      res.json({ message: 'Variedad de campaña eliminada correctamente' });
    } else {
      res.status(404).json({ message: 'Variedad de campaña no encontrada' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar la variedad de campaña' });
  }
};

// Filtrar variedades de campañas por campo y valor
exports.filterCampanhaVariedadesByField = async (req, res) => {
  const { field, value } = req.params;
  try {
    const campanhaVariedades = await CampanhaVariedad.findAll({
      where: {
        [field]: value,
      },
    });
    res.json(campanhaVariedades);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al filtrar las variedades de campañas' });
  }
};

module.exports = exports;
