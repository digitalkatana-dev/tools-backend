const { Router } = require('express');
const { model } = require('mongoose');
const { sign } = require('jsonwebtoken');
// const { genSalt, hash } = require('bcrypt');
// const { createHash } = require('crypto');
const { validateLogin } = require('../util/validators');

const User = model('User');
const Profile = model('Profile');
const router = Router();

// Login
router.post('/login', async (req, res) => {
	const { valid, errors } = validateLogin(req?.body);

	if (!valid) return res.status(400).json(errors);

	const { email, password } = req?.body;
	let user;

	try {
		user = await User.findOne({ email }).populate('profile');
		// .populate({ path: 'profile', populate: { path: 'projects' } });

		if (user) {
			await user?.comparePassword(password);
		} else {
			const newUserData = {
				email,
				password,
				role: email === 'bbenoit@vervecloud.com' ? 'admin' : 'user',
			};

			const newUser = new User(newUserData);
			await newUser?.save();

			const profileData = {
				user: newUser?._id,
			};

			const userProfile = new Profile(profileData);
			await userProfile?.save();

			user = await User.findOne({ email }).populate('profile');
			// .populate({ path: 'profile', populate: { path: 'projects' } });
		}

		const token = sign({ userId: user?._id }, process.env.DB_SECRET_KEY, {
			expiresIn: '10d',
		});

		res.json({
			success: 'Login successful!',
			userProfile: user.profile,
			token,
		});
	} catch (err) {
		console.log('Signin Error: ', err);
		errors.login = 'Something went wrong! Please try again.';
		return res.status(400).json(errors);
	}
});

// Get All Users
router.get('/users', async (req, res) => {
	let errors = {};

	try {
		const allUsers = await User.find({}).populate('profile');

		res.json(allUsers);
	} catch (err) {
		errors.users = 'Error retreiving users.';
		return res.status(400).json(errors);
	}
});

module.exports = router;
