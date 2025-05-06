const { Router } = require('express');
const { model } = require('mongoose');
const { sign } = require('jsonwebtoken');
const { genSalt, hash } = require('bcrypt');
const { createHash } = require('crypto');
const { config } = require('dotenv');
const {
	validateLogin,
	validateForgot,
	validateReset,
} = require('../util/validators');
const fs = require('fs');
const requireAuth = require('../middleware/requireAuth');
const sgMail = require('@sendgrid/mail');
const User = model('User');
const Profile = model('Profile');
const Project = model('Project');
const router = Router();
config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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
			const base = 'vervecloud.com';
			const test = email?.split('@')[1];

			if (test !== base) {
				errors.login = 'Error, must have a valid Verve email.';
				return res.status(400).json(errors);
			}

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

// Generate Password Reset Token
router.post('/users/password-token', async (req, res) => {
	const { valid, errors } = validateForgot(req?.body);

	if (!valid) return res.status(400).json(errors);

	const { email } = req?.body;

	const user = await User.findOne({ email });

	if (!user) {
		errors.users = 'Error, user not found!';
		return res.status(404).json(errors);
	}

	try {
		const resetToken = user?.createPasswordResetToken();
		await user?.save();

		let resetUrl = fs.readFileSync('src/templates/reset-token.html', 'utf-8');
		resetUrl = resetUrl.replace('{{email}}', email);
		resetUrl = resetUrl.replace('{{resetToken}}', resetToken);

		const msg = {
			to: email,
			from: process.env.SG_BASE_EMAIL,
			subject: 'Reset Your Password',
			html: resetUrl,
		};

		await sgMail.send(msg);
		res.json(
			`A password reset link has been sent to ${user?.email}. Follow the instructions in the email to reset your password.`
		);
	} catch (err) {
		errors.users = 'Error generating token.';
		console.log('Token error', err);
		return res.status(400).json(errors);
	}
});

// Password Reset
router.post('/users/reset-password', async (req, res) => {
	const { valid, errors } = validateReset(req?.body);

	if (!valid) return res.status(400).json(errors);

	const { token, password } = req?.body;

	const hashedToken = createHash('sha256').update(token).digest('hex');
	const user = await User.findOne({
		passwordResetToken: hashedToken,
		passwordResetTokenExpires: { $gt: new Date() },
	});

	if (!user) {
		errors.token = 'Token expired, try again later.';
		return res.status(400).json(errors);
	}

	try {
		user.password = password;
		user.passwordResetToken = undefined;
		user.passwordResetTokenExpires = undefined;

		await user?.save();

		const resetSuccess = fs.readFileSync(
			'src/templates/password-reset.html',
			'utf-8'
		);

		const msg = {
			to: user?.email,
			from: process.env.SG_BASE_EMAIL,
			subject: 'Your Password Has Been Updated',
			html: resetSuccess,
		};

		await sgMail.send(msg);

		res.json('Password upated successfully!');
	} catch (err) {
		errors.token = 'Error verifying token!';
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
