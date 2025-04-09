const express = require("express");
const router = express.Router();

const db = require("../config/db");

// API to add product to cart (insert order & order details)
router.post("/addToCart", async (req, res) => {
  const { userId, productId, quantity, price, order_exists, orderId } = req.body;

  if (!userId || !productId) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  console.log(userId, productId, quantity, price, order_exists, orderId);
  // add in orders based on the order id 
  let connection;
  try {
    connection = await db.promise().getConnection();
    await connection.beginTransaction();

    let findOrderId = orderId;

    // if it is a new order, then add it to cart, along with the delivery addresses
    if (!order_exists) {
      const [res] = await connection.execute(`INSERT INTO order_details (user_id,nb_orders,status)
            VALUES (?,?, 'pending')`, [userId, 1]);
      // then extract the orderId for this client to return it into frontend
      findOrderId = res.insertId;
    }
    else {
      // increment nb_orders 
      await connection.execute(`UPDATE order_details SET nb_orders = nb_orders + 1 WHERE id = ?`, [orderId]);
      console.log("increasing nb_orders");
    }

    // identify if it is the same product
    const [rows] = await connection.execute(`SELECT id FROM orders WHERE user_id = ? && order_id = ? && device_id = ?`,
      [userId, findOrderId, productId]
    );
    const sameProd = rows.length > 0 ? rows[0] : null;

    if (!sameProd) {
      // Insert a new entry into orders table 
      await connection.execute(
        `INSERT INTO orders (user_id, device_id, quantity, price, order_date, order_id, last_updated) 
           VALUES (?, ?, ?, ?, NOW(), ?, NOW())`,
        [userId, productId, quantity, price, findOrderId]
      );
      //console.log("insert a new prod");
    }
    else {
      // increase quantity 
      await connection.execute(`UPDATE orders SET quantity = quantity + 1 WHERE id = ?`, [sameProd.id]);
      //console.log("Increase quantity");
    }

    await connection.commit();
    res.status(201).json({ message: "Order placed successfully!", findOrderId });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error adding order:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    if (connection) connection.release();
  }
});

router.get('/order_details/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [ids] = await db.promise().execute(`SELECT id, status FROM order_details WHERE user_id = ?`, [userId]);
    if (ids.length === 0) {
      return res.status(404).json({ message: "No orders found!" });
    }
    res.status(200).json({ data: ids });
  } catch (error) {
    console.error("Error fetching devices:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:userId/:orderId", async (req, res) => {
  const { userId, orderId } = req.params;
  const { status } = req.query;

  try {

    // A doua interogare: obține detaliile tuturor dispozitivelor
    const [deviceRows] = await db.promise().execute(
      `SELECT d.id, d.model, d.price, d.in_stock, d.image_url, o.quantity 
         FROM device d
         JOIN orders o ON d.id = o.device_id
         JOIN order_details od ON o.order_id = od.id
         WHERE o.user_id = ? AND o.order_id = ? AND od.status = ?`,
      [userId, orderId, status]
    );

    // Verifică dacă există dispozitive
    if (deviceRows.length === 0) {
      return res.status(404).json({ message: "No devices found!" });
    }

    // Returnează array-ul cu toate dispozitivele
    res.status(200).json({ data: deviceRows });
  } catch (error) {
    console.error("Error fetching devices:", error);
    res.status(500).json({ message: "Server error" });
  }
});


router.patch("/Quantity/:userId/:orderId/:itemId", async (req, res) => {
  const { userId, orderId, itemId } = req.params;
  const { quantity } = req.body;

  try {
    const [result] = await db.promise().execute(
      `UPDATE orders 
           SET quantity = ? 
           WHERE order_id = ? 
           AND user_id = ? 
           AND device_id = ?`,
      [quantity, orderId, userId, itemId]
    );

    
    // Check if any rows were affected
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Order not found or no changes made" });
    }

    const [totalQuantity] = await db.promise().execute(
      `SELECT SUM(quantity) as total 
       FROM orders 
       WHERE order_id = ? AND user_id = ?`,
      [orderId, userId]
    );

    const [result2] = await db.promise().execute(
      `UPDATE order_details
       SET nb_orders = ?
       WHERE id = ? AND user_id = ?`,
      [totalQuantity[0].total, orderId, userId]
    );
    if(result2.affectedRows === 0){
      return res.status(404).json({ message: "Order not found or no changes made" });
    }

    res.status(200).json({ message: "Updated successfully" })

  } catch (error) {
    console.error("Internal error", error);
    res.status(500).json({ message: "Server error" });
  }

});

