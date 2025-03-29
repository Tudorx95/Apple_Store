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

module.exports= db;