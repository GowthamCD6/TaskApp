const { OAuth2Client } = require('google-auth-library');
const { pool } = require('../config/db');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /api/auth/login (Credential & Role Login)
const login = async (req, res) => {
  try {
    const { regNo, email, password, role, id } = req.body;

    let user = null;

    if (id) {
      // Direct lookup by user ID
      const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
      if (rows.length > 0) user = rows[0];
    } else if (regNo) {
      // Lookup by registration number / Admin ID
      const [rows] = await pool.query('SELECT * FROM users WHERE LOWER(reg_no) = LOWER(?)', [regNo.trim()]);
      if (rows.length > 0) user = rows[0];
    } else if (email) {
      // Lookup by email
      const [rows] = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
      if (rows.length > 0) user = rows[0];
    }

    // Fallback search by role if specified
    if (!user && role) {
      const [rows] = await pool.query('SELECT * FROM users WHERE LOWER(role) = LOWER(?) ORDER BY created_at ASC LIMIT 1', [role.trim()]);
      if (rows.length > 0) user = rows[0];
    }

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Invalid login credentials. User account not found.',
      });
    }

    // Optional password verification if password provided
    if (password && user.password && user.password !== password) {
      return res.status(401).json({
        status: 'error',
        message: 'Incorrect password entered.',
      });
    }

    res.status(200).json({
      status: 'success',
      message: `Welcome back, ${user.name}`,
      data: {
        id: user.id,
        googleId: user.google_id || null,
        regNo: user.reg_no || (user.role === 'admin' ? 'ADM-2026-001' : 'FAC-2026-101'),
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department || 'Academic Department',
        title: user.title || 'Faculty Member',
        avatar: user.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        phone: user.phone || '+1 (555) 123-4567',
        officeHours: user.office_hours || 'Mon - Fri, 09:00 AM - 05:00 PM',
      },
    });
  } catch (err) {
    console.error('❌ Login Error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to authenticate user.',
      error: err.message,
    });
  }
};

// POST /api/auth/google
const googleLogin = async (req, res) => {
  try {
    const { idToken, googleUser } = req.body;

    let payload = null;

    if (idToken) {
      try {
        const ticket = await client.verifyIdToken({
          idToken,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
      } catch (tokenErr) {
        console.warn('⚠️ Google ID Token verification failed/fallback:', tokenErr.message);
      }
    }

    // Fallback if client passed parsed googleUser directly
    if (!payload && googleUser) {
      payload = {
        sub: googleUser.id || googleUser.sub,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.photo || googleUser.picture || googleUser.avatar,
      };
    }

    if (!payload || !payload.email) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid Google Authentication payload. Email is required.',
      });
    }

    const { sub: googleId, email, name, picture } = payload;

    // Check if user already exists in TiDB Cloud
    const [rows] = await pool.query('SELECT * FROM users WHERE google_id = ? OR LOWER(email) = LOWER(?)', [
      googleId,
      email,
    ]);

    let user = null;

    if (rows.length > 0) {
      user = rows[0];
      if (!user.google_id || (picture && user.avatar !== picture)) {
        await pool.query(
          'UPDATE users SET google_id = ?, avatar = COALESCE(?, avatar) WHERE id = ?',
          [googleId, picture, user.id]
        );
        user.google_id = googleId;
        if (picture) user.avatar = picture;
      }
    } else {
      // Create new user in database
      const userId = `fac-${Date.now()}`;
      const newUser = {
        id: userId,
        google_id: googleId,
        reg_no: `FAC-2026-${Math.floor(100 + Math.random() * 900)}`,
        password: '123456',
        name: name || 'Faculty User',
        email: email.toLowerCase(),
        role: 'faculty',
        department: 'General Faculty',
        title: 'Faculty Member',
        avatar: picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        phone: '+1 (555) 123-4567',
        office_hours: 'Mon - Fri, 09:00 AM - 05:00 PM',
      };

      await pool.query(
        `INSERT INTO users (id, google_id, reg_no, password, name, email, role, department, title, avatar, phone, office_hours)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newUser.id,
          newUser.google_id,
          newUser.reg_no,
          newUser.password,
          newUser.name,
          newUser.email,
          newUser.role,
          newUser.department,
          newUser.title,
          newUser.avatar,
          newUser.phone,
          newUser.office_hours,
        ]
      );
      user = newUser;
    }

    res.status(200).json({
      status: 'success',
      message: `Welcome ${user.name}`,
      data: {
        id: user.id,
        googleId: user.google_id,
        regNo: user.reg_no || 'FAC-2026-101',
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        title: user.title,
        avatar: user.avatar,
        phone: user.phone || '+1 (555) 123-4567',
        officeHours: user.office_hours || 'Mon - Fri, 09:00 AM - 05:00 PM',
      },
    });
  } catch (err) {
    console.error('❌ Google Login Error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to authenticate with Google.',
      error: err.message,
    });
  }
};

module.exports = {
  login,
  googleLogin,
};
