require('./src/models/User');
require('./src/models/Profile');
require('./src/models/Project');
const { config } = require('dotenv');
const { set, connect, connection } = require('mongoose');
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const assetRoutes = require('./src/routes/assetRoutes');
const userRoutes = require('./src/routes/userRoutes');
const profileRoutes = require('./src/routes/profileRoutes');
const projectRoutes = require('./src/routes/projectRoutes');
config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/assets', express.static(path.join(__dirname, 'assets')));

set('strictQuery', false);

connect(process.env.MONGODB_URL);

connection.on('connected', () => {
	console.log('Connected to DB.');
});
connection.on('error', (err) => {
	console.log('Error connecting to DB.', err);
});

app.use(assetRoutes);
app.use(userRoutes);
app.use(profileRoutes);
app.use(projectRoutes);

const server = http.createServer(app);

const port = process.env.PORT || 3005;

server.listen(port, () => {
	console.log(`Listening on port ${port}`);
});
