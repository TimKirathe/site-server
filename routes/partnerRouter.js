const express = require('express');
const Partner = require('../models/partner');
const authenticate = require('../authenticate');

// const bodyParser = require('body-parser');

const partnerRoute = express.Router();

partnerRoute.route('/')
.get((req, res, next) => {
    Partner.find().then(partners => {
        if(partners) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(partners);
        } else {
            err = new Error('Partners not found.');
            res.statusCode = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
}).post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    Partner.create(req.body).then(partner => {
        if (partner) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(partner);
        } else {
            err = new Error('Partner not found');
            res.statusCode = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
}).put(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT method not supported for /partners');
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    Partner.deleteMany().then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

partnerRoute.route('/:partnerId')
.get((req, res) => {
    Partner.findById(req.params.partnerId).then(partner => {
        if (partner) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(partner);
        } else {   
            err = new Error(`Partner with the ID: ${req.params.partnerId} does not exist`);
            res.statusCode = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
}).post(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`POST method not supported for partner with ID: ${req.params.partnerId}`);
}).put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    Partner.findByIdAndUpdate(req.params.partnerId, { $set: req.body }, { new: true }).then(partner => {
        if (partner) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(partner);
        } else {   
            err = new Error(`Partner with the ID: ${req.params.partnerId} does not exist`);
            res.statusCode = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    Partner.findByIdAndDelete(req.params.campsiteId).then(response => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(response);
	})
	.catch(err => next(err));
});

module.exports = partnerRoute;