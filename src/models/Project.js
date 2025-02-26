const { Schema, model } = require('mongoose');

const projectSchema = new Schema(
	{
		projectType: {
			type: String,
			enum: ['circuit', 'voice'],
			required: [true, 'Project Type is required.'],
		},
		client: {
			type: String,
			required: true,
		},
		user: {
			type: Schema.Types.ObjectId,
			ref: 'Profile',
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

model('Project', projectSchema);
