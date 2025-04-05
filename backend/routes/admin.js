const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authenticateToken = require("../middleware/authMiddleware");

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
    try {
        const [user] = await db.promise().query(
            "SELECT user_type FROM users WHERE id = ?",
            [req.user.id]
        );

        if (user.length === 0 || user[0].user_type !== 2) {
            return res.status(403).json({ message: "Access denied: Admin only" });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Get all records from a table
router.get("/:table", authenticateToken, isAdmin, async (req, res) => {
    const { table } = req.params;
    const allowedTables = [
        'device', 'device_color', 'device_images', 'device_promo',
        'device_specs', 'coupons', 'order_details', 'orders'
    ];

    if (!allowedTables.includes(table)) {
        return res.status(400).json({ message: "Invalid table name" });
    }

    try {
        let query;
        switch (table) {
            case 'device':
                query = `
                    SELECT d.*, dt.device_type as device_type_name, ds.display_specs, ds.material, ds.CPU, ds.GPU, ds.battery_life
                    FROM device d
                    LEFT JOIN device_type dt ON d.device_type = dt.ID
                    LEFT JOIN device_specs ds ON d.specs = ds.ID
                `;
                break;

            case 'device_color':
                query = `
                    SELECT dc.*, d.model as device_model
                    FROM device_color dc
                    LEFT JOIN device d ON dc.device_id = d.ID
                `;
                break;

            case 'device_images':
                query = `
                    SELECT di.*, d.model as device_model
                    FROM device_images di
                    LEFT JOIN device d ON di.device_ID = d.ID
                `;
                break;

            case 'device_specs':
                query = `
                    SELECT ds.*, 
                           GROUP_CONCAT(DISTINCT d.model) as used_in_devices
                    FROM device_specs ds
                    LEFT JOIN device d ON ds.ID = d.specs
                    GROUP BY ds.ID
                `;
                break;

            default:
                query = `SELECT * FROM ${table}`;
        }

        const [rows] = await db.promise().query(query);

        // Post-process the results
        const processedRows = rows.map(row => {
            const processed = { ...row };

            // Convert device type name if available
            if (processed.device_type_name) {
                processed.device_type = processed.device_type_name;
                delete processed.device_type_name;
            }

            // Format specifications for device table
            if (table === 'device') {
                processed.specifications = {
                    display: processed.display_specs,
                    material: processed.material,
                    CPU: processed.CPU,
                    GPU: processed.GPU,
                    battery: processed.battery_life
                };
                // Remove individual spec fields if you don't want them in the main level
                delete processed.display_specs;
                delete processed.material;
                delete processed.CPU;
                delete processed.GPU;
                delete processed.battery_life;
            }

            return processed;
        });

        res.json(processedRows);
    } catch (error) {
        console.error(`Error fetching ${table}:`, error);
        res.status(500).json({ message: "Server error" });
    }
});

// Update a record
router.put("/:table/:id", authenticateToken, isAdmin, async (req, res) => {
    const { table, id } = req.params;
    const updates = req.body;

    const allowedTables = [
        'device', 'device_color', 'device_images', 'device_promo',
        'device_specs', 'coupons', 'order_details', 'orders'
    ];

    if (!allowedTables.includes(table)) {
        return res.status(400).json({ message: "Invalid table name" });
    }

    try {
        // Remove any ID fields and joined fields that shouldn't be updated
        delete updates.ID;
        delete updates.id;
        delete updates.device_model;
        delete updates.device_type_name;
        delete updates.specifications;
        delete updates.used_in_devices;

        // If there are no fields to update after removing protected fields, return error
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "No valid fields to update" });
        }

        const setClause = Object.keys(updates)
            .map(key => `${key} = ?`)
            .join(", ");
        const values = [...Object.values(updates), id];

        const query = `UPDATE ${table} SET ${setClause} WHERE ID = ?`;
        const [result] = await db.promise().query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Record not found" });
        }

        res.json({ message: "Updated successfully" });
    } catch (error) {
        console.error(`Error updating ${table}:`, error);
        res.status(500).json({ message: "Server error" });
    }
});

// Add a new record
router.post("/:table", authenticateToken, isAdmin, async (req, res) => {
    const { table } = req.params;
    const newRecord = req.body;

    const allowedTables = [
        'device', 'device_color', 'device_images', 'device_promo',
        'device_specs', 'coupons', 'order_details', 'orders'
    ];

    if (!allowedTables.includes(table)) {
        return res.status(400).json({ message: "Invalid table name" });
    }

    try {
        // Remove any ID fields and joined fields that shouldn't be inserted
        delete newRecord.ID;
        delete newRecord.id;
        delete newRecord.device_model;
        delete newRecord.device_type_name;
        delete newRecord.specifications;
        delete newRecord.used_in_devices;

        // If there are no fields to insert after removing protected fields, return error
        if (Object.keys(newRecord).length === 0) {
            return res.status(400).json({ message: "No valid fields to insert" });
        }

        const columns = Object.keys(newRecord).join(", ");
        const placeholders = Object.keys(newRecord).map(() => "?").join(", ");
        const values = Object.values(newRecord);

        const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
        const [result] = await db.promise().query(query, values);

        res.status(201).json({
            message: "Created successfully",
            id: result.insertId
        });
    } catch (error) {
        console.error(`Error creating ${table}:`, error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Delete a record
router.delete("/:table/:id", authenticateToken, isAdmin, async (req, res) => {
    const { table, id } = req.params;

    const allowedTables = [
        'device', 'device_color', 'device_images', 'device_promo',
        'device_specs', 'coupons', 'order_details', 'orders'
    ];

    if (!allowedTables.includes(table)) {
        return res.status(400).json({ message: "Invalid table name" });
    }

    try {
        // Check for foreign key constraints before deleting
        let checkQuery;
        switch (table) {
            case 'device':
                checkQuery = `
                    SELECT 
                        (SELECT COUNT(*) FROM device_color WHERE device_id = ?) as color_refs,
                        (SELECT COUNT(*) FROM device_images WHERE device_ID = ?) as image_refs,
                        (SELECT COUNT(*) FROM device_promo WHERE device_id = ?) as promo_refs
                `;
                const [refs] = await db.promise().query(checkQuery, [id, id, id]);
                if (refs[0].color_refs > 0 || refs[0].image_refs > 0 || refs[0].promo_refs > 0) {
                    return res.status(400).json({
                        message: "Cannot delete device: It has associated colors, images, or promotions"
                    });
                }
                break;
            case 'device_specs':
                const [deviceRefs] = await db.promise().query(
                    'SELECT COUNT(*) as spec_refs FROM device WHERE specs = ?',
                    [id]
                );
                if (deviceRefs[0].spec_refs > 0) {
                    return res.status(400).json({
                        message: "Cannot delete specifications: They are being used by devices"
                    });
                }
                break;
        }

        const query = `DELETE FROM ${table} WHERE ID = ?`;
        const [result] = await db.promise().query(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Record not found" });
        }

        res.json({ message: "Deleted successfully" });
    } catch (error) {
        console.error(`Error deleting from ${table}:`, error);
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({
                message: "Cannot delete this record because it is referenced by other records"
            });
        }
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router; 