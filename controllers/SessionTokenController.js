const SessionToken = require('../models/SessionToken');
const { v4: uuidv4 } = require('uuid'); // Importa la función UUID v4

// Función para generar un token de sesión único
const generateSessionToken = () => {
    const token = uuidv4(); // Genera un token UUID único
    return token;
};

// Función para guardar el token en la base de datos
const saveSessionToken = async (userId, token) => {
  await SessionToken.create({
    token,
    revocado: false,
    usuario_id: userId,
  });
};

// Función para marcar un token como revocado
const revokeSessionToken = async (token) => {
  await SessionToken.update({ revocado: true }, { where: { token } });
};

// Función para revocar todos los tokens de sesión de un usuario
const revokeAllSessionTokensForUser = async (userId) => {
    await SessionToken.update({ revocado: true }, { where: { usuario_id: userId } });
};

const checkTokenValidity = async (token) => {
    try {
        const sessionToken = await SessionToken.findOne({
            where: { token, revocado: false }, // Busca el token no revocado en la base de datos
        });

        return sessionToken !== null; // Devuelve true si se encontró el token
    } catch (error) {
        console.error('Error al verificar el token:', error);
        return false; // En caso de error, consideramos el token como inválido
    }
};

// Otras funciones relacionadas con los tokens de sesión

module.exports = {
  generateSessionToken,
  saveSessionToken,
  revokeSessionToken,
  revokeAllSessionTokensForUser,
  checkTokenValidity
  // Exportar otras funciones si las tienes
};
