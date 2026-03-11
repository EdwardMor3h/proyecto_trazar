const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  "gis_mango",
  "gis_user",
  "123456",
  {
    host: "localhost",
    port: 5432,
    dialect: "postgres",
  }
);

module.exports = sequelize;