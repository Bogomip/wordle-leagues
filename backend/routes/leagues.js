const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const league = require('../models/league');
const methods = require('../methods/methods');
const user = require('../models/user');
const message = require('../models/messages');
const result = require('../models/result');
const { runner } = require('karma');
// NEED TO ADD MODELS FOR THIS DATA TO THE TOP OF HERE...

/**
 * Takes user data and results from a league user query and determines the winner and runner up from the data.
 * pass in an optional array of the fields you want to take from the user data.
 *
 * @param {*} usersData
 * @param {*} resultsData
 * @param {*} scoreArray
 * @param {*} fields
 * @returns
 */
function calculateLeagueWinners(usersData, resultsData, scoreArray, fields = ['_id']) {

    let winner = { score: 0 };
    let runnerUp = { score: 0 };

    // set empty arrays for all fields
    fields.map(temp => {
        winner[temp] = new Array();
        runnerUp[temp] = new Array();
    });

    for(let i = 0 ; i < usersData.length ; i++) {
        // total score..
        let totalScore = 0;
        // get the scores for this user...
        const userScores = resultsData.filter(temp => temp.user.toString() === usersData[i]._id.toString());
        // then remove from the array so next iterations are faster...
        resultsData.filter(temp => temp.user.toString() !== usersData[i]._id.toString());

        // and create a scores array...
        // and calculate a score for the user...
        userScores.forEach(result => totalScore += scoreArray[result.score]);

        // then decide if they are a winner or a runnerup or nothing..
        // also set them as winner if they are the first person through the loop!
        if(totalScore > winner.score || i === 0) {
            runnerUp = {...winner};    // the winner is now the runner up
            // iterate over all required keys...
            for(let o = 0 ; o < fields.length ; o++) winner[fields[o]] = [usersData[i][fields[o]]];
            winner.score = totalScore;
        } else if (totalScore === winner.score) {
            // equal to the winner
            for(let o = 0 ; o < fields.length ; o++) winner[fields[o]].push(usersData[i][fields[o]]);
        } else if (totalScore > runnerUp.score) {
            // the new runner up
            for(let o = 0 ; o < fields.length ; o++) runnerUp[fields[o]] = [usersData[i][fields[o]]];
            runnerUp.score = totalScore;
        } else if (totalScore === runnerUp.score) {
            // equal to the runner up
            for(let o = 0 ; o < fields.length ; o++) runnerUp[fields[o]].push(usersData[i][fields[o]]);
        } // else they place no where!
    }
    return [winner, runnerUp];
}

/**
 * Constructs a string from the winner array { name: [winner with same score], score: number }
 * and returns it...
 * @param {*} winnerArray
 * @param {*} runnerUpArray
 */
function winnersAndRunnerUpString(winnerArray, runnerUpArray, namefield = 'username') {

    let winners, runners;

    if(winnerArray[namefield].length > 1) {
        winners = winnerArray[namefield].slice(0, -1).join(', ').concat(` and ${winnerArray[namefield][winnerArray[namefield].length - 2]}`);
    } else winners = winnerArray[namefield][0];

    if(runnerUpArray[namefield].length > 1) {
        runners = runnerUpArray[namefield].slice(0, -1).join(', ').concat(` and ${runnerUpArray[namefield][runnerUp[namefield].length - 2]}`);
    } else runners = runnerUpArray[namefield][0];

    return [winners || '(Nobody won!)', runners || '(Nobody challenged for second!)'];
}

