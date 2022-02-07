const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();
const User = require('../models/user');
const Result = require('../models/result');
const checkAuth = require('../middleware/check-auth');

// NEED TO ADD MODELS FOR THIS DATA TO THE TOP OF HERE...
const generateToken = (email, id, remainLoggedIn) => {
    return jwt.sign({
        email: email, id: id
    }, 'this-should-be-a-very-long-string-which-encodes-my-secret-has-lololololol', { expiresIn: remainLoggedIn ? '7d' : '1h' });

}

/**
 * Signs up then logs in a user.
 */
router.post('/register', (req, res, next) => {

    bcrypt.hash(req.body.password, 10).then(hashedPassword => {

        const user = new User({
            email: req.body.email,
            username: req.body.username,
            password: hashedPassword,
            joindate: new Date().getTime()
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
                joinDate: user.joindate
            })
        }).catch(err => {
            res.status(404).json({
                error: err
            })
        })

        console.log('user registration in progress...')
    });
})

/**
 * Logs in a user.
 */
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
            joinDate: fetchedUser.joindate
        })

    }).catch((error) => {
        return res.status(401).json({
            error: 'Auth Failed: ' + error
        })
    })

})

/**
 * submit a score to the database...
 */
router.post(
    '/score',
    checkAuth,
    (req, res, next) => {

        Result.findOne({ wordleId: req.body.wordleId, user: req.body.userId }).then((result) => {
            if(!result) {
                // insert
                const result = new Result({
                    user: req.body.userId,
                    wordleId: req.body.wordleId,
                    score: req.body.score
                })

                result.save().then(result => {
                    res.status(200).json({
                        success: true,
                        message: `Success`
                    })
                }).catch((error) => {
                    res.status(400).json({
                        success: false,
                        message: `Error: ${error}`
                    })
                })

            } else {
                // record is found properly and should be updated with the new score...
                result.updateOne({ score: req.body.score }).then((result) => {
                    res.status(200).json({
                        success: true,
                        message: `Success`
                    })
                }).catch((error) => {
                    res.status(400).json({
                        success: false,
                        message: `Error: ${error}`
                    })
                })
            }

        }).catch((error) => {
            res.status(400).json({
                success: false,
                message: `Error: ${error}`
            })
        })
    }
)

module.exports = router;
