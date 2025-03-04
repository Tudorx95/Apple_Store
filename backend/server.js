const express = require('express');

// env vars
const dotenv = require('dotenv');
dotenv.config();
// extracting port
const PORT = process.env.PORT;

// db connection
const mysql = require('mysql2');

const readlineSync = require('readline-sync');

// password is typed at the start
const password = readlineSync.question('Enter MySQL Password: ', {
    hideEchoBack: true, // This will hide the input as asterisks
    mask: '*' // This sets the character to asterisk (*)
});

const bcrypt = require('bcryptjs');
// Create MySQL connection with user-provided password
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: password,  // Use the entered password
    database: process.env.DB_NAME
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('❌ Error connecting to MySQL:', err.message);
        process.exit(1);
    } else {
        console.log('✅ Connected to MySQL database!');
    }
});



// Create Express app
const app = express();
app.use(express.json());

// !!! First declare cors and then the get and post methods
// cors -> If your backend and frontend are running on different ports, you'll need to handle CORS (Cross-Origin Resource Sharing).
const cors = require('cors');
// Enable CORS for the frontend
app.use(cors({
    origin: process.env.REACT_APP_FRONTEND_URL, // Allow requests from your React frontend
    methods: ['GET', 'POST'], // Allow specific HTTP methods
    allowedHeaders: ['Content-Type'] // Allow specific headers (you can add more if needed)
  }));


// Routes
app.get('/devices', (req, res) => {
    db.query('SELECT * FROM Device', (err, results) => {
        if (err) {
            res.status(500).json({ message: 'An error occurred while fetching data. Please try again later.' });
        } else {
            res.json(results);
        }
    });
});

app.get('/device-promo',(req,res)=>{
    db.query('SELECT * FROM Device_Promo', (err,results)=>{
        if (err) {
            res.status(500).json({ message: 'An error occurred while fetching data. Please try again later.' });
        } else {
            res.json(results);
        }
    });
});

app.get("/", (req, res) => {
    res.send("Response from server");
});


// Error handling for securing sensitive information about the DB

app.use((req, res, next) => {
    res.status(404).json({ message: 'Not Found' }); // routes that are not found
});
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err); // Log the error for debugging
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
});



// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

// Export db connection
module.exports = db;