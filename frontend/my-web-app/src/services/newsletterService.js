const nodemailer = require('nodemailer');
const db = require('../db'); // Assuming the database connection is in db.js

const subscribeToNewsletter = (req, res) => {
  const { firstname, lastname, email } = req.body;

  // Insert user data into the database
  const query = 'INSERT INTO newsletter (firstname, lastname, email) VALUES (?, ?, ?)';
  db.query(query, [firstname, lastname, email], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Server Error');
    }

    // Send confirmation email to user
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'your-email@gmail.com',
        pass: 'your-email-password',
      },
    });

    const mailOptions = {
      from: 'your-email@gmail.com',
      to: email,
      subject: 'Newsletter Subscription Confirmation',
      text: `Hello ${firstname} ${lastname},\n\nYou have successfully subscribed to our newsletter.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).send('Error sending confirmation email');
      }
      console.log('Email sent: ' + info.response);
      res.status(200).send('Successfully subscribed!');
    });
  });
};

module.exports = {
  subscribeToNewsletter,
};
