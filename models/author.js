// get a reference to the mongoose MongoDB 
const mongoose = require("mongoose");
// get a reference to the Book model 
const Book = require("./book");


// define the fields of an Author by creating a mongoose schema
const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

// set up a constraint that will disallow removing an author from the database
// if there are any books associated with the author (a "foriegn key delete" constraint)
// The 'next' parameter for the function is a mogoose method that will receive a callback
// if there are any errors or issues.
authorSchema.pre("remove", function (next) {
    console.log(`Ready to search for books by author id: ${this.id}`)
    Book.find({ authorId: this.id }, (error, books) => {
        // if an error was encountered when attempting to find books that 
        // reference the author id, call the 'next' callback method with the
        // error object, so that the author record won't be removed from the DB.
        if (error) {
            console.error(`Error encountered attempting to find books associated with author id: ${this.id}\nError: ${error}`);
            next(error);
        } else if (books.length > 0) {
            // if we made it to here, there is at least one book associated with
            // the author; therefore, call the mongoose callback method with an error, 
            // so that the author record won't be removed from the DB.
            console.error(`Books are currently associated with author id: ${this.id}`);
            next(new Error(`Books are still associated with this author (Author id: ${this.id})`));
        } else {
            // if we made it to here, there are no books associated with the author,
            // so call the mongoose callback method with no parameters, indicating that
            // it's fine to proceed with removing the author record from the DB.
            console.log(`There are currently NO books associated with author id: ${this.id}`);
            next();
        }
    });
});

module.exports = mongoose.model("Author", authorSchema);