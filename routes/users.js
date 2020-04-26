const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// User Model
const User = require('../models/User');

// Login Page Route
router.get("/login", (req, res) => res.render("login"));

// Register Page Route
router.get("/register", (req, res) => res.render("register"));

// Handling the registration logic
router.post("/register", (req, res) => {
    const {name, handle, email, password, password2} = req.body; // using destructuring to get some variables
    // Validation
    let errors = [];
    // Checking the required fields
    if(!name || !handle || !email || !password || !password2) {
        errors.push({msg: "please fill in all fields"});
    }
    // Checking password match
    if(password !== password2) {
        errors.push({msg: "passwords do not match"});
    }
    // Chacking password's length
    if(password.length < 6) {
        errors.push({msg: "the password must be at least 6 characters long"});
    }
    // Checking for errors
    if(errors.length > 0) {
        res.render('register', {
            errors,
            name,
            handle,
            email,
            password,
            password2
        }); // passing the variables for the ejs form in case of an error
    } else {
        // Validation passed successfully

        // Checking if the handle is unique
        User.findOne({handle: handle})
            .then(user => {
                if(user) {
                    // if the the handle has been taken
                    errors.push({msg: `The Handle ${handle} is un-available`});
                    res.render('register', {
                        errors,
                        name,
                        handle,
                        email,
                        password,
                        password2
                    });
                }
            });

        User.findOne({email: email}) // checking if the user exists || the function (findOne) is used to find one record
            .then(user => {
                if(user) { //re-rendering the register form and send an error
                    // if the user exists
                    errors.push({msg: "email is already registered"});
                    res.render('register', {
                        errors,
                        name,
                        handle,
                        email,
                        password,
                        password2
                    });
                } else {
                    const newUser = new User({ // creating a new user
                        name,
                        handle,
                        email,
                        password
                    }); 
                    // Hashing the password
                    bcrypt.genSalt(10, (err, salt) =>
                        bcrypt.hash(newUser.password, salt, (err, hash) => { // generating a salt
                            if(err) throw err;
                            // Setting the password to hash
                            newUser.password = hash
                            // Save User
                            newUser.save()
                                .then(user => {
                                    req.flash("success_msg", "you're registered");
                                    res.redirect("/users/login")
                                })
                                .catch(err => console.log(err));
                        })); 
                        
                }
            }); 
    }
});

// Handling the login logic
router.post("/login", (req, res, next) => {
    passport.authenticate("local", {successRedirect: "/dashboard", failureRedirect: "/users/login", failureFlash: true})(req, res, next);
});

// Handling the logout logic
router.get("/logout", (req, res) => {
    req.logout(); // a passport method
    req.flash("success_msg", "you're logged out"); // sending a flash message
    res.redirect("/users/login");
});

module.exports = router;