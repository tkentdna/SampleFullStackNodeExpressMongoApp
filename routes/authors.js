const express = require("express");

const router = express.Router();

const Author = require("../models/author");

const Book = require("../models/book");

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
// NOTE: This method must appear before the 'router.get("/:id")...' method; otherwise,
//       it will not be possible to redirect to the form for creating a new author
router.get("/new", (request, response) => {
    console.log("Ready to show form for creating a new author...")
    response.render("authors/new", { author: new Author() });  // views/authors/new.ejs 
});

// (GET) A specific author for display
router.get("/:id", async (request, response) => {
    //response.send("Show Author " + request.params.id);
    try {
        console.log("Ready to get author by id...")
        const author = await Author.findById(request.params.id);
        console.log("Ready to find books associated with the author...")
        const books = await Book.find({ authorId: author.id }).limit(6).exec();
        response.render('authors/show', {
          author: author,
          booksByAuthor: books
        }); 
    } catch (error) {
        console.error(`Error encountered attempting to show book for author id: ${request.params.id}\nError: ${error}`);
        response.redirect('/');
    }
});

// (GET) A specific author for edit
router.get("/:id/edit", async (request, response) => {
    //response.send("Edit Author " + request.params.id);
    try {
        const author = await Author.findById(request.params.id);
        response.render("authors/edit", { author: author });  // views/authors/edit.ejs 
    } catch(error) {
        console.log("Error in GET author for edit: " + error);
        response.redirect("/authors");
    }
});

// (POST) Create Author Route
router.post("/", async (request, response) => {
    const author = new Author({
        name: request.body.name
    });

    try {
        const newAuthor = await author.save();
        response.redirect(`authors/${newAuthor.id}`);
    } catch {
        response.render("authors/new", {
            author: author, 
            errorMessage: "Error creating author"
        });
    }
});

// (PUT) Update details for a specific author
router.put("/:id", async (request, response) => {
    //response.send("Update Author " + request.params.id);
    let author = null;
    try {
        console.log(`Ready to find author record to be updated. (id: ${request.params.id})`);
        author = await Author.findById(request.params.id);
        author.name = request.body.name;
        console.error(`Ready to update author record. (author: ${author})`);
        await author.save();
        response.redirect(`/authors/${author.id}`);
    } catch {
        console.error(`Error finding author record to be updated. (id: ${request.params.id})`);
        if (author == null) {
            response.redirect("/");
        } else {
            console.error(`Error updating author record. (author: ${author})`);
            response.render("authors/edit", {
                author: author, 
                errorMessage: "Error updating author"
            });
        }   
    }
});

// (DELETE) A specific author
router.delete("/:id", async (request, response) => {
    //response.send("Delete Author " + request.params.id);
    let author = null;
    try {
        console.log(`Ready to find author record to be deleted. (id: ${request.params.id})`);
        author = await Author.findById(request.params.id);
        console.error(`Ready to delete author record. (author: ${author})`);
        await author.remove();
        response.redirect(`/authors`);
    } catch {
        if (author == null) {
            console.error(`Error finding author record to be deleted. (id: ${request.params.id})`);
            response.redirect("/");
        } else {
            console.error(`Error deleting author record. (author: ${author})`);
            response.redirect(`/authors/${author.id}`);
        }   
    }
});

module.exports = router;