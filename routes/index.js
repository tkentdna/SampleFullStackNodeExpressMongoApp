const express = require("express");

const router = express.Router();
const app = express();

router.get("/", (request, response) => {
    response.render("index");  // views/index.ejs 
});


// app.listen(process.env.PORT || 3000);

module.exports = router;