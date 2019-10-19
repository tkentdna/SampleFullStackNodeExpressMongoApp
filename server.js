// if we're not running in a production environment, load and activate dotenv 
// (to utilize substitutions within .env file)
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
//const dotenv = require("dotenv").config();

const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongodb = require("mongoose");  // MongoDB integration library

// set up connection to the appropriate MongoDB instance
mongodb.connect(process.env.DATABASE_URL, { 
    useNewUrlParser: true,
    useUnifiedTopology: true
});
// let's log whether we are able to connect to the MongoDB instance
const db = mongodb.connection;
// on an error connecting to the MongoDB...
db.on("error", error => {
    console.error(`Error connecting to Mongo DB: ${error}`);
});
// one-time only, if we succeeded in opening the MongoDB connection, log success
db.once("open", () => {
    console.log("Successfully connected to MongoDB");
});

// get reference to the route for index (root)
const indexRouter = require("./routes/index");

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

// set up routes
app.use("/", indexRouter);  


// listen for http requests on a particular port
// In Dev mode, we'll default to port 3000
app.listen(process.env.PORT || 3000);