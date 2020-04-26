const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');

const app = express();
const PORT = process.env.PORT || 5000;

// Passport config
require('./config/passport')(passport);

// DB Config
const db  = require('./config/keys').MongoURI;
// Connecting To Mongo
mongoose.connect(db, {useNewUrlParser: true})
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

// Ejs middleware
app.use(expressLayouts);
app.set('view engine', 'ejs'); // setting the view-engine

// Body-Parser
app.use(express.urlencoded({extended: false})); // (extended : flase) : to get data from the form using req.body

// Express-session middleware
app.use(session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect-flash
app.use(flash());

// Middleware for Global variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    next();
});

// Routes
app.use("/", require("./routes/index"));
app.use("/users", require("./routes/users"));

app.listen(PORT, console.log(`server started on ${PORT}`));