const express = require('express');
const router = express.Router();

const {ensureAuthenticated} = require("../config/auth");

// creating a route
router.get("/", (req, res) => res.render('welcome'));

// Settings
router.get("/settings", (req, res) => res.render('settings'));

// dahsboard
router.get("/dashboard", ensureAuthenticated, (req, res) => res.render('dashboard', {handle: req.user.handle}));

module.exports = router;