const { Router } = require('express');
const { model } = require('mongoose');
const { config } = require('dotenv');
const requireAuth = require('../middleware/requireAuth');
const axios = require('axios');
const Config = model('Config');
const Profile = model('Profile');
const router = Router();
config();

// Get Time Zone
router.get('/config/timezone/:zipCode', async (req, res) => {
	let errors = {};
	const { zipCode } = req?.params;
	const secondsSinceEpoch = Math.floor(Date.now() / 1000);

	try {
		const locationRes = await axios.get(
			`https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode}&key=${process.env.GOOGLE_API_KEY}`,
		);
		const location = locationRes?.data.results[0].geometry.location;
		const { lat, lng } = location;
		const timeZoneRes = await axios.get(
			`https://maps.googleapis.com/maps/api/timezone/json?location=${lat}%2C${lng}&timestamp=${secondsSinceEpoch}&key=${process.env.GOOGLE_API_KEY}`,
		);

		const timeZoneData = timeZoneRes?.data;
		const timeZoneName = timeZoneData?.timeZoneName;
		const test = timeZoneName?.split(' ')[0];

		const timeZone = (data) => {
			const tzNameMap = {
				Pacific: 'America/Los_Angeles',
				Mountain: 'America/Denver',
				Central: 'America/Chicago',
				Eastern: 'America/New_York',
				Atlantic: 'America/Puerto_Rico',
			};

			return tzNameMap[data];
		};

		res.status(200).json(timeZone(test));
	} catch (err) {
		errors.timeZone = 'Error getting time zone';
		console.log('Time Zone Error', err);
		return res.status(500).json(errors);
	}
});

// Add Config
router.post('/config', requireAuth, async (req, res) => {
	let errors = {};

	try {
		const newConfig = new Config(req?.body);
		await newConfig?.save();

		res.json({ success: 'Config saved successfully!' });
	} catch (err) {
		console.log('Config Error', err);
		errors.config = 'Error adding config!';
		return res.status(500).json(errors);
	}
});

// Get Configs
router.get('/config', requireAuth, async (req, res) => {
	let errors = {};

	const profile = await Profile.findOne({ user: req?.user?._id });

	if (!profile) {
		errors.config = 'Error, user not found!';
		return res.status(404).json(errors);
	}

	try {
		const configs = await Config.find({ user: profile?._id }).populate('user');

		if (!configs) {
			errors.config = 'Error, no configs found!';
			return res.status(404).json(errors);
		}

		res.json(configs);
	} catch (err) {
		console.log('Config Error', err);
		errors.config = 'Error retrieving configs!';
		return res.status(500).json(errors);
	}
});

// Update Config
router.put('/config/:id', requireAuth, async (req, res) => {
	let errors = {};

	const { id } = req?.params;

	try {
		const updatedConfig = await Config.findByIdAndUpdate(
			id,
			{
				$set: req?.body,
			},
			{
				new: true,
			},
		).populate('user');

		if (!updatedConfig) {
			errors.config = 'Error, config not found!';
			return res.status(404).json(errors);
		}

		res.json({ success: 'Config updated successfully!' });
	} catch (err) {
		console.log('Config Error', err);
		errors.config = 'Error updating config!';
		return res.status(500).json(errors);
	}
});

// Delete Config
router.delete('/config/:id', requireAuth, async (req, res) => {
	let errors = {};

	const { id } = req?.params;

	try {
		const deletedConfig = await Config.findByIdAndDelete(id);

		if (!deletedConfig) {
			errors.config = 'Error, config not found!';
			return res.status(404).json(errors);
		}

		res.json({ success: 'Config deleted successfully!' });
	} catch (err) {
		console.log('Config Error', err);
		errors.config = 'Error deleting config!';
		return res.status(500).json(errors);
	}
});

module.exports = router;
