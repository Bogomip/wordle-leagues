const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const league = require('../models/league');
const methods = require('../methods/methods');
const user = require('../models/user');
const message = require('../models/messages');
const result = require('../models/result');
// NEED TO ADD MODELS FOR THIS DATA TO THE TOP OF HERE...


router.post('/create'
    , checkAuth
    , (req, res, next) => {

        const name = req.body.name;
        const userId = req.body.userId;
        const leagueId = methods.generateRandomId();

        if(name) {
            const newLeague = new league({
                name: name,
                leagueId: leagueId,
                startId: methods.todaysGame(),
                notifications: true,
                admins: [ userId ],
                members: [ userId ]
            })

            newLeague.save().then(result => {

                res.status(200).json({
                    leagueId: leagueId,
                    success: true
                })
            }).catch(error => {
                res.status(400).json({
                    success: false,
                    message: `Error: ${error}`
                })
            })

        } else {
            res.status(400).json({
                success: false,
                message: 'Error: A name is required when creating a league.'
            })
        }

    }
)

router.post('/join',
    checkAuth,
    (req, res, next) => {
        const userId = req.body.userId;
        const leagueCode = req.body.leagueCode;

        league.updateOne({ leagueId: leagueCode }, { $addToSet: { members: userId }}).then(results => {
            res.status(200).json({
                success: true
            })
        }).catch(error => {
            res.status(400).json({
                success: true
            })
        })

})

router.post('/leave',
    checkAuth,
    (req, res, next) => {
        console.log('leaving league...' + req.body);
})


router.post(
    '/delete',
    checkAuth,
    (req, res, next) => {
        const leagueId = req.body.leagueId;
        const adminId = req.body.adminId;

        league.findOne({ _id: leagueId, admins: { $in : [adminId] }}).then(leagueReturned => {
            // user has been found as an admin of this group...
            // get the userlist as they will need to be notified...
            const leagueToDelete = leagueReturned;

            // get the data for the league and the user data too.
            const userQuery = user.find({ _id: { $in : leagueToDelete.members }}, 'username');
            const resultQuery = result.find({ user: { $in : leagueToDelete.members }, wordleId: { $gte: leagueToDelete.startId }}, 'score user');

            // we havwe to go over the whole group on a deletion because
            // we need to know who won!
            Promise.all([userQuery, resultQuery]).then(([users, results]) => {

                let winner = { names: ['Nobody'], score: 0 };
                let runnerUp = { names: ['Nobody'], score: 0 };
                let scoreArray = [0,2,3,4,3,2,1];

                // not working 100% atm... but go with it!
                for(let i = 0 ; i < users.length ; i++) {
                    // total score..
                    let totalScore = 0;
                    // get the scores for this user...
                    const userScores = results.filter(temp => temp.user.toString() === users[i]._id.toString());
                    // then remove from the array so next iterations are faster...
                    results.filter(temp => temp.user.toString() !== users[i]._id.toString());

                    // and create a scores array...
                    // and calculate a score fo◘r the user...
                    userScores.forEach(result => totalScore += scoreArray[result.score]);

                    // then decide if they are a winner or a runnerup or nothing..
                    if(totalScore > winner.score) {
                        runnerUp = winner;    // the winner is now the runner up
                        winner = { names: [users[i].username], score: totalScore }; // this is now the winner
                    } else if (totalScore === winner.score) {
                        // equal to the winner
                        winner.names.push(users[i].username);
                    } else if (totalScore > runnerUp.score) {
                        // the new runner up
                        runnerUp = { names: [users[i].username], score: totalScore }
                    } else if (totalScore === runnerUp.score) {
                        // equal to the runner up
                        runnerUp.names.push(users[i].username);
                    } // else they place no where!
                }

                // got everything so delete away!
                league.deleteOne({ _id: leagueId }).then(deleteCount => {

                    // get the admin name
                    const adminName = users.find(usr => usr._id.toString() === adminId.toString()).username;

                    let winners;
                    let runners;

                    // make nice strings for the winners and runnerups

                    if(winner.names.length > 1) {
                        winners = winner.names.slice(0, -1).join(', ').concat(` and ${winner.names[winner.names.length - 2]}`);
                    } else winners = winner.names[0];

                    if(runnerUp.names.length > 1) {
                        runners = runnerUp.names.slice(0, -1).join(', ').concat(` and ${runnerUp.names[runnerUp.names.length - 2]}`);
                    } else runners = runnerUp.names[0];

                    // build the message
                    const messageToUsers = new message({
                        type: 1,
                        time: new Date().getTime(),
                        title: `League ${leagueToDelete.name} was deleted by ${adminName}.`,
                        content: `${leagueToDelete.name} league was deleted by ${adminName}. The winners of the final round were ${winners} with ${winner.score} points, and the runner ups were ${runners} with ${runnerUp.score}.`,
                        users: leagueToDelete.members
                    })

                    messageToUsers.save().then(messageResults => {
                        // message posted!
                        // return a copy of the message to be sent to users so it can be dynamically added to the users message bar.
                        res.status(201).json({
                            success: true,
                            data: {
                                type: 1,
                                time: new Date().getTime(),
                                title: `League ${leagueToDelete.name} was deleted by ${adminName}.`,
                                content: `${leagueToDelete.name} league was deleted by ${adminName}. The winners of the final round were ${winners} with ${winner.score} points, and the runner ups were ${runners} with ${runnerUp.score}.`,
                            }
                        })
                    }).catch(error => {
                        res.status(400).json({
                            success: false,
                            message: `Deletion Successful but Members not informed: ${error}`
                        })
                    })

                }).catch(error => {
                    res.status(400).json({
                        success: false,
                        message: `Deletion Failed: ${error}`
                    })
                })

            }).catch(error => {
                res.status(400).json({
                    success: false,
                    message: `An error occured whilst trying to delete the league: ${error}`
                })
            })
        }).catch(error => {
            res.status(400).json({
                success: false,
                message: `Error: ${error}`
            })
        });
})

router.post(
    '/restart'
    , checkAuth
    , (req, res, next) => {
        console.log('restarting league...' + req.body.adminId);
})

router.get(
    '/search/:leagueId'
    , checkAuth
    , (req, res, next) => {
        const leagueId = req.params.leagueId.split('=')[1];

        league.findOne({ leagueId: leagueId }, 'leagueId name members').then(result => {
            res.status(200).json({
                success: true,
                data: { code: result.leagueId, name: result.name, members: result.members.length }
            })
        }).catch(error => {
            res.status(400).json({
                success: false,
                message: `Error: ${error}`
            })
        })
})


module.exports = router;
