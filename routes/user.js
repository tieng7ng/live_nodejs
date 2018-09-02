const bcrypt = require('bcrypt');

const config = require('../config');
const Token = require('../services/token');
const token = new Token(config.tokenSecret);

const User = require('../models/user'),
	Todo = require('../models/todo')

module.exports = function (server) {

	/**
	 * Create
	 */
	server.post('/users', (req, res, next) => {

		let data = JSON.parse(req.body || {});

		console.log('>>> /users POST');
		console.log(data);

		console.log(data.password);

		bcrypt.hash(data.password, 10, function (err, hash) {
			console.log('hash');
			if (err) {
				console.log('error', err, hash);
				return res.status(500).json({
					error: err
				});
			}
			else {
				data.password = hash;

				User.create(data)
					.then(user => {
						res.send(200, user);
						next();
					})
					.catch(err => {
						res.send(500, err)
					})

			}
		});
	})

	/**
	 * List
	 */
	server.get('/users', (req, res, next) => {
		console.log('>>>');

		//=====
		// Validation TOKEN
		const sToken = req.query.token || req.body.token;
		const tabTokenValid = token.valid(sToken);

		if (!tabTokenValid['return']) {
			console.log('token KO');
			return res.send(500, { auth: false, message: 'Failed to authenticate token.' });
		} else {
			console.log('token OK');
		}
		// Validation TOKEN
		//=====

		let limit = parseInt(req.query.limit, 10) || 10, // default limit to 10 docs
			skip = parseInt(req.query.skip, 10) || 0, // default skip to 0 docs
			query = req.query || {}

		// remove skip and limit from query to avoid false querying
		delete query.skip;
		delete query.limit;
		delete query.token;
		User.find(query).skip(skip).limit(limit)
			.then(users => {

				//=====
				// vider le champ password
				for (let index = 0; index < users.length; ++index) {
					//users[index].password = 'xxx';
					delete users[index].password;
				}
				// vider le champ password
				//=====

				res.send(200, users)
				next()
			})
			.catch(err => {
				res.send(500, err)
			})

	})

	/**
	 * Read
	 */
	server.get('/users/:userId', (req, res, next) => {

		User.findById(req.params.userId)
			.then(user => {

				if (!user) {
					res.send(404)
					next()
				}
				user.password = 'xxx';

				res.send(200, user)
				next()

			})
			.catch(err => {
				res.send(500, err)
			})
	})

	/**
	 * Update
	 */
	server.put('/users/:userId', (req, res, next) => {
		let tabReq = JSON.parse(req.body);

		let data = req.body || {},
			opts = {
				new: true
			}

		console.log('>>> /users PUT');
		console.log(data);

		if (typeof tabReq.password !== 'undefined') {
			//=====
			// Gestion du password

			console.log('hash');
			bcrypt.hash(tabReq.password, 10, function (err, hash) {
				if (err) {
					console.log('error');
					return res.status(500).json({
						error: err
					});
				}
				else {
					//=====
					// Chiffrage du password
					tabData = JSON.parse(data);
					tabData.password = hash;
					data = JSON.stringify(tabData);
					// Chiffrage du password
					//=====

				}
				User.findByIdAndUpdate({ _id: req.params.userId }, { $set: JSON.parse(data) }, opts)
					.then(user => { // function MAP

						if (!user) {
							res.send(404)
							next()
						}
						//=====
						// Affichage user
						user.password = 'xxx';
						res.send(200, user);
						// Affichage user
						//=====
						next()
					})
					.catch(err => {
						res.send(500, err)
					})
			})
			// Gestion du password
			//=====

		} else {
			//=====
			// Sans password
			console.log('>> put without password', data);
			if (!Object.keys(data).length > 0) {
				console.log('objet');
			} else {
				console.log('pas objet');
			}

			//=====
			// Appel depuis ANGULAR : traitement data
			try {
				JSON.parse(data);
			} catch (e) {
				data = JSON.stringify(data);
			}
			// Appel depuis ANGULAR : traitement data
			//=====

			User.findByIdAndUpdatpassworde({ _id: req.params.userId }, { $set: JSON.parse(data) }, { new: true })
				.then(user => { // function MAP

					console.log({ $set: data }, user);

					if (!user) {
						res.send(404)
						next()
					}
					console.log('put OK');

					//=====
					// Affichage user
					user.password = 'xxx';
					res.send(200, user)
					next()
					// Affichage user
					//=====
				})
				.catch(err => {
					console.log(err);
					res.send(500, err + ' ---- ' + data)
				})
			// Sans password
			//=====
			password
		}
	})

	/**
	 * Delete
	 */
	server.del('/users/:userId', (req, res, next) => {

		const userId = req.params.userId

		User.findOneAndRemove({ _id: userId })
			.then((user) => {

				if (!user) {
					res.send(404)
					next()
				}

				// remove associated todos to avoid orphaned data
				Todo.deleteMany({ _id: userId })
					.then(() => {
						res.send(204)
						next()
					})
					.catch(err => {
						res.send(500, err)
					})
			})
			.catch(err => {
				res.send(500, err)
			})

	})

}
