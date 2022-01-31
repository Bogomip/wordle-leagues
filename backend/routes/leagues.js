const express = require('express');
const router = express.Router();
const multer = require('multer');

// NEED TO ADD MODELS FOR THIS DATA TO THE TOP OF HERE...

router.post('/join', (req, res, next) => {
    console.log('joining league...')
})

router.post('/leave', (req, res, next) => {
    console.log('leaving league...' + req.body);
})

router.delete('/delete', (req, res, next) => {
    console.log('deleting league...' + req.body);
})

router.post('/restart', (req, res, next) => {
    console.log('restarting league...' + req.body);
})


module.exports = router;
