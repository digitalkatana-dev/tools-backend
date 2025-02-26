const { Schema, model } = require('mongoose');

const profileSchema = new Schema(
	{
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
		windows: {
			type: String,
		},
		appPin: {
			type: String,
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
	}
);

// profileSchema.virtual('projects', {
// 	ref: 'Project',
// 	localField: '_id',
// 	foreignField: 'user',
// });

model('Profile', profileSchema);
