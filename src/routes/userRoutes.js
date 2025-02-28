const { Router } = require('express');
const { model } = require('mongoose');
const { sign } = require('jsonwebtoken');
// const { genSalt, hash } = require('bcrypt');
// const { createHash } = require('crypto');
const { validateLogin } = require('../util/validators');
const requireAuth = require('../middleware/requireAuth');
const User = model('User');
const Profile = model('Profile');
const Project = model('Project');
const router = Router();

// Login
router.post('/login', async (req, res) => {
	const { valid, errors } = validateLogin(req?.body);

	if (!valid) return res.status(400).json(errors);

	const { email, password } = req?.body;
	let user;

	const base = 'vervecloud.com';
	const test = email?.split('@')[1];

	if (test !== base) {
		errors.login = 'Error, must have a valid Verve email.';
		return res.status(400).json(errors);
	}

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
router.get('/users', requireAuth, async (req, res) => {
	let errors = {};

	try {
		const allUsers = await User.find({}).populate('profile');

		res.json(allUsers);
	} catch (err) {
		errors.users = 'Error retreiving users.';
		return res.status(400).json(errors);
	}
});

// Delete User
router.delete('/users/:userId/delete', requireAuth, async (req, res) => {
	let errors = {};

	const { userId } = req?.params;

	try {
		const deletedProfile = await Profile.findOneAndDelete({ user: userId });

		if (!deletedProfile) {
			errors.users = 'Error, user not found!';
			return res.status(404).json(errors);
		}

		await Project.deleteMany({ user: deletedProfile?._id });
		await User.findByIdAndDelete(userId);

		res.json({ success: 'User deleted successfully!' });
	} catch (err) {
		errors.users = 'Error deleting user!';
		return res.status(400).json(errors);
	}
});

module.exports = router;
