const { Router } = require('express');
const { config } = require('dotenv');
const { validateContact } = require('../util/validators');
const fs = require('fs');
const sgMail = require('@sendgrid/mail');
const router = Router();
config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

router.post('/electrical-interest', async (req, res) => {
	const { valid, errors } = validateContact(req?.body);

	if (!valid) return res.status(400).json(errors);

	const { firstName, lastName, email, phone, message } = req?.body;

	const formattedNumber = (phone) => {
		// Remove all non-digits from the input
		const cleaned = ('' + phone).replace(/\D/g, '');

		// Check if the cleaned number is exactly 10 digits
		const isValid = cleaned.length === 10;

		if (!isValid) {
			return 'Error: Please enter a 10 digit number';
		}

		// Format the number as (xxx) xxx-xxxx
		const formatted = `(${cleaned.substring(0, 3)}) ${cleaned.substring(
			3,
			6
		)}-${cleaned.substring(6)}`;

		return formatted;
	};

	try {
		let interestNotification = fs.readFileSync(
			'src/templates/interest-notification.html',
			'utf-8'
		);
		interestNotification = interestNotification.replace(
			'{{firstName}}',
			firstName
		);
		interestNotification = interestNotification.replace(
			'{{lastName}}',
			lastName
		);
		interestNotification = interestNotification.replace('{{email}}', email);

		interestNotification = interestNotification.replace(
			'{{phone}}',
			phone ? formattedNumber(phone) : ''
		);
		interestNotification = interestNotification.replace('{{message}}', message);

		const msg = {
			to: 'information@aeintegrationinc.com',
			from: process.env.SG_BASE_EMAIL,
			subject: 'New Request',
			html: interestNotification,
		};

		await sgMail.send(msg);

		res.json('Thank you for your interest.');
	} catch (err) {
		errors.email = 'Error sending email';
		return res.status(400).json(errors);
	}
});

module.exports = router;
