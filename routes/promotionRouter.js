const express = require('express');
const Promotion = require('../models/promotion');
const promotionRouter = express.Router();
const authenticate = require('../authenticate');

promotionRouter.route('/')
.get((req, res, next) => {
    Promotion.find().then(promotions => {
        if(promotions) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(promotions);
        } else {
            err = new Error('Promotions not found.');
            res.statusCode = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
}).post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    Promotion.create(req.body).then(promotion => {
        if (promotion) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(promotion);
        } else {
            err = new Error('Promotion not found');
            res.statusCode = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
}).put(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT method not supported for /promotions');
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    Promotion.deleteMany().then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

promotionRouter.route('/:promotionId')
.get((req, res) => {
    Promotion.findById(req.params.promotionId).then(promotion => {
        if (promotion) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(promotion);
        } else {   
            err = new Error(`Promotion with the ID: ${req.params.promotionId} does not exist`);
            res.statusCode = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
}).post(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`POST method not supported for promotion with ID: ${req.params.promotionId}`);
}).put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    Promotion.findByIdAndUpdate(req.params.promotionId, { $set: req.body }, { new: true }).then(promotion => {
        if (promotion) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(partner);
        } else {   
            err = new Error(`Promotion with the ID: ${req.params.promotionId} does not exist`);
            res.statusCode = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    Promotion.findByIdAndDelete(req.params.promotionId).then(response => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(response);
	})
	.catch(err => next(err));
});

module.exports = promotionRouter;