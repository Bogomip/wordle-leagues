const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../models/user');

// NEED TO ADD MODELS FOR THIS DATA TO THE TOP OF HERE...

router.post('/register', (req, res, next) => {

    bcrypt.hash(req.body.password, 10).then(hashedPassword => {


        const user = new User({
            email: req.body.email,
            username: req.body.username,
            password: hashedPassword,
            joindate: new Date().getTime()
        })
        console.log(user);

        // then save the user...
        user.save().then(result => {
            res.status(201).json({
                id: result._id
            })
        }).catch(err => {
            res.status(404).json({
                error: err
            })
        })

        console.log('user registration in progress...')
    });
})

router.post('/login', (req, res, next) => {
    console.log('user registration in progress...' + req.body);
})

module.exports = router;
