const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`⚡ Server listening on http://10.150.250.40:${PORT} (${process.env.NODE_ENV || 'development'} mode)`);
});
