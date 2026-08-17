import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Create a new listing
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      item_type,
      veg,
      quantity,
      unit,
      pickup_start,
      pickup_end,
      address,
      latitude,
      longitude,
    } = req.body;
    
    if (!title || !item_type || !quantity || !pickup_end || !address) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const listingId = uuidv4();
    const query = `
      INSERT INTO listings (
        id, seller_id, title, description, item_type, veg, quantity, unit,
        pickup_start, pickup_end, address, latitude, longitude
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      listingId,
      req.userId,
      title,
      description,
      item_type,
      veg !== undefined ? veg : true,
      quantity,
      unit || 'kg',
      pickup_start || new Date(),
      pickup_end,
      address,
      latitude,
      longitude,
    ]);
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

// Get nearby listings (geo-search)
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 5 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }
    
    // Simple distance calculation (Haversine formula approximation)
    const query = `
      SELECT *,
      SQRT(
        POWER(latitude - $1, 2) + POWER(longitude - $2, 2)
      ) * 111 as distance
      FROM listings
      WHERE status = 'active'
      AND SQRT(POWER(latitude - $1, 2) + POWER(longitude - $2, 2)) * 111 <= $3
      ORDER BY distance
    `;
    
    const result = await pool.query(query, [lat, lng, radius]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch nearby listings' });
  }
});

// Get all listings
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM listings WHERE status = $1 ORDER BY created_at DESC', ['active']);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

// Get single listing
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM listings WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
});

export default router;
