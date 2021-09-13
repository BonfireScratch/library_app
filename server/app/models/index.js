const dbConfig = require("../config/dbConfig.js");
const Sequelize = require("sequelize");

const database = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  dialect: dbConfig.dialect,
  operatorsAliases: 0,
  logging: false,

  pool: {
    max: dbConfig.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.database = database;
db.books = require("./bookModel.js")(database, Sequelize);
db.users = require("./userModel.js")(database, Sequelize);
db.borrows = require("./borrowModel.js")(database, Sequelize);
db.borrowHistory = require("./borrowHistoryModel.js")(database, Sequelize);

db.books.belongsToMany(db.users, { through: db.borrows, foreignKey: "f_book_id" });
db.users.belongsToMany(db.books, { through: db.borrows, foreignKey: "f_user_id" });

module.exports = db;
