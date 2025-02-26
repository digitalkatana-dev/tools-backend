const { Router } = require('express');
const { model } = require('mongoose');
const requireAuth = require('../middleware/requireAuth');
const Project = model('Project');
const router = Router();

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

module.exports = router;
