const { Schema, model } = require('mongoose');

const configSchema = new Schema(
	{
		clientName: {
			type: String,
			required: [true, 'Client name is required.'],
		},
		address_1: {
			type: String,
			required: [true, 'Address 1 is required.'],
		},
		address_2: {
			type: String,
		},
		city: {
			type: String,
			required: [true, 'City is required.'],
		},
		state: {
			type: String,
			required: [true, 'State is required.'],
		},
		zipCode: {
			type: String,
			required: [true, 'Zip code is required.'],
		},
		timeZone: {
			type: String,
			required: [true, 'Time zone is required.'],
		},
		carrier: {
			type: String,
			required: [true, 'Carrier is required.'],
		},
		handoffType: {
			type: String,
			required: [true, 'Hand-off type is required.'],
		},
		isSymmetrical: {
			type: String,
			required: [true, 'isSymmetrical is required.'],
		},
		speedUp: {
			type: String,
		},
		speedDn: {
			type: String,
			required: [true, 'Speed down is required.'],
		},
		measurement: {
			type: String,
			required: [true, 'Measurement is required.'],
		},
		entryType: {
			type: String,
			required: [true, 'Entry type is required.'],
		},
		circuitType: {
			type: String,
			required: [true, 'Circuit type is required.'],
		},
		isTagged: {
			type: String,
			required: [true, 'isTagged is required.'],
		},
		vlanId: {
			type: String,
		},
		ipAddress_1: {
			type: String,
			required: [true, 'IP address 1 is required.'],
		},
		ipAddress_2: {
			type: String,
		},
		cidr_1: {
			type: String,
			required: [true, 'Cidr 1 is required.'],
		},
		cidr_2: {
			type: String,
		},
		homeIP: {
			type: String,
		},
		verveRouter: {
			type: String,
		},
		available: {
			type: String,
		},
		subnetMask: {
			type: String,
		},
		gateway: {
			type: String,
		},
		coreVerveGateway: {
			type: String,
		},
		verveRouterWan: {
			type: String,
		},
		wanMask: {
			type: String,
		},
		clientGateway: {
			type: String,
		},
		lanMask: {
			type: String,
		},
		gatewayLocation: {
			type: String,
			required: [true, 'Gateway location is required.'],
		},
		dnsP: {
			type: String,
			required: [true, 'Primary DNS is required.'],
		},
		dnsS: {
			type: String,
			required: [true, 'Secondary DNS is required.'],
		},
		tpLink: {
			type: String,
			required: [true, 'TP-Link is required.'],
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
	},
);

model('Config', configSchema);
