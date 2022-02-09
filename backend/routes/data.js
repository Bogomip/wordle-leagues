const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const result = require('../models/result');
const Results = require('../models/result')
const methods = require('../methods/methods');
const user = require('../models/user');
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
        let lowestWordleDate, todaysGame = methods.todaysGame();

        for(let league of leagues) {
            // build a list of users to query for...
            for(let member of league.members) {
                if(!usersList.find(temp => temp.toString() === member.toString())) {
                    usersList.push(member.toString());
                }
            }
            // and see if the lowest looked at wordle date is found...
            lowestWordleDate = league.startId < lowestWordleDate ? league.startId : lowestWordleDate;
        }

        const usersQuery = user.find({ _id: { $in :  usersList }}, 'username');
        const resultsQuery = result.find({ user: { $in: usersList }}, 'wordleId score user');

        Promise.all([usersQuery, resultsQuery]).then(([users, results]) => {
            // console.log(users, results);
            let leagueReturn = [];

            // parse user data into a useable format...
            for(let leagueIteration of leagues) {

                // make a new copy of this to increase speed when dealing with large data sets...
                let leagueIterationScore = [...results];

                // create a new league
                let newLeague = {
                    _id: leagueIteration._id,
                    name: leagueIteration.name,
                    notificationsAllowed: leagueIteration.notifications ? leagueIteration.notifications : true,
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

                const usersInLeague = users.filter(temp => !!leagueIteration.members.find(usr => usr.toString() === temp._id.toString()));
                // console.log(`Usres in league ${leagueIteration.name}: ${usersInLeague}`);

                for(let member of usersInLeague) {
                    // get the scores for this user...
                    const userScores = leagueIterationScore.filter(temp => temp.user.toString() === member._id.toString());
                    // then remove from the array so next iterations are faster...
                    leagueIterationScore.filter(temp => temp.user.toString() !== member._id.toString());
                    // and create a scores array...
                    const scores = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 0: 0};
                    userScores.forEach(result => scores[result.score] = scores[result.score] + 1);

                    // iterate through the users array to find all users that belong
                    const leagueMember = {
                        _id: member._id,
                        name: member.username,
                        tags: {
                            admin: !!leagueIteration.admins.find(temp => temp.toString() === member._id.toString()),
                            pastWinner: leagueIteration.previousWinner === member._id,
                            pastRunnerUp: leagueIteration.previousRunnerUp === member._id,
                        },
                        score: {
                            1: scores[1],
                            2: scores[2],
                            3: scores[3],
                            4: scores[4],
                            5: scores[5],
                            6: scores[6],
                            fail: scores[0]
                        },
                        today: userScores.find(temp => temp.wordleId === todaysGame)?.score
                    }
                    newLeague.members.push(leagueMember);
                }

                leagueReturn.push(newLeague);
            }

            res.status(200).json({
                success: true,
                data: leagueReturn
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
