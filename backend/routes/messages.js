const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

router.get('/all', checkAuth, (req, res, next) => {
    res.status(200).json({
        message: 'yes!'
    })
});

router.post('/delete', checkAuth, (req, res, next) => {
    res.status(200).json({
        message: 'yes!'
    })
});

module.exports = router;
