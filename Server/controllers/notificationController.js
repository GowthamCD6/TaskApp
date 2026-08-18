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
  readAt: row.read_at ? new Date(row.read_at).toISOString() : null,
  senderName: row.sender_name || 'System',
  createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
});

// GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const { userId } = req.query;

    // If userId belongs to a faculty, generate dynamic alert records (period ending, log submission needed, new tasks)
    let dynamicNotifs = [];
    if (userId && userId !== 'admin') {
      try {
        const [taskRows] = await pool.query(
          'SELECT * FROM tasks WHERE assigned_to = ? ORDER BY date DESC, start_time DESC LIMIT 20',
          [userId]
        );

        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTotalMinutes = currentHour * 60 + currentMinute;

        // Parse HH:MM string to total minutes from 00:00
        const parseTimeToMinutes = (timeStr) => {
          if (!timeStr) return null;
          const clean = timeStr.trim();
          const match = clean.match(/^(\d{1,2}):(\d{2})/);
          if (!match) return null;
          return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
        };

        taskRows.forEach(t => {
          const taskDate = t.date ? (typeof t.date === 'string' ? t.date.split('T')[0] : t.date) : '';
          const isPending = t.status === 'pending';
          const isDone = t.status === 'completed';

          if (isPending) {
            const isToday = taskDate === todayStr;
            const startMin = parseTimeToMinutes(t.start_time);
            const endMin = parseTimeToMinutes(t.end_time);

            if (isToday && endMin !== null) {
              const diffToEnd = endMin - currentTotalMinutes; // minutes until end time

              if (diffToEnd <= 30 && diffToEnd >= -60) {
                // Period ending soon / Log submission urgency alert
                const isOverdue = diffToEnd < 0;
                dynamicNotifs.push({
                  id: `alert-ending-soon-${t.id}`,
                  userId: t.assigned_to,
                  title: isOverdue ? 'Period Ended: Submit Work Log Now' : 'Period Ending Soon: Log Required',
                  message: isOverdue
                    ? `Your session "${t.title}" ended at ${t.end_time}. Please submit your completion remarks and student attendance log immediately.`
                    : `Your session "${t.title}" (${t.start_time} - ${t.end_time}) is ending in ${diffToEnd} min(s). Please prepare and submit your work log.`,
                  type: 'urgent',
                  timestamp: isOverdue ? `Ended at ${t.end_time}` : `Ends at ${t.end_time}`,
                  isRead: false,
                  senderName: t.assigned_by || 'Admin',
                  createdAt: new Date().toISOString(),
                });
              } else if (startMin !== null && currentTotalMinutes >= startMin && currentTotalMinutes < endMin) {
                // Active in-progress period
                dynamicNotifs.push({
                  id: `alert-active-${t.id}`,
                  userId: t.assigned_to,
                  title: 'Active Session: Work in Progress',
                  message: `You are currently in session "${t.title}" (${t.start_time} - ${t.end_time}). Submit your work log when the period concludes.`,
                  type: 'reminder',
                  timestamp: `Today (${t.start_time} - ${t.end_time})`,
                  isRead: false,
                  senderName: t.assigned_by || 'Admin',
                  createdAt: t.created_at ? new Date(t.created_at).toISOString() : new Date().toISOString(),
                });
              } else {
                // Scheduled for later today
                dynamicNotifs.push({
                  id: `alert-log-req-${t.id}`,
                  userId: t.assigned_to,
                  title: 'Academic Duty Scheduled Today',
                  message: `You have "${t.title}" scheduled today from ${t.start_time} to ${t.end_time}. Please log completion once finished.`,
                  type: t.priority === 'High' ? 'urgent' : 'task_assigned',
                  timestamp: `Today (${t.start_time} - ${t.end_time})`,
                  isRead: false,
                  senderName: t.assigned_by || 'Admin',
                  createdAt: t.created_at ? new Date(t.created_at).toISOString() : new Date().toISOString(),
                });
              }
            } else {
              // Future/other date schedule
              dynamicNotifs.push({
                id: `alert-log-req-${t.id}`,
                userId: t.assigned_to,
                title: 'Academic Duty Scheduled',
                message: `You are scheduled for "${t.title}" on ${taskDate} from ${t.start_time} to ${t.end_time}.`,
                type: t.priority === 'High' ? 'urgent' : 'task_assigned',
                timestamp: `${taskDate}`,
                isRead: false,
                senderName: t.assigned_by || 'Admin',
                createdAt: t.created_at ? new Date(t.created_at).toISOString() : new Date().toISOString(),
              });
            }
          } else if (isDone && t.completion_note) {
            // Verified Log Submission Alert
            dynamicNotifs.push({
              id: `alert-logged-${t.id}`,
              userId: t.assigned_to,
              title: 'Work Log Submitted Successfully',
              message: `You submitted remarks for "${t.title}": "${t.completion_note.slice(0, 80)}${t.completion_note.length > 80 ? '...' : ''}"`,
              type: 'task_assigned',
              timestamp: t.completed_at ? new Date(t.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Completed',
              isRead: true,
              senderName: 'Academic Portal',
              createdAt: t.completed_at ? new Date(t.completed_at).toISOString() : new Date().toISOString(),
            });
          }
        });
      } catch (genErr) {
        console.warn('Error generating dynamic faculty task notifications:', genErr);
      }
    } else {
      // Admin notifications feed: include all faculty completed submissions that need admin review
      try {
        const [recentTasks] = await pool.query(
          'SELECT * FROM tasks ORDER BY updated_at DESC, created_at DESC LIMIT 20'
        );

        recentTasks.forEach(t => {
          if (t.status === 'completed' && t.completion_note) {
            dynamicNotifs.push({
              id: `admin-notif-done-${t.id}`,
              userId: 'admin',
              title: `Log Submitted: ${t.assigned_to_name || 'Faculty'}`,
              message: `${t.assigned_to_name || 'Faculty'} completed "${t.title}": "${t.completion_note.slice(0, 100)}"`,
              type: 'task_assigned',
              timestamp: t.completed_at ? new Date(t.completed_at).toLocaleString() : 'Recently',
              isRead: false,
              senderName: t.assigned_to_name || 'Faculty',
              createdAt: t.completed_at ? new Date(t.completed_at).toISOString() : new Date().toISOString(),
            });
          }
        });
      } catch (adminGenErr) {
        console.warn('Error generating admin task notifications:', adminGenErr);
      }
    }

    // Persist all notifications in `notifications` table and link in `notification_recipients` table
    for (const notif of dynamicNotifs) {
      try {
        await pool.query(
          `INSERT INTO notifications (id, user_id, title, message, type, timestamp, is_read, sender_name)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE title = VALUES(title), message = VALUES(message), timestamp = VALUES(timestamp)`,
          [
            notif.id,
            notif.userId,
            notif.title,
            notif.message,
            notif.type || 'reminder',
            notif.timestamp || 'Just now',
            Boolean(notif.isRead),
            notif.senderName || 'System',
          ]
        );

        // Ensure recipient record exists in notification_recipients
        if (notif.userId && notif.userId !== 'broadcast') {
          await pool.query(
            `INSERT IGNORE INTO notification_recipients (notification_id, user_id, is_read)
             VALUES (?, ?, ?)`,
            [notif.id, notif.userId, Boolean(notif.isRead)]
          );
        }
      } catch (insertErr) {
        // Ignore duplicate insert errors
      }
    }

    // Query notifications joined with notification_recipients for accurate recipient-level read tracking
    let query = `
      SELECT 
        n.id,
        COALESCE(nr.user_id, n.user_id) AS user_id,
        n.title,
        n.message,
        n.type,
        n.timestamp,
        COALESCE(nr.is_read, n.is_read, FALSE) AS is_read,
        nr.read_at,
        n.sender_name,
        n.created_at
      FROM notifications n
      LEFT JOIN notification_recipients nr ON n.id = nr.notification_id AND (nr.user_id = ? OR ? IS NULL)
      WHERE 1=1
    `;
    const params = [userId || null, userId || null];

    if (userId && userId !== 'admin') {
      query += ' AND (n.user_id = ? OR nr.user_id = ? OR n.user_id IS NULL OR n.user_id = "broadcast")';
      params.push(userId, userId);
    } else if (userId === 'admin') {
      query += ' AND (n.user_id = "admin" OR nr.user_id = "admin" OR n.user_id IS NULL OR n.user_id = "broadcast")';
    }

    query += ' ORDER BY n.created_at DESC, n.timestamp DESC LIMIT 50';

    const [finalRows] = await pool.query(query, params);
    const notifications = finalRows.map(formatNotificationRow);

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
    const { userId, title, message, type, senderName } = req.body || {};
    const now = new Date();
    const formattedReadAt = now.toISOString().slice(0, 19).replace('T', ' ');

    // 1. Update in notifications table
    await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = ?', [id]);

    // 2. Update/Insert in notification_recipients table
    if (userId && userId !== 'broadcast') {
      await pool.query(
        `INSERT INTO notification_recipients (notification_id, user_id, is_read, read_at)
         VALUES (?, ?, TRUE, ?)
         ON DUPLICATE KEY UPDATE is_read = TRUE, read_at = ?`,
        [id, userId, formattedReadAt, formattedReadAt]
      );
    }

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
    const { userId, notificationIds } = req.body;
    const now = new Date();
    const formattedReadAt = now.toISOString().slice(0, 19).replace('T', ' ');

    if (userId) {
      await pool.query('UPDATE notifications SET is_read = TRUE WHERE user_id = ? OR user_id = "broadcast"', [userId]);
      await pool.query('UPDATE notification_recipients SET is_read = TRUE, read_at = ? WHERE user_id = ?', [formattedReadAt, userId]);
    } else {
      await pool.query('UPDATE notifications SET is_read = TRUE');
      await pool.query('UPDATE notification_recipients SET is_read = TRUE, read_at = ?', [formattedReadAt]);
    }

    if (Array.isArray(notificationIds) && notificationIds.length > 0 && userId) {
      for (const id of notificationIds) {
        try {
          await pool.query(
            `INSERT INTO notification_recipients (notification_id, user_id, is_read, read_at)
             VALUES (?, ?, TRUE, ?)
             ON DUPLICATE KEY UPDATE is_read = TRUE, read_at = ?`,
            [id, userId, formattedReadAt, formattedReadAt]
          );
        } catch {
          // ignore duplicate errors
        }
      }
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
