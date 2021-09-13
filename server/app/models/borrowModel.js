module.exports = (database, Sequelize) => {
  const Borrow = database.define('borrow', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    f_user_id: {
      type: Sequelize.INTEGER,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'cascade',
    },
    f_book_id: {
      type: Sequelize.INTEGER,
      references: {
        model: 'books',
        key: 'id'
      },
      onDelete: 'cascade',
    },
    date_of_borrow: {
      type: Sequelize.DATE
    },
    date_of_exp_return: {
      type: Sequelize.DATE
    },
  }, {
    timestamps: false
  });
  
  return Borrow;
};
