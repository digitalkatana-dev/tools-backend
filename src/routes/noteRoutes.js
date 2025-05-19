const { Router } = require('express');
const { model } = require('mongoose');
const { validateNote } = require('../util/validators');
const requireAuth = require('../middleware/requireAuth');
const Note = model('Note');
const Profile = model('Profile');
const router = Router();

// Create Note
router.post('/notes', requireAuth, async (req, res) => {
	const { valid, errors } = validateNote(req?.body);

	if (!valid) return res.status(400).json(errors);

	try {
		const newNote = new Note(req?.body);
		await newNote?.save();

		res.json({ success: 'Note created successfully!' });
	} catch (err) {
		errors.notes = 'Error creating note!';
		return res.status(400).json(errors);
	}
});

// Get Note(s)
router.get('/notes', requireAuth, async (req, res) => {
	let errors = {};

	const profile = await Profile.findOne({ user: req?.user?._id });

	if (!profile) {
		errors.notes = 'Error user not found!';
		return res.status(404).json(errors);
	}

	try {
		const notes = await Note.find({ user: profile?._id });

		if (!notes) {
			errors.notes = 'Error, no notes found!';
			return res.status(404).json(errors);
		}

		res.json(notes);
	} catch (err) {
		errors.notes = 'Error retrieving notes!';
		return res.status(400).json(errors);
	}
});

// Update Note
router.put('/notes/:id', requireAuth, async (req, res) => {
	let errors = {};

	const { id } = req?.params;

	try {
		const updatedNote = await Note.findByIdAndUpdate(
			id,
			{
				$set: req?.body,
			},
			{
				new: true,
			}
		);

		if (!updatedNote) {
			errors.notes = 'Error, note not found!';
			return res.status(404).json(errors);
		}

		res.json({ success: 'Note updated successfully!' });
	} catch (err) {
		errors.notes = 'Error updating note!';
		console.log(err);
		return res.status(400).json(errors);
	}
});

// Delete Note
router.delete('/notes/:id', requireAuth, async (req, res) => {
	let errors = {};

	const { id } = req?.params;

	try {
		const deletedNote = await Note.findByIdAndDelete(id);

		if (!deletedNote) {
			errors.notes = 'Error, note not found!';
			return res.status(404).json(errors);
		}

		res.json({ success: 'Note deleted successfully!' });
	} catch (err) {
		errors.notes = 'Error deleting note!';
		res.status(400).json(errors);
	}
});

module.exports = router;
