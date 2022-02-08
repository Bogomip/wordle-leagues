const express = require('express');
const router = express.Router();
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');
const league = require('../models/league');
const methods = require('../methods/methods');
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

router.get(
    '/search/:leagueId'
    , checkAuth
    , (req, res, next) => {
        const leagueId = req.params.leagueId.split('=')[1];
        console.log(leagueId);

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
