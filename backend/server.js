const express = require('express');

// env vars
const dotenv = require('dotenv');
dotenv.config();
// extracting port
const PORT = process.env.PORT;

const db = require('./config/db');


// Create Express app
const app = express();
app.use(express.json());

// !!! First declare cors and then the get and post methods
// cors -> If your backend and frontend are running on different ports, you'll need to handle CORS (Cross-Origin Resource Sharing).
const cors = require('cors');
app.use(express.json());
// Enable CORS for the frontend
app.use(cors({
    origin: process.env.REACT_APP_FRONTEND_URL, // Allow requests from your React frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow specific HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'] // Allow specific headers (you can add more if needed)
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
        SELECT 
            device.*,
            device_specs.*,
            GROUP_CONCAT(DISTINCT device_color.color) AS colors,
            GROUP_CONCAT(DISTINCT device_capacity.capacity) AS capacities,
            GROUP_CONCAT(DISTINCT device_unifiedmemory.unified_memory) AS unified_memories
        FROM device
        INNER JOIN device_specs ON device.specs = device_specs.ID
        INNER JOIN device_type ON device_type.ID = device.device_type
        LEFT JOIN device_color ON device.ID = device_color.device_id
        LEFT JOIN device_capacity ON device.ID = device_capacity.device_id
        LEFT JOIN device_unifiedmemory ON device.ID = device_unifiedmemory.device_id
        WHERE device_type.device_type = 'MacBook'
        GROUP BY device.ID;

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
        SELECT 
            device.*,
            device_specs.*,
            GROUP_CONCAT(DISTINCT device_color.color) AS colors,
            GROUP_CONCAT(DISTINCT device_capacity.capacity) AS capacities
        FROM device
        INNER JOIN device_specs ON device.specs = device_specs.ID
        INNER JOIN device_type ON device_type.ID = device.device_type
        LEFT JOIN device_color ON device.ID = device_color.device_id
        LEFT JOIN device_capacity ON device.ID = device_capacity.device_id
        WHERE device_type.device_type = 'iPad'
        GROUP BY device.ID;
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
        SELECT 
            device.*,
            device_specs.*,
            GROUP_CONCAT(DISTINCT device_color.color) AS colors,
            GROUP_CONCAT(DISTINCT device_capacity.capacity) AS capacities
        FROM device
        INNER JOIN device_specs ON device.specs = device_specs.ID
        INNER JOIN device_type ON device_type.ID = device.device_type
        LEFT JOIN device_color ON device.ID = device_color.device_id
        LEFT JOIN device_capacity ON device.ID = device_capacity.device_id
        WHERE device_type.device_type = 'iPhone'
        GROUP BY device.ID;
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

app.get("/products/:device_type/:ID", (req, res) => {
    const { device_type, ID: deviceId } = req.params;

    const query = `
        SELECT 
            GROUP_CONCAT(DISTINCT dc.color) AS colors,
            GROUP_CONCAT(DISTINCT dcap.capacity) AS capacities,
            GROUP_CONCAT(DISTINCT ds.CPU) AS cpus,
            GROUP_CONCAT(DISTINCT ds.GPU) AS gpus,
            GROUP_CONCAT(DISTINCT ds.material) AS materials,
            GROUP_CONCAT(DISTINCT ds.security) AS security_options,
            GROUP_CONCAT(DISTINCT dum.unified_memory) AS unifiedmemories
        FROM Device d
        JOIN Device_Specs ds ON d.specs = ds.ID
        LEFT JOIN device_color dc ON d.ID = dc.device_id
        LEFT JOIN device_capacity dcap ON d.ID = dcap.device_id
        LEFT JOIN device_unifiedmemory dum ON d.ID = dum.device_id  -- Added join for unified memory
        WHERE d.ID = ? AND d.device_type = ?;
    `;

    db.query(query, [deviceId, device_type], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err });
        }
        if (!results.length || !results[0].colors) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Convert comma-separated strings to arrays
        const formatArray = (str) => (str ? str.split(",") : []);

        res.json({
            colors: formatArray(results[0].colors),
            capacities: formatArray(results[0].capacities),
            cpus: formatArray(results[0].cpus),
            gpus: formatArray(results[0].gpus),
            materials: formatArray(results[0].materials),
            security_options: formatArray(results[0].security_options),
            unifiedmemories: formatArray(results[0].unifiedmemories)  // Added unifiedmemories
        });
    });
});

// Reset password 
const crypto = require('crypto');  // For generating a unique reset token
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'main.mta.ro',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false
    }
  });


  const {render} = require('@react-email/components');
  const {Email} = require('./Email.js');
  
