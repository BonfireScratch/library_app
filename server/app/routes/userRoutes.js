module.exports = app => {
  const users = require("../controllers/userController.js");
    
  var router = require("express").Router();
    
  router.post("/", users.create);
  router.put("/:id", users.update);
  
  router.get("/:id", users.findOne);
  router.get("/", users.findAll);
  
  router.delete("/:id", users.delete);
  router.delete("/", users.deleteAll);
    
  app.use('/api/user', router);
};