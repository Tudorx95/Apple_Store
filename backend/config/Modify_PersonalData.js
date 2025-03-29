// Example for Express.js

const express = require('express');
const router = express.Router();

const db = require('./db');
const bcrypt = require('bcrypt');

// POST endpoint for updating user data
router.post('/updateUser', async (req, res) => {
    const { firstName, lastName, email, currentPassword, newPassword } = req.body;
  
    try {
      let updateQuery;
      let queryParams;
  
      if (newPassword) {
        // Hash the new password before saving
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        updateQuery = `UPDATE users SET firstname = ?, lastname = ?, password = ? WHERE email = ?`;
        queryParams = [firstName, lastName, hashedPassword, email];
      } else {
        // If no new password is provided, update only name fields
        updateQuery = `UPDATE users SET firstname = ?, lastname = ? WHERE email = ?`;
        queryParams = [firstName, lastName, email];
      }
  
      // Perform the query
      const [updateResults] = await db.promise().query(updateQuery, queryParams);
  
      if (updateResults.affectedRows > 0) {
        return res.status(200).json({ message: 'User data updated successfully' });
      } else {
        return res.status(400).json({ error: 'Failed to update user data' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  

// POST endpoint for deleting the account
router.post('/deleteAccount', async (req, res) => {
  const { userId } = req.body;
  console.log(userId);
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }
  
  try {
    // Delete user from the database (assuming you have a user model)
    const user = await db.promise().query('SELECT * FROM users WHERE id = ?', [userId]);
    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    await db.promise().query('DELETE FROM users WHERE id = ?', [userId]);

    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: 'An error occurred while deleting the account' });
  }
});

module.exports = router;
