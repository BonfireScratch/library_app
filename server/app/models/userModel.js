module.exports = (database, Sequelize) => {
  const User = database.define('user', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    first_name: {
      type: Sequelize.STRING
    },
    last_name: {
      type: Sequelize.STRING
    },
    fathers_name: {
      type: Sequelize.STRING
    },
    year_of_birth: {
      type: Sequelize.INTEGER
    },
    class: {
      type: Sequelize.STRING
    },
    date_of_join: {
      type: Sequelize.DATE
    }
  }, {
    timestamps: false
  });

  return User;
};
