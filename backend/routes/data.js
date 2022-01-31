const express = require('express');
const router = express.Router();
const multer = require('multer');

// NEED TO ADD MODELS FOR THIS DATA TO THE TOP OF HERE...

/**
 * Get all league data for all leagues for the user..
 */
router.get('/all/:id', (req, res, next) => {
    console.log("get all data..." + req.params.id);

    res.status(200).json({
        data: 'here is the data...'
    })
})

/**
 * Get all league data for the user...
 */
router.get('/league/:id', (req, res, next) => {
    console.log("get all data in a specific league..." + req.params.id);

    res.status(200).json({
        data: 'here is the data...'
    })
})

/**
 * Gtes all relevant notifications for the user...
 */
router.get('/notifications/:id', (req, res, next) => {
    console.log("get all notifications..." + req.params.id);

    res.status(200).json({
        data: 'here is the data...'
    })
})

/**
 * Posts the daily wordle score to the database
 */
router.post('/daily/:id', (req, res, next) => {
    console.log('submitting daily wordle score' + req.body);

    res.status(201).json({
        data: 'here is the data...'
    })
})


module.exports = router;
