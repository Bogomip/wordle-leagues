const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();
const User = require('../models/user');
const user = require('../models/user');
const checkAuth = require('../middleware/check-auth');

// NEED TO ADD MODELS FOR THIS DATA TO THE TOP OF HERE...
const generateToken = (email, id, remainLoggedIn) => {
    return jwt.sign({
        email: email, id: id
    }, 'this-should-be-a-very-long-string-which-encodes-my-secret-has-lololololol', { expiresIn: remainLoggedIn ? '7d' : '1h' });

}

router.post('/register', (req, res, next) => {

    bcrypt.hash(req.body.password, 10).then(hashedPassword => {

        const user = new User({
            email: req.body.email,
            username: req.body.username,
            password: hashedPassword,
            joindate: new Date().getTime(),
            leagues: [],
            results: []
        })

        // then save the user...
        user.save().then(result => {
            // save has worked and the user now exists!
            const token = generateToken(fetchedUser.email, fetchedUser._id, false);

            res.status(201).json({
                _id: result._id,
                token: token,
                name: user.username,
                email: user.email,
                joinDate: user.joindate,
                leagues: [],
                results: []
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

    let fetchedUser;

    User.findOne({ email: req.body.email }).then((user) => {
        // user not found...
        if(!user) {
            return res.status(401).json({
                error: 'Auth Failed  - No matching email found...'
            })
        }
        // store user data;
        fetchedUser = user;
        // return a promise from brypt comparing the password and the stored password...
        return bcrypt.compare(req.body.password, user.password);
    }).then((result) => {
        // if the passwords no not match throw and error
        if(!result) {
            return res.status(401).json({
                error: 'Auth Failed - Passwords dont match...'
            })
        }
        // password is valid...
        const token = generateToken(fetchedUser.email, fetchedUser._id, req.body.remainLoggedIn );

        console.log('User logged in: ' + req.body.email);

        res.status(200).json({
            _id: fetchedUser._id,
            token: token,
            name: fetchedUser.username,
            email: fetchedUser.email,
            joinDate: fetchedUser.joindate,
            leagues: fetchedUser.leagues
        })

    }).catch((error) => {
        return res.status(401).json({
            error: 'Auth Failed: ' + error
        })
    })

})

// submit a score to the database...
router.post(
    '/score',
    checkAuth,
    (req, res, next) => {

        User.findOneAndReplace(
            { _id: req.body._id, results: { $elemMatch: { wordleId: 231 }}},
            { _id: req.body.id,  results: { wordleId: req.body.wordleId, score: req.body.score }},
            {
                upsert: true,
                new: true
            }
        ).then((result) => {
            console.log(result);

            res.status(200).json({
                message: 'Added score :D'
            })
        }).catch((error) => {
            res.status(400).json({
                message: 'Failed to add score...' + error
            })
        })



        // the thing above does work BUT it doesnt do unique...

        // this doesnt work
        // User.findById(req.body.userId).then((user) => {
        //     // see if this result has been added...
        //     user.results.findOneAndUpdate(
        //         { wordleId: req.body.wordleId },
        //         { wordleId: req.body.wordleId, score: req.body.score },
        //         { upsert: true }
        //     ).then((result) => {
        //         res.status(200).json({
        //             message: 'Added score :D'
        //         })
        //     }).catch((error) => {
        //         res.status(400).json({
        //             message: 'Failed to add score...' + error
        //         })
        //     })
        // })
    }
)

module.exports = router;
