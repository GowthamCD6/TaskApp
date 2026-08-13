const { OAuth2Client } = require('google-auth-library');
const { pool } = require('../config/db');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
    const [rows] = await pool.query('SELECT * FROM users WHERE google_id = ? OR email = ?', [
      googleId,
      email.toLowerCase(),
    ]);

    let user = null;

    if (rows.length > 0) {
      user = rows[0];
      // Update google_id or avatar if needed
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
        name: name || 'Faculty User',
        email: email.toLowerCase(),
        role: 'faculty',
        department: 'General Faculty',
        title: 'Faculty Member',
        avatar: picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      };

      await pool.query(
        `INSERT INTO users (id, google_id, name, email, role, department, title, avatar)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newUser.id,
          newUser.google_id,
          newUser.name,
          newUser.email,
          newUser.role,
          newUser.department,
          newUser.title,
          newUser.avatar,
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
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        title: user.title,
        avatar: user.avatar,
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
  googleLogin,
};
