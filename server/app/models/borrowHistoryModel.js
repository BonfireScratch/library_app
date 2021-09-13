module.exports = (database, Sequelize) => {
  const BorrowHistory = database.define('borrow_history', {
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
      }
    },
    f_book_id: {
      type: Sequelize.INTEGER,
      references: {
        model: 'books',
        key: 'id'
      }
    },
    date_of_borrow: {
      type: Sequelize.DATE
    },
    date_of_exp_return: {
      type: Sequelize.DATE
    },
    date_of_act_return: {
      type: Sequelize.DATE
    }
  }, {
    timestamps: false,
    freezeTableName: true,
  });
  
  return BorrowHistory;
};
