// get a reference to the mongoose MongoDB 
const mongoose = require("mongoose");

// define the fields of an Author by creating a mongoose schema
const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("Author", authorSchema);