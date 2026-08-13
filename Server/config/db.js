const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: recursive });
}

const usersFile = path.join(dataDir, 'users.json');
const tasksFile = path.join(dataDir, 'tasks.json');
const notificationsFile = path.join(dataDir, 'notifications.json');

const readJSON = (filePath, defaultVal = []) => {
  try {
    if (!fs.existsSync(filePath)) return defaultVal;
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return defaultVal;
  }
};

const writeJSON = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
};

let useLocalFallback = false;

const mysqlPool = mysql.createPool({
  host: process.env.DB_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
  port: parseInt(process.env.DB_PORT || '4000', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'taskapp',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  waitForConnections: true,
  connectionLimit: 5,
  connectTimeout: 5000,
});

const executeFallbackQuery = async (sql, params = []) => {
  const sqlTrimmed = sql.trim();
  const upperSQL = sqlTrimmed.toUpperCase();

  // 1. Users Queries
  if (upperSQL.includes('FROM USERS') || upperSQL.includes('INTO USERS') || upperSQL.includes('UPDATE USERS')) {
    let users = readJSON(usersFile, []);

    if (upperSQL.startsWith('SELECT COUNT(*)')) {
      return [[{ count: users.length }], []];
    }

    if (upperSQL.startsWith('SELECT * FROM USERS WHERE ID = ?')) {
      const found = users.filter(u => u.id === params[0]);
      return [found, []];
    }

    if (upperSQL.startsWith('SELECT * FROM USERS WHERE LOWER(REG_NO) = LOWER(?)')) {
      const found = users.filter(u => u.reg_no && u.reg_no.toLowerCase() === String(params[0]).toLowerCase());
      return [found, []];
    }

    if (upperSQL.startsWith('SELECT * FROM USERS WHERE LOWER(EMAIL) = LOWER(?)')) {
      const found = users.filter(u => u.email && u.email.toLowerCase() === String(params[0]).toLowerCase());
      return [found, []];
    }

    if (upperSQL.includes('LOWER(ROLE) = LOWER(?)')) {
      const roleVal = params[0].toLowerCase();
      let filtered = users.filter(u => u.role && u.role.toLowerCase() === roleVal);
      if (upperSQL.includes('LIMIT 1')) filtered = filtered.slice(0, 1);
      return [filtered, []];
    }

    if (upperSQL.includes('GOOGLE_ID = ? OR LOWER(EMAIL) = LOWER(?)')) {
      const googleId = params[0];
      const email = String(params[1]).toLowerCase();
      const found = users.filter(u => (u.google_id && u.google_id === googleId) || (u.email && u.email.toLowerCase() === email));
      return [found, []];
    }

    if (upperSQL.startsWith('SELECT * FROM USERS')) {
      return [users, []];
    }

    if (upperSQL.startsWith('INSERT INTO USERS')) {
      const newUser = {
        id: params[0],
        google_id: params[1] || null,
        reg_no: params[2] || `FAC-2026-${Math.floor(100 + Math.random() * 900)}`,
        password: params[3] || '123456',
        name: params[4],
        email: params[5],
        role: params[6] || 'faculty',
        department: params[7] || 'Department',
        title: params[8] || 'Faculty Member',
        avatar: params[9] || '',
        phone: params[10] || '',
        office_hours: params[11] || '',
        created_at: new Date().toISOString(),
      };
      users.push(newUser);
      writeJSON(usersFile, users);
      return [{ affectedRows: 1, insertId: newUser.id }, []];
    }

    if (upperSQL.startsWith('UPDATE USERS SET NAME = ?')) {
      const id = params[8];
      const idx = users.findIndex(u => u.id === id);
      if (idx !== -1) {
        users[idx] = {
          ...users[idx],
          name: params[0],
          email: params[1],
          department: params[2],
          title: params[3],
          avatar: params[4],
          phone: params[5],
          office_hours: params[6],
          reg_no: params[7],
        };
        writeJSON(usersFile, users);
      }
      return [{ affectedRows: idx !== -1 ? 1 : 0 }, []];
    }

    if (upperSQL.startsWith('UPDATE USERS SET GOOGLE_ID = ?')) {
      const [gId, pic, id] = params;
      const idx = users.findIndex(u => u.id === id);
      if (idx !== -1) {
        users[idx].google_id = gId;
        if (pic) users[idx].avatar = pic;
        writeJSON(usersFile, users);
      }
      return [{ affectedRows: 1 }, []];
    }
  }

  // 2. Tasks Queries
  if (upperSQL.includes('FROM TASKS') || upperSQL.includes('INTO TASKS') || upperSQL.includes('UPDATE TASKS') || upperSQL.includes('DELETE FROM TASKS')) {
    let tasks = readJSON(tasksFile, []);

    if (upperSQL.startsWith('SELECT COUNT(*)')) {
      return [[{ count: tasks.length }], []];
    }

    if (upperSQL.startsWith('SELECT * FROM TASKS WHERE ID = ?')) {
      const found = tasks.filter(t => t.id === params[0]);
      return [found, []];
    }

    if (upperSQL.startsWith('SELECT * FROM TASKS')) {
      let filtered = [...tasks];
      let pIdx = 0;
      if (upperSQL.includes('ASSIGNED_TO = ?')) {
        filtered = filtered.filter(t => t.assigned_to === params[pIdx] || t.assignedTo === params[pIdx]);
        pIdx++;
      }
      if (upperSQL.includes('DATE = ?')) {
        filtered = filtered.filter(t => t.date === params[pIdx]);
        pIdx++;
      }
      if (upperSQL.includes('STATUS = ?')) {
        filtered = filtered.filter(t => t.status === params[pIdx]);
        pIdx++;
      }
      return [filtered, []];
    }

    if (upperSQL.startsWith('INSERT INTO TASKS')) {
      const newTask = {
        id: params[0],
        title: params[1],
        description: params[2],
        assigned_to: params[3],
        assigned_to_name: params[4],
        assigned_by: params[5],
        date: params[6],
        start_time: params[7],
        end_time: params[8],
        priority: params[9],
        status: params[10] || 'pending',
        completion_note: '',
        completed_at: null,
        created_at: new Date().toISOString(),
      };
      tasks.unshift(newTask);
      writeJSON(tasksFile, tasks);
      return [{ affectedRows: 1, insertId: newTask.id }, []];
    }

    if (upperSQL.startsWith('UPDATE TASKS SET STATUS = ?')) {
      const [status, note, completedAt, id] = params;
      const idx = tasks.findIndex(t => t.id === id);
      if (idx !== -1) {
        tasks[idx].status = status;
        tasks[idx].completion_note = note;
        tasks[idx].completed_at = completedAt;
        writeJSON(tasksFile, tasks);
      }
      return [{ affectedRows: idx !== -1 ? 1 : 0 }, []];
    }

    if (upperSQL.startsWith('DELETE FROM TASKS WHERE ID = ?')) {
      const id = params[0];
      const initialLen = tasks.length;
      tasks = tasks.filter(t => t.id !== id);
      writeJSON(tasksFile, tasks);
      return [{ affectedRows: initialLen - tasks.length }, []];
    }
  }

  // 3. Notifications Queries
  if (upperSQL.includes('FROM NOTIFICATIONS') || upperSQL.includes('INTO NOTIFICATIONS') || upperSQL.includes('UPDATE NOTIFICATIONS')) {
    let notifications = readJSON(notificationsFile, []);

    if (upperSQL.startsWith('SELECT COUNT(*)')) {
      return [[{ count: notifications.length }], []];
    }

    if (upperSQL.startsWith('SELECT * FROM NOTIFICATIONS')) {
      let filtered = [...notifications];
      if (upperSQL.includes('USER_ID = ?') && params.length > 0) {
        filtered = filtered.filter(n => n.user_id === params[0] || n.userId === params[0]);
      }
      return [filtered, []];
    }

    if (upperSQL.startsWith('UPDATE NOTIFICATIONS SET IS_READ = TRUE WHERE ID = ?')) {
      const id = params[0];
      const idx = notifications.findIndex(n => n.id === id);
      if (idx !== -1) {
        notifications[idx].is_read = true;
        writeJSON(notificationsFile, notifications);
      }
      return [{ affectedRows: idx !== -1 ? 1 : 0 }, []];
    }

    if (upperSQL.startsWith('UPDATE NOTIFICATIONS SET IS_READ = TRUE WHERE USER_ID = ?')) {
      const uId = params[0];
      notifications.forEach(n => {
        if (n.user_id === uId || n.userId === uId) n.is_read = true;
      });
      writeJSON(notificationsFile, notifications);
      return [{ affectedRows: 1 }, []];
    }

    if (upperSQL.startsWith('UPDATE NOTIFICATIONS SET IS_READ = TRUE')) {
      notifications.forEach(n => (n.is_read = true));
      writeJSON(notificationsFile, notifications);
      return [{ affectedRows: notifications.length }, []];
    }

    if (upperSQL.startsWith('INSERT INTO NOTIFICATIONS')) {
      const newNotif = {
        id: params[0],
        user_id: params[1],
        title: params[2],
        message: params[3],
        type: params[4],
        timestamp: params[5],
        is_read: Boolean(params[6]),
        sender_name: params[7],
        created_at: new Date().toISOString(),
      };
      notifications.unshift(newNotif);
      writeJSON(notificationsFile, notifications);
      return [{ affectedRows: 1 }, []];
    }
  }

  return [[], []];
};

const pool = {
  query: async (sql, params = []) => {
    if (!useLocalFallback) {
      try {
        const result = await mysqlPool.query(sql, params);
        return result;
      } catch (err) {
        console.warn('⚠️ Remote MySQL/TiDB database error, using JSON file storage fallback:', err.message);
        useLocalFallback = true;
      }
    }
    return executeFallbackQuery(sql, params);
  },
  getConnection: async () => {
    if (!useLocalFallback) {
      try {
        const conn = await mysqlPool.getConnection();
        return conn;
      } catch (err) {
        useLocalFallback = true;
      }
    }
    return {
      query: (sql, params) => executeFallbackQuery(sql, params),
      release: () => {},
    };
  },
};

const testConnection = async () => {
  try {
    const conn = await mysqlPool.getConnection();
    console.log('⚡ Connected successfully to TiDB/MySQL Database');
    conn.release();
    return true;
  } catch (error) {
    console.log('ℹ️ Running backend server with persistent JSON file database fallback');
    useLocalFallback = true;
    return true;
  }
};

module.exports = {
  pool,
  testConnection,
};
