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
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: "11235",  // Use the entered password
    database: process.env.DB_NAME,
    waitForConnections: true, 
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Error connecting to MySQL:', err.message);
        process.exit(1); // Exit on failure
    } else {
        console.log('✅ Connected to MySQL database!');
        connection.release(); // Release test connection
    }
});

// Connect to MySQL
// db.connect((err) => {
//     if (err) {
//         console.error('❌ Error connecting to MySQL:', err.message);
//         process.exit(1);
//     } else {
//         console.log('✅ Connected to MySQL database!');
//     }
// });

module.exports= db;