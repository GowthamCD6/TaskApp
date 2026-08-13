const { pool } = require('../config/db');

// Helper to format notification row
const formatNotificationRow = (row) => ({
  id: row.id,
  userId: row.user_id,
  title: row.title,
  message: row.message,
  type: row.type || 'reminder',
  timestamp: row.timestamp || 'Just now',
  isRead: Boolean(row.is_read),
  senderName: row.sender_name || 'System',
  createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
});

// GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const { userId } = req.query;
    let query = 'SELECT * FROM notifications WHERE 1=1';
    const params = [];

    if (userId) {
      query += ' AND user_id = ?';
      params.push(userId);
    }

    query += ' ORDER BY timestamp DESC';

    const [rows] = await pool.query(query, params);
    const notifications = rows.map(formatNotificationRow);

    res.status(200).json({
      status: 'success',
      results: notifications.length,
      data: notifications,
    });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch notifications',
    });
  }
};

// PATCH /api/notifications/:id/read
const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = ?', [id]);

    res.status(200).json({
      status: 'success',
      message: 'Notification marked as read',
    });
  } catch (err) {
    console.error('Error updating notification:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update notification',
    });
  }
};

// PATCH /api/notifications/read-all
const markAllNotificationsRead = async (req, res) => {
  try {
    const { userId } = req.body;
    if (userId) {
      await pool.query('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [userId]);
    } else {
      await pool.query('UPDATE notifications SET is_read = TRUE');
    }

    res.status(200).json({
      status: 'success',
      message: 'All notifications marked as read',
    });
  } catch (err) {
    console.error('Error marking all read:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to mark all as read',
    });
  }
};

module.exports = {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
