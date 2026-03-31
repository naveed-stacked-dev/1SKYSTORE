require('dotenv').config();

// Custom Logger to colorize terminal output
const _log = console.log;
const _warn = console.warn;
const _err = console.error;
console.log = (...args) => _log('\x1b[37m', ...args, '\x1b[0m');  // White
console.warn = (...args) => _warn('\x1b[33m', ...args, '\x1b[0m'); // Yellow
console.error = (...args) => _err('\x1b[31m', ...args, '\x1b[0m'); // Red

const { sequelize } = require('./models');
const app = require('./app');

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync all models (create tables if they don't exist, but don't alter them to save time)
    // await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    await sequelize.sync();
    console.log('✅ Database models synchronized.');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
})();
