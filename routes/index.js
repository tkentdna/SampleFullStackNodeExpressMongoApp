const express = require("express");
const Book = require("../models/book");

const router = express.Router();
const app = express();

router.get("/", async (request, response) => {
    let books = null;
    try {
        books = await Book.find().sort( {createdAt: "desc"}).limit(10).exec();
    } catch (error) {
        console.log("Error in Mian Index to GET all books: " + error);
        books = [];
    }
    response.render("index", { books: books });  // views/index.ejs 
});

module.exports = router;