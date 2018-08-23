const bcrypt = require('bcrypt');

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

		let limit = parseInt(req.query.limit, 10) || 10, // default limit to 10 docs
			skip = parseInt(req.query.skip, 10) || 0, // default skip to 0 docs
			query = req.query || {}

		// remove skip and limit from query to avoid false querying
		delete query.skip
		delete query.limit
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

		let data = req.body || {},
			opts = {
				new: true
			}

		console.log('>>> /users PUT');
		console.log(data);

		if (typeof req.body.password !== 'undefined') {
			//=====
			// Gestion du password

			console.log('hash');
			bcrypt.hash(req.body.password, 10, function (err, hash) {
				if (err) {
					console.log('error');
					return res.status(500).json({
						error: err
					});
				}
				else {
					console.log('hash ' + hash);
					data.password = hash;
				}
				console.log(data);
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
			console.log({"email":"toto@dbX.comd2"});
			User.findByIdAndUpdate({ _id: req.params.userId }, { $set: JSON.parse(data) }, { new: true })
				.then(user => { // function MAP

					console.log({ $set: data }, user);

					if (!user) {
						res.send(404)
						next()
					}
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
					res.send(500, err)
				})
			// Sans password
			//=====

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