/******
 *
 * ROUTER METHODS
 *
 */

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
                res.status(400).json({ success: false,  message: `Error: ${error}` })
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
        const userId = methods.getUserDataFromToken(req)._id;

        league.findOne({ _id: leagueId, admins: { $in : [userId] }}).then(leagueReturned => {
            // user has been found as an admin of this group...
            // get the userlist as they will need to be notified...
            const leagueToDelete = leagueReturned;
            // get the data for the league and the user data too.
            const userQuery = user.find({ _id: { $in : leagueToDelete.members }}, 'username');
            const resultQuery = result.find({ user: { $in : leagueToDelete.members }, wordleId: { $gte: leagueToDelete.startId }}, 'score user');

            // we havwe to go over the whole group on a deletion because
            // we need to know who won!
            Promise.all([userQuery, resultQuery]).then(([users, results]) => {
                // find the winners and runners up, and make nice strings for them
                let [winner, runnerUp] = calculateLeagueWinners(users,results,[0,2,3,4,3,2,1], ['username', '_id']);
                let [winnersString, runnersString] = winnersAndRunnerUpString(winner, runnerUp);

                // got everything so delete away!
                league.deleteOne({ _id: leagueId }).then(deleteCount => {
                    // get the admin name
                    const adminName = users.find(usr => usr._id.toString() === userId.toString()).username;
                    // message to the winner and runner up in the case of draws...
                    sharedWin = winner._id.length > 1 ? `You shared the win with ${winner._id.length} other people. ` : ``;
                    sharedRunner = runnerUp._id.length > 1 ? `You shared second place with ${runnerUp._id.length} other people. ` : ``;

                    // build the messages
                    const messageToUsers = new message({
                        type: 1, time: new Date().getTime(), users: leagueToDelete.members,
                        title: `League ${leagueToDelete.name} was deleted by ${adminName}.`,
                        content: `${leagueToDelete.name} league was deleted by ${adminName}. The winners of the final round were ${winnersString} with ${winner.score} points, and the runner ups were ${runnersString} with ${runnerUp.score}.`
                    }).save();

                    const messageToWinner = new message({
                        type: 11, time: new Date().getTime(), users: winner._id,
                        title: `You have won the '${leagueToDelete.name}' league!`,
                        content: `You were just declared the winner of the ${leagueToDelete.name} league, congratulations! ${sharedWin} You had ${winner.score} points and second place had ${runnerUp.score}. A new league starts today!`
                    }).save();

                    const messageToRunnerUp = new message({
                        type: 12, time: new Date().getTime(), users: runnerUp._id,
                        title: `You have come second in the '${leagueToDelete.name}' league!`,
                        content: `You were just declared the runner up of the ${leagueToDelete.name} league, congratulations! ${sharedRunner} You had ${runnerUp.score} points and the winner had ${winner.score}. A new league starts today!`
                    }).save();

                    // post all messages and once complete return the message
                    Promise.all([messageToUsers, messageToWinner, messageToRunnerUp]).then(([allRes,winRes,runnerRes]) => {
                        // message posted!
                        // return a copy of the message to be sent to users so it can be dynamically added to the users message bar.
                        let data = [
                            {
                                _id: allRes._id, type: 1, time: new Date().getTime(), title: `League ${leagueToDelete.name} was deleted by ${adminName}.`,
                                content: `${leagueToDelete.name} league was deleted by ${adminName}. The winners of the final round were ${winnersString} with ${winner.score} points, and the runner ups were ${runnersString} with ${runnerUp.score}.`,
                            }
                        ]
                        // if the admin who called the delete is winner of the league then create a new message informing of their win...
                        if(!!winner._id.find(temp => temp === userId)) {
                            data.push({
                                _id: winRes._id, type: 11, time: new Date().getTime(), title: `You have won the '${leagueToDelete.name}' league!`,
                                content: `You were just declared the winner of the ${leagueToDelete.name} league, congratulations! ${sharedWin} You had ${winner.score} points and second place had ${runnerUp.score}. A new league starts today!`
                            })
                        }
                        // if the admin who called the delete is runnerup of the league then create a new message informing of their runns up...
                        if(!!runnerUp._id.find(temp => temp === userId)) {
                            data.push({
                                _id: runnerRes._id, type: 12, time: new Date().getTime(), title: `You have come second in the '${leagueToDelete.name}' league!`,
                                content: `You were just declared the runner up of the ${leagueToDelete.name} league, congratulations! ${sharedRunner} You had ${runnerUp.score} points and the winner had ${winner.score}. A new league starts today!`
                            })
                        }

                        // and return the data to the user...
                        res.status(201).json({
                            success: true,
                            data: data
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
    '/restart',
    checkAuth,
    (req, res, next) => {
        const leagueId = req.body.leagueId;
        const adminId = req.body.adminId;

        league.findOne({ _id: leagueId, admins: { $in : [adminId] }}).then(leagueReturned => {
            // user has been found as an admin of this group...
            // get the userlist as they will need to be notified of the restart...
            const leagueToRestart = leagueReturned;
            // get the data for the league and the user data too.
            const userQuery = user.find({ _id: { $in : leagueToRestart.members }}, 'username');
            const resultQuery = result.find({ user: { $in : leagueToRestart.members }, wordleId: { $gte: leagueToRestart.startId }}, 'score user');

            // we havwe to go over the whole group on a restart because we need to know who won!
            Promise.all([userQuery, resultQuery]).then(([users, results]) => {
                // find the winners and runners up, and make nice strings for them
                let [winner, runnerUp] = calculateLeagueWinners(users,results,[0,2,3,4,3,2,1],['username','_id']);
                let [winners, runners] = winnersAndRunnerUpString(winner, runnerUp);
                let winnerId = winner._id || '';
                let runnerId = runnerUp._id || '';
                let newWordleId = methods.todaysGame();

                // got everything so delete away!
                league.updateOne({ _id: leagueId }, { $set : { startId: newWordleId, previousWinner: winnerId, previousRunnerUp: runnerId }}).then(updateResult => {
                    // get the admin name
                    const adminName = users.find(usr => usr._id.toString() === adminId.toString()).username;
                    // build the message
                    const messageToUsers = new message({
                        type: 2,
                        time: new Date().getTime(),
                        title: `League ${leagueToRestart.name} was restarted by ${adminName}.`,
                        content: `${leagueToRestart.name} league was just restarted by ${adminName}. This league had run from ${leagueToRestart.startId} and will now run from today, wordle number ${newWordleId}. The winners of the previous round were ${winners} with ${winner.score} points, and the runner up was ${runners} with ${runnerUp.score}.`,
                        users: leagueToRestart.members
                    })

                    messageToUsers.save().then(messageResults => {
                        // message posted!
                        // return a copy of the message to be sent to users so it can be dynamically added to the users message bar.
                        res.status(201).json({
                            success: true,
                            data: {
                                _id: messageResults._id,
                                type: 2,
                                time: new Date().getTime(),
                                title: `League ${leagueToRestart.name} was restarted by ${adminName}.`,
                                content: `${leagueToRestart.name} league was just restarted by ${adminName}. This league had run from ${leagueToRestart.startId} and will now run from today, wordle number ${newWordleId}. The winners of the previous round were ${winners} with ${winner.score} points, and the runner up was ${runners} with ${runnerUp.score}.`,
                            }
                        })
                    }).catch(error => {
                        res.status(400).json({
                            success: false,
                            message: `Restart Successful but Members not informed: ${error}`
                        })
                    })

                }).catch(error => {
                    res.status(400).json({
                        success: false,
                        message: `Restart Failed: ${error}`
                    })
                })

            }).catch(error => {
                res.status(400).json({
                    success: false,
                    message: `An error occured whilst trying to restart the league: ${error}`
                })
            })
        }).catch(error => {
            res.status(400).json({
                success: false,
                message: `Error: ${error}`
            })
        });
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
