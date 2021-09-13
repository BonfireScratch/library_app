const db = require('../models');
const Borrow = db.borrows;
const BorrowHistory = db.borrowHistory;

exports.create = (req, res) => {
  // Check if all necessary parameters have been passed
  if (!req.body.f_user_id || !req.body.f_book_id || !req.body.date_of_borrow || !req.body.date_of_exp_return) {
    res.status(400).send({
      message: "Bad request"
    });

    return;
  }

  const borrow = {
    f_user_id: req.body.f_user_id,
    f_book_id: req.body.f_book_id,
    date_of_borrow: req.body.date_of_borrow,
    date_of_exp_return: req.body.date_of_exp_return,
  };

  Borrow.create(borrow).then(data => {
    res.send(data);
  }).catch(error => {
    res.status(500).send({
      message: error.message
    });
  });
};

exports.findAll = (req, res) => {
  Borrow.findAll({ where: {} }).then(data => {
    res.send(data);
  }).catch(error => {
    res.status(500).send({
      message: error.message
    });
  });
};

exports.findOne = (req, res) => {
  // Check if all necessary parameters have been passed
  if (!req.params.id) {
    res.status(400).send({
      message: "Bad request"
    });

    return;
  }

  const using = req.query.using || 'borrow_id';

  if (using === 'borrow_id') {
    Borrow.findByPk(req.params.id).then(data => {
      res.send(data);
    }).catch(error => {
      res.status(500).send({
        message: `Error retrieving borrow with id=${req.params.id}`
      });
    });
  } else if (using === 'book_id') {
    Borrow.findOne({ where: { f_book_id: req.params.id } }).then(data => {
      res.send(data);
    }).catch(error => {
      res.status(500).send({
        message: `Error retrieving borrow with book_id=${req.params.id}`
      });
    });
  } else if (using === 'user_id') {
    Borrow.findAll({ where: { f_user_id: req.params.id } }).then(data => {
      res.send(data);
    }).catch(error => {
      res.status(500).send({
        message: `Error retrieving borrow with user_id=${req.params.id}`
      });
    });
  }
};

exports.update = (req, res) => {
  const id = req.params.id;

  // Check if all necessary parameters have been passed
  if (!id) {
    res.status(400).send({
      message: "Bad request: book ID missing"
    });
  
    return;
  }

  Borrow.update(req.body, { where: { id: id } }).then(num => {
    if (num == 1) {
      res.send({
        message: "Borrow was updated successfully."
      });
    } else {
      res.status(500).send({
        message: `Cannot update borrow with id=${id}`
      });
    }
  }).catch(err => {
    res.status(500).send({
      message: `Error updating borrow with id=${id}`
    });
  });
};

exports.delete = (req, res) => {
  const completeDelete = data => {
    let { id, ...borrow } = data.dataValues;
    borrow.date_of_act_return = new Date().toISOString().slice(0, 10);

    BorrowHistory.create(borrow).then(data_ => {
      Borrow.destroy({ where: { id: id } }).then(num => {
        if (num == 1) {
          res.status(200).send({
            message: `Borrow deleted successfully`
          });
        } else {
          res.status(500).send({
            message: `Error deleting borrow with id=${id}`
          });
        }
      }).catch(error => {
        res.status(500).send({
          message: `Error deleting borrow with id=${id}`
        });
      });
    }).catch(error => {
      res.status(500).send({
        message: `Error transferring borrow to history`
      });
    });
  }

  // Check if all necessary parameters have been passed
  if (!req.params.id) {
    res.status(400).send({
      message: "Bad request"
    });

    return;
  }

  const using = req.query.using || 'borrow_id';

  if (using === 'borrow_id') {
    Borrow.findByPk(req.params.id).then(data => {
      completeDelete(data);
    }).catch(error => {
      res.status(500).send({
        message: `Error retrieving borrow with id=${req.params.id}`
      });
    });
  } else if (using === 'book_id') {
    Borrow.findOne({ where: { f_book_id: req.params.id } }).then(data => {
      completeDelete(data);
    }).catch(error => {
      res.status(500).send({
        message: `Error retrieving borrow with book_id=${req.params.id}`
      });
    });
  } else if (using === 'user_id') {
    Borrow.findAll({ where: { f_user_id: req.params.id } }).then(data => {
      completeDelete(data);
    }).catch(error => {
      res.status(500).send({
        message: `Error retrieving borrow with user_id=${req.params.id}`
      });
    });
  }
};

exports.deleteAll = (req, res) => {
  Borrow.findAll({ where: {} }).then(data => {
    let borrows = [];

    for (entry of data) {
      let { id, ...borrow } = entry.dataValues;
      borrow.date_of_act_return = new Date().toISOString().slice(0, 10);

      borrows.push(borrow);
    }

    BorrowHistory.bulkCreate(borrows).then(() => {
      Borrow.destroy({ where: {}, truncate: false }).then(nums => {
        res.send({ message: `${nums} borrows were deleted succesfully` });
      }).catch(err => {
        res.status(500).send({
          message: err.message || "Error removing all borrows."
        });
      });
    }).catch(error => {
      res.status(500).send({
        message: `Error transferring borrows to history`
      });
    });
  }).catch(error => {
    res.status(500).send({
      message: `Error retrieving all borrows`
    });
  });
};
