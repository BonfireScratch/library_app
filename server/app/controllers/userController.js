const db = require('../models');
const User = db.users;
const Op = db.Sequelize.Op;

exports.create = (req, res) => {
  // Check if all necessary parameters have been passed
  if (!req.body.first_name || !req.body.last_name || !req.body.fathers_name || !req.body.year_of_birth || !req.body.class || !req.body.date_of_join) {
    res.status(400).send({
      message: "Bad request"
    });

    return;
  }

  const user = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    fathers_name: req.body.fathers_name,
    year_of_birth: req.body.year_of_birth,
    class: req.body.class,
    date_of_join: req.body.date_of_join,
  };

  User.create(user).then(data => {
    res.send(data);
  }).catch(error => {
    res.status(500).send({
      message: error.message
    });
  });
};

exports.findAll = (req, res) => {
  const keywords = req.query.keywords;
  const limit = req.query.limit;

  let limits = {};

  if (limit) {
    limits = {
      limit: parseInt(limit)
    };
  }

  User.findAndCountAll({ where: {
    [Op.or]: [
      db.Sequelize.where(db.Sequelize.fn('unaccent', db.Sequelize.col('first_name')), { [Op.iLike]: `%${keywords}%` }),
      db.Sequelize.where(db.Sequelize.fn('unaccent', db.Sequelize.col('last_name')), { [Op.iLike]: `%${keywords}%` })
    ]
  }, ...limits }).then(data => {
    res.send(data);
  }).catch(error => {
    res.status(500).send({
      message: error.message
    });
  })
};

exports.findOne = (req, res) => {
  const id = req.params.id;

  // Check if all necessary parameters have been passed
  if (!id) {
    res.status(400).send({
      message: "Bad request: user ID missing"
    });
  
    return;
  }

  User.findByPk(id).then(data => {
    res.send(data);
  }).catch(error => {
    res.status(500).send({
      message: `Error retrieving user with id=${id}`
    });
  });
};

exports.update = (req, res) => {
  const id = req.params.id;

  // Check if all necessary parameters have been passed
  if (!id) {
    res.status(400).send({
      message: "Bad request: user ID missing"
    });
  
    return;
  }

  User.update(req.body, { where: { id: id } }).then(num => {
    if (num == 1) {
      res.send({
        message: "User was updated successfully."
      });
    } else {
      res.status(500).send({
        message: `Cannot update user with id=${id}`
      });
    }
  }).catch(err => {
    res.status(500).send({
      message: `Error updating user with id=${id}`
    });
  });
};

exports.delete = (req, res) => {
  const id = req.params.id;
  
  // Check if all necessary parameters have been passed
  if (!id) {
    res.status(400).send({
      message: "Bad request: user ID missing"
    });
  
    return;
  }

  User.destroy({
    where: { id: id }
  }).then(num => {
    if (num == 1) {
      res.send({
        message: "User was deleted successfully!"
      });
    } else {
      res.status(500).send({
        message: `Cannot delete user with id=${id}`
      });
    }
  }).catch(err => {
    res.status(500).send({
      message: `Error deleting user with id=${id}`
    });
  });
};

exports.deleteAll = (req, res) => {
  User.destroy({ where: {}, truncate: false }).then(nums => {
    res.send({ message: `${nums} user were deleted successfully!` });
  }).catch(err => {
    res.status(500).send({
      message: err.message || "Error removing all users."
    });
  });
};
