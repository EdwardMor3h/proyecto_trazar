const Rol = require('../models/Rol');

// Obtener todos los roles
exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Rol.findAll();
    res.json(roles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los roles' });
  }
};

// Crear un nuevo rol
exports.createRol = async (req, res) => {
  const { nombre } = req.body;
  try {
    const rol = await Rol.create({
      nombre,
    });
    res.status(201).json(rol);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el rol' });
  }
};

// Actualizar un rol por su ID
exports.updateRol = async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  try {
    const rol = await Rol.findByPk(id);
    if (rol) {
      rol.nombre = nombre;
      await rol.save();
      res.json(rol);
    } else {
      res.status(404).json({ message: 'Rol no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el rol' });
  }
};

// Eliminar un rol por su ID
exports.deleteRol = async (req, res) => {
  const { id } = req.params;
  try {
    const rol = await Rol.findByPk(id);
    if (rol) {
      await rol.destroy();
      res.json({ message: 'Rol eliminado correctamente' });
    } else {
      res.status(404).json({ message: 'Rol no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el rol' });
  }
};

module.exports = exports;
