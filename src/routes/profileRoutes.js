const { Router } = require('express');
const { model } = require('mongoose');
const requireAuth = require('../middleware/requireAuth');
const Profile = model('Profile');
const Note = model('Note');
const Config = model('Config');
const router = Router();

// Get Profile
router.get('/profiles/:id', requireAuth, async (req, res) => {
	let errors = {};

	const { id } = req?.params;

	try {
		const profile = await Profile.findById(id);

		if (!profile) {
			errors.profile = 'Error, profile not found';
			return res.status(404).json(errors);
		}

		const notes = await Note.find({
			$or: [{ user: profile._id }, { isPublic: true }],
		})
			.populate('user')
			.sort('-isPublic');

		profile.notes = notes;

		const configs = await Config.find({ user: profile?._id }).sort('createdAt');

		profile.configs = configs;

		return res.json(profile);
	} catch (err) {
		errors.profile = 'Error retreiving profile!';
		return res.status(400).json(errors);
	}
});

// Update Profile
router.put('/profiles', requireAuth, async (req, res) => {
	let errors = {};

	const user = req?.user?._id;

	try {
		const updatedProfile = await Profile.findOneAndUpdate(
			{ user },
			{
				$set: req?.body,
			},
			{
				new: true,
			},
		);

		const notes = await Note.find({
			$or: [{ user: updatedProfile._id }, { isPublic: true }],
		})
			.populate('user')
			.sort('-isPublic');

		updatedProfile.notes = notes;

		if (!updatedProfile) {
			errors.profile = 'Error, profile not found';
			return res.status(404).json(errors);
		}

		return res.json({
			success: 'Profile updated successfully!',
			updatedProfile,
		});
	} catch (err) {
		errors.profile = 'Error updating profile!';
		return res.status(400).json(errors);
	}
});

// Delete Profile

module.exports = router;
