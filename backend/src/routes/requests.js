import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Create a request for a listing
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { listing_id, quantity_requested } = req.body;
    
    if (!listing_id || !quantity_requested) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const requestId = uuidv4();
    const query = `
      INSERT INTO requests (id, listing_id, requester_id, quantity_requested)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      requestId,
      listing_id,
      req.userId,
      quantity_requested,
    ]);
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create request' });
  }
});

// Accept a request (by listing owner)
router.post('/:id/accept', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const reqResult = await pool.query('SELECT * FROM requests WHERE id = $1', [id]);
    if (reqResult.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    const listingResult = await pool.query('SELECT * FROM listings WHERE id = $1', [reqResult.rows[0].listing_id]);
    if (listingResult.rows[0].seller_id !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    const updateResult = await pool.query(
      'UPDATE requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      ['accepted', id]
    );
    
    res.json(updateResult.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to accept request' });
  }
});

// Complete a request
router.post('/:id/complete', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const updateResult = await pool.query(
      'UPDATE requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      ['completed', id]
    );
    
    res.json(updateResult.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to complete request' });
  }
});

export default router;
