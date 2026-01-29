const { Router } = require('express');
const { config } = require('dotenv');
const axios = require('axios');
const router = Router();
config();

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

module.exports = router;
