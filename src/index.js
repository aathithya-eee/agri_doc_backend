const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: ["http://localhost:5173", "https://agri-doctor-ai.vercel.app"],
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
    res.send('Agri-Doctor AI Backend is Running');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
