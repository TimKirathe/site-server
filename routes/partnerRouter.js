const express = require('express');
const Partner = require('../models/partner');
const bodyParser = require('body-parser');

const partnerRoute = express.Router();

partnerRoute.use(bodyParser.json());

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
}).post((req, res) => {
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
}).put((req, res) => {
    res.statusCode = 403;
    res.end('PUT method not supported for /partners');
})
.delete((req, res) => {
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
}).post((req, res) => {
    res.statusCode = 403;
    res.end(`POST method not supported for partner with ID: ${req.params.partnerId}`);
}).put((req, res) => {
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
.delete((req, res) => {
    Partner.findByIdAndDelete(req.params.campsiteId).then(response => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(response);
	})
	.catch(err => next(err));
});

module.exports = partnerRoute;