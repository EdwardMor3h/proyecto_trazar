const Campanha = require('../models/Campanha');
const CampanhaVariedad = require('../models/CampanhaVariedad');
const Variedad = require('../models/Variedad');

// Obtener todas las campañas
exports.getAllCampanhas = async (req, res) => {
  try {
    const campanhas = await Campanha.findAll({
      include: [
        {
          model: CampanhaVariedad,
          //as: 'CampanhaVariedads',
          include: [{ 
            model: Variedad, 
            //as: 'variedad' 
          }],
        },
      ],
    });

    // Mapear el resultado para obtener el objeto completo de Variedad en lugar del valor
    /*
    const campanhasConVariedad = campanhas.map((campanha) => {
      const campanhaObj = campanha.toJSON(); // Convertir a objeto JSON
      const campanhaVariedades = campanhaObj.CampanhaVariedads.map((cv) => {
        return {
          ...cv,
          variedad: cv.Variedad.toJSON(), // Obtener el objeto completo de Variedad
        };
      });
      campanhaObj.CampanhaVariedads = campanhaVariedades; // Actualizar la propiedad con los datos modificados
      return campanhaObj;
    });
    */

    res.json(campanhas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener las campañas' });
  }
};

// Crear una nueva campaña
exports.createCampanha = async (req, res) => {
  const { fecha_siembra, porcentaje_sombra, numero_plantas, unidad_productiva_id } = req.body;
  try {
    const campanha = await Campanha.create({
      fecha_siembra,
      porcentaje_sombra,
      numero_plantas,
      unidad_productiva_id,
    });
    res.status(201).json(campanha);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear la campaña' });
  }
};

// Actualizar una campaña por su ID
exports.updateCampanha = async (req, res) => {
  const { id } = req.params;
  const { fecha_siembra, porcentaje_sombra, numero_plantas, unidad_productiva_id } = req.body;
  try {
    const campanha = await Campanha.findByPk(id);
    if (campanha) {
      campanha.fecha_siembra = fecha_siembra;
      campanha.porcentaje_sombra = porcentaje_sombra;
      campanha.numero_plantas = numero_plantas;
      campanha.unidad_productiva_id = unidad_productiva_id;
      await campanha.save();
      res.json(campanha);
    } else {
      res.status(404).json({ message: 'Campaña no encontrada' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar la campaña' });
  }
};

// Eliminar una campaña por su ID
exports.deleteCampanha = async (req, res) => {
  const { id } = req.params;
  try {
    const campanha = await Campanha.findByPk(id);
    if (campanha) {
      await campanha.destroy();
      res.json({ message: 'Campaña eliminada correctamente' });
    } else {
      res.status(404).json({ message: 'Campaña no encontrada' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar la campaña' });
  }
};

// Filtrar campañas por campo y valor
exports.filterCampanhasByField = async (req, res) => {
  const { field, value } = req.params;
  try {
    const campanhas = await Campanha.findAll({
      where: {
        [field]: value,
      },
    });
    res.json(campanhas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al filtrar las campañas' });
  }
};

module.exports = exports;
