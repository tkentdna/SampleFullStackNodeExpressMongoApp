// include npm components
const express = require("express");
// const multer = require("multer");
const path = require("path");  // built-in 'path' library
const fileSystem = require("fs");  // built-in 'file system' library

// include models
const Book = require("../models/book");
const Author = require("../models/author");

// instantiate an Express router
const router = express.Router();

// // specify the path in the local file system for uploading cover image files
// const uploadPath = path.join("public", Book.coverImageBasePath);

const imageMimeTypes = ["image/jpeg", "image/png", "image/gif"];

// // instantiate a file upload object from Multer (for uploading a file with the cover image)
// const upload = multer({
//     dest: uploadPath,
//     fileFilter: (request, file, callback) => {
//         callback(null, imageMimeTypes.includes(file.mimetype));
//     }
// });

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

// (GET) To create a new book
// New Books Route (form for creating an Book)
router.get("/new", (request, response) => {
    renderFormPage(response, new Book(), "new", false);
});

// (GET) Show Book by ID
router.get("/:id", async (request, response) => {
    try {
        console.log("Ready to get book by id (router.get('/:id')...")
        // const book = await Book.findById(request.params.id).populate("author").exec();

        // // Render the book details to the "Show Book" form view
        // response.render('books/show', {
        //     book: book
        // });

        const book = await Book.findById(request.params.id)
                           .populate('author')
                           .exec();
        response.render('books/show', { book: book });
    } catch {
        console.error(`Error encountered attempting to show book for book id: ${request.params.id}\nError: ${error}`);
        // in the case of an error, redirect user to the main Books page
        response.redirect("/");
    }
});

// (GET) To edit an existent book
// Edit Books Route (form for editing a Book)
router.get("/:id/edit", async (request, response) => {
    try {
        console.log("Ready to get book by id (router.get('/:id/edit')...")
        const book = await Book.findById(request.params.id);

        // Render the book details to the "Edit Book" form view
        //renderEditPage(response, book);
        renderFormPage(response, book, "edit", false);
    } catch {
        console.error(`Error encountered attempting to edit book for book id: ${request.params.id}\nError: ${error}`);
        // in the case of an error, redirect user to the main Books page
        response.redirect("/");
    }

});


// (POST) Create Book Route
// router.post("/", upload.single("coverImageFile"), async (request, response) => {
router.post("/", async (request, response) => {

    const logMessage = "New Book Info: \n  title: " + request.body.title +
        "\n  author: " + request.body.author +
        "\n  publishDate: " + request.body.publishDate +
        "\n  pageCount: " + request.body.pageCount +
        // "\n  coverImageName: " + request.file.filename +
        // "\n  coverImagePathname: " + request.file.path +
        "\n  description: " + request.body.description;
    console.log(logMessage);

    // when defining the 'upload' variable (above in this source file), we specified
    // in the fileFilter that the name of the file field in the request will be 'file'
    // const filename = request.file != null ? request.file.filename : null;
    const book = new Book({
        title: request.body.title,
        author: request.body.author,
        publishDate: new Date(request.body.publishDate),
        pageCount: request.body.pageCount,
        // coverImageName: filename,
        description: request.body.description
    });

    // save the book cover image file
    saveCover(book, request.body.cover);

    try {
        const newBook = await book.save();
//         //response.redirect(`books/${newBook.id}`);
        response.redirect(`books`);
    } catch (error) {
        console.error(`Error attempting to save book: ${error}`);
        // // if a book cover image file was uploaded (if the filename exists), let's remove it
        // if (book.coverImageName != null) {
        //     removeBookCoverFile(book.coverImageName);
        // }
        //renderNewPage(response, book, true);
        renderFormPage(response, book, "new", true);
    }
});

