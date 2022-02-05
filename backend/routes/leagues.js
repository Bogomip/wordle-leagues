const express = require('express');
const router = express.Router();
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');

// NEED TO ADD MODELS FOR THIS DATA TO THE TOP OF HERE...

router.post('/join',
    checkAuth,
    (req, res, next) => {
    console.log('joining league...')
})

router.post('/leave',
    checkAuth,
    (req, res, next) => {
    console.log('leaving league...' + req.body);
})

router.delete(
    '/delete',
    checkAuth,
    (req, res, next) => {
    console.log('deleting league...' + req.body);
})

router.post(
    '/restart'
    , checkAuth
    , (req, res, next) => {
    console.log('restarting league...' + req.body);
})


module.exports = router;
