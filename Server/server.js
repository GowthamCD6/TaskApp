const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const os = require('os');

const PORT = process.env.PORT || 5000;

// Auto-detect local network IP for device connectivity
const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
};

app.listen(PORT, '0.0.0.0', () => {
  const localIP = getLocalIP();
  console.log(`⚡ Server listening on port ${PORT} (${process.env.NODE_ENV || 'development'} mode)`);
  console.log(`   └─ Local:   http://localhost:${PORT}/api`);
  console.log(`   └─ Network: http://${localIP}:${PORT}/api`);
  console.log(`\n📱 Update Client/src/config/env.ts with API_HOST_IP = '${localIP}' if needed.\n`);
});
