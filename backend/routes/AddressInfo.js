
const express = require("express");
const router = express.Router();

const db = require("../config/db");

router.get('/counties', async (req, res) => {
    try {
      const [rows] = await db.promise().execute('SELECT * FROM counties');
      res.json(rows);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching counties' });
    }
  });
  

  router.get('/cities', async (req, res) => {
    try {
      const { countyId } = req.params;
      const [rows] = await db.promise().execute('SELECT * FROM cities');
      res.json(rows);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching cities' });
    }
  });
  
router.get('/addresses/:userId', async (req,res)=>{
  try{
    const {userId } = req.params;
    const [rows] = await db.promise().execute('SELECT * FROM addresses WHERE user_id = ?', [userId]);
    res.json(rows);
  }catch (error) {
      res.status(500).json({ message: 'Error fetching cities' });
    }
});

  router.post('/addresses', async (req, res) => {
    try {
      const { user_id, userType, county, city, full_address } = req.body;
      
      await db.promise().execute(
        'INSERT INTO addresses (user_id, type, county, city, full_address) VALUES (?,?, ?, ?, ?)',
        [user_id, userType, county, city, full_address]
      );
      res.status(201).json({ message: 'Address added successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error adding address' });
    }
  });

  router.get('/addresses/last-inserted/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const [rows] = await db.promise().execute(
        'SELECT id FROM addresses WHERE user_id = ? ORDER BY id DESC LIMIT 1',
        [userId]
      );
      res.json(rows[0]?.id || null);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching last address ID' });
    }
  });

  router.get('/delivery-types/:typeName', async (req, res) => {
    try {
      const { typeName } = req.params;
      const [rows] = await db.promise().execute(
        'SELECT id FROM delivery_types WHERE name = ?',
        [typeName]
      );
      res.json(rows[0]?.id || null);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching delivery type' });
    }
  });
    
  router.post('/address-delivery', async (req, res) => {
    try {
      const { address_id, delivery_type_id } = req.body;
      await db.promise().execute(
        'INSERT INTO address_delivery (address_id, delivery_type_id) VALUES (?, ?)',
        [address_id, delivery_type_id]
      );
      res.status(201).json({ message: 'Address delivery added successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error adding address delivery' });
    }
  });

  router.get('/address-delivery/:addressId', async (req, res) => {
    try {
      const { addressId } = req.params;
      const [rows] = await db.promise().execute(
        `SELECT dt.name 
         FROM address_delivery ad
         JOIN delivery_types dt ON ad.delivery_type_id = dt.id
         WHERE ad.address_id = ?`,
        [addressId]
      );
      res.json(rows);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching delivery types' });
    }
  });

// Delete address and its delivery types
router.delete('/addresses/:addressId', async (req, res) => {
  try {
    const { addressId } = req.params;
    
    // First delete from address_delivery
    await db.promise().execute(
      'DELETE FROM address_delivery WHERE address_id = ?',
      [addressId]
    );
    
    // Then delete from addresses
    await db.promise().execute(
      'DELETE FROM addresses WHERE id = ?',
      [addressId]
    );
    
    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting address' });
  }
});

  router.get('/addresses/check-limit/:userId/:userType', async (req, res) => {
    try {
      const { userId, userType } = req.params;
      
      // Get the current count of addresses for this user type
      const [countRows] = await db.promise().execute(
        `SELECT COUNT(*) as count FROM addresses 
         WHERE user_id = ? AND type = ?`,
        [userId, userType]
      );
      
      const count = countRows[0].count;
      const limit = 3; // Set your limit here
      
      res.json({ hasReachedLimit: count >= limit, currentCount: count });
    } catch (error) {
      res.status(500).json({ message: 'Error checking address limit' });
    }
  });

  // Update existing address instead of creating new one
router.put('/addresses/update-default/:addressId', async (req, res) => {
  try {
    const { addressId } = req.params;
    const { county, city, full_address, userType } = req.body;
    
    await db.promise().execute(
      `UPDATE addresses 
       SET type = ?, county = ?, city = ?, full_address = ?
       WHERE id = ?`,
      [userType, county, city, full_address, addressId]
    );
    
    res.json({ message: 'Address updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating address' });
  }
});

// Set default address (delivery or billing)
router.put('/addresses/:addressId/default', async (req, res) => {
  try {
    const { addressId } = req.params;
    const { addressType } = req.body;

    // First get the delivery type ID
    const [deliveryTypes] = await db.promise().execute(
      `SELECT id FROM delivery_types WHERE name = ?`,
      [`default_${addressType}`]
    );

    if (!deliveryTypes || deliveryTypes.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Delivery type 'default_${addressType}' not found`
      });
    }

    const deliveryTypeId = deliveryTypes[0].id; // Correctly access the ID

    // Clear any existing defaults of this type for this user
    await db.promise().execute(
      `DELETE FROM address_delivery 
       WHERE address_id IN (
         SELECT id FROM addresses 
         WHERE user_id = (SELECT user_id FROM addresses WHERE id = ?)
       ) AND delivery_type_id = ?`,
      [addressId, deliveryTypeId]
    );

    // Set the new default
    await db.promise().execute(
      `INSERT INTO address_delivery (address_id, delivery_type_id)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE delivery_type_id = VALUES(delivery_type_id)`,
      [addressId, deliveryTypeId]
    );

    res.json({ 
      success: true,
      message: `Default ${addressType} address updated successfully` 
    });
  } catch (error) {
    console.error('Error setting default address:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating default address',
      error: error.message 
    });
  }
});

module.exports= router;