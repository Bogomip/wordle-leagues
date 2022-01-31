const express = require('express');
const router = express.Router();
const multer = require('multer');

// NEED TO ADD MODELS FOR THIS DATA TO THE TOP OF HERE...

router.post('/register', (req, res, next) => {
    console.log('user registration in progress...')
})

router.get('/login', (req, res, next) => {
    console.log('user registration in progress...' + req.body);
})

module.exports = router;
