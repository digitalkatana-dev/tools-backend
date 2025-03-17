const { Router } = require('express');
const path = require('path');
const fs = require('fs');
const router = Router();

// Get uploads - images
router.get('/assets/images/:path', async (req, res) => {
	try {
		res.sendFile(path.join(__dirname, `assets/images/${req?.params?.path}`));
	} catch (err) {
		console.log(err);
	}
});

module.exports = router;
