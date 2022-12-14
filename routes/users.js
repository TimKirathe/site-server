const express = require('express');
const User = require('../models/user');
const passport = require('passport');
const authenticate = require('../authenticate');
const cors = require('./cors');

const router = express.Router();

/* GET users listing. */
router.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, function(req, res, next) {
	User.find().then(users => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json({ success: true, users: users });
	})
	.catch(err => next(err));
});

router.post('/signup', cors.corsWithOptions, (req, res) => {
	User.register(
		new User({ username: req.body.username }),
		req.body.password,
		(err, user) => {
			if (err) {
				res.statusCode = 500;
				res.setHeader('Content-Type', 'application/json');
				res.json({ err: err });
			} else {
				if (req.body.firstname) {
					user.firstname = req.body.firstname;
				}
				if (req.body.lastname) {
					user.lastname = req.body.lastname;
				}
				user.save(err => {
					if (err) {
						res.statusCode = 500;
						res.setHeader('Content-Type', 'application/json');
						res.json({ err: err});
						return;
					}
					passport.authenticate('local')(req, res, () => {
						res.statusCode = 200;
						res.setHeader('Content-Type', 'application/json');
						res.json({ success: true, status: 'Registration Successful!' });
					});
				});
			}
		}
	)
});

router.post('/login', cors.corsWithOptions, passport.authenticate('local'), (req, res) => {
	const token = authenticate.getToken({ _id: req.user._id});
	res.statusCode = 200;
	res.setHeader('Content-Type', 'application/json');
	res.json({ success: true, token: token, status: 'You are successfully logged in!'});
});

router.get('/logout', cors.corsWithOptions, (req, res, next) => {
	if (req.session) {
		req.session.destroy();
		res.clearCookie('session-id');
		res.redirect('/');
	} else {
		const err = new Error('You are not logged in.')
		res.statusCode = 401;
		return next(err);
	}
});

router.get('/facebook/token', passport.authenticate('facebook-token'), (req, res) => {
	if(req.user) {
		const token = authenticate.getToken({ _id: req.body._id });
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json({ success: true, token: token, status: "You have successfully logged in!"});
	}

});

module.exports = router;


/*
if(!req.session.user) {
	const authHeader = req.headers.authorization;
	console.log(authHeader);
	if(!authHeader) {
		const error = new Error('You must first be authenticated!');
		res.setHeader('WWW-Authenticate', 'Basic');
		res.statusCode = 401;
		return next(error);
	}

	const authDetails = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
	const username = authDetails[0];
	const password = authDetails[1];
	
	User.findOne({ username: username }).then(user => {
		if(!user) {
			const err = new Error(`User ${username} does not exist.`);
			res.statusCode = 401;
			return next(err);
		} else if (user.password !== password) {
			const error = new Error('Your password is incorrect');
			res.statusCode = 401;
			return next(err);
		} else if (user.username === username && user.password === password) {
			req.session.user = 'authenticated';
			res.statusCode = 200;
			res.setHeader('Content-Type', 'text/plain');
			res.send('You are authenticated');
		}
	})
	.catch(err => next(err));
	} else {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'text/plain');
		res.send('You are already authenticated.');
	}
*/