module.exports = (database, Sequelize) => {
  const Book = database.define('book', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    title: {
      type: Sequelize.STRING
    },
    author: {
      type: Sequelize.STRING
    },
    publisher: {
      type: Sequelize.STRING
    },
    genre: {
      type: Sequelize.STRING
    },
    availability: {
      type: Sequelize.INTEGER
    }
  }, {
    timestamps: false
  });

  return Book;
};