// (PUT) Update Book Route
router.put("/:id", async (request, response) => {
    let book = null;
    try {
        console.log(`Ready to find book record to be updated. (id: ${request.params.id})`);
        book = await Book.findById(request.params.id);
        book.title = request.body.title;
        book.publishDate = new Date(request.body.publishDate);
        book.pageCount = request.body.pageCount;
        book.description = request.body.description;
        book.author = request.body.author;

        if ((request.body.cover != null) && (request.body.cover !== "")) {
            // save the book cover image file
            saveCover(book, request.body.cover);
        }

        console.error(`Ready to update book record. (book: ${book})`);
        await book.save();
        response.redirect(`/books/${book.id}`);
    } catch {
        console.error(`Error finding book record to be updated. (id: ${request.params.id})`);
        if (book == null) {
            response.redirect("/");
        } else {
            console.error(`Error updating book record. (author: ${book})`);
            renderFormPage(response, book, "edit", true);
        }   
    }

});

router.delete("/:id", async (request, response) => {
    let book = null;
    try {
        console.log(`Ready to find book record to be deleted. (id: ${request.params.id})`);
        book = await Book.findById(request.params.id);
        console.error(`Ready to delete book record. (book: ${book})`);
        await book.remove();
        response.redirect(`/books`);
    } catch (error) {
        console.error(`Error finding book record to be deleted. (id: ${request.params.id})\nError: ${error}`);
        if (book == null) {
            response.redirect("/");
        } else {
            console.error(`Error updating book record. (book: ${book})\nError: ${error}`);
            response.redirect("/books/show", {
                book: book,
                errorMessage: "Could not remove book"
            });
        }
    }
});
    
async function saveCover(book, coverEncoded) {
    if (coverEncoded != null) {
        const cover = JSON.parse(coverEncoded);
        if ((cover != null) && imageMimeTypes.includes(cover.type)) {
            book.coverImage = new Buffer.from(cover.data, 'base64');
            book.coverImageType = cover.type;
        }
        try {
        
        } catch (error) {
            console.error(`Error attempting to save book cover: ${error}`);
        }
    }
}

// function removeBookCoverFile(filename) {
//     fileSystem.unlink(path.join(uploadPath, filename), error => {
//         if (error) {
//             console.error(`Error attempting to remove book cover file: ${error}`);
//         }
//     });
// }

// async function renderNewPage(response, book, hasError = false) {
//     try {
//         // get all authors from the DB
//         const allAuthors = await Author.find({});

//         const params = {
//             authors: allAuthors,
//             book: book
//         };

//         // Render the collection of authors in the DB and the new book object
//         // to the recipient form view for entering a new book.  The collection 
//         // of authors will be used to populate the Authors dropdown
//         if (hasError) {
//             params.errorMessage = "Error creating a new book";
//         }
//         response.render('books/new', params);
//     } catch {
//         // in the case of an error, redirect user to the main Books page
//         response.redirect("/books");
//     }
// }

// async function renderEditPage(response, book, hasError = false) {
//     try {
//         // get all authors from the DB
//         const allAuthors = await Author.find({});

//         const params = {
//             authors: allAuthors,
//             book: book
//         };

//         // Render the collection of authors in the DB and the new book object
//         // to the recipient form view for entering a new book.  The collection 
//         // of authors will be used to populate the Authors dropdown
//         if (hasError) {
//             params.errorMessage = "Error editing an existing book";
//         }
//         response.render('books/edit', params);
//     } catch {
//         // in the case of an error, redirect user to the main Books page
//         response.redirect("/books");
//     }
// }


async function renderFormPage(response, book, form, hasError = false) {
    try {
        // get all authors from the DB
        const allAuthors = await Author.find({});

        const params = {
            authors: allAuthors,
            book: book
        };

        if (hasError) {
            console.log(`Processing error for operation type of '${form}'`);
            if (form === 'edit') {
                params.errorMessage = 'Error Updating Book'
            } else {
                params.errorMessage = 'Error Creating Book'
            }
        }

        // Render the form for either creating a new book or editing an existing book.
        // The params contains both collection of authors in the DB and the new/existing
        // book object. The collection of authors will be used to populate the Authors 
        // dropdown.
        console.log(`Ready to render to books/${form} with params: '${params}'`);
        response.render(`books/${form}`, params);
    } catch {
        // in the case of an error, redirect user to the main Books page
        response.redirect("/books");
    }
}

module.exports = router;