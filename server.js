// if we're not running in a production environment, load and activate dotenv 
// (to utilize substitutions within .env file)
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
//const dotenv = require("dotenv").config();

const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");  // MongoDB integration library
const bodyParser = require("body-parser");

//set up connection to the appropriate MongoDB instance
// mongoose.connect(process.env.DATABASE_URL, { 
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// });

// mongoose.connect(process.env.DATABASE_URL, { 
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// }).catch(error => handleError(error));

// utilize IIFE to connect to the MongoDB via Mongoose
(async function connectToMongoose() {
    try {
        await mongoose.connect(process.env.DATABASE_URL, { 
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
    } catch (error) {
        //console.error(`Error upon attempting to connect to MongoDB via Mongoose ${process.env.DATABASE_URL}: ${error}`);
        handleError(error);
    }
})();



// let's log whether we are able to connect to the MongoDB instance
const db = mongoose.connection;
// on an error connecting to the MongoDB...
db.on("error", error => {
    console.error(`Error connecting to Mongo DB: ${error}`);
});
// one-time only, if we succeeded in opening the MongoDB connection, log success
db.once("open", () => {
    console.log("Successfully connected to MongoDB");
});

function handleError(error) {
    console.error(`Error connecting to Mongo DB: ${error}`);
}

// get reference to the route for index (root)
const indexRouter = require("./routes/index");

// get reference to the route for Authors
const authorRouter = require("./routes/authors");

// get an instance of the express application 
const app = express();

// configure the app
// indicate that we'll use the ejs view engine
app.set("view engine", "ejs");
// view files will be found within the /views folder
app.set("views", __dirname + "/views");
// indicates where to find layouts (in a file named 'layout' inside of a folder labeled 'layouts')
app.set("layout", "layouts/layout");
// use Express layouts
app.use(expressLayouts);
// indicate where to find application assets (js, style sheets, images, etc.) -- in a folder labeled 'public'
app.use(express.static("public"));
// indicate to use body-parser, and limit the payload to 10MB
app.use(bodyParser.urlencoded({ limit: "10mb", extended: false }));

// set up routes
app.use("/", indexRouter);  
app.use("/authors", authorRouter);  


// listen for http requests on a particular port
// In Dev mode, we'll default to port 3000
app.listen(process.env.PORT || 3000);