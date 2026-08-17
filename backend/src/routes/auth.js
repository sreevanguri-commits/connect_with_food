import express from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db.js';

const router = express.Router();

// Mock OTP storage (use Redis/cache in production)
const otpStore = {};

// Send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ error: 'Phone number required' });
    }
    
    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    
    // Store OTP (in production, use SMS provider)
    otpStore[phone] = { code, expiresAt };
    
    // Log to database
    const query = `
      INSERT INTO otp_codes (phone, code, expires_at)
      VALUES ($1, $2, $3)
    `;
    await pool.query(query, [phone, code, expiresAt]);
    
    console.log(`OTP for ${phone}: ${code}`); // Dev log
    res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify OTP and create/update user
router.post('/verify', async (req, res) => {
  try {
    const { phone, code, name, role } = req.body;
    
    if (!phone || !code) {
      return res.status(400).json({ error: 'Phone and OTP code required' });
    }
    
    // Verify OTP
    const storedOtp = otpStore[phone];
    if (!storedOtp || storedOtp.code !== code || new Date() > storedOtp.expiresAt) {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }
    
    // Check if user exists
    let user = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    
    if (user.rows.length === 0) {
      // Create new user
      const userId = uuidv4();
      const query = `
        INSERT INTO users (id, phone, name, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id, phone, name, role, verified
      `;
      const result = await pool.query(query, [userId, phone, name || 'User', role || 'donor']);
      user = result;
    }
    
    // Generate JWT
    const token = jwt.sign(
      {
        userId: user.rows[0].id,
        phone: user.rows[0].phone,
        role: user.rows[0].role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '7d' }
    );
    
    // Mark OTP as used
    delete otpStore[phone];
    await pool.query('UPDATE otp_codes SET used = true WHERE phone = $1 AND code = $2', [phone, code]);
    
    res.json({
      token,
      user: {
        id: user.rows[0].id,
        phone: user.rows[0].phone,
        name: user.rows[0].name,
        role: user.rows[0].role,
        verified: user.rows[0].verified,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

export default router;
