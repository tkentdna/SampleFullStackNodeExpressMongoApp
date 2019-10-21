const express = require("express");

const router = express.Router();

const Author = require("../models/author");

const app = express();

// (GET) All Authors Route
router.get("/", async (request, response) => {
    let searchOptions = {};
    if (request.query.name != null && request.query.name !== "") {
        searchOptions.name = new RegExp(request.query.name, "i");
    }
    try {
        const authors = await Author.find(searchOptions);
        response.render("authors/index", {  // views/authors/index.ejs
            authors: authors, 
            searchOptions: request.query
        });   
    } catch {
        redirect("/");
    }
});

// New Authors Route (form for creating an Author)
router.get("/new", (request, response) => {
    response.render("authors/new", { author: new Author() });  // views/authors/new.ejs 
});

// (POST) Create Author Route
router.post("/", async (request, response) => {
    const author = new Author({
        name: request.body.name
    });

    try {
        const newAuthor = await author.save();
        //response.redirect(`authors/${newAuthor.id}`);
        response.redirect(`authors`);
} catch {
        response.render("authors/new", {
            author: author, 
            errorMessage: "Error creating author"
        });
    }

    // author.save((error, newAuthor) => {
    //     if (error) {
    //         response.render("authors/new", {
    //             author: author, 
    //             errorMessage: "Error creating author"
    //         });
    //     } else {
    //         //response.redirect(`authors/${newAuthor.id}`);
    //         response.redirect(`authors`);
    //     }
    // });
});

module.exports = router;