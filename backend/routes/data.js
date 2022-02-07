const express = require('express');
const router = express.Router();
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');
const league = require('../models/league');
const result = require('../models/result');
const Results = require('../models/result')
const methods = require('../methods/methods');
const user = require('../models/user');
const league = require('../models/league');
const league = require('../models/league');
const league = require('../models/league');
// NEED TO ADD MODELS FOR THIS DATA TO THE TOP OF HERE...

/**
 * Get all league data for all leagues for the user..
 */
router.get('/all/:userId', checkAuth, (req, res, next) => {
    const userId = req.params.userId.split('=')[1];
    let leagues = [];

    // it takes three queries to get all of the users leagues...
    league.find({ members: { $elemMatch: { $eq: userId }}}).then((leagues) => {

        // loop over the results collecting data to form the next queries...
        let usersList = [];
        let lowestWordleDate = methods.todaysGame();

        for(let league of leagues) {
            // build a list of users to query for...
            for(let member of league.members) {
                if(!usersList.find(temp => temp === member)) {
                    usersList.push(member);
                }
            }
            // and see if the lowest looked at wordle date is found...
            lowestWordleDate = league.startId < lowestWordleDate ? league.startId : lowestWordleDate;
        }

        const usersQuery = user.find({ _id: { $in :  usersList }}, 'username');
        const resultsQuery = result.find({ user: { $in: usersList }}, 'wordleId score user');

        Promise.all([usersQuery, resultsQuery]).then(([users, results]) => {
            console.log(users, results);

            // parse user data into a useable format...
            for(let league of leagues) {
                // create a new league
                let newLeague = {
                    _id: league._id,
                    name: league.name,
                    notificationsAllowed: league.notifications,
                    members: []
                }
                // and iterate over the users to place them into the array for members...
                // STRUCTURE
                //     _id: string;
                //     name: string;
                //     tags: { admin: boolean; pastWinner: boolean; pastRunnerUp: boolean };
                //     score: { 1: number; 2: number; 3: number; 4: number; 5: number; 6: number; fail: number; }
                //     today?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
                //     joinTime: number;

                const usersInLeague = users.filter(temp => league.members.find(usr => usr === temp._id));

                for(let member of usersInLeague) {
                    // iterate through the users array to find all users that belong
                    for(let user of users) {

                    }
                }
            }






            res.status(200).json({
                success: true,
                data: users
            })
        }).catch(error => {
            res.status(400).json({
                success: false,
                message: 'Error occured whilst collating user data for league',
                error: error
            })
        })

        // // now query for the users...
        // user.find({ _id: { $in :  usersList }}, 'username').then(users => {
        //     // uer search succeeded
        //     console.log(users);
        //     res.status(200).json({
        //         success: true,
        //         data: users
        //     })
        // }).catch(error => {
        //     // user search failed
        //     console.log('lol nope');
        //     res.status(400).json({
        //         success: false,
        //         message: 'Error occured whilst collating user data for league'
        //     })
        // })


    }).catch(error => {
        res.status(400).json({
            success: false,
            message: `Error: ${error}`
        })
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
router.get('/notifications', (req, res, next) => {
    console.log("get all notifications..." + req.params.id);

    res.status(200).json({
        data: 'here is the data...'
    })
})

/**
 * Posts the daily wordle score to the database
 */
router.post(
    '/daily',
    checkAuth,
    (req, res, next) => {

        const gameId = req.body.gameId;

        Results.find({ user: req.body.userId, wordleId: { $lte: gameId, $gte: (gameId - 1) }}).then((result) => {
            if(result) {
                res.status(201).json({
                    success: true,
                    data: result
                })
            } else {
                res.status(201).json({
                    success: true,
                    data: null
                })
            }
        }).catch((error) => {
            res.status(400).json({
                success: false,
                message: `Error: ${error}`
            })
        })
})


module.exports = router;
