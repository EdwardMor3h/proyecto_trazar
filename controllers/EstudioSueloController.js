const EstudioSuelo = require('../models/EstudioSuelo');
const UnidadProductiva = require('../models/UnidadProductiva');
const TexturaSuelo = require('../models/TexturaSuelo');

// Obtener todos los estudios de suelo
exports.getAllEstudioSuelos = async (req, res) => {
  try {
    const estudioSuelos = await EstudioSuelo.findAll({
      include:
          [
            {model: UnidadProductiva, as: 'UnidadProductiva'},
            {model: TexturaSuelo, as: 'TexturaSuelo'}
          ]
    });
    res.json(estudioSuelos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los estudios de suelo' });
  }
};

// Crear un nuevo estudio de suelo
exports.createEstudioSuelo = async (req, res) => {
  const { fecha, codigo_estudio, ph, materia_organica, no3_ppm, fosforo, k2o_ppm,textura_suelo_id, unidad_productiva_id } = req.body;
  try {
    const estudioSuelo = await EstudioSuelo.create({
        fecha,
        codigo_estudio,
        ph,
        materia_organica,
        no3_ppm,
        fosforo,
        k2o_ppm,
        textura_suelo_id,
        unidad_productiva_id
    });
    res.status(201).json(estudioSuelo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el estudio de suelo' });
  }
};

// Actualizar un estudio de suelo por su ID
exports.updateEstudioSuelo = async (req, res) => {
  
  const {id, fecha, codigo_estudio, ph, materia_organica, no3_ppm, fosforo, k2o_ppm,textura_suelo_id, unidad_productiva_id  } = req.body;
  try {
    const estudioSuelo = await EstudioSuelo.findByPk(id);
    if (estudioSuelo) {
      fecha != null && fecha != '' ? estudioSuelo.fecha = fecha : false;
      codigo_estudio != null && codigo_estudio != '' ? estudioSuelo.codigo_estudio = codigo_estudio : false;
      ph != null && ph != '' ? estudioSuelo.ph = ph : false;
      materia_organica != null && materia_organica != '' ? estudioSuelo.materia_organica = materia_organica : false;
      no3_ppm != null && no3_ppm != '' ? estudioSuelo.no3_ppm = no3_ppm : false;
      fosforo != null && fosforo != '' ? estudioSuelo.fosforo = fosforo : false;
      k2o_ppm != null && k2o_ppm != '' ? estudioSuelo.k2o_ppm = k2o_ppm : false;
      textura_suelo_id != null && textura_suelo_id != '' ? estudioSuelo.textura_suelo_id = textura_suelo_id : false;
      unidad_productiva_id != null && unidad_productiva_id != '' ? estudioSuelo.unidad_productiva_id = unidad_productiva_id : false;
      await estudioSuelo.save();
      res.json(estudioSuelo);
    } else {
      res.status(404).json({ message: 'Estudio de Suelo no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el estudio de suelo' });
  }
};

// Eliminar un estudio de suelo por su ID
exports.deleteEstudioSuelo = async (req, res) => {
  const { id } = req.params;
  try {
    const estudioSuelo = await EstudioSuelo.findByPk(id);
    if (estudioSuelo) {
      await estudioSuelo.destroy();
      res.json({ message: 'Estudio de Suelo eliminado correctamente' });
    } else {
      res.status(404).json({ message: 'Estudio de Suelo no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el estudio de suelo' });
  }
};

// Filtrar estudios de suelo por campo y valor
exports.filterEstudioSuelosByField = async (req, res) => {
  const { field, value, where_filtros } = req.query;

  let filtros = JSON.parse(where_filtros);
  console.log(filtros);

  // Comprobar y remover comillas de los valores de filtros existentes
  //filtros["codigo"] != null ? filtros["codigo"] = eval(filtros["codigo"]) : null;
  console.log(filtros);


  try {
    const estudioSuelos = await EstudioSuelo.findAll({
      where: filtros
    });
    res.json(estudioSuelos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al filtrar los estudios de suelo' });
  }
};

module.exports = exports;
