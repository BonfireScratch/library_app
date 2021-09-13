const db = require('../models');
const Book = db.books;
const Op = db.Sequelize.Op;

exports.create = (req, res) => {
  // Check if all necessary parameters have been passed
  if (!req.body.title || !req.body.author) {
    res.status(400).send({
      message: "Bad request"
    });

    return;
  }

  const book = {
    title: req.body.title,
    author: req.body.author,
    publisher: req.body.publisher || "-",
    genre: req.body.genre || "-",
    availability: req.body.availability || 0
  };

  Book.create(book).then(data => {
    res.send(data);
  }).catch(error => {
    res.status(500).send({
      message: error.message
    });
  });
};

exports.findAll = (req, res) => {
  const keywords = req.query.keywords;
  const searchAvailability = req.query.availability;
  const limit = req.query.limit;

  const keywordCondition = keywords ? {
    [Op.or]: [
      db.Sequelize.where(db.Sequelize.fn('unaccent', db.Sequelize.col('title')), { [Op.iLike]: `%${keywords}%` }),
      db.Sequelize.where(db.Sequelize.fn('unaccent', db.Sequelize.col('author')), { [Op.iLike]: `%${keywords}%` })
    ]
  } : null;

  const availabilityCondition = searchAvailability ? {
    availability: {
      [Op.in]: JSON.parse(searchAvailability)
    }
  } : null;

  let finalCondition = null;

  if (keywords && searchAvailability) {
    finalCondition = {
      [Op.and]: [
        keywordCondition,
        availabilityCondition
      ]
    };
  } else if (keywords) {
    finalCondition = keywordCondition;
  } else if (searchAvailability) {
    finalCondition = availabilityCondition;
  }

  let limits = {};

  if (limit) {
    limits = {
      limit: parseInt(limit)
    };
  }

  Book.findAndCountAll({ where: finalCondition, ...limits }).then(data => {
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
      message: "Bad request: book ID missing"
    });
  
    return;
  }

  Book.findByPk(id).then(data => {
    res.send(data);
  }).catch(error => {
    res.status(500).send({
      message: `Error retrieving book with id=${id}`
    });
  });
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

  Book.update(req.body, { where: { id: id } }).then(num => {
    if (num == 1) {
      res.send({
        message: "Book was updated successfully."
      });
    } else {
      res.status(500).send({
        message: `Cannot update book with id=${id}`
      });
    }
  }).catch(err => {
    res.status(500).send({
      message: `Error updating book with id=${id}`
    });
  });
};

exports.delete = (req, res) => {
  const id = req.params.id;

  // Check if all necessary parameters have been passed
  if (!id) {
    res.status(400).send({
      message: "Bad request: book ID missing"
    });
  
    return;
  }

  Book.destroy({
    where: { id: id }
  }).then(num => {
    if (num == 1) {
      res.send({
        message: "Book was deleted successfully!"
      });
    } else {
      res.status(500).send({
        message: `Cannot delete book with id=${id}`
      });
    }
  }).catch(err => {
    res.status(500).send({
      message: `Error deleting book with id=${id}`
    });
  });
};

exports.deleteAll = (req, res) => {
  Book.destroy({ where: {}, truncate: false }).then(nums => {
    res.send({ message: `${nums} book were deleted successfully!` });
  }).catch(err => {
    res.status(500).send({
      message: err.message || "Error removing all books."
    });
  });
};
