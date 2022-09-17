const express = require('express');
const mongoose = require('mongoose');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
	Favorite.find({ user: req.user._id }).populate('user').populate('campsites.campsite').then(favorite => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json({ success: true, favorite: favorite });
	})
	.catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
	Favorite.findOne({ user: req.user._id }).then(favorite => {
        if (favorite) {
            favorite.campsites.forEach((campsite, index) => {
                if (!req.body.campsites.includes(campsite)) {
                    favorite.campsites.push(req.body.campsites[index]);
                }
            });
            favorite.save().then(fav => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({ success: true, favorite: fav });
            }).catch(err => next(err)); 
        } else {
            Favorite.create({ user: req.user._id, campsites: req.body.campsites }).then(fav => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({ success: true, fav: fav });
            }).catch(err => next(err));
        }
	})
	.catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
	res.statusCode = 403;
	res.end(`PUT method is not supported for /favorites`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
	Favorite.findOneAndDelete({ user: req.user._id }).then(favorite => {
        if (favorite) {
            res.statusCode = 200;
		    res.setHeader('Content-Type', 'application/json');
		    res.json({ success: true, favoriteDeleted: favorite});
        } else {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'text/plain');
            res.send('You do not have any favorites to delete.');
        }
	})
	.catch(err => next(err));
});

favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
	res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    res.send('GET method is not supported for /favorites/:campsiteId route.')
})
.post(authenticate.verifyUser, (req, res, next) => {
	Favorite.findOne({ user: req.user._id}).then(favorite => {
        if (favorite) {
            if (favorite.campsites.includes(req.params.campsiteId)) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.json({ success: false, message: `The campsite with id: ${req.params.campsiteId} is already part of your favorites!`});
            } else {
                favorite.campsites.push(req.params.campsiteId);
                favorite.save().then(fav => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({ success: true, fav: fav });
                }).catch(err => next(err));
            }
        } else {
            Favorite.create({ user: req.user._id, campsites: [req.params.campsiteId]})
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({ success: true, favorite: favorite });
            }).catch(err => next(err));
        }
    })
})
.put(authenticate.verifyUser, (req, res, next) => {
	res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    res.send('PUT method is not supported for /favorites/:campsiteId route.')
})
.delete(authenticate.verifyUser, (req, res, next) => {
	Favorite.findOne({ user: req.user._id }).then(favorite => {
        if (favorite) {
            newCampsites = favorite.campsites.filter((campsite) => {
                return campsite.toString() !== req.params.campsiteId;
            })
            console.log(newCampsites);
            favorite.campsites = newCampsites;
            favorite.save().then(fav => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({ success: true, fav: fav });
            }).catch(err => next(err));
        } else {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'text/plain');
            res.send('There are no favorites to delete.');
        }
    }).catch(err => next(err));
});


module.exports = favoriteRouter;