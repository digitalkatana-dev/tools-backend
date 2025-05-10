require('./src/models/User');
require('./src/models/Profile');
require('./src/models/Project');
require('./src/models/Note');
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
const noteRoutes = require('./src/routes/noteRoutes');
const aeRoutes = require('./src/routes/aeRoutes');
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
app.use(noteRoutes);
app.use(aeRoutes);

const server = http.createServer(app);

const port = process.env.PORT || 3005;

server.listen(port, () => {
	console.log(`Listening on port ${port}`);
});
