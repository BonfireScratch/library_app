module.exports = app => {
  const borrows = require("../controllers/borrowController.js");
      
  var router = require("express").Router();
      
  router.post("/", borrows.create);
  router.put("/:id", borrows.update);
    
  router.get("/:id", borrows.findOne);
  router.get("/", borrows.findAll);
    
  router.delete("/:id", borrows.delete);
  router.delete("/", borrows.deleteAll);
      
  app.use('/api/borrow', router);
};