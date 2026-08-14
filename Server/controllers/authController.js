const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { pool } = require('../config/db');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

// Helper to generate signed JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role || 'faculty',
      regNo: user.reg_no || user.regNo || '',
      name: user.name || '',
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Helper to format user response
const formatUser = (user) => ({
  id: user.id,
  googleId: user.google_id || null,
  regNo: user.reg_no || '',
  name: user.name || '',
  email: user.email || '',
  role: user.role || 'faculty',
  department: user.department || '',
  title: user.title || '',
  avatar: user.avatar || '',
  phone: user.phone || '',
  officeHours: user.office_hours || '',
  themeModeId: user.theme_mode_id || (user.theme_mode === 'dark' ? 2 : 1),
  themeMode: (user.theme_mode_id === 2 || user.theme_mode === 'dark') ? 'dark' : 'light',
});

// POST /api/auth/login (Credential & Role Login)
const login = async (req, res) => {
  try {
    const { regNo, email, password, id } = req.body;

    let user = null;

    if (id) {
      // Direct lookup by user ID
      const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
      if (rows.length > 0) user = rows[0];
    } else if (regNo) {
      // Lookup by registration number / Admin ID or email
      const [rows] = await pool.query('SELECT * FROM users WHERE LOWER(reg_no) = LOWER(?) OR LOWER(email) = LOWER(?)', [regNo.trim(), regNo.trim()]);
      if (rows.length > 0) user = rows[0];
    } else if (email) {
      // Lookup by email
      const [rows] = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
      if (rows.length > 0) user = rows[0];
    }

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Access Denied: Registration Number / User ID is not registered in the system.',
      });
    }

    // Password verification
    if (password && user.password && user.password !== password) {
      return res.status(401).json({
        status: 'error',
        message: 'Incorrect password entered.',
      });
    }

    const token = generateToken(user);
    const formattedData = formatUser(user);

    res.status(200).json({
      status: 'success',
      message: `Welcome back, ${user.name}`,
      token,
      data: formattedData,
    });
  } catch (err) {
    console.error('❌ Login Error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process login authentication',
    });
  }
};

// POST /api/auth/google (Google Sign-In Authentication)
const googleLogin = async (req, res) => {
  try {
    const { token: clientToken, idToken, googleUser: bodyGoogleUser, user: bodyUser } = req.body;
    const googleUser = bodyGoogleUser || bodyUser;

    let payload = null;

    if (idToken || clientToken) {
      try {
        const ticket = await client.verifyIdToken({
          idToken: idToken || clientToken,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
      } catch (e) {
        console.warn('Google ID token verification failed:', e.message);
      }
    }

    if (!payload && googleUser) {
      payload = {
        sub: googleUser.id || googleUser.googleId,
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

    const { sub: googleId, email, picture } = payload;

    // Check if user exists in database
    const [rows] = await pool.query('SELECT * FROM users WHERE google_id = ? OR LOWER(email) = LOWER(?)', [
      googleId,
      email,
    ]);

    if (rows.length === 0) {
      return res.status(403).json({
        status: 'error',
        message: `Access Denied: Google email (${email}) is not registered in the system. Please contact the Academic Administrator.`,
      });
    }

    const user = rows[0];
    if (!user.google_id || (picture && user.avatar !== picture)) {
      await pool.query(
        'UPDATE users SET google_id = ?, avatar = COALESCE(?, avatar) WHERE id = ?',
        [googleId, picture, user.id]
      );
      user.google_id = googleId;
      if (picture) user.avatar = picture;
    }

    const jwtToken = generateToken(user);
    const formattedData = formatUser(user);

    res.status(200).json({
      status: 'success',
      message: `Welcome ${user.name}`,
      token: jwtToken,
      data: formattedData,
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

// GET /api/auth/me (Verify JWT Token & Return Active User Profile)
const getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);

    if (rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User session no longer exists in database.',
      });
    }

    const user = rows[0];
    const formattedData = formatUser(user);

    res.status(200).json({
      status: 'success',
      data: formattedData,
    });
  } catch (err) {
    console.error('❌ getMe Error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve authenticated user profile.',
    });
  }
};

module.exports = {
  login,
  googleLogin,
  getMe,
  generateToken,
};
