const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 8080;

app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

require("./app/routes/bookRoutes")(app);
require("./app/routes/userRoutes")(app);
require("./app/routes/borrowRoutes")(app);

// Host the application
app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
