// include npm components
const express = require("express");
const multer = require("multer");
const path = require("path");  // built-in 'path' library
const fileSystem = require("fs");  // built-in 'file system' library

// include models
const Book = require("../models/book");
const Author = require("../models/author");

// instantiate an Express router
const router = express.Router();

// specify the path in the local file system for uploading cover image files
const uploadPath = path.join("public", Book.coverImageBasePath);

const imageMimeTypes = ["image/jpeg", "image/png", "image/gif"];

// instantiate a file upload object from Multer (for uploading a file with the cover image)
const upload = multer({
    dest: uploadPath,
    fileFilter: (request, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype));
    }
});

const app = express();

// (GET) All Books Route
router.get("/", async (request, response) => {
    //response.send("All Books");
    let query = Book.find();
    if (request.query.title != null && request.query.title != '') {
        query = query.regex("title", new RegExp(request.query.title, "i"));
    }
    if (request.query.publishedBefore != null && request.query.publishedBefore != '') {
        query = query.lte("publishDate", request.query.publishedBefore);
    }
    if (request.query.publishedAfter != null && request.query.publishedAfter != '') {
        query = query.gte("publishDate", request.query.publishedAfter);
    }
    try {
        console.log("In GET all books.  request.query.title: " + request.query.title);
        const books = await query.exec();
        response.render("books/index", {
            books: books,
            searchOptions: request.query
        });
    } catch (error) {
        console.log("Error in GET all books: " + error);
        response.redirect("/");
    }
    // let searchOptions = {};
    // if (request.query.name != null && request.query.name !== "") {
    //     searchOptions.name = new RegExp(request.query.name, "i");
    // }
    // try {
    //     const books = await Book.find(searchOptions);
    //     response.render("books/index", {  // views/books/index.ejs
    //         books: books, 
    //         searchOptions: request.query
    //     });   
    // } catch {
    //     redirect("/");
    // }
});

// New Books Route (form for creating an Book)
router.get("/new", (request, response) => {
    // try {
    //     // get all authors from the DB
    //     const allAuthors = await Author.find({});

    //     // instantiate a new Book object
    //     const newBook = new Book();

    //     // Render the collection of authors in the DB and the new book object
    //     // to the recipient form view for entering a new book.  The collection 
    //     // of authors will be used to populate the Authors dropdown
    //     response.render('books/new', {
    //         authors: allAuthors,
    //         book: newBook
    //     });
    // } catch {
    //     // in the case of an error, redirect user to the main Books page
    //     response.redirect("/books");
    // }

    renderNewPage(response, new Book());
});

// (POST) Create Book Route
router.post("/", upload.single("coverImageFile"), async (request, response) => {

    const logMessage = "New Book Info: \n  title: " + request.body.title +
        "\n  authorId: " + request.body.authorId +
        "\n  publishDate: " + request.body.publishDate +
        "\n  pageCount: " + request.body.pageCount +
        "\n  coverImageName: " + request.file.filename +
        "\n  coverImagePathname: " + request.file.path +
        "\n  description: " + request.body.description;
    console.log(logMessage);

    // when defining the 'upload' variable (above in this source file), we specified
    // in the fileFilter that the name of the file field in the request will be 'file'
    const filename = request.file != null ? request.file.filename : null;
    const book = new Book({
        title: request.body.title,
        authorId: request.body.authorId,
        publishDate: new Date(request.body.publishDate),
        pageCount: request.body.pageCount,
        coverImageName: filename,
        description: request.body.description
    });

    try {
        const newBook = await book.save();
//         //response.redirect(`books/${newBook.id}`);
        response.redirect(`books`);
    } catch (error) {
        console.error(`Error attempting to save book: ${error}`);
        // if a book cover image file was uploaded (if the filename exists), let's remove it
        if (book.coverImageName != null) {
            removeBookCoverFile(book.coverImageName);
        }
        renderNewPage(response, book, true);
    }
});

function removeBookCoverFile(filename) {
    fileSystem.unlink(path.join(uploadPath, filename), error => {
        if (error) {
            console.error(`Error attempting to remove book cover file: ${error}`);
        }
    });
}

async function renderNewPage(response, book, hasError = false) {
    try {
        // get all authors from the DB
        const allAuthors = await Author.find({});

        const params = {
            authors: allAuthors,
            book: book
        };

        // Render the collection of authors in the DB and the new book object
        // to the recipient form view for entering a new book.  The collection 
        // of authors will be used to populate the Authors dropdown
        if (hasError) {
            params.errorMessage = "Error creating a new book";
        }
        response.render('books/new', params);
    } catch {
        // in the case of an error, redirect user to the main Books page
        response.redirect("/books");
    }
}

module.exports = router;