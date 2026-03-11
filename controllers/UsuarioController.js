const Usuario = require('../models/Usuario');
const md5 = require('md5');

const path = require('path');
const Busboy = require('busboy');
const fs = require('fs');

// Obtener todos los usuarios
exports.getAllUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      include: 'Rol', // Incluye el modelo de Rol en la consulta
      order: ['usuario']
    });
    res.json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los usuarios' });
  }
};

// Crear un nuevo usuario
exports.createUsuario = async (req, res) => {


  
  try {

    const formData = {};
    let imageFileName = '';

    const busboyInstance = Busboy({ headers: req.headers });

    busboyInstance.on('field', (fieldname, value) => {
      formData[fieldname] = value;
    });

    busboyInstance.on('file', (fieldname, file, filename, encoding, mimetype) => {
      try {
        // Guardar el nombre del archivo para usarlo luego
        imageFileName = filename;

        // Generar un nuevo nombre de archivo si ya existe
        let uniqueFileName = imageFileName.filename;
        let fileIndex = 1;
        const folderPath = path.join(process.cwd(), 'public', 'productor', 'fotos');
        while (fs.existsSync(path.join(folderPath, uniqueFileName))) {
          uniqueFileName = `${path.parse(uniqueFileName).name}_${fileIndex}${path.extname(uniqueFileName)}`;
          fileIndex++;
        }

        // Ruta donde se guardará el archivo, utilizando process.cwd()
        //const folderPath = path.join(process.cwd(), 'public', 'productor', 'fotos');
        const filePath = path.join(folderPath, uniqueFileName);

        // Verificar si la carpeta existe, si no, crearla
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath, { recursive: true });
        }

        const writeStream = fs.createWriteStream(filePath);

        // Guardar el archivo en el sistema de archivos
        file.pipe(writeStream);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear el usuario' });
      }
    });

    busboyInstance.on('finish', async () => {
      try {
        

        const { nombre, dni, zona_id, email, rol_id, usuario, contrasenaa, imageen } = formData;

        const $usuario = usuario;
        const contrasena = md5(contrasenaa);
        console.log($usuario);
        var imagen;
        if (imageFileName && 'filename' in imageFileName) {
          imagen = path.join('productor', 'fotos', imageFileName.filename);
        }
        else{
          imagen = 'https://cdn.www.gob.pe/uploads/document/file/1464052/standard_FOTO_WEB_CAFE-1536x1024.jpg';
        }
        
        console.log(imageen);
        console.log(imagen);

        const nuevo_usuario = await Usuario.create({
          nombre,
          dni,
          zona_id,
          email,
          rol_id,
          usuario,
          contrasena,
          imagen
        });

          res.status(201).json(nuevo_usuario);
        
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar el productor' });
      }
    });

    // Iniciar el procesamiento de la solicitud
    req.pipe(busboyInstance);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el usuario' });
  }

};

// Actualizar un usuario por su ID
exports.updateUsuario = async (req, res) => {
  
  
  try {

    const formData = {};
    let imageFileName = '';

    const busboyInstance = Busboy({ headers: req.headers });

    busboyInstance.on('field', (fieldname, value) => {
      formData[fieldname] = value;
    });

    busboyInstance.on('file', (fieldname, file, filename, encoding, mimetype) => {
      try {
        // Guardar el nombre del archivo para usarlo luego
        imageFileName = filename;

        console.log("===============");

        // Generar un nuevo nombre de archivo si ya existe
        let uniqueFileName = imageFileName.filename;
        let fileIndex = 1;
        const folderPath = path.join(process.cwd(), 'public', 'usuario', 'fotos');
        while (fs.existsSync(path.join(folderPath, uniqueFileName))) {
          uniqueFileName = `${path.parse(uniqueFileName).name}_${fileIndex}${path.extname(uniqueFileName)}`;
          fileIndex++;
        }

        // Ruta donde se guardará el archivo, utilizando process.cwd()
        //const folderPath = path.join(process.cwd(), 'public', 'productor', 'fotos');
        const filePath = path.join(folderPath, uniqueFileName);

        // Verificar si la carpeta existe, si no, crearla
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath, { recursive: true });
        }

        const writeStream = fs.createWriteStream(filePath);

        // Guardar el archivo en el sistema de archivos
        file.pipe(writeStream);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar usuario' });
      }
    });

    busboyInstance.on('finish', async () => {
      try {

        const { id, nombre, dni, zona_id, email, rol_id, usuario, contrasena, imagen } = formData;
        const $usuario = usuario;

        const user = await Usuario.findByPk(id);
        if (user) {
          nombre != null ? user.nombre = nombre : false;
          dni != null ? user.dni = dni : false;
          zona_id != null ? user.zona_id = zona_id : false;
          email != null ? user.email = email : false;
          rol_id != null ? user.rol_id = rol_id : false;
          $usuario != null ? user.usuario = $usuario : false;
          
          if (contrasena != 'nd' && contrasena !== undefined) {
            console.log(contrasena);
            console.log('la contraseña es válida###------------');

            let contrasena_md5 = md5(contrasena);
            user.contrasena = contrasena_md5;
            
          }

          // Actualizar la ruta de la imagen en la base de datos si se adjuntó una imagen
          if (imageFileName && 'filename' in imageFileName) {
            user.imagen = path.join('/usuario', 'fotos', imageFileName.filename);
          }

          await user.save();
          res.json(user);
        } else {
          res.status(404).json({ message: 'Usuario no encontrado' });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar el productor' });
      }
    });

    // Iniciar el procesamiento de la solicitud
    req.pipe(busboyInstance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el usuario' });
  }
};

// Eliminar un usuario por su ID
exports.deleteUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    const usuario = await Usuario.findByPk(id);
    if (usuario) {
      await usuario.destroy();
      res.json({ message: 'Usuario eliminado correctamente' });
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el usuario' });
  }
};

// Filtrar usuarios por campo y valor
exports.filterUsuariosByField = async (req, res) => {
  const { field, value, where_filtros } = req.query;

  let filtros = JSON.parse(where_filtros);
  console.log(filtros);

  // Comprobar y remover comillas de los valores de filtros existentes
  filtros["rol_id"] != null ? filtros["rol_id"] = eval(filtros["rol_id"]) : null;

  try {
    const usuarios = await Usuario.findAll({
      where: filtros,
      include: 'Rol', // Incluye el modelo de Rol en la consulta
      order: ['usuario']
    });
    res.json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al filtrar los usuarios' });
  }
};

module.exports = exports;