// Endpoint to handle password reset request
app.post('/send-reset-email', async (req, res) => {

    const { email } = req.body;
  try {
      // Search for the user in the database
      const [user] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
      
      if (user.length === 0) {
          return res.status(404).json({ message: 'User not found' });
        }

    // Generate a reset token (a random string)
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000);  // 1 hour expiry time

    // Save the token and its expiry in the database
    await db.promise().query('UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?', [resetToken, resetTokenExpiry, email]);

    // Send the reset link with the token
    const resetLink = `${process.env.REACT_APP_FRONTEND_URL}/reset-password?token=${resetToken}`;


    // Generate email HTML
    const emailHtml = await render(Email({resetLink}));
      // Email options
      const mailOptions = {
        from: process.env.EMAIL_USER, // Your sender email
        to: email,
        subject: 'Password Reset Request on Apple Store',
        html: emailHtml,
      };
  
      await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: 'Password reset email sent.' });
  } catch (error) {
    console.error('Error handling password reset:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Endpoint to handle password update
app.post('/update-password', async (req, res) => {
  const { resetToken, newPassword } = req.body;

  try {
    // Check if the reset token is valid and not expired
    const [user] = await db.promise().query('SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()', [resetToken]);

    if (user.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password and clear the reset token
    await db.promise().query('UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE reset_token = ?', [hashedPassword, resetToken]);

    return res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Error updating password:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

const bcrypt = require('bcrypt');
// POST route to register a new user
app.post('/api/register', async (req, res) => {
    const { firstname, lastname, email, password, phone, address, user_type } = req.body;
  
    // Validate inputs
    if (!firstname || !lastname || !email || !password) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }
  
    try {
      // Check if the email already exists in the database
      const [existingUser] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
  
      if (existingUser.length > 0) {
        return res.status(400).json({ message: 'Email already exists' });
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // constraint for admin users !!!
      // Check if password meets the constraint (contains 2 $ and 1 #)
      const dollarCount = (password.match(/\$/g) || []).length;
      const hashCount = (password.match(/#/g) || []).length;
      let finalUserType = user_type || 1;  // Default to normal user (1) if no type provided
      if (dollarCount === 2 && hashCount === 1) {
        finalUserType = 2;  // Admin user type (2)
      }


      // Insert user data into the database
      const query = 'INSERT INTO users (firstname, lastname, email, password, phone, address, user_type) VALUES (?, ?, ?, ?, ?, ?, ?)';
      const values = [firstname, lastname, email, hashedPassword, phone || null, address || null, finalUserType || null];
  
      const [result] = await db.promise().query(query, values);
  
      // Respond with a success message
      return res.status(201).json({ message: 'Registration successful', userId: result.insertId });
    } catch (error) {
      console.error('Error registering user: ', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
  
const jwt = require('jsonwebtoken');
const authMiddleware = require('./authMiddleware.js');
const SECRET_KEY = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

const userRoutes = require("./routes/user"); // Import your user routes
const authenticateToken = require("./middleware/authMiddleware"); // Import auth middleware
app.use("/", userRoutes); 
app.get("/user/:id", authenticateToken, async (req, res) => {
    const userId = req.params.id;

    // Check if the logged-in user is trying to access their own data
    if (req.user.id !== parseInt(userId)) {
        return res.status(403).json({ message: "Forbidden: You cannot access this user's data" });
    }

    // Fetch user data from the database
    const [user] = await db.promise().query(
        "SELECT id, firstname, lastname, email, phone, address FROM users WHERE id = ?",
        [userId]
    );

    if (user.length === 0) {
        return res.status(404).json({ message: "User not found" });
    }

    res.json(user[0]);
});

app.post("/verify-token", authenticateToken, (req, res) => {
    // If the token is valid, `req.user` will have the decoded JWT payload
    res.json(req.user); // Send the user data from the token payload
});
const Modify_UserData= require('./config/Modify_PersonalData');
app.use("/api",Modify_UserData);

app.get('/dashboard', authMiddleware, (req, res) => {
    res.json({ message: `Welcome, ${req.user.email}` });
});




app.post('/logout', async (req, res) => {
    //await db.deleteRefreshToken(req.cookies.refreshToken);
    //res.clearCookie('refreshToken');
    res.json({ message: "Logged out successfully" });
});


app.get("/", (req, res) => {
    res.send("Response from server");
});

const addresses = require("./routes/AddressInfo");
app.use("/api",addresses);

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