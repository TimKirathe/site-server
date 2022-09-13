const express = require('express');
const mongoose = require('mongoose');
const Campsite = require('../models/campsite');
// const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const cors = require('./cors');

const campsiteRouter = express.Router();

campsiteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
	Campsite.find().populate('comments.author').then(campsites => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(campsites);
	})
	.catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
	Campsite.create(req.body).then(campsite => {
		console.log('Campsite Created:', campsite);
		res.status = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(campsite);
	})
	.catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
	res.statusCode = 403;
	res.end(`PUT method is not supported for /campsites`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
	Campsite.deleteMany().then(response => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(response);
	})
	.catch(err => next(err));
});

campsiteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
	Campsite.findById(req.params.campsiteId).populate('comments.author').then(campsite => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(campsite);
	})
	.catch(err => next(err));
})
.post(authenticate.verifyUser, (req, res) => {
	res.statusCode = 403;
	res.end(`POST method is not supported for /campsites/${req.params.campsiteId}`);
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
	Campsite.findByIdAndUpdate(req.params.campsiteId, { $set: req.body }, { new: true }).then(campsite => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(campsite);
	})
	.catch(err => next(err));
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
	Campsite.findByIdAndDelete(req.params.campsiteId).then(response => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(response);
	})
	.catch(err => next(err));
});

campsiteRouter.route('/:campsiteId/comments')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
	Campsite.findById(req.params.campsiteId).populate('comments.author').then(campsite => {
		if (campsite) {
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json(campsite.comments);
		} else {
			const error = new Error(`Campsite with id: ${req.params.campsiteId}, does not exist.`);
			res.statusCode = 404;
			return next(error);
		}
	})
	.catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
	Campsite.findById(req.params.campsiteId).then(campsite => {
		if (campsite) {
			req.body.author = req.user._id;
			campsite.comments.push(req.body);
			campsite.save().then(campsite => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json(campsite);
			})
			.catch(err => next(err));
		} else {
			const error = new Error(`Campsite with id: ${req.params.campsiteId}, does not exist.`);
			res.statusCode = 403;
			return next(error);
		}
	})
	.catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
	res.statusCode = 403;
	res.end(`PUT method is not supported for /campsites/${req.params.campsiteId}/comments`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
	Campsite.findById(req.params.campsiteId).then(campsite => {
		if (campsite) {
			for(let i = 0; i < campsite.comments.length; i++) {
				campsite.comments.id(campsite.comments[i]).remove();
			}
			campsite.save().then(campsite => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json(campsite);
			})
			.catch(err => next(err));
		} else {
			const error = new Error(`Campsite with id: ${req.params.campsiteId}, does not exist.`);
			res.statusCode = 403;
			return next(error);
		}
	})
	.catch(err => next(err));
});

campsiteRouter.route('/:campsiteId/comments/:commentId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
	Campsite.findById(req.params.campsiteId).populate('comments.author').then(campsite => {
		if (campsite && campsite.comments.id(req.params.commentId)) {
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json(campsite.comments.id(req.params.commentId));
		} 
		else if(!campsite) {
			const error = new Error(`Campsite with ID: ${req.params.campsiteId} not found.`);
			res.statusCode = 404;
			return next(error);
		}
		else {
			const error = new Error(`Campsite with id: ${req.params.campsiteId}, does not exist.`);
			res.statusCode = 403;
			return next(error);
		}
	})
	.catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
	res.statusCode = 403;
	res.end(`POST method is not supported for /campsites/${req.params.campsiteId}/comments/${req.params.commentId}`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
	Campsite.findById(req.params.campsiteId).then(campsite => {
		if (campsite) {
			if (campsite.comments.id(req.params.commentId)) {
				if (campsite.comments.id(req.params.commentId).author._id.equals(req.user._id)) {
					if(req.body.rating) {
						campsite.comments.id(req.params.commentId).rating = req.body.rating;
					}
					if(req.body.text) {
						campsite.comments.id(req.params.commentId).text = req.body.text;
					}
					campsite.save().then(campsite => {
						res.statusCode = 200;
						res.setHeader('Content-Type', 'application/json');
						res.json(campsite);
					});
				} else {
					const error = new Error('You are not authorized to edit this comment!');
					res.statusCode = 403;
					return next(error);
				}
			} else {
				const error = new Error(`Campsite with id: ${req.params.campsiteId}, does not exist.`);
				res.statusCode = 403;
				return next(error);
			}
		} else {
			const error = new Error(`Campsite with ID: ${req.params.campsiteId} not found.`);
			res.statusCode = 404;
			return next(error);
		}
	})
	.catch(err => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		Campsite.findById(req.params.campsiteId).then(campsite => {
			if (campsite) {
				if (campsite.comments.id(req.params.commentId)) {
					if (campsite.comments.id(req.params.commentId).author._id.equals(req.user._id)) {
						campsite.comments.id(req.params.commentId).remove();
						campsite.save().then(campsite => {
						res.statusCode = 200;
						res.setHeader('Content-Type', 'application/json');
						res.json(campsite);
					});
					} else {
						const error = new Error('You are not authorized to edit this comment!');
						res.statusCode = 403;
						return next(error);
					}
				} 
				else {
					const error = new Error(`Campsite with id: ${req.params.campsiteId}, does not exist.`);
					res.statusCode = 403;
					return next(error);
				}
			} else {
				const error = new Error(`Campsite with ID: ${req.params.campsiteId} not found.`);
				res.statusCode = 404;
				return next(error);
			}
		})
		.catch(err => next(err));
});

module.exports = campsiteRouter;

// 32452345234523452345
