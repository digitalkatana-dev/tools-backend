const { Schema, model } = require('mongoose');

const noteSchema = new Schema(
	{
		topic: {
			type: String,
			required: true,
		},
		content: {
			type: String,
			required: true,
		},
		user: {
			type: Schema.Types.ObjectId,
			ref: 'Profile',
			required: true,
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

model('Note', noteSchema);
