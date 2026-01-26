const { Router } = require('express');
const { model } = require('mongoose');
const { config } = require('dotenv');
const axios = require('axios');
const tzlookup = require('tz-lookup');
const requireAuth = require('../middleware/requireAuth');
const Project = model('Project');
const router = Router();
config();

// Create New Project
router.post('/projects', requireAuth, async (req, res) => {
	const errors = {};

	try {
		const newProject = new Project(req?.body);
		await newProject?.save();

		const userProjects = await Project.find({ user: req?.body?.user });

		res.json({ success: 'Project created successfully!', userProjects });
	} catch (err) {
		errors.projects = 'Error creating project!';
		return res.status(400).json(errors);
	}
});

// Get User Projects
router.get('/projects/user/:id', requireAuth, async (req, res) => {
	const errors = {};

	const { id } = req?.params;

	try {
		const userProjects = await Project.find({ user: id });

		res.status(201).json(userProjects);
	} catch (err) {
		errors.projects = 'Error retreiving projects!';
		return res.status(400).json(errors);
	}
});

router.get('/time-zone/:zipCode', async (req, res) => {
	let errors = {};
	const { zipCode } = req?.params;

	try {
		const locationRes = await axios.get(
			`https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode}&key=${process.env.GOOGLE_API_KEY}`,
		);
		const location = locationRes?.data.results[0].geometry.location;
		const { lat, lng } = location;
		let timeZone;
		if (lat && lng) {
			timeZone = tzlookup(lat, lng);
		}

		res.status(200).json(timeZone);
	} catch (err) {
		errors.timeZone = 'Error getting time zone';
		console.log('Time Zone Error', err);
		return res.status(500).json(errors);
	}
});

module.exports = router;
