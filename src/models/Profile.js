const { Schema, model } = require('mongoose');

const profileSchema = new Schema(
	{
		theme: {
			type: String,
			enum: ['light', 'dark'],
			default: 'light',
		},
		firstName: {
			type: String,
		},
		phoneNumber: {
			type: String,
		},
		phoneExt: {
			type: String,
		},
		bridgeNumber: {
			type: String,
		},
		bridgeExt: {
			type: String,
		},
		bridgePin: {
			type: String,
		},
		warden: {
			type: String,
		},
		msAcct: {
			type: String,
		},
		windows: {
			type: String,
		},
		appPin: {
			type: String,
		},
		showForm: {
			type: Boolean,
			default: true,
		},
		showHome: {
			type: Boolean,
			default: true,
		},
		showGenerator: {
			type: Boolean,
			default: true,
		},
		user: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: [true, 'User is required.'],
		},
	},
	{
		toJSON: {
			virtuals: true,
		},
		toObject: {
			virtuals: true,
		},
		timestamps: true,
	},
);

profileSchema.virtual('notes', {
	ref: 'Note',
	localField: '_id',
	foreignField: 'user',
});

model('Profile', profileSchema);
