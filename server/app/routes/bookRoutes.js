module.exports = app => {
  const books = require("../controllers/bookController.js");
  
  var router = require("express").Router();
  
  router.post("/", books.create);
  router.put("/:id", books.update);

  router.get("/:id", books.findOne);
  router.get("/", books.findAll);

  router.delete("/:id", books.delete);
  router.delete("/", books.deleteAll);
  
  app.use('/api/book', router);
};