router.delete(`/RemoveItem/:userId/:orderId/:itemId`, async (req, res) => {
  const { userId, orderId, itemId } = req.params;
  try {
    const [result] = await db.promise().execute(
      `DELETE FROM orders 
         WHERE user_id = ? 
         AND order_id = ? 
         AND device_id = ?`,
      [userId, orderId, itemId]
    );

    // Check if any rows were deleted
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // decrement nb_orders from order_details 
    const [orderDetails] = await db.promise().execute(
      `SELECT nb_orders FROM order_details 
       WHERE user_id = ? 
       AND id = ?`,
      [userId, orderId]
    );

    if (orderDetails.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }
    // Check if the order exists
    const currentNbOrders = orderDetails[0].nb_orders;
    console.log("currentNbOrders", currentNbOrders);

    // Only decrement if there are more than one item
    if (currentNbOrders > 1) {
      await db.promise().execute(
        `UPDATE order_details 
        SET nb_orders = nb_orders - 1 
        WHERE user_id = ? 
        AND id = ?`,
        [userId, orderId]
      );
      console.log("Updating nb_orders", currentNbOrders);
    }
    else {
      await db.promise().execute(`DELETE FROM order_details WHERE user_id = ? && id = ?`, [userId, orderId]);
    }

    res.status(200).json({ message: "Item removed successfully" });
  } catch (error) {
    console.error("Internal error", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post(`/coupon/validate`, async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ message: "Coupon code is required" });
  }

  try {
    const [couponRows] = await db.promise().execute(
      `SELECT id, discount_type, discount_value, min_purchase, max_discount, 
                valid_from, valid_until, usage_limit, used_count, status 
         FROM coupons WHERE code = ? LIMIT 1`,
      [code]
    );

    if (couponRows.length === 0) {
      return res.status(404).json({ message: "Invalid coupon code" });
    }

    const coupon = couponRows[0];

    // Check if the coupon is active
    if (coupon.status !== "active") {
      return res.status(400).json({ message: "This coupon is not active" });
    }

    // Check if the coupon is expired
    const today = new Date();
    const validFrom = new Date(coupon.valid_from);
    const validUntil = new Date(coupon.valid_until);

    if (today < validFrom || today > validUntil) {
      return res.status(400).json({ message: "This coupon is expired or not yet valid" });
    }

    // Check if the coupon usage limit has been reached
    if (coupon.used_count >= coupon.usage_limit) {
      return res.status(400).json({ message: "This coupon has reached its usage limit" });
    }

    // If all checks pass, return the coupon details
    res.status(200).json({
      message: "Coupon is valid",
      discountType: coupon.discount_type,
      discountValue: coupon.discount_value,
      minPurchase: coupon.min_purchase,
      maxDiscount: coupon.max_discount,
    });

  } catch (error) {
    console.error("Internal error", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post('/finalize', async (req, res) => {
  const { user_id, order_id, status } = req.body;

  try {
    // Fetch the total price from the cart before finalizing
    const cartTotal = await db.promise().execute(
      `SELECT SUM(O.quantity * O.price) AS total_price
         FROM order_details OD 
         JOIN orders O ON O.order_id = OD.id 
         WHERE O.order_id = ? AND O.user_id = ?`,
      [order_id, user_id]
    );
    const totalPrice = cartTotal[0][0]?.total_price || 0;

    if (totalPrice === 0) {
      return res.status(400).json({ message: "Cart is empty or invalid order." });
    }

    // select delivery address
    const delivery_addr_id = await db.promise().execute(`select id from addresses 
        where user_id = ? && default_delivery = 1`, [user_id]);

    if (delivery_addr_id) {
      // update in the order_details
      //console.log(delivery_addr_id[0][0].id, order_id, user_id);
      await db.promise().execute(`UPDATE order_details SET address_delivery_id = ? WHERE id = ? AND user_id = ?`,
        [delivery_addr_id[0][0].id, order_id, user_id]
      );
    }

    // Update the order_details table with status and total price
    await db.promise().execute(
      `UPDATE order_details 
         SET status = ?
         WHERE id = ? AND user_id = ?`,
      [status, order_id, user_id]
    );

    res.status(200).json({ message: "Order finalized successfully", order_id, total_price: totalPrice });

  } catch (error) {
    console.error("Internal error", error);
    res.status(500).json({ message: "Server error while finalizing order." });
  }
});

router.get('/order-details/user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const orders = await db.promise().execute(``);
  } catch (error) {
    console.error("Internal error", error);
    res.status(500).json({ message: "Server error while finalizing order." });
  }
});

router.get('/address-delivery/:userId/:nb_orders', async (req, res) => {
  const { userId, nb_orders } = req.params;

  try {
    // First, get the default delivery address
    const [defaultAddress] = await db.promise().execute(
      `SELECT id, type, county, city, full_address, default_delivery, default_billing 
             FROM addresses 
             WHERE user_id = ? AND default_delivery = 1`,
      [userId]
    );

    // Then get all addresses for the user
    const [allAddresses] = await db.promise().execute(
      `SELECT id, type, county, city, full_address, default_delivery, default_billing 
             FROM addresses 
             WHERE user_id = ? 
             ORDER BY default_delivery DESC, default_billing DESC`,
      [userId]
    );

    if (allAddresses.length === 0) {
      return res.status(404).json({ message: "No addresses found for this user" });
    }

    // If there's no default delivery address, set the first address as default
    if (defaultAddress.length === 0 && allAddresses.length > 0) {
      await db.promise().execute(
        `UPDATE addresses 
                 SET default_delivery = 1 
                 WHERE id = ?`,
        [allAddresses[0].id]
      );
      allAddresses[0].default_delivery = 1;
    }

    res.status(200).json({
      message: "Addresses retrieved successfully",
      data: allAddresses
    });

  } catch (error) {
    console.error("Error fetching addresses:", error);
    res.status(500).json({ message: "Server error while fetching addresses" });
  }
});

module.exports = router;