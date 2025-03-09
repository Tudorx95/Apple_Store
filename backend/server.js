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

app.post('/api/subscribe', (req, res) => {
    const { firstname, lastname, email } = req.body;
    const loggedAt=new Date();

    if (!firstname || !lastname || !email) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    db.query('SELECT * FROM Newsletter_user WHERE email = ?', [email], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error. Please try again later.' });
        }
        if (results.length > 0) {
            return res.status(409).json({ message: 'This email is already subscribed.' });
        }

        db.query('INSERT INTO Newsletter_user (firstname, lastname, email, subscribed_at) VALUES (?, ?, ?, ?)',
            [firstname, lastname, email,loggedAt],
            (err, result) => {
                if (err) {
                    return res.status(500).json({ message: 'Failed to subscribe. Try again later.' });
                }
                res.status(201).json({ message: 'Successfully subscribed!', subscribed_at: loggedAt });
            }
        );
    });
});

app.get("/contact", (req,res)=>{
    db.query('SELECT * FROM apple_stores', (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err });
        }
        const formattedResults = results.map(store => ({
            ...store,
            latitude: parseFloat(store.latitude),
            longitude: parseFloat(store.longitude),
            position: { 
              lat: parseFloat(store.latitude), 
              lng: parseFloat(store.longitude) 
            }
          }));
      
        res.status(200).json(formattedResults);
        
    });
});

app.get("/products/macbook", (req, res) => {
    const query = `
        SELECT device.*, device_specs.*
        FROM device
        INNER JOIN device_specs ON device.specs = device_specs.ID
        INNER JOIN device_type ON device_type.ID = device.device_type
        WHERE device_type.device_type = 'MacBook';
    `;

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err });
        }
        res.json(results);
    });
});

app.get("/products/ipad", (req, res) => {
    const query = `
        SELECT device.*, device_specs.*
        FROM device
        INNER JOIN device_specs ON device.specs = device_specs.ID
        INNER JOIN device_type ON device_type.ID = device.device_type
        WHERE device_type.device_type = 'iPad';
    `;

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err });
        }
        res.json(results);
    });
});

app.get("/products/iphone", (req, res) => {
    const query = `
        SELECT device.*, device_specs.*
        FROM device
        INNER JOIN device_specs ON device.specs = device_specs.ID
        INNER JOIN device_type ON device_type.ID = device.device_type
        WHERE device_type.device_type = 'iPhone';
    `;

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err });
        }
        res.json(results);
    });
});


app.get('/products/models', async (req, res) => {
      const query = `SELECT device.model, device_type.device_type, device.ID FROM device
                     INNER JOIN device_type ON 
                     device.device_type = device_type.ID`;
      
      db.query(query,(err,results)=>{
        if(err){
            return res.status(500).json({ message: "Database error", error: err });
        }
        res.json(results);
      });   
  });

  app.get('/products/images/:device_type/:ID', async (req, res) => {
    const deviceType = req.params.device_type;
    const productId = req.params.ID;
  
    const query = `
      SELECT image_url FROM device_images
      WHERE device_ID = ?
    `;
  
    db.query(query, [productId], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: "Database error", error: err });
      }
  
      // If images are found, return them as an array of image URLs
      const imageUrls = results.map(result => `/images/${result.image_url}`);
      res.json(imageUrls);
    });
  });
  
  
  

app.get("/", (req, res) => {
    res.send("Response from server");
});

const crypto= require('crypto');
// Generate a secure random encryption key (32 bytes = 256-bit AES key)
let key;    // 
app.get('/encryption-key',(req,res)=>{
    const encryptionKey = crypto.randomBytes(32).toString('hex');
    key= encryptionKey;
    res.json({key:encryptionKey });
})

app.get('/decryption-key',(req,res)=>{
    res.json({key:key });
})

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